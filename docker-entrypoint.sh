#!/bin/sh
set -e

# Ensure DB directory exists (on the persistent volume)
mkdir -p /app/prisma/data

# Ensure uploads directory exists (on the persistent volume)
if [ -n "$UPLOAD_DIR" ]; then
  mkdir -p "$UPLOAD_DIR"
  mkdir -p "$UPLOAD_DIR/marcas"
fi

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
  echo "Database is empty, ready for data."
fi

echo "Starting server..."
exec node server.js
