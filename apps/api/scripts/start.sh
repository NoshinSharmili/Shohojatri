#!/bin/sh
# Container entrypoint (Dockerfile): migrate, optionally seed the demo data, then serve.
set -eu

alembic upgrade head

# Demo accounts and children (CLAUDE.md §10). Idempotent, so it is safe on every deploy.
if [ "${SEED_DEMO:-false}" = "true" ]; then
  python -m app.seed
fi

# --proxy-headers + --forwarded-allow-ips: Render's proxy (and Vercel's rewrite before it)
# terminate TLS, so the client address and scheme come from X-Forwarded-* headers.
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-2}" \
  --proxy-headers \
  --forwarded-allow-ips "*"
