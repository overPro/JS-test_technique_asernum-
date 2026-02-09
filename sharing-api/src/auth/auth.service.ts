import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(userId: string) {
    return { id: userId };
  }
}
