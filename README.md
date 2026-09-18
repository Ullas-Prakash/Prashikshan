# Prashikshan

Prashikshan is a role-based, NEP-aligned career pathway platform. It connects skill assessment, structured courses, verified internship coordination, transparent milestones, and credit records in one deployable web application.

## What is included

- Student accounts, skill assessment, personalised course ordering, course enrolment/progress, verified internship application, status tracking, and a credit ledger.
- Industry partner onboarding, coordinator verification, internship submission, applicant review, milestones, and final grading/credit award.
- Coordinator workspace for partner and opportunity review, activity oversight, and publishing structured courses.
- Passwords are salted and hashed with Node's `scrypt`; signed, expiring bearer tokens protect all private endpoints. The client uses relative `/api` URLs, so a single deployment works without hard-coded localhost URLs.

## Local setup

Requirements: Node.js 22+ and a MongoDB database (local MongoDB or Atlas).

1. Copy [server/.env.example](server/.env.example) to `server/.env` and set `MONGO_URI`, a long random `JWT_SECRET`, and a private `COORDINATOR_INVITE_CODE`.
2. Optionally copy [client/.env.example](client/.env.example) to `client/.env`. Keep `VITE_API_URL=/api` when running as one service.
3. Install and run in two terminals:

   ```powershell
   cd server
   npm.cmd install
   npm.cmd run dev
   ```

   ```powershell
   cd client
   npm.cmd install
   npm.cmd run dev
   ```

4. Open `http://localhost:5173`. In development, `SEED_DEMO_DATA=true` creates a small catalogue and clearly labelled demo listings only when the relevant collections are empty.

## First-use workflow

1. Visit `/coordinator-setup` and enter the `COORDINATOR_INVITE_CODE` from the server environment. Do not publish this URL or code.
2. Create a partner account; the coordinator verifies it in the Coordinator workspace.
3. The verified partner submits an internship; the coordinator publishes it after review.
4. Create a student account, complete an assessment, add a course, and apply to the verified internship.
5. The partner advances the application to `completed`; the agreed credit and grade enter the student's immutable-style credit record.

## Production deployment

The included [Dockerfile](Dockerfile) builds the React application and serves it from the Express server, so only one container is needed.

```bash
docker build -t prashikshan .
docker run --rm -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGO_URI='your-mongodb-uri' \
  -e JWT_SECRET='use-a-long-random-value' \
  -e COORDINATOR_INVITE_CODE='private-operator-code' \
  -e CLIENT_ORIGIN='https://your-domain.example' \
  prashikshan
```

Configure the same values in your deployment provider's encrypted environment settings. Keep `SEED_DEMO_DATA` unset or `false` in production; production listings must be created and reviewed by real partners and coordinators.

## Verification

```powershell
cd server; npm.cmd run check; npm.cmd test
cd ..\client; npm.cmd run lint; npm.cmd run build
```

The frontend build output is intentionally ignored by Git and is copied into the production image by Docker.
