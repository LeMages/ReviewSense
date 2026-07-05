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

## Model Promotion

## Monitoring

## Reproducibility
