#   Système de Gestion Collaborative de Documents

Microservices avec NestJS, PostgreSQL, Redis et BullMQ.

## Architecture

### Services

1. **documents-api** (Port 3001)
   - Authentification JWT
   - Gestion documents/dossiers
   - Upload fichiers (PDF, images, texte)
   - Recherche et métadonnées
   - CQRS pattern

2. **sharing-api** (Port 3002)
   - Génération liens temporaires
   - Gestion permissions
   - Révocation partages
   - Middleware authorization

3. **processing-worker**
   - Traitement asynchrone BullMQ
   - Extraction métadonnées (images, PDF)
   - Génération hash SHA-256
   - Gestion retry automatique (3 tentatives)
   - Logs détaillés des traitements

### Infrastructure

- PostgreSQL 15 (Port 5432)
- Redis 7 (Port 6379)
- Docker Compose v2

## Stack Technique

- **Framework:** NestJS (Fastify adapter)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL + TypeORM
- **Queue:** Redis + BullMQ
- **Auth:** JWT + Passport
- **Architecture:** CQRS (documents-api), Clean Architecture
- **Validation:** class-validator, Joi
- **API Docs:** Swagger/OpenAPI
- **File Processing:** Sharp (images), pdf-parse (PDF)
- **Hashing:** crypto-js (SHA-256)

## Installation Complète

### Prérequis

- Node.js v24.11.1
- npm v11.6.2
- Docker Desktop (avec Compose v2)

### 1. Installation des Dépendances

```bash
# Racine
npm install

# documents-api
cd documents-api
npm install
cd ..

# sharing-api
cd sharing-api
npm install
cd ..

# processing-worker
cd processing-worker
npm install
cd ..
```

### 2. Infrastructure (Docker)

```bash
# Démarrer PostgreSQL et Redis
docker compose up -d

# Vérifier les conteneurs
docker compose ps
```

**Conteneurs créés :**
- `postgres` (PostgreSQL 15)
- `redis` (Redis 7)

### 3. Migrations Base de Données

```bash
# Créer schéma et tables
npm run migrate
```

### 4. Démarrer les Services

Ouvrir **3 fenêtres CMD/Terminal différentes** :

**Terminal 1 - documents-api:**
```bash
cd documents-api
npm run start:dev
```

**Terminal 2 - sharing-api:**
```bash
cd sharing-api
npm run start:dev
```

**Terminal 3 - processing-worker:**
```bash
cd processing-worker
npm run start:dev
```

## Ports et URLs

| Service | Port | URL |
|---------|------|-----|
| documents-api | 3001 | http://localhost:3001 |
| documents-api Swagger | 3001 | http://localhost:3001/api/docs |
| sharing-api | 3002 | http://localhost:3002 |
| sharing-api Swagger | 3002 | http://localhost:3002/api/docs |
| PostgreSQL | 5432 | localhost:5432 |
| Redis CLI | 6379 | localhost:6379 |

## Communication Inter-Services

### Stratégie: Événements Redis + REST Synchrone

**Justification :**
- **Redis Events** : Pour les notifications asynchrones (upload → processing)
- **REST synchrone** : Pour les requêtes critiques (vérification status avant partage)
- **BullMQ** : Pour la queue job fiable avec retry automatique

### Flux Documents Upload

```
1. User upload fichier
   ↓
2. documents-api crée Document (status: pending)
   ↓
3. Crée BullMQ job → Redis queue
   ↓
4. processing-worker consomme job
   ↓
5. Extrait métadonnées (dimensions, pages, hash)
   ↓
6. Met à jour Document (status: completed)
   ↓
7. Sharing-api peut vérifier status via documents-api (REST)
```

### Avantages

-   **Découplage** : Services indépendants du timing
-   **Scalabilité** : Redis queue distribué
-   **Résilience** : Retry auto, pas de perte d'événements
-   **Monitoring** : Queue observable, logs centralisés

## Gestion Erreurs

### Codes HTTP Standardisés

- `400` : Bad Request (validation échouée)
- `401` : Unauthorized (pas d'auth)
- `403` : Forbidden (pas de permissions)
- `404` : Not Found (ressource inexistante)
- `409` : Conflict (dupliqué, quota dépassé)
- `410` : Gone (lien expiré, révoqué)
- `500` : Internal Server Error

### Global Exception Filter

Tous les services utilisent un filtre global d'exception qui :
- Normalise réponses d'erreur
- Log erreurs avec contexte
- Masque détails sensibles en prod
- Retourne JSON structuré

## Variables d'Environnement

### documents-api

Créer `.env` (copie de `.env.example`) :

```
NODE_ENV=development
LOG_LEVEL=debug
PORT=3001

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/documents_db
JWT_SECRET=your-super-secret-jwt-key-change-in-prod
JWT_EXPIRY=7d

REDIS_URL=redis://localhost:6379
REDIS_DB=0

UPLOAD_BASE_DIR=./uploads
UPLOAD_MAX_SIZE_MB=50
UPLOAD_ALLOWED_TYPES=application/pdf,image/jpeg,image/png,text/plain

USER_QUOTA_MB=100
```

### sharing-api

```
NODE_ENV=development
LOG_LEVEL=debug
PORT=3002

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/documents_db
JWT_SECRET=your-super-secret-jwt-key-change-in-prod

REDIS_URL=redis://localhost:6379

SHARE_LINK_EXPIRY_HOURS=24
SHARE_LINK_MAX_DOWN_DAYS=30
```

### processing-worker

```
NODE_ENV=development
LOG_LEVEL=debug

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/documents_db
REDIS_URL=redis://localhost:6379

WORKER_CONCURRENCY=5
WORKER_TIMEOUT_MS=30000
WORKER_RETRY_ATTEMPTS=3
WORKER_RETRY_DELAY_MS=5000
```

## Structure Codebase

```
test_technique_asernum/
├── documents-api/
│   ├── src/
│   │   ├── main.ts                    # Entry point
│   │   ├── app.module.ts              # Root module
│   │   ├── config/                    # Configuration
│   │   │   └── configuration.ts
│   │   ├── auth/                      # JWT, Guards
│   │   │   ├── auth.module.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt.guard.ts
│   │   │   └── auth.service.ts
│   │   ├── documents/                 # CQRS
│   │   │   ├── commands/
│   │   │   │   └── upload.command.ts
│   │   │   ├── queries/
│   │   │   │   └── get-document.query.ts
│   │   │   ├── handlers/
│   │   │   ├── document.entity.ts
│   │   │   └── documents.module.ts
│   │   ├── folders/                   # Dossiers
│   │   │   ├── folder.entity.ts
│   │   │   ├── folders.service.ts
│   │   │   └── folders.controller.ts
│   │   ├── uploads/                   # Upload handling
│   │   │   ├── upload.service.ts
│   │   │   └── uploads.controller.ts
│   │   ├── common/                    # Shared utilities
│   │   │   ├── exceptions/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── decorators/
│   │   │   └── constants.ts
│   │   └── database/                  # TypeORM config
│   │       └── database.module.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── sharing-api/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   ├── auth/
│   │   ├── shares/                    # Share links
│   │   │   ├── share.entity.ts
│   │   │   ├── shares.service.ts
│   │   │   └── shares.controller.ts
│   │   ├── permissions/               # Authorization
│   │   │   ├── permission.middleware.ts
│   │   │   └── permissions.service.ts
│   │   ├── common/
│   │   └── database/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── processing-worker/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   ├── jobs/                      # Job definitions
│   │   │   ├── process-document.job.ts
│   │   │   └── jobs.module.ts
│   │   ├── processors/                # Job processors
│   │   │   ├── image.processor.ts
│   │   │   ├── pdf.processor.ts
│   │   │   └── document.processor.ts
│   │   ├── common/
│   │   │   ├── logger/
│   │   │   └── errors/
│   │   └── database/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                            # Code partagé
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 001_init_schema.sql
│   │   │   └── migration.runner.ts
│   │   └── typeorm.config.ts
│   ├── types/
│   │   ├── document.type.ts
│   │   ├── share.type.ts
│   │   └── job.type.ts
│   └── constants/
│       └── http-codes.ts
│
├── docker-compose.yml
├── tsconfig.json                      # Racine
├── package.json                       # Racine
└── README.md
```

## Scripts Utiles

### Racine

```bash
# Build tous les services
npm run build

# Démarrer infrastructure
npm run docker:up

# Arrêter infrastructure
npm run docker:down

# Logs infrastructure
npm run docker:logs
```

### Par Service

```bash
# Development
npm run start:dev

# Production build
npm run build

# Run production
npm run start

# Linting (si configuré)
npm run lint

# Tests (si configuré)
npm run test
```

## Accès Base de Données

```bash
# Accès PostgreSQL via Docker
docker compose exec postgres psql -U postgres -d documents_db

# Commandes utiles une fois connecté:
\dt                          # Lister tables
\d documents                 # Décrire table
SELECT * FROM documents;     # Requête
\q                          # Quitter
```

## Accès Redis

```bash
# Redis CLI
docker compose exec redis redis-cli

# Lister clés
KEYS *

# Voir une clé
GET key_name

# Quitter
EXIT
```

## Arrêt et Reset Complet

```bash
# Arrêter et supprimer conteneurs (garde données)
docker compose down

# Arrêter et supprimer données (ATTENTION!)
docker compose down -v

# Restart complet
docker compose up -d
npm run migrate
```

## Monitoring et Logs

### Logs Docker

```bash
# Logs PostgreSQL
docker compose logs postgres -f

# Logs Redis
docker compose logs redis -f

# Tous les logs
docker compose logs -f
```



## Dépendances Principales

### documents-api

```json
{
  "@nestjs/common": "^10.2.x",
  "@nestjs/core": "^10.2.x",
  "@nestjs/jwt": "^11.0.x",
  "@nestjs/passport": "^10.0.x",
  "@nestjs/swagger": "^7.1.x",
  "@nestjs/cqrs": "^10.0.x",
  "@nestjs/typeorm": "^10.0.x",
  "@nestjs/config": "^3.0.x",
  "@nestjs/platform-fastify": "^10.2.x",
  "@nestjs/bullmq": "^10.0.x",
  "passport-jwt": "^4.0.x",
  "typeorm": "^0.3.x",
  "pg": "^8.11.x",
  "redis": "^4.6.x",
  "bullmq": "^5.0.x",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x",
  "joi": "^17.11.x"
}
```

### sharing-api

Similaire à documents-api (sans CQRS).

### processing-worker

```json
{
  "@nestjs/common": "^10.2.x",
  "@nestjs/core": "^10.2.x",
  "@nestjs/bullmq": "^10.0.x",
  "@nestjs/typeorm": "^10.0.x",
  "typeorm": "^0.3.x",
  "pg": "^8.11.x",
  "redis": "^4.6.x",
  "bullmq": "^5.0.x",
  "sharp": "^0.33.x",
  "pdf-parse": "^1.1.x"
}
```


