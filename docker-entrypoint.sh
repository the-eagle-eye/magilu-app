#!/bin/sh
set -e

# Ensure DB directory exists
mkdir -p /app/prisma/data

# Run migrations
echo "Running database migrations..."
node_modules/.bin/prisma migrate deploy

# Seed if DB is empty
SHOE_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.shoe.count().then(n => { console.log(n); prisma.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$SHOE_COUNT" = "0" ]; then
  echo "Seeding database with initial inventory..."
  node -e "
const { PrismaClient } = require('@prisma/client');
" 2>/dev/null || true
  # Seed is handled by the seed script, run via ts-node in dev
  # In production, we use the compiled seed
fi

echo "Starting server..."
exec node server.js
