import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SharesService } from './shares.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateShareDto } from './dto/create-share.dto';

@ApiTags('Shares')
@Controller('shares')
export class SharesController {
  constructor(private sharesService: SharesService) {}

  @Post(':documentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create share link' })
  async createShare(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
    @Body() dto: CreateShareDto,
  ) {
    return this.sharesService.createShare(documentId, user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user shares' })
  async listShares(@CurrentUser() user: any) {
    return this.sharesService.listShares(user.id);
  }

  @Get(':shareId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get share details' })
  async getShare(
    @CurrentUser() user: any,
    @Param('shareId') shareId: string,
  ) {
    return this.sharesService.getShareById(shareId, user.id);
  }

  @Delete(':shareId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke share' })
  async revokeShare(
    @CurrentUser() user: any,
    @Param('shareId') shareId: string,
  ) {
    return this.sharesService.revokeShare(shareId, user.id);
  }

  @Get('token/:token')
  @ApiOperation({ summary: 'Validate share token' })
  async validateToken(@Param('token') token: string) {
    return this.sharesService.getShareByToken(token);
  }
}
