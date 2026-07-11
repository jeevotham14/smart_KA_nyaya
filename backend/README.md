# Smart Karnataka Nyaya Backend

FastAPI backend for a Karnataka-only AI-powered legal assistance platform. The current AI workflow is mocked, but the code is structured for later LangChain/LlamaIndex, embedding, Indian Kanoon, maps, email, and SMS integrations.

## Stack

- FastAPI
- PostgreSQL with pgvector-ready schema
- SQLAlchemy 2.x
- Pydantic
- JWT authentication
- bcrypt password hashing
- Alembic migrations
- Mock multi-agent AI services

## Project Layout

```text
app/api/routes      FastAPI route modules
app/agents          Mock AI agent orchestration
app/core            Settings and security
app/db              Engine, session, seed data, DB types
app/models          SQLAlchemy models
app/schemas         Pydantic schemas
app/services        Reserved for real integrations
app/utils           Shared utilities
alembic             Migrations
tests               API tests
```

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Set `DATABASE_URL` in `.env`. For PostgreSQL:

```text
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/smart_karnataka_nyaya
JWT_SECRET=replace-with-a-long-random-secret
```

Enable pgvector in the database:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload --port 5000
```

API docs are available at `http://localhost:5000/docs`.

## Seed Data

On startup the app creates tables for local development and seeds:

- Admin user: `admin@smartnyaya.local`
- Admin password: `Admin@12345`
- Karnataka legal aid directory examples
- Emergency helplines `112`, `181`
- Sample legal statutes/categories

For production, prefer Alembic migrations and replace the default admin password immediately.

## Implemented API Areas

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/ai/legal-query`
- `POST /api/ai/classify-issue`
- `POST /api/ai/retrieve-precedents`
- `POST /api/ai/risk-assessment`
- `POST /api/legal-aid/check-eligibility`
- `POST /api/legal-aid/apply`
- `GET /api/legal-aid/applications/{user_id}`
- `GET /api/women-protection/resources`
- `POST /api/women-protection/request-help`
- `GET /api/women-protection/nearby-services`
- `POST /api/documents/generate`
- `GET /api/documents/{doc_id}`
- `GET /api/documents/user/{user_id}`
- `POST /api/complaints`
- `GET /api/complaints/{complaint_id}`
- `GET /api/complaints/user/{user_id}`
- `PATCH /api/complaints/{complaint_id}/status`
- `GET /api/directory/search`
- `GET /api/directory/district/{district}`
- `GET /api/directory/service-type/{service_type}`
- `GET /api/tracker/{case_id}`
- `PATCH /api/tracker/{case_id}/status`
- `GET /api/notifications/user/{user_id}`
- `PATCH /api/notifications/{notification_id}/read`
- Admin APIs under `/api/admin/*`, protected by the `admin` role


## AI Integration Layer

AI calls flow through `app/services/ai_service.py`. It exposes:

- `classify_legal_issue`
- `rag_retrieval_placeholder`
- `legal_guidance_response`
- `document_generation_response`

Configure providers with environment variables only:

```text
AI_PROVIDER=mock
AI_MODEL=mock-legal-assistant
EMBEDDING_MODEL=mock-embedding
OPENAI_API_KEY=
INDIAN_KANOON_API_KEY=
```

No API keys are hardcoded or returned in API responses. The current implementation uses deterministic mock agents and is ready for a real provider client later.

## Tests

```bash
pytest
```

Tests use SQLite with FastAPI dependency overrides. PostgreSQL/pgvector remains the intended production database.

## AI Safety

Every generated legal guidance response includes the required disclaimer:

> This is legal information only and is not a substitute for advice from a qualified advocate. For official legal action, consult an advocate, DLSA, TLSC, or appropriate authority.

