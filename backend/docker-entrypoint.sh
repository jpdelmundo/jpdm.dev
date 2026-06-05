#!/bin/sh
set -e

echo "Running database migrations..."
node dist/migrate.js

echo "Running database seed..."
node dist/seed.js

echo "Starting backend..."
exec node dist/app.js