# ReviewSense — Main API

Node.js / Express backend for the ReviewSense platform.

## Stack

- **Express 4** — HTTP server
- **Sequelize 6** + **PostgreSQL** — ORM and primary datastore (users, reviews)
- **Apollo Server 4** — GraphQL endpoint at `/graphql`
- **Passport** + **passport-google-oauth20** — Google OAuth 2.0 login
- **jsonwebtoken** — JWT issuance for API-as-a-Service
- **Axios** — internal call to the ML service
- **Helmet / CORS / dotenv** — security and config

## Layout

```
backend/main-api/
├── src/
│   ├── index.js              Express + Apollo bootstrap
│   ├── config/
│   │   ├── database.js       Sequelize connection (DATABASE_URL)
│   │   └── sync.js           `node src/config/sync.js` to (re)create tables
│   ├── models/
│   │   ├── index.js          Sequelize init + associations
│   │   ├── User.js           googleId, email, name, role
│   │   └── Review.js         text, predictedSentiment, confidence, language
│   ├── routes/
│   │   ├── auth.js           /auth/google, /callback, /me, /logout
│   │   ├── reviews.js        POST/GET /api/v1/reviews (JWT-protected)
│   │   └── external.js       POST /api/v1/external/predict (JWT Bearer)
│   ├── graphql/
│   │   ├── typeDefs.js       reviewStats, sentimentDistribution, recentReviews
│   │   └── resolvers.js      Sequelize aggregate queries
│   ├── middleware/
│   │   ├── authJwt.js        Bearer token verification
│   │   └── authSession.js    alias of authJwt (JWT-only, no server state)
│   ├── services/
│   │   └── mlClient.js       POST ML_SERVICE_URL/predict
│   └── seeds/
│       └── seed.js           2 users + 5 reviews
├── tests/                    (added in Phase 3)
├── .env.example
├── Dockerfile                node:20-alpine multi-stage
├── jest.config.js
└── package.json
```

## Local run

```bash
cp .env.example .env
# edit .env (DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID/SECRET, ML_SERVICE_URL, ...)

npm install
node src/config/sync.js     # create / update tables
node src/seeds/seed.js      # optional: insert demo users + reviews
npm start                   # http://localhost:3000
```

## Endpoints

| Method | Path                              | Auth          | Purpose                          |
|--------|-----------------------------------|---------------|----------------------------------|
| GET    | /health                           | —             | liveness                        |
| GET    | /auth/google                      | —             | start Google OAuth               |
| GET    | /auth/google/callback             | —             | OAuth callback, sets JWT         |
| GET    | /auth/me                          | JWT Bearer    | current user                     |
| POST   | /auth/logout                      | —             | clear session                    |
| POST   | /api/v1/reviews                   | JWT Bearer    | submit a review → ML prediction  |
| GET    | /api/v1/reviews                   | JWT Bearer    | list my reviews                  |
| GET    | /api/v1/reviews/:id               | JWT Bearer    | one review (owner only)          |
| POST   | /api/v1/external/predict          | JWT Bearer    | API-as-a-Service predict         |
| POST   | /graphql                          | JWT Bearer    | analytics queries                |

## Notes

- The server **does not crash** if PostgreSQL or the ML service are down — endpoints that need them will return errors per request, but `/health` and `/auth/*` keep working.
- Google OAuth is silently disabled if `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are missing (a warning is logged).
- Apollo Server is mounted as Express middleware via `@as-integrations/express4` (Apollo 4 + Express 4 are compatible).
