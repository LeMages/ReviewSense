# ReviewSense

Sentiment analysis platform for product reviews.

## Architecture

## Setup

## CI/CD

### GitHub Secrets Configuration

The `cd-staging.yml` and `cd-production.yml` workflows read the following secrets from **Settings → Secrets and variables → Actions**:

| Secret | Description | Where to find it |
|---|---|---|
| `STAGING_DATABASE_URL` | PostgreSQL connection string for staging | Your staging DB provider (e.g. Railway/Render dashboard) |
| `STAGING_MONGO_URI` | MongoDB connection string for staging | Your staging Mongo provider (e.g. MongoDB Atlas connection string) |
| `PROD_DATABASE_URL` | PostgreSQL connection string for production | Your production DB provider (e.g. Railway/Render dashboard) |
| `PROD_MONGO_URI` | MongoDB connection string for production | Your production Mongo provider (e.g. MongoDB Atlas connection string) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console → APIs & Services → Credentials |
| `JWT_SECRET` | Secret key for JWT signing | Generate a strong random value yourself (e.g. `openssl rand -base64 32`) |
| `MLFLOW_TRACKING_URI` | DagsHub MLflow tracking URL | DagsHub repo → Remote → MLflow tracking URI |
| `MLFLOW_TRACKING_USERNAME` | DagsHub username | DagsHub account settings |
| `MLFLOW_TRACKING_PASSWORD` | DagsHub access token | DagsHub → Settings → Tokens |
| `RAILWAY_TOKEN_STAGING` | Railway project token scoped to the `staging` environment | Railway dashboard → Project Settings → Tokens |
| `RAILWAY_TOKEN_PRODUCTION` | Railway project token scoped to the `production` environment | Railway dashboard → Project Settings → Tokens |
| `STAGING_MAIN_API_URL` | Public URL of `main-api` on staging (used by the post-deploy smoke test) | Railway → `main-api` service (staging) → Settings → Networking |
| `STAGING_ML_SERVICE_URL` | Public URL of `ml-service` on staging (used by the post-deploy smoke test) | Railway → `ml-service` service (staging) → Settings → Networking |
| `PROD_MAIN_API_URL` | Public URL of `main-api` on production (used by the post-deploy smoke test) | Railway → `main-api` service (production) → Settings → Networking |
| `PROD_ML_SERVICE_URL` | Public URL of `ml-service` on production (used by the post-deploy smoke test) | Railway → `ml-service` service (production) → Settings → Networking |

## Déploiement sur Railway

Cette section décrit comment déployer les 4 services applicatifs (`main-api`, `ml-service`,
`notification-service`, `frontend`) sur [Railway](https://railway.app), avec deux
environnements distincts (`staging` et `production`). Le fichier `railway.toml` à la
racine du repo documente la configuration cible (root directory, port, healthcheck)
de chaque service — Railway ne permettant pas de créer plusieurs services depuis un
seul fichier pour un monorepo, la création des services se fait manuellement dans le
dashboard en suivant les étapes ci-dessous.

### a. Créer le projet Railway et connecter le repo GitHub

1. Sur [railway.app](https://railway.app), cliquer sur **New Project → Deploy from GitHub repo**.
2. Sélectionner le repo `ReviewSense` (autoriser l'accès Railway si demandé).
3. Railway crée un projet vide : ne pas laisser Railway auto-détecter un service à ce stade, on va créer chaque service manuellement (étape c).

### b. Créer les 2 environnements "staging" et "production"

1. Dans le projet Railway, ouvrir le sélecteur d'environnement (en haut, à côté du nom du projet).
2. Un environnement `production` existe par défaut. Cliquer sur **New Environment**, nommer le second `staging`.
3. Chaque environnement a ses propres variables, ses propres déploiements et son propre domaine public par service — les étapes c à f sont à répéter dans les deux environnements.

### c. Configurer les 4 services

Pour chaque service, dans l'environnement courant : **New → GitHub Repo** (ou **Empty Service** puis connecter le repo), puis dans **Settings** :

| Service | Root Directory | Port cible | Healthcheck |
|---|---|---|---|
| `main-api` | `backend/main-api` | `3000` | `/health` |
| `ml-service` | `backend/ml-service` | `8000` | `/health` |
| `notification-service` | `backend/notification-service` | `4000` | `/` |
| `frontend` | `frontend` | `80` | `/` |

Railway détecte automatiquement le `Dockerfile` présent dans chaque `Root Directory`
et builde l'image avec. Dans **Settings → Networking**, activer un domaine public
(`Generate Domain`) et vérifier que le port cible correspond à la colonne "Port cible"
ci-dessus (les 4 Dockerfiles respectent `$PORT` ou exposent le port documenté).

### d. Ajouter les bases de données

Deux options, à choisir par environnement :

- **PostgreSQL** : dans chaque environnement, **New → Database → Add PostgreSQL**. Railway
  fournit une variable `DATABASE_URL` sur le plugin — recopier sa valeur (ou la référencer
  avec `${{Postgres.DATABASE_URL}}`) dans la variable `DATABASE_URL` du service `main-api`.
- **MongoDB** : soit **New → Database → Add MongoDB** sur Railway, soit un cluster
  [MongoDB Atlas](https://www.mongodb.com/atlas) gratuit (M0) — recommandé pour rester
  dans le tier gratuit Railway. Dans ce cas, créer un cluster Atlas par environnement
  (ou une base par environnement dans le même cluster) et copier la connection string
  dans la variable `MONGO_URI` de `main-api` et `ml-service`.

### e. Configurer les variables d'environnement (12-factor)

Chaque service ne reçoit que les variables dont il a besoin — pas de fichier `.env`
partagé entre services en production, conformément au principe 12-factor "Config".
Ces variables se configurent dans **Settings → Variables** de chaque service, séparément
par environnement (`staging` et `production` ont des valeurs différentes : bases de
données distinctes, `GOOGLE_CALLBACK_URL`/`FRONTEND_URL` distincts, etc.).

**`main-api`**

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | connection string Postgres de l'environnement |
| `MONGO_URI` | connection string Mongo de l'environnement |
| `JWT_SECRET` | secret fort, différent entre staging et production |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | credentials OAuth Google |
| `GOOGLE_CALLBACK_URL` | URL publique Railway de `main-api` + `/auth/google/callback` |
| `FRONTEND_URL` | URL publique Railway de `frontend` |
| `ML_SERVICE_URL` | URL publique Railway de `ml-service` |
| `NOTIF_SERVICE_URL` | URL publique Railway de `notification-service` |

**`ml-service`**

| Variable | Valeur |
|---|---|
| `MONGO_URI` | connection string Mongo de l'environnement |
| `MLFLOW_TRACKING_URI` / `MLFLOW_TRACKING_USERNAME` / `MLFLOW_TRACKING_PASSWORD` | credentials DagsHub MLflow |
| `MODEL_NAME` | nom du modèle enregistré (`reviewsense-sentiment`) |
| `MODEL_STAGE` | `Staging` pour l'environnement staging, `Production` pour l'environnement production |

**`notification-service`** : aucune variable requise (le port est fourni par Railway via `PORT`).

**`frontend`** : build-time uniquement (Vite), aucune variable runtime requise — l'app appelle `main-api` depuis le navigateur.

### f. Configurer le déploiement automatique

Pour chaque service, dans **Settings → Source** :

- Dans l'environnement **staging** : brancher le service sur la branche `staging` du repo (**Deploy Triggers → Branch = `staging`**). Chaque push sur `staging` redéploie automatiquement les 4 services de cet environnement.
- Dans l'environnement **production** : brancher le service sur la branche `main` (**Deploy Triggers → Branch = `main`**). Chaque push sur `main` (donc chaque merge de `staging` vers `main`) redéploie automatiquement les 4 services de cet environnement.

En complément du déploiement automatique déclenché par Railway lui-même sur push,
les workflows `cd-staging.yml` et `cd-production.yml` déclenchent aussi un déploiement
via la Railway CLI (`railway up --service ... --environment ...`) authentifié avec
`RAILWAY_TOKEN_STAGING` / `RAILWAY_TOKEN_PRODUCTION`, puis exécutent
`scripts/deploy-check.sh` pour vérifier que le déploiement répond correctement.

### Vérifier un déploiement manuellement

Une fois les services déployés (staging ou production), vérifier qu'ils répondent :

```bash
./scripts/deploy-check.sh https://<url-main-api> https://<url-ml-service>
```

Le script attend `401` sur `GET /auth/me` et `POST /api/v1/external/predict` (l'app
tourne et l'authentification est bien appliquée) et `200` sur `GET /health` du ml-service.

## Model Promotion

## Monitoring

Prometheus and Grafana are provisioned via `docker-compose.yml` and configuration files in `monitoring/`.

Once the stack is running (`docker compose up`), the dashboards are available at:

| Service | URL | Login |
|---|---|---|
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3001 | `admin` / `admin` |

Grafana is pre-provisioned with:
- A **Prometheus** datasource pointing to `http://prometheus:9090` (`monitoring/grafana/provisioning/datasources/datasource.yml`)
- The **ReviewSense Production Monitoring** dashboard (`monitoring/grafana/provisioning/dashboards/reviewsense.json`), with 4 panels: Request Volume, Prediction Latency (p95), Error Rate, and Backend Health.

Prometheus scrapes `/metrics` from `ml-service:8000` and `main-api:3000` (see `monitoring/prometheus.yml`). The main API needs `prom-client` wired up to expose its `/metrics` endpoint before its metrics will appear.

## Reproducibility
