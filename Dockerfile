# Stage 1: Build the React admin-crm frontend
FROM node:18-alpine as frontend-builder

# Build admin-crm
WORKDIR /app/frontend/admin-crm
COPY frontend/admin-crm/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/admin-crm ./
RUN npm run build --legacy-peer-deps

# Stage 2: Build the Django backend with admin-crm frontend assets
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=core.settings \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn whitenoise dj-database-url django-environ

# Copy backend code
COPY backend/ .

# Create a directory for the frontend assets
RUN mkdir -p /app/static/admin-crm

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/admin-crm/build /app/static/admin-crm

# Collect static files
RUN python manage.py collectstatic --noinput

# Run gunicorn
CMD gunicorn core.wsgi:application --bind 0.0.0.0:$PORT