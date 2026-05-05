# 🚀 FlowDesk — Team Task Manager

A full-stack, role-based task management platform designed to streamline team collaboration, project tracking, and workflow visibility.

> Built with FastAPI, React, PostgreSQL, and deployed on Railway.

---

## 📌 Overview

FlowDesk is a production-ready task management system that enables teams to:

- Create and manage projects
- Assign and track tasks
- Collaborate with role-based access
- Monitor progress using dashboards and Kanban workflows

---

## ✨ Features

- 🔐 JWT Authentication (Access + Refresh tokens)
- 🛡️ Role-Based Access Control (Admin / Member)
- 📁 Project Management
- ✅ Task Management (priority, status, due dates)
- 📊 Dashboard with analytics
- 📌 Kanban Board (drag & drop)
- 🔔 Notifications system
- 📱 Fully responsive UI
- ☁️ Deployed on Railway

---

## 🧱 Tech Stack

| Layer        | Technology                  |
|--------------|---------------------------|
| Frontend     | React + Vite              |
| Styling      | Tailwind CSS              |
| State Mgmt   | Zustand + React Query     |
| Backend      | FastAPI (Python 3.11)     |
| Auth         | JWT + bcrypt              |
| Database     | PostgreSQL                |
| ORM          | SQLAlchemy + Alembic      |
| Deployment   | Railway                   |
| Testing      | Pytest                    |

---

## 🗂️ Project Structure

```

flowdesk/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── tests/
│   └── alembic/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── store/
│   │   └── api/
│
├── docker-compose.yml
├── railway.toml
└── .github/workflows/

````

---

## 🗄️ Database

### Task Status
- `todo`
- `in_progress`
- `in_review`
- `done`

### Task Priority
- `low`
- `medium`
- `high`

---

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Projects
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

### Tasks
- `GET /api/tasks`
- `POST /api/projects/:id/tasks`
- `PATCH /api/tasks/:id/status`

### Dashboard
- `GET /api/dashboard/stats`

📘 Swagger Docs: `/docs`

---

## 🔐 Role-Based Access

| Action              | Admin | Member |
|--------------------|-------|--------|
| Create Project     | ✅    | ❌     |
| Manage Users       | ✅    | ❌     |
| Create Tasks       | ✅    | ✅     |
| Update Tasks       | ✅    | ✅     |
| Delete Tasks       | ✅    | Limited |

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL

---

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

alembic upgrade head
uvicorn app.main:app --reload
```

---

### Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env
npm run dev
```

---

## 🌍 Deployment (Railway)

1. Connect GitHub repository
2. Add PostgreSQL plugin
3. Configure environment variables
4. Deploy backend and frontend
5. Access via Railway-generated domain

---

## 🧪 Testing

```bash
cd backend
pytest tests/ -v --cov=app
```

---

## 🛡️ Security

* bcrypt password hashing
* JWT authentication
* RBAC enforcement
* Input validation (Pydantic)
* SQL injection protection (ORM)
* Rate limiting

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: add feature"
git push
```

---

MIT License

```

---

If you want a **next-level version (badges + screenshots + demo GIF + architecture diagram)**, I can turn this into something that *instantly impresses recruiters*.
```
