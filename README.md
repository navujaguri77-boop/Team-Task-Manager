const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Header, Footer, TabStopType, TabStopPosition,
  ExternalHyperlink
} = require('docx');
const fs = require('fs');

const INDIGO = "4F46E5";
const INDIGO_LIGHT = "EEF2FF";
const DARK = "1E1B4B";
const GRAY = "6B7280";
const GRAY_LIGHT = "F9FAFB";
const BORDER_GRAY = "E5E7EB";
const GREEN = "16A34A";
const GREEN_LIGHT = "F0FDF4";
const AMBER = "D97706";
const AMBER_LIGHT = "FFFBEB";
const RED = "DC2626";
const RED_LIGHT = "FEF2F2";
const CYAN = "0891B2";
const CYAN_LIGHT = "ECFEFF";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: INDIGO, space: 6 } },
    children: [new TextRun({ text, font: "Arial", size: 36, bold: true, color: DARK })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 28, bold: true, color: INDIGO })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: DARK })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: opts.color || "374151", ...opts })]
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: "374151" })]
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 40, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: "374151" })]
  });
}

function code(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
    children: [new TextRun({ text, font: "Courier New", size: 20, color: INDIGO })]
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY, space: 1 } },
    children: []
  });
}

function badge(text, bg, textColor) {
  return new TableCell({
    borders: noBorders,
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: textColor })]
    })]
  });
}

function infoBox(title, text, bg, borderColor) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    margins: { top: 120, bottom: 120 },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
              bottom: { style: BorderStyle.NONE, size: 0, color: WHITE },
              left: { style: BorderStyle.SINGLE, size: 12, color: borderColor },
              right: { style: BorderStyle.NONE, size: 0, color: WHITE },
            },
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              new Paragraph({ children: [new TextRun({ text: title, font: "Arial", size: 22, bold: true, color: borderColor })] }),
              new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 22, color: "374151" })] })
            ]
          })
        ]
      })
    ]
  });
}

function makeTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: INDIGO, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 20, bold: true, color: WHITE })] })]
    }))
  });
  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: ri % 2 === 0 ? WHITE : GRAY_LIGHT, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Arial", size: 20, color: "374151" })] })]
    }))
  }));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

function space(before = 120) {
  return new Paragraph({ spacing: { before, after: 0 }, children: [] });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
        ]
      },
      {
        reference: "numbers",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        ]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: "Arial" }, paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Arial" }, paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial" }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [5000, 4360],
            rows: [new TableRow({
              children: [
                new TableCell({
                  borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 2, color: INDIGO, space: 1 } },
                  children: [new Paragraph({ children: [new TextRun({ text: "FlowDesk — Team Task Manager", font: "Arial", size: 20, bold: true, color: INDIGO })] })]
                }),
                new TableCell({
                  borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 2, color: INDIGO, space: 1 } },
                  children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "README & Documentation", font: "Arial", size: 20, color: GRAY })] })]
                })
              ]
            })]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "FlowDesk v1.0  |  ", font: "Arial", size: 18, color: GRAY }),
              new TextRun({ text: "Page ", font: "Arial", size: 18, color: GRAY }),
              new PageNumber({ font: "Arial", size: 18, color: GRAY }),
            ]
          })
        ]
      })
    },
    children: [
      // ── COVER ──────────────────────────────────────────────
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            shading: { fill: DARK, type: ShadingType.CLEAR },
            margins: { top: 600, bottom: 600, left: 600, right: 600 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "FlowDesk", font: "Arial", size: 72, bold: true, color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Team Task Manager", font: "Arial", size: 40, color: "A5B4FC" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 200 }, children: [new TextRun({ text: "Full-Stack Web Application — Complete Documentation", font: "Arial", size: 22, color: "94A3B8", italics: true })] }),
              new Table({
                width: { size: 7000, type: WidthType.DXA },
                columnWidths: [1750, 1750, 1750, 1750],
                rows: [new TableRow({
                  children: [
                    new TableCell({ borders: noBorders, shading: { fill: "312E81", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "FastAPI", font: "Arial", size: 18, bold: true, color: "A5B4FC" })] })] }),
                    new TableCell({ borders: noBorders, shading: { fill: "312E81", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "React", font: "Arial", size: 18, bold: true, color: "A5B4FC" })] })] }),
                    new TableCell({ borders: noBorders, shading: { fill: "312E81", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PostgreSQL", font: "Arial", size: 18, bold: true, color: "A5B4FC" })] })] }),
                    new TableCell({ borders: noBorders, shading: { fill: "312E81", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Railway", font: "Arial", size: 18, bold: true, color: "A5B4FC" })] })] }),
                  ]
                })]
              }),
            ]
          })]
        })]
      }),

      space(400),

      // ── 1. OVERVIEW ────────────────────────────────────────
      h1("1. Project Overview"),
      para("FlowDesk is a full-stack, role-based Team Task Manager that enables teams to create projects, assign tasks, track progress, and collaborate effectively. Built for the assignment requirement of demonstrating REST APIs, database relationships, role-based access control, and live Railway deployment."),
      space(80),
      infoBox("Live Demo", "https://flowdesk.up.railway.app  |  API Docs: https://flowdesk.up.railway.app/docs", INDIGO_LIGHT, INDIGO),
      space(120),

      h2("1.1 Key Features"),
      bullet("JWT Authentication — Signup, login, refresh tokens, bcrypt password hashing"),
      bullet("Role-Based Access Control — Admin and Member roles with enforced permissions"),
      bullet("Project Management — Create, edit, delete projects; assign team members"),
      bullet("Task System — Create tasks with priority, status, assignee, and due date"),
      bullet("Kanban Board — Drag-and-drop task cards across To Do, In Progress, In Review, Done"),
      bullet("Dashboard — Live stats: total projects, tasks, completed, overdue"),
      bullet("Notifications — In-app alerts for task assignments and due dates"),
      bullet("Fully Responsive — Works on mobile, tablet, and desktop"),
      bullet("Deployed on Railway — Live, accessible, and fully functional"),

      divider(),

      // ── 2. TECH STACK ──────────────────────────────────────
      h1("2. Tech Stack"),
      space(80),
      makeTable(
        ["Layer", "Technology", "Purpose"],
        [
          ["Frontend", "React 18 + Vite", "UI framework with fast HMR build"],
          ["Styling", "Tailwind CSS", "Utility-first responsive styling"],
          ["State", "Zustand + React Query", "Global state + server state management"],
          ["Backend", "FastAPI (Python 3.11)", "REST API framework with auto docs"],
          ["Auth", "JWT + bcrypt", "Stateless auth with secure password hashing"],
          ["Database", "PostgreSQL 15", "Relational DB with full ACID compliance"],
          ["ORM", "SQLAlchemy + Alembic", "ORM with migration support"],
          ["Deployment", "Railway", "Cloud PaaS with PostgreSQL plugin"],
          ["Testing", "Pytest + TestClient", "Backend unit and integration tests"],
          ["CI/CD", "GitHub Actions", "Automated test and deploy pipeline"],
        ],
        [2200, 3000, 4160]
      ),

      divider(),

      // ── 3. PROJECT STRUCTURE ───────────────────────────────
      h1("3. Project Structure"),
      space(80),
      makeTable(
        ["Path", "Description"],
        [
          ["flowdesk/", "Root monorepo directory"],
          ["flowdesk/backend/", "FastAPI application"],
          ["flowdesk/backend/app/routes/", "All API route handlers"],
          ["flowdesk/backend/app/models/", "SQLAlchemy database models"],
          ["flowdesk/backend/app/services/", "Business logic layer"],
          ["flowdesk/backend/app/middleware/", "JWT auth + RBAC middleware"],
          ["flowdesk/backend/app/utils/", "Helper functions and validators"],
          ["flowdesk/backend/tests/", "Pytest test suite"],
          ["flowdesk/backend/alembic/", "Database migration files"],
          ["flowdesk/frontend/", "React + Vite application"],
          ["flowdesk/frontend/src/pages/", "Page components (Dashboard, Projects, etc.)"],
          ["flowdesk/frontend/src/components/", "Reusable UI components"],
          ["flowdesk/frontend/src/store/", "Zustand global state stores"],
          ["flowdesk/frontend/src/api/", "Axios API client and hooks"],
          ["flowdesk/docker-compose.yml", "Multi-container Docker setup"],
          ["flowdesk/.github/workflows/", "GitHub Actions CI/CD pipeline"],
          ["flowdesk/railway.toml", "Railway deployment config"],
        ],
        [3500, 5860]
      ),

      divider(),

      // ── 4. DATABASE ────────────────────────────────────────
      h1("4. Database Schema"),
      para("FlowDesk uses PostgreSQL with the following relational schema. All foreign keys are enforced at the database level with cascading deletes where appropriate."),
      space(80),

      h2("4.1 Tables"),
      makeTable(
        ["Table", "Key Columns", "Relationships"],
        [
          ["users", "id, name, email, password_hash, role, avatar_url, created_at", "Has many project_members, tasks"],
          ["projects", "id, name, description, status, created_by, created_at", "Has many project_members, tasks"],
          ["project_members", "id, project_id, user_id, joined_at", "Belongs to projects + users"],
          ["tasks", "id, project_id, title, description, status, priority, assignee_id, due_date", "Belongs to projects + users"],
          ["notifications", "id, user_id, message, is_read, type, reference_id, created_at", "Belongs to users"],
        ],
        [2000, 3800, 3560]
      ),

      space(120),
      h2("4.2 Task Status Values"),
      makeTable(
        ["Status", "Description", "Color"],
        [
          ["todo", "Not yet started", "Gray"],
          ["in_progress", "Actively being worked on", "Blue"],
          ["in_review", "Submitted for review", "Amber"],
          ["done", "Completed", "Green"],
        ],
        [2500, 4360, 2500]
      ),

      space(120),
      h2("4.3 Task Priority Values"),
      makeTable(
        ["Priority", "Description", "Visual"],
        [
          ["low", "Non-urgent, can be deferred", "Green badge"],
          ["medium", "Normal priority", "Amber badge"],
          ["high", "Urgent, needs attention soon", "Red badge"],
        ],
        [2000, 4360, 3000]
      ),

      divider(),

      // ── 5. API REFERENCE ───────────────────────────────────
      h1("5. API Reference"),
      para("All endpoints are prefixed with /api. Protected endpoints require the Authorization: Bearer <token> header. Full interactive docs available at /docs (Swagger UI) and /redoc."),
      space(80),

      h2("5.1 Authentication Endpoints"),
      makeTable(
        ["Method", "Endpoint", "Auth", "Description"],
        [
          ["POST", "/api/auth/register", "None", "Create new account"],
          ["POST", "/api/auth/login", "None", "Login, receive access + refresh tokens"],
          ["POST", "/api/auth/refresh", "Refresh token", "Issue new access token"],
          ["GET", "/api/auth/me", "Bearer", "Get current user profile"],
          ["PUT", "/api/auth/profile", "Bearer", "Update name or avatar"],
          ["GET", "/api/health", "None", "Health check for deployment"],
        ],
        [1000, 2500, 1500, 4360]
      ),

      space(120),
      h2("5.2 Project Endpoints"),
      makeTable(
        ["Method", "Endpoint", "Role", "Description"],
        [
          ["GET", "/api/projects", "All", "List projects (Admin: all, Member: assigned)"],
          ["POST", "/api/projects", "Admin", "Create new project"],
          ["GET", "/api/projects/:id", "Member+", "Get project details"],
          ["PUT", "/api/projects/:id", "Admin", "Update project name, description, status"],
          ["DELETE", "/api/projects/:id", "Admin", "Delete project and all tasks"],
          ["GET", "/api/projects/:id/members", "Member+", "List project members"],
          ["POST", "/api/projects/:id/members", "Admin", "Add member to project"],
          ["DELETE", "/api/projects/:id/members/:uid", "Admin", "Remove member from project"],
        ],
        [1000, 2800, 1200, 4360]
      ),

      space(120),
      h2("5.3 Task Endpoints"),
      makeTable(
        ["Method", "Endpoint", "Role", "Description"],
        [
          ["GET", "/api/tasks", "All", "Get all tasks assigned to current user"],
          ["GET", "/api/projects/:id/tasks", "Member+", "Get all tasks in a project"],
          ["POST", "/api/projects/:id/tasks", "Member+", "Create new task in project"],
          ["GET", "/api/tasks/:id", "Member+", "Get single task detail"],
          ["PUT", "/api/tasks/:id", "Member+", "Update task fields"],
          ["PATCH", "/api/tasks/:id/status", "Member+", "Update status only (for kanban drag)"],
          ["DELETE", "/api/tasks/:id", "Admin/Creator", "Delete a task"],
        ],
        [1000, 2800, 1400, 4160]
      ),

      space(120),
      h2("5.4 Team & Dashboard Endpoints"),
      makeTable(
        ["Method", "Endpoint", "Role", "Description"],
        [
          ["GET", "/api/team", "Admin", "List all users with task counts"],
          ["PUT", "/api/team/:uid/role", "Admin", "Change a user's role"],
          ["DELETE", "/api/team/:uid", "Admin", "Remove user from platform"],
          ["GET", "/api/dashboard/stats", "All", "Counts: projects, tasks, overdue, done"],
          ["GET", "/api/notifications", "All", "Get user notifications"],
          ["PATCH", "/api/notifications/read", "All", "Mark all notifications as read"],
        ],
        [1000, 2800, 1200, 4360]
      ),

      divider(),

      // ── 6. ROLE-BASED ACCESS ───────────────────────────────
      h1("6. Role-Based Access Control"),
      para("RBAC is enforced at both the API middleware layer (backend) and the UI component level (frontend). There are two roles: Admin and Member."),
      space(80),
      makeTable(
        ["Permission", "Admin", "Member"],
        [
          ["View own assigned projects", "YES", "YES"],
          ["View all projects on platform", "YES", "NO"],
          ["Create new projects", "YES", "NO"],
          ["Edit / delete projects", "YES", "NO"],
          ["Add/remove project members", "YES", "NO"],
          ["Create tasks in assigned projects", "YES", "YES"],
          ["Update task status and details", "YES", "YES"],
          ["Delete any task", "YES", "Own tasks only"],
          ["View Team page", "YES", "NO"],
          ["Change user roles", "YES", "NO"],
          ["Remove users from platform", "YES", "NO"],
          ["View dashboard stats", "YES", "YES (own data)"],
        ],
        [4500, 2000, 2860]
      ),

      divider(),

      // ── 7. SETUP ───────────────────────────────────────────
      h1("7. Local Development Setup"),
      space(80),
      infoBox("Prerequisites", "Node.js 18+, Python 3.11+, PostgreSQL 15+, Git", GRAY_LIGHT, GRAY),
      space(120),

      h2("7.1 Clone the Repository"),
      code("git clone https://github.com/yourusername/flowdesk.git"),
      code("cd flowdesk"),

      space(80),
      h2("7.2 Backend Setup"),
      numbered("Navigate to backend folder:  cd backend"),
      numbered("Create virtual environment:  python -m venv venv"),
      numbered("Activate:  source venv/bin/activate  (Mac/Linux) or  venv\\Scripts\\activate  (Windows)"),
      numbered("Install dependencies:  pip install -r requirements.txt"),
      numbered("Copy env file:  cp .env.example .env  and fill in your values"),
      numbered("Run migrations:  alembic upgrade head"),
      numbered("Start server:  uvicorn app.main:app --reload --port 8000"),

      space(80),
      h2("7.3 Frontend Setup"),
      numbered("Navigate to frontend folder:  cd frontend"),
      numbered("Install dependencies:  npm install"),
      numbered("Copy env file:  cp .env.example .env  and set VITE_API_URL=http://localhost:8000"),
      numbered("Start dev server:  npm run dev"),
      numbered("Open browser at:  http://localhost:5173"),

      space(80),
      h2("7.4 Environment Variables"),
      makeTable(
        ["Variable", "Description", "Example"],
        [
          ["DATABASE_URL", "PostgreSQL connection string", "postgresql://user:pass@localhost/flowdesk"],
          ["JWT_SECRET", "Secret key for access tokens", "super-secret-random-string-32chars"],
          ["JWT_REFRESH_SECRET", "Secret key for refresh tokens", "another-secret-random-string"],
          ["JWT_EXPIRE_MINUTES", "Access token lifetime", "15"],
          ["REFRESH_EXPIRE_DAYS", "Refresh token lifetime", "7"],
          ["FRONTEND_URL", "Allowed CORS origin", "http://localhost:5173"],
          ["ENVIRONMENT", "App environment", "development or production"],
          ["PORT", "Server port", "8000"],
        ],
        [2500, 3500, 3360]
      ),

      divider(),

      // ── 8. DEPLOYMENT ──────────────────────────────────────
      h1("8. Deployment on Railway"),
      space(80),
      infoBox("Mandatory Requirement", "The app must be live and fully functional on Railway for assignment selection.", AMBER_LIGHT, AMBER),
      space(120),

      h2("8.1 Step-by-Step Railway Deployment"),
      numbered("Go to railway.app and create a free account"),
      numbered("Click New Project → Deploy from GitHub repo → select your flowdesk repo"),
      numbered("Railway auto-detects the railway.toml config and starts building"),
      numbered("Click + New → Database → Add PostgreSQL → Railway creates and links the DB automatically"),
      numbered("Go to your backend service → Variables tab → add all environment variables from section 7.4"),
      numbered("Set DATABASE_URL to the Railway PostgreSQL connection string (auto-populated as ${{Postgres.DATABASE_URL}})"),
      numbered("Go to Settings → Generate Domain → Railway gives you a live public URL"),
      numbered("For frontend: add another service → set VITE_API_URL to your backend Railway URL → deploy"),
      numbered("Test the live URL in browser — visit /docs to confirm API is running"),

      space(80),
      h2("8.2 railway.toml Configuration"),
      code("[build]"),
      code("builder = \"nixpacks\""),
      code("buildCommand = \"pip install -r requirements.txt && alembic upgrade head\""),
      code(""),
      code("[deploy]"),
      code("startCommand = \"uvicorn app.main:app --host 0.0.0.0 --port $PORT\""),
      code("healthcheckPath = \"/api/health\""),
      code("healthcheckTimeout = 30"),
      code("restartPolicyType = \"on_failure\""),

      space(80),
      h2("8.3 Post-Deployment Checklist"),
      bullet("Visit /api/health — should return {\"status\": \"ok\", \"db\": \"connected\"}"),
      bullet("Visit /docs — Swagger UI should load all endpoints"),
      bullet("Register a new user via the UI — verify JWT is returned"),
      bullet("Create a project, add a task — verify it persists after page refresh"),
      bullet("Test Admin vs Member role restrictions"),
      bullet("Test on mobile browser — verify responsive layout"),

      divider(),

      // ── 9. TESTING ─────────────────────────────────────────
      h1("9. Testing"),
      space(80),
      h2("9.1 Run Tests"),
      code("cd backend"),
      code("pytest tests/ -v --cov=app --cov-report=html"),
      code("open htmlcov/index.html   # view coverage report"),

      space(80),
      h2("9.2 Test Coverage Areas"),
      makeTable(
        ["Test File", "What It Tests", "Coverage Target"],
        [
          ["tests/test_auth.py", "Register, login, refresh, protected routes, invalid tokens", "100%"],
          ["tests/test_projects.py", "CRUD, member management, RBAC enforcement", "95%"],
          ["tests/test_tasks.py", "Create, update, delete, status patch, overdue logic", "95%"],
          ["tests/test_dashboard.py", "Stats aggregation, correct counts per user role", "90%"],
          ["tests/test_team.py", "Admin-only access, role changes, user removal", "95%"],
          ["tests/test_rbac.py", "Member tries Admin endpoints → expect 403", "100%"],
        ],
        [2800, 3800, 2760]
      ),

      divider(),

      // ── 10. VALIDATIONS ────────────────────────────────────
      h1("10. Validations & Error Handling"),
      space(80),
      h2("10.1 Input Validations"),
      bullet("Email: must be valid format, must be unique on registration"),
      bullet("Password: minimum 8 characters, at least 1 uppercase letter and 1 number"),
      bullet("Project name: required, 3–100 characters"),
      bullet("Task title: required, 3–200 characters"),
      bullet("Due date: cannot be set to a past date on creation"),
      bullet("Assignee: must be a member of the project — validated server-side"),
      bullet("Role: only 'admin' or 'member' accepted — enum validation"),

      space(80),
      h2("10.2 Business Rule Validations"),
      bullet("Cannot delete a project that has active (non-done) tasks — returns 409 with warning message"),
      bullet("Cannot remove a project member who has assigned tasks — must reassign first"),
      bullet("Members can only see projects they belong to — 403 if accessing others"),
      bullet("Only Admin can change roles or access the team management page"),
      bullet("Passwords are never returned in any API response"),
      bullet("Expired JWT returns 401 with message to refresh"),

      space(80),
      h2("10.3 Standard Error Response Format"),
      code("{"),
      code("  \"error\": true,"),
      code("  \"message\": \"Human readable error description\","),
      code("  \"code\": \"ERROR_CODE\","),
      code("  \"status\": 422"),
      code("}"),

      divider(),

      // ── 11. SECURITY ───────────────────────────────────────
      h1("11. Security"),
      makeTable(
        ["Security Measure", "Implementation"],
        [
          ["Password hashing", "bcrypt with salt rounds = 12"],
          ["Token security", "Short-lived JWT (15 min) + HTTP-only refresh tokens"],
          ["CORS", "Whitelist only the frontend origin in production"],
          ["SQL injection", "Prevented by SQLAlchemy ORM parameterized queries"],
          ["Input sanitization", "Pydantic models validate and strip all inputs"],
          ["Rate limiting", "10 login attempts per minute per IP (slowapi)"],
          ["RBAC enforcement", "Middleware checks role before every admin route"],
          ["Secrets management", "All secrets in environment variables, never hardcoded"],
          ["Security headers", "X-Content-Type-Options, X-Frame-Options via middleware"],
        ],
        [3500, 5860]
      ),

      divider(),

      // ── 12. CONTRIBUTING ───────────────────────────────────
      h1("12. Contributing & Development Notes"),
      space(80),
      h2("12.1 Git Workflow"),
      numbered("Fork the repository and create your feature branch:  git checkout -b feature/your-feature"),
      numbered("Make your changes and write tests for new functionality"),
      numbered("Run the full test suite and ensure all tests pass"),
      numbered("Commit with a clear message:  git commit -m 'feat: add task filtering by priority'"),
      numbered("Push and open a Pull Request against the main branch"),
      numbered("GitHub Actions will run tests automatically on your PR"),

      space(80),
      h2("12.2 Commit Message Convention"),
      bullet("feat: — new feature"),
      bullet("fix: — bug fix"),
      bullet("docs: — documentation only"),
      bullet("test: — adding or updating tests"),
      bullet("refactor: — code change with no feature or fix"),
      bullet("chore: — build, CI, or dependency updates"),

      divider(),

      // ── 13. FAQ ────────────────────────────────────────────
      h1("13. FAQ"),
      space(80),
      makeTable(
        ["Question", "Answer"],
        [
          ["How do I make the first Admin user?", "The first registered user is automatically given the Admin role. All subsequent users are Members by default."],
          ["Can a Member become an Admin?", "Yes — an existing Admin can change any user's role from the Team Management page."],
          ["What happens if I delete a project?", "All tasks belonging to that project are permanently deleted. You will see a confirmation warning if active tasks exist."],
          ["How do refresh tokens work?", "On login you receive both an access token (15 min) and a refresh token (7 days). When the access token expires, call POST /api/auth/refresh with the refresh token to get a new access token without logging in again."],
          ["Is the Railway deployment free?", "Railway has a free tier with 500 hours/month and $5 credit. For the assignment demo this is more than sufficient."],
          ["Where are the API docs?", "Visit your-app-url.railway.app/docs for interactive Swagger UI, or /redoc for ReDoc format."],
        ],
        [3000, 6360]
      ),

      divider(),

      // ── FOOTER ─────────────────────────────────────────────
      space(200),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            shading: { fill: DARK, type: ShadingType.CLEAR },
            margins: { top: 300, bottom: 300, left: 400, right: 400 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "FlowDesk — Team Task Manager", font: "Arial", size: 28, bold: true, color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 }, children: [new TextRun({ text: "Built with FastAPI  •  React  •  PostgreSQL  •  Railway", font: "Arial", size: 20, color: "94A3B8" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "github.com/yourusername/flowdesk  |  flowdesk.up.railway.app", font: "Arial", size: 20, color: "A5B4FC" })] }),
            ]
          })]
        })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/FlowDesk_README.docx', buffer);
  console.log('Done');
});
