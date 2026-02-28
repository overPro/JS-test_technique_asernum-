#  📄 ASERNUM Document Management System - Production Ready

## 🏗️ Architecture Système

### Aperçu Microservices

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client / Frontend                            │
│                    (HTTP/REST Requests)                           │
└─────────┬─────────────────────────────────────────────────────────┘
          │
          ├─────────────────────┬─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
   ┌─────────────┐       ┌─────────────┐       ┌──────────────┐
   │ Documents   │       │  Sharing    │       │   Processing │
   │   API       │       │   API       │       │   Worker     │
   │ :3001       │       │  :3002      │       │  (Internal)  │
   ├─────────────┤       ├─────────────┤       ├──────────────┤
   │ - Auth      │       │ - Auth      │       │ - BullMQ     │
   │ - Upload    │       │ - Share     │       │  Consumer    │
   │ - Documents │       │  Management │       │ - PDF/Image  │
   │ - CQRS      │       │ - Perms     │       │  Processing  │
   │ - BullMQ    │       │              │       │ - Metadata   │
   │  Producer   │       │              │       │  Extraction  │
   └──────┬──────┘       └──────┬───────┘       └──────┬───────┘
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                           ┌────┴─────┐
                           │           │
                      ┌────▼──┐   ┌───▼────┐
                      │PostgreSQL │ │ Redis  │
                      │ Database  │ │ Cache  │
                      │(Shared)   │ │ Queue  │
                      └──────────┘ └────────┘
```

### Stack Technique

- **Framework:** NestJS 10.2.10 (Fastify adapter)
- **Language:** TypeScript 5.3 (strict mode)
- **Database:** PostgreSQL 15 + TypeORM 0.3.17
- **Queue:** Redis 7 + BullMQ 5.0
- **Auth:** JWT + Passport
- **API:** Swagger/OpenAPI auto-générée
- **Architecture Patterns:** CQRS, Clean Architecture, Microservices


## 🚀 Démarrage Rapide avec Docker Compose

### Prérequis

- Docker Engine 24+ (ou Docker Desktop 4.26+)
- Docker Compose 2+

### Installation & Démarrage

```bash
# 1. Cloner le projet
git clone <repo-url>
cd test_technique_asernum

# 2. Créer le fichier .env (configuration automatique fournie)
cp .env.example .env

# 3. Démarrer tous les services
docker-compose up --build -d

# 4. Vérifier la santé des services (patience 30 secondes)
docker-compose ps

# Tous les services doivent afficher "healthy" ou "Up"
```

### Endpoints Disponibles

```
Documents API:   http://localhost:3001
  Swagger:       http://localhost:3001/api/docs
  Health Check:  http://localhost:3001/health

Sharing API:     http://localhost:3002
  Swagger:       http://localhost:3002/api/docs
  Health Check:  http://localhost:3002/health

PostgreSQL Database:
  Host: localhost:5432
  User: postgres
  Password: postgres
  Database: documents_db

Redis:
  Host: localhost:6379
  DB: 0
```

---

## 📋 Test Complet du Système

### Test 1: Authentification

```bash
# Register (créer un compte)
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstname": "John",
    "lastname": "Doe"
  }'

# Sauvegardez le TOKEN retourné
TOKEN="eyJhbGci..."

# Login (se connecter)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Test 2: Upload de Fichier

```bash
# Créer un fichier de test
echo "Contenu du fichier de test" > test.txt

# Upload
curl -X POST http://localhost:3001/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt"

# Résultat: Vous obtenez un DOCUMENT_ID et le status "pending"
# → Le worker va traiter le fichier en arrière-plan
DOCUMENT_ID="550e8400-..."

# Vérifier le statut (attendez 2-3 secondes)
curl -X GET http://localhost:3001/documents/$DOCUMENT_ID \
  -H "Authorization: Bearer $TOKEN"

# Le status doit devenir "completed" avec métadonnées
```

### Test 3: Créer un Partage

```bash
# Créer un lien de partage (APRÈS que status = "completed")
curl -X POST http://localhost:3002/shares/$DOCUMENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "readonly"
  }'

# Résultat inclut un "token"
SHARE_TOKEN="a3c8f2e1d..."

# Accéder au partage sans authentification (endpoint public)
curl -X GET "http://localhost:3002/shares/public/token/$SHARE_TOKEN"

# Réponse: l'ID du document et le mode (sans révéler le propriétaire)
```

### Test 4: Restrictions Fonctionnelles

```bash
# Essayer de partager un document non traité (devrait échouer)
curl -X POST http://localhost:3002/shares/$DOCUMENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "readonly"}'

# Erreur attendue: HTTP 409
# Message: "Document must be completed before sharing. Current status: pending"
```

### Test 5: Persistance des Données

```bash
# Arrêter et relancer les services
docker-compose down
sleep 5
docker-compose up -d

# Vérifier que les données sont intactes
curl -X GET http://localhost:3001/documents \
  -H "Authorization: Bearer $TOKEN"

# Tous les documents doivent toujours être présents
```

---

## ✅ Checklist QA Complète

### Démarrage & Infrastructure
- [ ] `docker-compose ps` affiche 5 services (postgres, redis, documents-api, sharing-api, processing-worker)
- [ ] Tous ont le status "healthy" ou "Up"
- [ ] PostgreSQL initialise `init-db.sql` à la première exécution
- [ ] Redis est accessible

### Authentification
- [ ] Register crée un nouvel utilisateur avec email unique
- [ ] Login retourne un JWT valide (durée: 7d)
- [ ] Endpoints protégés rejetent requêtes sans Bearer token (HTTP 401)
- [ ] JWT expiré retourne HTTP 401

### Upload et Traitement
- [ ] Upload crée document en status "pending"
- [ ] Processing Worker traite le job automatiquement (< 5 secondes)
- [ ] Status change à "completed" une fois traité
- [ ] Métadonnées (hash, file_path) sont extraites
- [ ] Fichiers > 50MB sont rejetés (HTTP 400)
- [ ] Quota utilisateur (100MB) est respecté
- [ ] MIME types non autorisés sont rejetés (HTTP 400)

### Partage de Documents
- [ ] Créer partage pour document "PENDING" → HTTP 409 ✅
- [ ] Créer partage pour document "COMPLETED" → Succès ✅
- [ ] Accès token public fonctionne sans auth ✅
- [ ] Token unique, sécurisé, aléatoire ✅
- [ ] Expiration 24h (configurable) ✅

### Docker & Persistance
- [ ] `docker-compose down` conserve les données
- [ ] `docker-compose up` restaure l'état précédent
- [ ] Redémarrage n'entraîne pas de perte de données

---

## 🐛 Guide de Debug

### Les services ne décmarrent pas

```bash
# Voir les logs détaillés
docker-compose logs documents-api
docker-compose logs processing-worker

# Vérifier la connexion PostgreSQL
docker-compose exec documents-api nc -zv postgres 5432

# Vérifier la connexion Redis
docker-compose exec documents-api redis-cli -h redis ping
```

### Document reste "pending" après 10 secondes

```bash
# Vérifier le worker est actif
docker-compose logs processing-worker | grep "Job started"

# Vérifier Redis queue
docker-compose exec redis redis-cli info stats

# Logs d'erreur du worker
docker-compose logs processing-worker | grep -i "error"

# Redémarrer le worker
docker-compose restart processing-worker
```

### Impossible de partager un document

```bash
# Vérifier le statut du document
curl -X GET http://localhost:3001/documents/$DOCUMENT_ID \
  -H "Authorization: Bearer $TOKEN" | grep status

# Doit afficher "status": "completed"
```

---

## 📊 Service Details

### documents-api (Port 3001)

**Responsabilités:**
- Authentification JWT
- Gestion upload fichiers
- CQRS pour documents (Commands + Queries)
- Création jobs BullMQ
- Métadonnées documents

**Patterns:**
- CQRS (Command Query Responsibility Segregation)
- Repository Pattern
- Dependency Injection

**Key Files:**
- `src/documents/handlers/commands/upload-document.handler.ts` - Upload CQRS
- `src/documents/documents.controller.ts` - Upload endpoint
- `src/uploads/uploads.service.ts` - Sauvegarde réelle fichiers


### sharing-api (Port 3002)

**Responsabilités:**
- Gestion liens de partage
- Génération tokens aléatoires
- Vérification statut document avant partage
- Gestion expiration + révocation
- Audit access logs

**Security:**
- Endpoint public `/shares/public/token/:token` sécurisé
- Validation status document COMPLETED obligatoire
- Tokens non guessables (crypto.randomBytes)

**Key Files:**
- `src/shares/shares.service.ts` - Logique partage
- `src/database/repositories/document.repository.ts` - Vérification documents


### processing-worker (Service Interne)

**Responsabilités:**
- Consommation jobs BullMQ
- Extraction métadonnées (PDF, images)
- Génération hash SHA-256
- Retry automatique (3 tentatives)
- Mise à jour statut documents

**Features:**
- Worker scalable (répliquez N instances)
- Gestion d'erreurs + logs
- Graceful shutdown (SIGTERM/SIGINT)

**Key Files:**
- `src/jobs/process-document.job.ts` - Job processor
- `src/processors/document.processor.ts` - Orchestration métier

---

## 🔒 Sécurité

### Validations Input

✅ JWT validé à chaque requête authentifiée
✅ Email unique + validé
✅ Mot de passe hashé (bcrypt, 10 rounds)
✅ Taille fichier validée (50MB max)
✅ MIME types validés (whitelist)
✅ SQL Injection protection (TypeORM + parameterized queries)
✅ XSS prevention (pas de contenu HTML/JS)

### Endpoints Publics vs Protégés

```
PUBLICS:
  POST   /auth/register
  POST   /auth/login
  GET    /shares/public/token/:token  ← Sécurisé (affiche juste doc ID)

PROTÉGÉS (JWT requis):
  GET    /documents/*
  POST   /documents/upload
  DELETE /documents/:id
  POST   /shares/:documentId
  GET    /shares
```

---

## 📝 Structure Codebase

```
test_technique_asernum/
├── documents-api/
│   ├── src/
│   │   ├── main.ts                           # Entry + Fastify config
│   │   ├── app.module.ts
│   │   ├── auth/                             # JWT + Passport
│   │   ├── documents/                        # CQRS documents
│   │   │   ├── commands/
│   │   │   ├── queries/
│   │   │   ├── handlers/
│   │   │   └── documents.controller.ts
│   │   ├── uploads/                          # Service upload
│   │   │   └── uploads.service.ts
│   │   ├── config/                           # Configuration Joi
│   │   └── database/                         # TypeORM config
│   ├── dist/                                 # Build output
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── sharing-api/
│   ├── src/
│   │   ├── main.ts
│   │   ├── shares/                           # Gestion partages
│   │   │   ├── shares.controller.ts
│   │   │   ├── shares.service.ts
│   │   │   └── shares.module.ts
│   │   ├── database/
│   │   │   ├── entities/
│   │   │   │   ├── share.entity.ts
│   │   │   │   └── document.entity.ts        # ← Nouvelle entité
│   │   │   └── repositories/
│   │   │       ├── share.repository.ts
│   │   │       └── document.repository.ts    # ← Nouveau repository
│   │   └── config/
│   ├── dist/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── processing-worker/
│   ├── src/
│   │   ├── main.ts                           # Bootstrap amélioré
│   │   ├── jobs/
│   │   │   └── process-document.job.ts       # BullMQ processor
│   │   ├── processors/
│   │   │   ├── document.processor.ts
│   │   │   ├── image.processor.ts
│   │   │   └── pdf.processor.ts
│   │   └── config/
│   ├── dist/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── shared/
│   └── database/
│       └── init-db.sql                       # Schéma initial
│
├── uploads/                                   # ← Répertoire fichiers uploadés
├── docker-compose.yml
├── Dockerfile                                # (à la racine, optionnel)
├── .env                                      # ← Variables prod
├── .env.example                              # ← Template
└── README.md
```

---

## 🔧 Configuration

### Variables Globales (.env)

```bash
# PostgreSQL
DOCKER_POSTGRES_USER=postgres
DOCKER_POSTGRES_PASSWORD=postgres
DOCKER_POSTGRES_DB=documents_db

# API Ports
DOCUMENTS_API_PORT=3001
SHARING_API_PORT=3002

# Database (shared)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/documents_db

# Redis
REDIS_URL=redis://redis:6379
REDIS_DB=0

# JWT
JWT_SECRET=<secret-64-chars-change-in-prod>
JWT_EXPIRY=7d

# Upload
UPLOAD_MAX_SIZE_MB=50
UPLOAD_ALLOWED_TYPES=application/pdf,image/jpeg,image/png,text/plain
USER_QUOTA_MB=100

# Sharing
SHARE_LINK_EXPIRY_HOURS=24

# Worker
WORKER_CONCURRENCY=5
WORKER_TIMEOUT_MS=30000
WORKER_RETRY_ATTEMPTS=3

# Logging
LOG_LEVEL=debug
NODE_ENV=production
```

### Correctionss Apportées (29 Février 2025)

✅ **Sauvegarde réelle fichiers:** Fichier buffer passé via CQRS et sauvegardé par UploadsService
✅ **Fastify Multipart:** Plugin @fastify/multipart enregistré dans main.ts
✅ **Worker Bootstrap:** Graceful shutdown avec SIGTERM/SIGINT handlers
✅ **Vérification status:** Document doit être COMPLETED avant partage
✅ **Endpoint sécurisé:** Token validation est endpoint public (_/shares/public/token_)
✅ **Expiration partage:** Vérifiée au niveau repository
✅ **Migrations DB:** `migrationsRun: true` pour execution automatique
✅ **DocumentEntity:** Non-null assertions ajoutées pour TypeScript

---

## 🚦 État Production

- ✅ Services démarrent sans erreur
- ✅ PostgreSQL & Redis initialisés
- ✅ Authentification fonctionnelle
- ✅ Upload & Processing réels
- ✅ Partage avec validations
- ✅ Redémarrage sans perte
- ✅ Health checks actifs
- ✅ Swagger documentation
- ✅ Configuration externalisée
- ✅ Logs & error handling

**Status: PRODUCTION READY** ✅

---

## 📞 Commandes Utiles

```bash
# Infrastructure
docker-compose up -d                         # Démarrer
docker-compose down                          # Arrêter
docker-compose ps                            # Statut
docker-compose logs -f                       # Logs live
docker-compose restart <service>             # Relancer

# Build
docker-compose build                         # Rebuilder images
docker-compose build --no-cache              # Sans cache

# Database
docker-compose exec postgres psql -U postgres -d documents_db
  \dt                                        # Lister tables
  \d documents                               # Décrire table
  SELECT * FROM documents LIMIT 10;          # Query
  \q                                         # Quitter

# Redis
docker-compose exec redis redis-cli
  KEYS *                                     # Lister clés
  INFO stats                                 # Statistiques
  EXIT                                       # Quitter

# Scaling
docker-compose up -d --scale processing-worker=3  # 3 workers
```

---

**Version:** 2.0.0 (Production Ready)
**Mise à jour:** 28-29 Février 2025
**Authored by:** ASERNUM Development Team


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


