#!/bin/sh
set -e

# Ensure DB directory exists (on the persistent volume)
mkdir -p /app/prisma/data
mkdir -p /app/data/db

# Remove corrupted SQLite file if it exists but is not a valid database
DB_PATH="${DATABASE_URL#file:}"
if [ -f "$DB_PATH" ]; then
  # SQLite files start with "SQLite format 3"
  MAGIC=$(head -c 16 "$DB_PATH" 2>/dev/null || echo "")
  case "$MAGIC" in
    "SQLite format 3"*) echo "Database file is valid." ;;
    *) echo "WARNING: Corrupted or empty database file found. Removing it."; rm -f "$DB_PATH" ;;
  esac
fi

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
