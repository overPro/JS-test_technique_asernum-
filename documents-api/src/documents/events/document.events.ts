export class DocumentUploadedEvent {
  constructor(
    public readonly documentId: string,
    public readonly userId: string,
    public readonly filename: string,
    public readonly mimeType: string,
    public readonly filePath: string,
  ) {}
}

export class DocumentProcessingStartedEvent {
  constructor(
    public readonly documentId: string,
    public readonly jobId: string,
  ) {}
}

export class DocumentProcessingCompletedEvent {
  constructor(
    public readonly documentId: string,
    public readonly metadata: {
      imageWidth?: number;
      imageHeight?: number;
      pdfPages?: number;
      fileHash?: string;
    },
  ) {}
}
