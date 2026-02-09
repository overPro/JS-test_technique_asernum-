import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationService } from '@config/configuration.service';

@Injectable()
export class UploadsService {
  constructor(private configService: ConfigurationService) {}

  async saveUploadedFile(
    userId: string,
    file: any,
  ): Promise<string> {
    const uploadDir = this.configService.uploadBaseDir;
    const userDir = path.join(uploadDir, userId);

   
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.originalname}`;
    const filePath = path.join(userDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    return filePath;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      throw new BadRequestException('Failed to delete file');
    }
  }

  async getFileBuffer(filePath: string): Promise<Buffer> {
    try {
      return fs.readFileSync(filePath);
    } catch (error) {
      throw new BadRequestException('Failed to read file');
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    return fs.existsSync(filePath);
  }

  getOutputPath(userId: string, filename: string): string {
    return path.join(this.configService.uploadBaseDir, userId, filename);
  }
}
