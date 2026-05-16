#!/bin/bash
set -e

echo "Running database migrations..."
uv run alembic upgrade head
echo "Migrations complete."

echo "Starting server..."
exec uv run uvicorn main:app --host 0.0.0.0 --port 8000
