

##   Lancement  Simple

```bash
docker compose up -d
```





```bash
# Vérifier le statut
docker compose ps

# Voir les logs
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs documents-api
docker compose logs sharing-api
docker compose logs processing-worker
```

---


1. **PostgreSQL 15** (port 5432)
   - Base: documents_db
   - User: postgres / Password: postgres
   - Schema: 7 tables, 18 indexes
   - Status: healthy  

2. **Redis 7** (port 6379)
   - Cache et BullMQ message broker
   - Status: healthy  

3. **documents-api** (port 3001)
   - User authentication
   - Document management
   - Folder management
   - Upload with BullMQ job creation
   - Swagger: http://localhost:3001/api/docs

4. **sharing-api** (port 3002)
   - Share link generation
   - Temporary tokens
   - Permission management
   - Swagger: http://localhost:3002/api/docs

5. **processing-worker** (background)
   - BullMQ job processor
   - Image metadata extraction
   - PDF metadata extraction
   - File hashing

---

##   Commandes Utiles

```bash
# Démarrer les services
docker compose up -d

# Arrêter les services
docker compose down

# Arrêter et supprimer tous les volumes
docker compose down -v

# Redémarrer
docker compose restart

# Voir les logs en temps réel
docker compose logs -f

# Entrer dans un conteneur
docker compose exec documents_api sh
docker compose exec documents_postgres psql -U postgres -d documents_db

# Voir les variables d'environnement
docker compose config
```

---



### Exemple avec curl

```bash
# 1. Créer un utilisateur
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Kramoh@example.com",
    "password": "password123",
    "firstname": " Over",
    "lastname": "Kramoh"
  }'

# 2. Se connecter
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Kramoh@example.com",
    "password": "password123"
  }'

# 3. Uploader un document (besoin du token JWT)
curl -X POST http://localhost:3001/documents/upload \
  -H "Authorization: Bearer <TOKEN_JWT>" \
  -F "file=@file.pdf"
```

---

##   Bonnes Pratiques

1. **Changer les mots de passe en production**
   - Éditez docker-compose.yml
   - Changez POSTGRES_PASSWORD
   - Changez JWT_SECRET

2. **Gérer les volumes**
   ```bash
   docker volume ls
   docker volume inspect test_technique_asernum_postgres_data
   ```

3. **Network**
   - Les services communiquent via: `http://service-name:port`
   - Exemple: `http://documents-api:3001`

4. **Logs et Monitoring**
   ```bash
   # Log structuré
   docker compose logs --timestamps

   # Suivre un service
   docker compose logs -f processing_worker
   ```

---





```bash
# Vérifier les logs
docker compose logs [service]

# Redémarrer
docker compose restart [service]

# Rebuild l'image
docker compose build --no-cache [service]
```










```bash
# Vérifier la santé
docker compose ps

# Voir les logs de postgres
docker compose logs documents_postgres

# Vérifier la connexion
docker compose exec documents_postgres psql -U postgres -c "SELECT 1"
```




Les données sont automatiquement sauvegardées dans:

```
- postgres_data     (données PostgreSQL)
- redis_data        (données Redis)
- uploads/          (fichiers uploadés)
```

Ces volumes restent même après `docker compose down`.

Pour les supprimer:
```bash
docker compose down -v
```

---


