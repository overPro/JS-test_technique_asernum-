export class ProcessingError extends Error {
  constructor(
    public readonly documentId: string,
    public readonly originalError: Error,
  ) {
    super('Processing failed for document: ' + documentId);
    this.name = 'ProcessingError';
  }
}

export class MetadataExtractionError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly fileType: string,
  ) {
    super('Failed to extract metadata from: ' + filePath);
    this.name = 'MetadataExtractionError';
  }
}
