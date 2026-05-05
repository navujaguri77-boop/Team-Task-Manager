# Docker Setup

## Quick Start with Docker

Run the entire stack with one command:

```bash
docker-compose up
```

This starts:
- PostgreSQL database (port 5432)
- FastAPI backend (port 8000)
- Next.js frontend (port 3000)

## Access

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Development

### View logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop services
```bash
docker-compose down
```

### Restart services
```bash
docker-compose restart
```

### Rebuild images
```bash
docker-compose build
```

## Production

### Build images only
```bash
docker build -t flowdesk-backend ./backend
docker build -t flowdesk-frontend ./frontend
```

### Run single service
```bash
docker run -p 8000:8000 flowdesk-backend
```

## Database

Initial credentials (change in production):
- Username: flowdesk
- Password: flowdesk_password
- Database: flowdesk

Data persists in `postgres_data` volume.

## Troubleshooting

**Port already in use:**
```bash
docker-compose down -v  # Remove volumes and containers
docker-compose up
```

**Permission denied:**
```bash
sudo usermod -aG docker $USER
logout and login
```

**Out of memory:**
Allocate more resources in Docker Desktop settings
