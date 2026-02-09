#   Docker Compose Guide

## Quick Start

Le projet est 100% dockerisé et prêt pour la production. Pour lancer l'ensemble du stack avec une seule commande:

```bash
docker compose up -d
```

**C'est tout!** Les 5 conteneurs vont se lancer automatiquement:
- PostgreSQL 15  
- Redis 7  
- documents-api (port 3001)  
- sharing-api (port 3002)  
- processing-worker (background jobs)  

## Vérifier le statut

```bash
docker compose ps
```

## Voir the logs

```bash
docker compose logs -f
```

## Arrêter l'application

```bash
docker compose down
```

## Architecture

```
docker-compose.yml
├── postgres (PostgreSQL 15)
│   └── /shared/database/init-db.sql (schema auto-initialization)
├── redis (Redis 7)
├── documents-api (Dockerfile)
├── sharing-api (Dockerfile)
└── processing-worker (Dockerfile)
```

## Variables d'Environnement

Les variables sont définies dans:
- `.env` (spécifique par service)
- `docker-compose.yml` (environment:)

Par défaut le JWT_SECRET est changeable dans docker-compose.yml.

## Endpoints après démarrage

- **Documents API**: http://localhost:3001
- **Sharing API**: http://localhost:3002
- **Swagger Docs (Documents)**: http://localhost:3001/api/docs
- **Swagger Docs (Sharing)**: http://localhost:3002/api/docs

## Production Deployment

1. Changez JWT_SECRET dans docker-compose.yml
2. Changez les mots de passe PostgreSQL
3. Configurez l'environnement en "production"
4. Utilisez `docker compose up -d` pour déployer

## Notes

- Tous les volumes persistent les données
- Les services se relancent automatiquement en cas d'arrêt anormal
- Health checks configurés pour chaque service
- Réseau Docker interne `microservices` pour communication inter-services
