#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="mh-integration-postgres"
DB_NAME="mh_test_integration"
DB_USER="mh_test"
DB_PASSWORD="mh_test"
DB_PORT="5433"

cd "$(dirname "$0")/.."

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Starting disposable Postgres container for integration tests..."
docker run -d --rm --name "$CONTAINER_NAME" \
  -e POSTGRES_DB="$DB_NAME" -e POSTGRES_USER="$DB_USER" -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -p "$DB_PORT:5432" postgres:16-alpine >/dev/null

echo "Waiting for the database to accept connections..."
until docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
  sleep 1
done

export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME"
export JWT_SECRET="integration-test-secret"
export GOOGLE_CLIENT_ID="integration-client-id"
export GOOGLE_CLIENT_SECRET="integration-client-secret"
export GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"
export FRONTEND_URL="http://localhost:5173"

echo "Building the backend..."
npm run build >/dev/null

echo "Running migrations..."
npx typeorm migration:run -d dist/config/data-source.js

echo "Running integration tests..."
npx jest --config jest.integration.config.js --runInBand "$@"
