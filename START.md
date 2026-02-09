#   DÉMARRER LE PROJET EN 1 COMMANDE

## ✨ C'EST SIMPLE:

```bash
docker compose up -d
```

**Voilà! Tous les services vont démarrer automatiquement.**

---

##   Ce qui va se lancer

```
  PostgreSQL 15       (port 5432)
  Redis 7             (port 6379)
  documents-api       (port 3001)
  sharing-api         (port 3002)
  processing-worker   (background jobs)
```

---

##   Endpoints après démarrage

- **API Docs (Documents)**: http://localhost:3001/api/docs
- **API Docs (Sharing)**: http://localhost:3002/api/docs

---

##   Vérifier le statut

```bash
docker compose ps
```

---

##   C'est tout!

Le projet de **73+ fichiers TypeScript** avec:
-   3 microservices NestJS
-   jwt authentication
-   CQRS pattern
-   BullMQ job processing
-   PostgreSQL 15 + Redis 7
-   Docker containerization
-   Production-ready code

**Est maintenant opérationnel avec une seule commande.**

---

##   Documentation

- **DOCKER_GUIDE.md** - Guide complet Docker
- **PROJECT_SUMMARY.md** - Résumé du projet
- **STARTUP_AND_TESTING_GUIDE.md** - Tests complets
- **README.md** - Vue d'ensemble

Consultez ces fichiers pour plus de détails.

---

##   C'EST TERMINÉ!

```bash
docker compose up -d
```

