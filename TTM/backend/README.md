# FlowDesk Backend - API Documentation

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env

# Run development server
python main.py
```

Server runs on `http://localhost:8000`

API docs available at `http://localhost:8000/docs` (Swagger UI)

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses are JSON:

```json
{
  "data": {},
  "status": 200
}
```

Errors:

```json
{
  "detail": "Error message"
}
```

## Rate Limiting

- Login attempts: 10 per minute per IP
- Other endpoints: 60 requests per minute

## Database

PostgreSQL required. Connection string in `.env`:

```
DATABASE_URL=postgresql://user:password@localhost/flowdesk
```

Tables are auto-created on first run.

## Testing

```bash
pytest tests/ -v
pytest tests/ --cov=app
```

## Deployment

Railway.toml configured for Railway deployment. Push to main branch to auto-deploy.

Environment variables must be set in Railway dashboard.

## Development

- FastAPI auto-reloads on file changes
- Swagger UI for API exploration: http://localhost:8000/docs
- PostgreSQL database required locally

## Troubleshooting

**Connection refused**: Ensure PostgreSQL is running

**Invalid token**: Token expired - request new one via refresh endpoint

**403 Forbidden**: Admin access required for this endpoint

**400 Bad Request**: Invalid input - check validation errors in response
