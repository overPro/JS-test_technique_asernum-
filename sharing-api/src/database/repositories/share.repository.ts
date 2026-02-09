import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { ShareEntity, ShareMode } from '../entities/share.entity';
import { ShareAccessEntity } from '../entities/share-access.entity';

@Injectable()
export class ShareRepository {
  constructor(
    @InjectRepository(ShareEntity)
    private repository: Repository<ShareEntity>,
    @InjectRepository(ShareAccessEntity)
    private accessRepository: Repository<ShareAccessEntity>,
  ) {}

  async findByToken(token: string): Promise<ShareEntity | null> {
    return this.repository.findOne({
      where: {
        token,
        revoked_at: IsNull(),
        expires_at: MoreThan(new Date()),
      },
    });
  }

  async findById(id: string): Promise<ShareEntity | null> {
    return this.repository.findOne({
      where: {
        id,
        revoked_at: IsNull(),
      },
    });
  }

  async findByOwnerId(ownerUserId: string) {
    return this.repository.find({
      where: {
        owner_user_id: ownerUserId,
        revoked_at: IsNull(),
      },
      order: { created_at: 'DESC' },
    });
  }

  async create(data: Partial<ShareEntity>): Promise<ShareEntity> {
    const share = this.repository.create(data);
    return this.repository.save(share);
  }

  async revoke(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async logAccess(shareId: string, email?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const access = this.accessRepository.create({
      share_id: shareId,
      accessed_by_email: email,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
    await this.accessRepository.save(access);
  }

  async getAccessLogs(shareId: string) {
    return this.accessRepository.find({
      where: { share_id: shareId },
      order: { accessed_at: 'DESC' },
    });
  }
}
