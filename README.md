# ReviewSense

[![CI Dev](https://github.com/LeMages/ReviewSense/actions/workflows/ci-dev.yml/badge.svg)](https://github.com/LeMages/ReviewSense/actions/workflows/ci-dev.yml)
[![CD Staging](https://github.com/LeMages/ReviewSense/actions/workflows/cd-staging.yml/badge.svg)](https://github.com/LeMages/ReviewSense/actions/workflows/cd-staging.yml)
[![CD Production](https://github.com/LeMages/ReviewSense/actions/workflows/cd-production.yml/badge.svg)](https://github.com/LeMages/ReviewSense/actions/workflows/cd-production.yml)

> Sentiment analysis platform for product reviews, built around a polyglot microservices
> architecture (Node.js + Python + React) and shipped with a fully automated MLOps loop:
> versioned data (DVC), tracked experiments (MLflow), gated model promotion, and
> end-to-end CI/CD pipelines on GitHub Actions.

ReviewSense lets users submit a product review, returns a sentiment label
(`positive` / `negative` / `neutral`) with a confidence score, stores the prediction
in PostgreSQL, and pushes a real-time notification over WebSocket. The classification
model is trained on Amazon Reviews data, versioned with DVC, tracked in MLflow, and
promoted to production only when it clears automated quality gates.

The frontend features a custom **Neural Pulse** dark design system built with
**Tailwind CSS v4**, **shadcn/ui**, **Framer Motion** animations, and **Recharts**
for interactive data visualization — blending a tech/AI aesthetic with a
production-grade user experience.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Getting Started](#getting-started)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Model Promotion](#model-promotion)
5. [Data Versioning](#data-versioning)
6. [Monitoring](#monitoring)
7. [API Documentation](#api-documentation)
8. [Reproducibility](#reproducibility)
9. [Team](#team)

---

## Architecture

ReviewSense is a monorepo that contains four independently deployable services plus a
machine-learning training pipeline. The React frontend talks to a single backend
(`main-api`) which orchestrates everything: persistence, OAuth, calls to the
`ml-service` for prediction, and fan-out to the `notification-service` over WebSocket.

```
                                 ┌──────────────────────┐
                                 │       Browser        │
                                 │   (React + Vite)     │
                                 └──────────┬───────────┘
                                            │ HTTPS
                                            ▼
                                 ┌──────────────────────┐
                                 │      main-api        │
                                 │  (Node.js · Express) │
                                 │  REST + GraphQL      │
                                 └──┬────────┬──────────┘
                                    │        │
            ┌───────────────────────┘        └─────────────────────────┐
            │ HTTP (predict)                                            │ HTTP (notify)
            ▼                                                          ▼
  ┌──────────────────────┐                                  ┌──────────────────────────┐
  │     ml-service       │                                  │  notification-service    │
  │  (Python · FastAPI)  │                                  │   (Node.js · WS + HTTP)  │
  │  loads model from    │                                  │   real-time fan-out      │
  │  MLflow (Production) │                                  └────────────┬─────────────┘
  └──────────┬───────────┘                                               │ WebSocket
             │                                                          ▼
             │                                                  ┌──────────────────────┐
             │                                                  │       Browser        │
             │                                                  └──────────────────────┘
             │
             ▼
   ┌────────────────────┐         ┌────────────────────┐
   │   PostgreSQL 16    │         │     MongoDB 7      │
   │  users · reviews   │         │  predictions log   │
   └────────────────────┘         └────────────────────┘

   ┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
   │     Prometheus     │◀────────│  ml-service /metrics│        │   MLflow (DagsHub) │
   │  scrapes /metrics  │         │  main-api /metrics │        │  experiments +     │
   └─────────┬──────────┘         └────────────────────┘        │  model registry     │
             │                                                   └────────────────────┘
             ▼
   ┌────────────────────┐
   │      Grafana       │
   │  pre-built dashboard│
   └────────────────────┘
```

### Tech stack per component

| Component | Language | Framework | Storage | Port |
|---|---|---|---|---|
| `frontend` | TypeScript | React 19, Vite, Tailwind CSS 4, shadcn/ui, Framer Motion, Apollo Client, Recharts, Sonner | – | `5173` (dev) / `80` (docker) |
| `main-api` | JavaScript | Node.js 20, Express, Apollo Server, Passport (Google OAuth), Sequelize | PostgreSQL 16 | `3000` |
| `ml-service` | Python | Python 3.12, FastAPI, scikit-learn (TF-IDF + Logistic Regression), prometheus-fastapi-instrumentator | MongoDB 7 (prediction log) | `8000` |
| `notification-service` | JavaScript | Node.js 20, Express, `ws` (WebSocket) | – | `4000` |
| `ml` (training) | Python | Python 3.12, scikit-learn, MLflow, DVC | DVC remote (S3/GDrive) | – |
| `monitoring` | – | Prometheus, Grafana (pre-provisioned dashboard) | Prometheus TSDB | `9090` / `3001` |

---

## Getting Started

### Prerequisites

Make sure the following tools are installed on your machine:

- **Docker** ≥ 24.x and **Docker Compose** v2 (the project ships a single `docker-compose.yml`)
- **Node.js 20** (LTS) — for the `frontend` and `main-api` services
- **Python 3.12** with [uv](https://docs.astral.sh/uv/) — for the `ml-service` and the `ml/` training pipeline
- **DVC** — for data versioning (`pip install dvc` or `uv tool install "dvc[gdrive]"`)

### Clone & setup

```bash
# 1. Clone the repository
git clone https://github.com/LeMages/ReviewSense.git
cd reviewsense

# 2. Create your local environment file
cp .env.example .env
# -> open .env and fill in the missing values:
#    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET,
#    MLFLOW_TRACKING_URI, MLFLOW_TRACKING_USERNAME, MLFLOW_TRACKING_PASSWORD
#    (a .env with dev defaults for everything else is already provided)

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Boot the full stack
docker compose up --build
```

### Run the frontend standalone (for UI development)

```bash
cd frontend
npm run dev        # starts Vite dev server at http://localhost:5173
npm run build      # production build → dist/
npm run lint       # run oxlint
npm run test:e2e   # Playwright E2E tests
```

The first build pulls and compiles the four Docker images, then starts every service in
the right order (`postgres` and `mongo` first, then `ml-service`, `main-api` and
`notification-service`, then `frontend`, then the observability stack).

### Access the running services

| Service | URL | Notes |
|---|---|---|
| Frontend (React app) | http://localhost:5173 | Login with Google (OAuth) |
| Main API (REST + GraphQL) | http://localhost:3000 | `/health`, `/auth/*`, `/api/v1/*`, `/graphql` |
| ML Service (FastAPI) | http://localhost:8000 | `/health`, `/predict`, `/metrics` |
| Notification Service | http://localhost:4000 (HTTP) / `ws://localhost:4000` (WS) | |
| Prometheus | http://localhost:9090 | metrics scraping |
| Grafana | http://localhost:3001 | login `admin` / `admin` |

---

## CI/CD Pipeline

We follow a strict **Git Flow** with three long-lived branches and one short-lived
branch per change:

```
feature/*  ──PR──▶  dev  ──PR──▶  staging  ──PR──▶  main
   (CI)            (CI)            (CD staging)        (CD production)
```

| Branch | Trigger | Pipeline | Purpose |
|---|---|---|---|
| `feature/*` | Pull request to `dev` | `ci-dev.yml` | Run unit tests + type-check + Docker build for every service. Branch is **not deployable** until it passes. |
| `dev` | Push | `ci-dev.yml` | Continuous integration, no deployment. Acts as the integration trunk. |
| `staging` | Push | `cd-staging.yml` | Full test suite (backend unit + integration + ML tests). Pre-prod validation gate. |
| `main` | Push (after `staging` PR) | `cd-production.yml` | Runs the **quality gates** on the Staging model in MLflow, promotes it to Production if it passes, then deploys the four services to Railway (production) and runs the smoke test. |

### Pipeline details

- **`ci-dev.yml`** — runs on every PR to `dev`:
  1. `test-main-api` — `npm ci && npm test` (Jest)
  2. `test-ml-service` — `uv sync && uv run pytest tests/ -v`
  3. `lint-frontend` — `npm ci && npx tsc --noEmit`
  4. `build-docker` — depends on the three jobs above; builds the four Docker images
     (`main-api`, `ml-service`, `notification-service`, `frontend`) with
     `docker/build-push-action@v6` to catch any Dockerfile regression.

- **`cd-staging.yml`** — runs on every push to `staging`:
  1. `test-full` — runs the **full** test suite (unit + integration for the backend, full
     pytest for the ML service) to validate the candidate before it reaches production.
  2. *(The actual staging deployment is performed locally via `docker compose` — the
     workflow above only runs the test gate.)*

- **`cd-production.yml`** — runs on every push to `main` (merge of `staging` into `main`):
  1. `quality-gates` — runs `ml/quality_gates.py --min-accuracy 0.70 --max-latency-ms 500`
     against the **Staging** model in MLflow. If accuracy < 70 % **or** average
     latency > 500 ms, the job exits with `1` and the deployment is aborted.
  2. `deploy-production` — has `needs: quality-gates`, so it only runs when the gates
     pass. It deploys the four services to Railway (production) and finally calls
     `scripts/deploy-check.sh` for the smoke test (`GET /auth/me` → `401`,
     `POST /api/v1/external/predict` → `401`, `GET /ml/health` → `200`).

### Flow diagram

```
   ┌──────────┐  PR   ┌─────┐  push  ┌──────────┐  PR  ┌──────────┐  push  ┌──────┐
   │ feature/*│──────▶│ dev │────────▶│ staging  │─────▶│  main    │───────▶│ Prod │
   └────┬─────┘       └──┬──┘        └────┬─────┘       └────┬─────┘        └──────┘
        │                │                │                  │
        ▼                ▼                ▼                  ▼
   ┌─────────┐       ┌─────────┐     ┌──────────────┐    ┌──────────────┐
   │ CI Dev  │       │ CI Dev  │     │ CD Staging   │    │ CD Prod      │
   │ tests + │       │ tests + │     │ full tests   │    │ quality-     │
   │ build   │       │ build   │     │              │    │ gates →      │
   └─────────┘       └─────────┘     └──────────────┘    │ deploy →     │
                                                          │ smoke test   │
                                                          └──────────────┘
```

---

## Model Promotion

The model lifecycle has three stages: training → Staging → Production. **A model is
never moved to Production by hand**: the transition is fully automated and gated.

### Pipeline

1. **Train** — `python ml/train.py` reads the dataset (versioned with DVC), trains a
   TF-IDF + Logistic Regression pipeline, logs params, metrics, the model artifact and
   two tags (`data_version`, `git_commit`) to **MLflow**, and registers the model under
   the name `reviewsense-sentiment` — every run lands in stage `None` first.
2. **Promote to Staging** — a maintainer (or a bot) transitions the desired version
   from `None` to `Staging` via the MLflow UI or the MLflow CLI.
3. **Quality gates** — `ml/quality_gates.py` (invoked by `cd-production.yml` on every
   push to `main`) loads the latest `Staging` version, evaluates it on the test split,
   and measures inference latency. The mandatory thresholds are:
   - **accuracy ≥ 0.70** on the held-out test set
   - **average inference latency ≤ 500 ms** (measured over 100 predictions)
4. **Promote to Production** — if both gates pass, the script calls
   `MlflowClient.transition_model_version_stage(..., stage="Production",
   archive_existing_versions=True)` so the previous Production version is archived and
   the new one becomes the live model served by `ml-service`.
5. **Deploy** — `cd-production.yml` redeploys `ml-service` (and the other services) to
   Railway only **after** the promotion succeeded.

### What happens when a gate fails

If accuracy or latency does not meet the threshold, `quality_gates.py` prints the
failing metric and exits with code `1`. Because `deploy-production` declares
`needs: quality-gates`, GitHub Actions **skips it entirely** — no service is
redeployed, and the version currently in MLflow stage `Production` (and therefore the
model served in production) is left untouched. The new model stays in `Staging` until
a subsequent training run produces a model that clears the gates, or until an operator
manually investigates.

---

## Data Versioning

The training corpus (Amazon Reviews) is tracked with **DVC**: raw and processed data
files are not committed to Git, but a small set of `.dvc` pointer files are. The actual
data lives in a DVC remote (S3 or Google Drive — see `ml/.dvc/config`) and is fetched
on demand.

```
ml/
├── .dvc/                # DVC internals + remote config
├── data/                # raw / processed datasets (gitignored, tracked by DVC)
│   ├── reviews.dvc
│   └── ...
├── data_utils.py
├── download_data.py
├── train.py
├── evaluate.py
└── quality_gates.py
```

### Reproduce a training run locally

```bash
# 1. Make sure the DVC remote is configured (see ml/.dvc/config)
dvc pull                  # downloads the exact data version pinned by *.dvc files

# 2. Train a new model version
python ml/train.py        # logs the run + model to MLflow, registers it in the registry
```

The current DVC data hash is recorded as the `data_version` tag on every MLflow run, so
any model in the registry can be traced back to the exact dataset it was trained on.

---

## Monitoring

The stack ships with a turnkey Prometheus + Grafana setup that is started by
`docker compose up` (no extra configuration needed).

| Service | URL | Login |
|---|---|---|
| Prometheus | http://localhost:9090 | – |
| Grafana | http://localhost:3001 | `admin` / `admin` |

### Exposed metrics

- **From `ml-service`** (`/metrics`, exposed by `prometheus-fastapi-instrumentator` +
  custom metrics in `backend/ml-service/app/metrics.py`):
  - `prediction_requests_total{sentiment}` — counter, labelled by predicted class
  - `prediction_latency_seconds` — histogram, end-to-end prediction latency
  - `prediction_errors_total` — counter (no model loaded, internal failures, …)
  - default FastAPI HTTP metrics (`http_requests_total`, `http_request_duration_seconds`, …)

- **From `main-api`** (`/metrics`, defined in `monitoring/prometheus.yml`): standard
  Node.js process / HTTP metrics via `prom-client`.

- **Scraping configuration**: `monitoring/prometheus.yml` declares the two scrape jobs
  above with a `15s` interval.

### Grafana dashboard

Grafana is pre-provisioned (`monitoring/grafana/provisioning/`) with:

- a **Prometheus** datasource pointing at `http://prometheus:9090`,
- the **ReviewSense Production Monitoring** dashboard
  (`monitoring/grafana/provisioning/dashboards/reviewsense.json`) with four panels:
  **Request Volume**, **Prediction Latency (p95)**, **Error Rate**, **Backend Health**.

> _Screenshots of the Grafana dashboard and the React UI will be added shortly._

---

## API Documentation

The platform exposes **two API surfaces** from `main-api`:
- a **REST** API under `/api/v1` and `/auth` (used by the React app and external clients),
- a **GraphQL** API under `/graphql` (used by the analytics dashboard in the React app).

All endpoints require a valid JWT in the `Authorization: Bearer <token>` header
**except** the Google OAuth entry points and the health check.

### REST endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | – | Liveness probe |
| `GET` | `/auth/google` | – | Start Google OAuth flow |
| `GET` | `/auth/google/callback` | – | OAuth callback, returns JWT via redirect |
| `GET` | `/auth/me` | JWT | Get the currently authenticated user |
| `POST` | `/auth/logout` | – | Invalidate the session |
| `POST` | `/api/v1/reviews` | JWT | Create a review, run sentiment analysis, persist + notify |
| `GET` | `/api/v1/reviews` | JWT | List the current user's reviews (filter by `sentiment`, paginate with `limit` / `offset`) |
| `GET` | `/api/v1/reviews/:id` | JWT | Fetch a single review (ownership-checked) |
| `POST` | `/api/v1/external/predict` | JWT | Stateless sentiment prediction (no persistence, no notification) |

### GraphQL endpoint

`POST /graphql` — introspection is enabled outside of `production`. Main queries:

```graphql
query {
  me { id email name role }
  recentReviews(limit: 10) {
    id text predictedSentiment confidence language createdAt
  }
  reviewStats { positive negative neutral total }
  sentimentDistribution(days: 30) { date count sentiment }
}
```

### Example calls with `curl`

**Health check (no JWT required):**

```bash
curl -s http://localhost:3000/health
# {"status":"ok","service":"main-api"}
```

**Anonymous request to a protected endpoint (expect `401`):**

```bash
curl -i http://localhost:3000/auth/me
# HTTP/1.1 401 Unauthorized
```

**Sentiment prediction with a valid JWT:**

```bash
TOKEN="eyJhbGciOi..."   # obtained via /auth/google/callback

# Stateless prediction (no DB write, no notification)
curl -X POST http://localhost:3000/api/v1/external/predict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "This product is absolutely fantastic, I love it!"}'

# {"sentiment":"positive","confidence":0.93,"model_version":"3"}

# Create a review (persists + notifies)
curl -X POST http://localhost:3000/api/v1/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Terrible quality, broke after two days.", "language": "en"}'
```

---

## Reproducibility

Every artifact produced by the platform can be traced back to the exact inputs that
generated it. We rely on a three-way anchor:

| Anchor | Where it lives | What it captures |
|---|---|---|
| **DVC data version** | MLflow run tag `data_version` | The exact dataset hash used for training |
| **Git commit** | MLflow run tag `git_commit` | The exact source code used for training |
| **MLflow experiment** | `mlflow.tracking_uri` (DagsHub) | Params, metrics, model artifact, signature |

This means **any model in the registry can be replayed bit-for-bit** by checking out
the corresponding Git commit, restoring the matching DVC data version, and re-running
`ml/train.py`.

### Replay a historical training run

```bash
# 1. Check out the commit that produced the model
git checkout <commit-sha>

# 2. Restore the exact data version pinned by the .dvc files
dvc checkout

# 3. Re-run training — the new run will have identical params and a matching data_version
python ml/train.py
```

The new run appears in MLflow with the same `data_version` and `git_commit` tags as
the original (the latter will also be identical, because the working tree is pinned),
making side-by-side comparison trivial.

---

## Team

| Name | Role |
|---|---|
| **Loïc** | Backend / DevOps |
| **Aurélien** | Backend / DevOps |
| **Benjamin** | Frontend / ML |

---

## License

This project is released for educational purposes.
