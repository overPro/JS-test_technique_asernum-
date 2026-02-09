export class GetDocumentQuery {
  constructor(
    public readonly documentId: string,
    public readonly userId: string,
  ) {}
}

export class ListDocumentsQuery {
  constructor(
    public readonly userId: string,
    public readonly skip: number = 0,
    public readonly take: number = 10,
  ) {}
}

export class SearchDocumentsQuery {
  constructor(
    public readonly userId: string,
    public readonly query: string,
  ) {}
}
