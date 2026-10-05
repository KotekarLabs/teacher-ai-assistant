# Teacher AI Assistant — DevOps, Infrastructure & Deployment Specification v1.0
## Initial hosting
Frontend: Vercel. Backend: Render or Railway. Database: managed PostgreSQL.

## Environments
Development, staging, production.

## Frontend
Vercel preview/production deployments.

## Backend
Managed Node/Express deployment with build/start/health/migrations.

## Database
Managed PostgreSQL with backups, secure credentials, migration safety and recovery.

## Secrets
Deployment secret management only; never source code.

## CI/CD
Quality checks before deployment; controlled/reversible production release.

## Security
HTTPS, CORS, security headers, auth, secrets, dependency/security scanning and least privilege.

## Observability
API errors/latency/health/AI failures/cost/deployment failures without secrets.

## Scaling
Start managed and modular; add queues/object storage/cache/service decomposition only when justified.

## Rollback
Maintain application rollback and safe migration practices.

## Cost
Monitor hosting, database, AI, storage and bandwidth.
