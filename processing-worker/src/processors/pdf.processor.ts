import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import * as fs from 'fs';

@Injectable()
export class PdfProcessor {
  private readonly logger = new Logger('PdfProcessor');

  async extractMetadata(filePath: string) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(fileBuffer);

      this.logger.log(
        `PDF metadata extracted: ${filePath} (${data.numpages} pages)`,
      );

      return {
        pages: data.numpages,
        producer: data.info?.Producer || 'Unknown',
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to extract PDF metadata: ${msg}`);
      throw error;
    }
  }
}
