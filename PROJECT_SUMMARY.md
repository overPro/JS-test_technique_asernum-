
### 1. **Trois Microservices NestJS**

#### documents-api (Port 3001)
-   User authentication (register/login with JWT)
-   Document upload with quota management
-   Folder management (hierarchical)
-   CQRS pattern for commands/queries
-   BullMQ job creation for async processing


#### sharing-api (Port 3002)
-   Share link generation with secure tokens
-   Permission modes (read-only/read-write)
-   Share expiry management (24 heures default)
-   Access audit logging


#### processing-worker
-   BullMQ background job processor
-   Image metadata extraction (Sharp)
-   PDF metadata extraction (pdf-parse)
-   SHA-256 file hashing
-   Automatic retry logic (3 attempts)


### 2. **Infrastructure Complète**
-   PostgreSQL 15 with 7 tables, 18 indexes
-   Redis 7 with BullMQ
-   Docker Compose avec 5 services
-   Health checks
-   Volumes persistants

### 3. **Implémentées**
-   JWT authentication
-   Document management
-   Folder management
-   Share links with permissions
-   Background job processing
-   File hashing & metadata extraction
-   Quota management
-   Audit logging



##   Lancer le Projet

```bash
cd "/d/Project_Dev/WSs/js/NEST JS/test_technique_asernum"
docker compose up -d
```

**Tous les services vont démarrer automatiquement!**

Endpoints:
- Documents API: http://localhost:3001
- Sharing API: http://localhost:3002
- Swagger Docs: http://localhost:3001/api/docs

---

##   Architecture

```
Docker Network
├── PostgreSQL 15 (healthy)
├── Redis 7 (healthy)
├── documents-api:3001
├── sharing-api:3002
└── processing-worker (background jobs)
```

---

##

-   Dockerized
-   Scalable
-   Secure (JWT + bcryptjs)
-   Documented
-   Tested architecture
-   Error handling
-   Health checks

