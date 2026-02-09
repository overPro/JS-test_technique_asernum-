export const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  SHARE_NOT_FOUND: 'Share link not found',
  SHARE_EXPIRED: 'Share link expired',
  UNAUTHORIZED_ACCESS: 'Access denied',
} as const;
