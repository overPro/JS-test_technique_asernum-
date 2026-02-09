#   ÉTAPE 6 - Démarrage et Test Complet

##   Infrastructure Status

### Docker Containers
```
  PostgreSQL 15        : Port 5432 (Healthy)
  Redis 7              : Port 6379 (Healthy)

Database Tables Created:
    users              (7 tables)
    folders
    documents
    shares
    share_accesses
    processing_jobs
    audit_logs
```

### Services Built
```
  documents-api       : Compiled successfully
  sharing-api         : Compiled successfully
  processing-worker   : Compiled successfully
```

### Environment Files
```
  documents-api/.env
  sharing-api/.env
  processing-worker/.env
```

---

##   DÉMARRAGE DES SERVICES

### Option 1: Démarrage Manuel (Terminal Séparé)

Ouvrir **3 terminaux** différents et exécuter:

**Terminal 1 - Documents API:**
```bash
cd "/d/Project_Dev/WSs/js/NEST JS/test_technique_asernum/documents-api"
npm run start:dev
```

Expected output:
```
  Documents API running on http://localhost:3001
  Swagger docs: http://localhost:3001/api/docs
```

**Terminal 2 - Sharing API:**
```bash
cd "/d/Project_Dev/WSs/js/NEST JS/test_technique_asernum/sharing-api"
npm run start:dev
```

Expected output:
```
  Sharing API running on http://localhost:3002
  Swagger docs: http://localhost:3002/api/docs
```

**Terminal 3 - Processing Worker:**
```bash
cd "/d/Project_Dev/WSs/js/NEST JS/test_technique_asernum/processing-worker"
npm run start:dev
```

Expected output:
```
  Processing Worker initialized
  Listening to BullMQ queue: documents
```

---

##   TESTS COMPLETS

### Test 1: Health Check

```bash

curl http://localhost:3001/api/docs


curl http://localhost:3002/api/docs

# Redis
docker compose exec redis redis-cli ping


# PostgreSQL
docker compose exec postgres psql -U postgres -d documents_db -c "SELECT COUNT(*) FROM users;"

```

---

### Test 2: User Registration & Login

**Register new user:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "overdev@example.com",
    "password": "password123",
    "firstname": "OverDev",
    "lastname": "KRAMOH"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "Over@example.com",
    "firstname": " Over",
    "lastname": "Kramoh",
    "quota_bytes": 104857600,
    "used_bytes": 0,
    "created_at": "2026-02-07T02:52:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token for next tests:**
```bash
export TOKEN="<jwt-token-from-above>"
```

**Login existing user:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Kramoh@example.com",
    "password": "password123"
  }'
```

---

### Test 3: Document Upload (Triggers BullMQ Job)

**Create test image file:**
```bash

mkdir -p uploads/test
cd uploads/test


python3 << 'PYTHON'
import struct

# Minimal 1x1 PNG
png_data = bytes.fromhex(
    "89504e470d0a1a0a"  # PNG signature
    "0000000d494844520000000100000001"  # IHDR chunk (1x1)
    "0802000000907753de"  # Width=1, Height=1, 8-bit RGBA
    "0000000c49444154"  # IDAT chunk
    "088d6360000000020001"  # Image data (1 zero byte)
    "e521bc330000000049454e44ae426082"  # IEND chunk
)

with open('test.png', 'wb') as f:
    f.write(png_data)

print("  test.png created (1x1 PNG)")
PYTHON

cd ../..
```

**Upload document:**
```bash
curl -X POST http://localhost:3001/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@uploads/test/test.png" \
  -F "originalFilename=test.png" \
  -F "mimeType=image/png"
```

Expected response:
```json
{
  "id": "document-uuid",
  "filename": "1707282723456_test.png",
  "status": "pending",
  "sizeBytes": 69,
  "createdAt": "2026-02-07T02:52:10.000Z"
}
```

Save the document ID:
```bash
export DOCUMENT_ID="<id-from-response>"
```

---

### Test 4: Check Processing Status

Wait 2-3 seconds for worker to process:

```bash
curl -X GET http://localhost:3001/documents/$DOCUMENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

Expected response (after processing):
```json
{
  "id": "document-uuid",
  "filename": "test.png",
  "mimeType": "image/png",
  "sizeBytes": 69,
  "status": "completed",  ← Should be "completed" now
  "imageWidth": 1,        ← Metadata extracted
  "imageHeight": 1,       ← Metadata extracted
  "pdfPages": null,
  "fileHash": "sha256hash...",
  "createdAt": "2026-02-07T02:52:10.000Z"
}
```

---

### Test 5: Create Share Link

```bash
curl -X POST http://localhost:3002/shares/$DOCUMENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "readonly"}'
```

Expected response:
```json
{
  "id": "share-uuid",
  "token": "abc123def456...",
  "documentId": "document-uuid",
  "mode": "readonly",
  "expiresAt": "2026-02-08T02:52:20.000Z",
  "createdAt": "2026-02-07T02:52:20.000Z"
}
```

Save the token:
```bash
export SHARE_TOKEN="<token-from-response>"
```

---

### Test 6: Access Shared Document (Public)

```bash
curl -X GET http://localhost:3002/shares/token/$SHARE_TOKEN
```

Expected response:
```json
{
  "id": "share-uuid",
  "documentId": "document-uuid",
  "mode": "readonly",
  "expiresAt": "2026-02-08T02:52:20.000Z"
}
```

---

### Test 7: List User Documents

```bash
curl -X GET http://localhost:3001/documents \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "documents": [
    {
      "id": "document-uuid",
      "filename": "test.png",
      "mimeType": "image/png",
      "sizeBytes": 69,
      "status": "completed",
      "createdAt": "2026-02-07T02:52:10.000Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "take": 10
}
```

---

### Test 8: Folder Management

**Create folder:**
```bash
curl -X POST http://localhost:3001/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Documents"}'
```

Expected response:
```json
{
  "id": "folder-uuid",
  "name": "My Documents",
  "parentId": null,
  "createdAt": "2026-02-07T02:53:00.000Z"
}
```

---

### Test 9: Worker Processing Logs

Check the processing-worker terminal. You should see logs like:

```
[ProcessDocumentProcessor] Job started: job-id for document uuid-here
[DocumentProcessor] Processing document: document-uuid
[ImageProcessor] Image metadata extracted: (1x1)
[DocumentProcessor] Hash generated: sha256hash...
[DocumentProcessor] Document processed successfully: document-uuid
[ProcessDocumentProcessor] Job completed: job-id
```

---

##   Database Verification

**Check created user:**
```bash
docker compose exec -T postgres psql -U postgres -d documents_db \
  -c "SELECT id, email, quota_bytes, used_bytes FROM users WHERE email='Kramoh@example.com';"
```

**Check uploaded documents:**
```bash
docker compose exec -T postgres psql -U postgres -d documents_db \
  -c "SELECT id, filename, status, image_width, image_height, file_hash FROM documents LIMIT 5;"
```

**Check share links:**
```bash
docker compose exec -T postgres psql -U postgres -d documents_db \
  -c "SELECT id, token, mode, expires_at FROM shares LIMIT 5;"
```

---

##   Swagger Documentation

Open in browser:

- **Documents API**: http://localhost:3001/api/docs
- **Sharing API**: http://localhost:3002/api/docs

---

##   Troubleshooting

### Connection Refused on Port 3001/3002
```bash

pwd



ps aux | grep node
```

### Database Connection Error
```bash

docker compose ps postgres


docker compose logs postgres
```

### Redis Connection Error
```bash

docker compose ps redis


docker compose exec redis redis-cli ping
```

### Worker Not Processing Jobs
```bash



docker compose exec -T redis redis-cli KEYS "bull:*"
```

---

##   Summary Commands

```bash

docker compose up -d          
docker compose down           
docker compose logs -f        


npm run build:docs
npm run build:sharing
npm run build:worker


cd documents-api && npm run start:dev
cd sharing-api && npm run start:dev
cd processing-worker && npm run start:dev


export TOKEN="<from-register-response>"
export DOCUMENT_ID="<from-upload-response>"
export SHARE_TOKEN="<from-create-share-response>"
```




