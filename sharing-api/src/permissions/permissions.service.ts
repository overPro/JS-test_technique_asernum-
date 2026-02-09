import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionsService {
  async verifyShareOwnership(shareId: string, userId: string): Promise<void> {
    
  }
}
