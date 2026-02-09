import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ShareRepository } from '../database/repositories/share.repository';
import { ConfigurationService } from '../config/configuration.service';
import { CreateShareDto } from './dto/create-share.dto';

@Injectable()
export class SharesService {
  constructor(
    private shareRepository: ShareRepository,
    private configService: ConfigurationService,
  ) {}

  async createShare(
    documentId: string,
    ownerUserId: string,
    createShareDto: CreateShareDto,
  ) {
    const { mode = 'readonly' } = createShareDto;

    if (!['readonly', 'readwrite'].includes(mode)) {
      throw new BadRequestException('Invalid share mode');
    }

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.configService.shareLinkExpiryHours);

    const share = await this.shareRepository.create({
      token,
      document_id: documentId,
      owner_user_id: ownerUserId,
      mode: mode as any,
      expires_at: expiresAt,
    });

    return {
      id: share.id,
      token: share.token,
      documentId: share.document_id,
      mode: share.mode,
      expiresAt: share.expires_at,
      createdAt: share.created_at,
    };
  }

  async getShareByToken(token: string) {
    const share = await this.shareRepository.findByToken(token);
    if (!share) {
      throw new NotFoundException('Share link not found or has expired');
    }
    await this.shareRepository.logAccess(share.id);
    return {
      id: share.id,
      documentId: share.document_id,
      mode: share.mode,
    };
  }

  async listShares(ownerUserId: string) {
    const shares = await this.shareRepository.findByOwnerId(ownerUserId);
    return {
      shares: shares.map((s) => ({
        id: s.id,
        token: s.token,
        documentId: s.document_id,
        mode: s.mode,
        expiresAt: s.expires_at,
      })),
      total: shares.length,
    };
  }

  async getShareById(shareId: string, ownerUserId: string) {
    const share = await this.shareRepository.findById(shareId);
    if (!share || share.owner_user_id !== ownerUserId) {
      throw new NotFoundException('Share not found');
    }
    const accessLogs = await this.shareRepository.getAccessLogs(shareId);
    return {
      id: share.id,
      documentId: share.document_id,
      mode: share.mode,
      expiresAt: share.expires_at,
      accessCount: accessLogs.length,
    };
  }

  async revokeShare(shareId: string, ownerUserId: string) {
    const share = await this.shareRepository.findById(shareId);
    if (!share || share.owner_user_id !== ownerUserId) {
      throw new NotFoundException('Share not found');
    }
    await this.shareRepository.revoke(shareId);
    return { message: 'Share revoked' };
  }

  async validateShareAccess(token: string, mode: 'read' | 'write') {
    const share = await this.shareRepository.findByToken(token);
    if (!share) {
      throw new NotFoundException('Share link expired or revoked');
    }
    if (mode === 'write' && share.mode !== 'readwrite') {
      throw new ConflictException('No write permission');
    }
    return share;
  }

  private generateToken(): string {
    return crypto.randomBytes(this.configService.shareLinkTokenLength).toString('hex');
  }
}
