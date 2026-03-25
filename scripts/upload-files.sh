#!/bin/bash
set -e

UPLOADS_DIR="/Users/luigi.aguirre/business/magilu-app/public/uploads"
BASE_URL="https://magilu-app-production.up.railway.app/api/admin/restore-uploads"
SECRET="magilu-restore-2024"

total=0
success=0
failed=0

find "$UPLOADS_DIR" -type f | while read -r filepath; do
  # Get relative path from uploads dir (e.g. "marcas/logo.png" or "photo.jpg")
  relative="${filepath#$UPLOADS_DIR/}"
  total=$((total + 1))

  response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" \
    -H "x-restore-secret: $SECRET" \
    -H "x-filename: $relative" \
    -H "Content-Type: application/octet-stream" \
    --data-binary "@$filepath")

  if [ "$response" = "200" ]; then
    echo "✓ $relative"
  else
    echo "✗ $relative (HTTP $response)"
  fi
done

echo ""
echo "Done."
