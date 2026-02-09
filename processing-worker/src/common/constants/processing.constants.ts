export const PROCESSING_CONSTANTS = {
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_PDF_TYPE: 'application/pdf',
  SUPPORTED_TEXT_TYPE: 'text/plain',

  HASH_ALGORITHM: 'sha256',

  STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },

  JOB_QUEUE: 'documents',
  JOB_NAME: 'process-document',

  RETRY_CONFIG: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },

  TIMEOUT: 30000,
} as const;
