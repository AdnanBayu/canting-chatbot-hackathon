FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy dependency files first (for layer caching)
COPY pyproject.toml uv.lock /app/

# Install dependencies from lockfile
RUN uv sync --frozen --no-dev

# Copy project files
COPY ./app /app/app
COPY main.py /app/

# Copy Alembic config and migrations
COPY alembic.ini /app/
COPY alembic /app/alembic

# Copy entrypoint script
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
