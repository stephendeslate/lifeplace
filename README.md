# LifePlace

A full-stack application built with Django, PostgreSQL, React TypeScript, Docker, Redis, and Celery.

## Project Structure

This is a monorepo containing both backend and frontend code:

- `backend/`: Django backend with domain-driven structure
- `frontend/`: React TypeScript frontend

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose
- Git
- VS Code (recommended)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate on Windows
   venv\Scripts\activate

   # Activate on macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file by copying the example:

   ```bash
   cp .env.example .env
   ```

5. Apply migrations:

   ```bash
   python manage.py migrate
   ```

6. Run the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm start
   ```

### Docker Setup

To run the entire stack with Docker:

```bash
docker-compose up
```

To rebuild containers after making changes:

```bash
docker-compose up --build
```

To run in detached mode:

```bash
docker-compose up -d
```

## Backend Structure

The backend follows a domain-driven architecture:

```
backend/
├── core/                 # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── domains/          # Domain modules
│       ├── __init__.py
│       ├── domain1/      # Domain-specific modules
│       │   ├── models.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   ├── serializers.py
│       │   ├── services.py
│       │   └── signals.py
│       └── domain2/
│           └── ...
├── manage.py
└── requirements.txt
```

## Frontend Structure

The frontend follows a feature-based structure:

```
frontend/
├── admin-crm/     # Admin facing CRM
│   ├── public/
│   ├── src/
│   │   ├── apis/              # API client code
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   ├── types/             # TypeScript types/interfaces
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── client-portal/             # Client facing portal
│   ├── public/
│   ├── src/
│   │   ├── apis/              # API client code
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   ├── types/             # TypeScript types/interfaces
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── tsconfig.json
```

## VS Code Integration

Open the project in VS Code:

```bash
code lifeplace.code-workspace
```

This will load the project with all recommended settings and extensions.
