import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs';

@Injectable()
export class ImageProcessor {
  private readonly logger = new Logger('ImageProcessor');

  async extractMetadata(filePath: string) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const metadata = await sharp(filePath).metadata();

      this.logger.log(
        `Image metadata extracted: ${filePath} (${metadata.width}x${metadata.height})`,
      );

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to extract image metadata: ${msg}`);
      throw error;
    }
  }
}
