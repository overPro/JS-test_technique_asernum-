

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  quota_bytes BIGINT DEFAULT 104857600, -- 100 MB par défaut
  used_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);



CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_folder_name_per_user_parent UNIQUE NULLS NOT DISTINCT (user_id, parent_id, name, deleted_at)
);

CREATE INDEX idx_folders_user_id ON folders(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_folders_parent_id ON folders(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_folders_name ON folders(name) WHERE deleted_at IS NULL;



CREATE TYPE document_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE document_mime_type AS ENUM ('application/pdf', 'image/jpeg', 'image/png', 'text/plain');

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  status document_status NOT NULL DEFAULT 'pending',
  file_path VARCHAR(500) NOT NULL,
  file_hash VARCHAR(64),

  
  image_width INTEGER,
  image_height INTEGER,
  pdf_pages INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT chk_size_positive CHECK (size_bytes > 0)
);

CREATE INDEX idx_documents_user_id ON documents(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_folder_id ON documents(folder_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_filename ON documents(filename) WHERE deleted_at IS NULL;



CREATE TYPE share_mode AS ENUM ('readonly', 'readwrite');

CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(64) NOT NULL UNIQUE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode share_mode NOT NULL DEFAULT 'readonly',

  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_shares_token ON shares(token);
CREATE INDEX idx_shares_document_id ON shares(document_id);
CREATE INDEX idx_shares_owner_user_id ON shares(owner_user_id);
CREATE INDEX idx_shares_expires_at ON shares(expires_at);
CREATE INDEX idx_shares_active ON shares(token) WHERE revoked_at IS NULL;



CREATE TABLE IF NOT EXISTS share_accesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id UUID NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
  accessed_by_email VARCHAR(255),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent VARCHAR(500)
);

CREATE INDEX idx_share_accesses_share_id ON share_accesses(share_id);
CREATE INDEX idx_share_accesses_accessed_at ON share_accesses(accessed_at);



CREATE TYPE job_status AS ENUM ('pending', 'active', 'completed', 'failed', 'delayed');

CREATE TABLE IF NOT EXISTS processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  bull_queue_id VARCHAR(255),
  status job_status NOT NULL DEFAULT 'pending',

  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  error_message TEXT,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_processing_jobs_document_id ON processing_jobs(document_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_processing_jobs_bull_queue_id ON processing_jobs(bull_queue_id);
CREATE INDEX idx_processing_jobs_created_at ON processing_jobs(created_at);



CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent VARCHAR(500),
  status INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);



GRANT CONNECT ON DATABASE documents_db TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO postgres;



INSERT INTO users (email, password_hash, firstname, lastname)
VALUES (
  'test@example.com',
  '$2b$10$test123456789', 
  'Test',
  'User'
)
ON CONFLICT (email) DO NOTHING;



CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_folders_timestamp
BEFORE UPDATE ON folders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_documents_timestamp
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_processing_jobs_timestamp
BEFORE UPDATE ON processing_jobs
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


