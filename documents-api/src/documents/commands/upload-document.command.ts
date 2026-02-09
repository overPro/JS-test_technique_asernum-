export class UploadDocumentCommand {
  constructor(
    public readonly userId: string,
    public readonly filename: string,
    public readonly originalFilename: string,
    public readonly mimeType: string,
    public readonly sizeBytes: number,
    public readonly folderId?: string,
    public readonly filePath?: string,
  ) {}
}
