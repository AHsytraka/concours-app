# 📚 Inscription Service - University Contest Management System

A comprehensive platform for managing university entrance examinations and contests. The system consists of three main components:

- **Backend**: Spring Boot REST API
- **Frontend**: React.js with Vite
- **AI Services**: FastAPI Python services for document classification and deliberation

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [AI Services Setup](#ai-services-setup)
- [Database Setup](#database-setup)
- [Running the Complete System](#running-the-complete-system)
- [API Documentation](#api-documentation)
- [Default Ports](#default-ports)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Download |
|----------|---------|----------|
| Java JDK | 17+ | [Download](https://adoptium.net/) |
| Node.js | 18+ | [Download](https://nodejs.org/) |
| Python | 3.10+ | [Download](https://python.org/) |
| PostgreSQL | 14+ | [Download](https://postgresql.org/) |
| Maven | 3.8+ | (Included via Maven Wrapper) |
| Git | Latest | [Download](https://git-scm.com/) |

---

## 📁 Project Structure

```
InscriptionService/
├── src/                          # Spring Boot Backend
│   ├── main/
│   │   ├── java/com/example/Inscription/
│   │   │   ├── config/           # Configuration classes
│   │   │   ├── controller/       # REST controllers
│   │   │   ├── model/            # JPA entities
│   │   │   ├── repository/       # Data repositories
│   │   │   └── service/          # Business logic
│   │   └── resources/
│   │       ├── application.properties
│   │       └── tessdata/         # OCR training data
│   └── test/                     # Unit tests
├── front/                        # React Frontend
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   ├── context/              # React context
│   │   └── styles/               # Global styles
│   ├── package.json
│   └── vite.config.js
├── IA/                           # AI Services
│   └── eni-ia-services/
│       ├── app/
│       │   ├── classification/   # Document classification
│       │   └── deliberation/     # Exam deliberation
│       ├── main.py
│       └── requirements.txt
├── pom.xml                       # Maven configuration
└── README.md
```

---

## ⚙️ Backend Setup

### 1. Configure Database Connection

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/inscriptionservice
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT Secret (change in production!)
app.jwt.secret=your-secret-key-at-least-256-bits-long
app.jwt.expiration=86400000

# Email Configuration (optional)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 2. Build and Run

```bash
# Navigate to project root
cd InscriptionService

# Build the project (skip tests for faster build)
./mvnw clean install -DskipTests

# Run the application
./mvnw spring-boot:run
```

**Windows:**
```cmd
mvnw.cmd clean install -DskipTests
mvnw.cmd spring-boot:run
```

### 3. Verify Backend is Running

Open your browser and go to:
- API Health: http://localhost:8080/actuator/health
- Swagger UI: http://localhost:8080/swagger-ui.html

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd front

# Install npm packages
npm install
```

### 2. Configure API URL (Optional)

The frontend is pre-configured to connect to `http://localhost:8080`. If you need to change this, edit `src/services/api.js`.

### 3. Run Development Server

```bash
# Start the development server
npm run dev
```

### 4. Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### 5. Verify Frontend is Running

Open your browser and go to: http://localhost:3000

---

## 🤖 AI Services Setup

### 1. Create Virtual Environment

```bash
# Navigate to AI services directory
cd IA/eni-ia-services

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
# Install required packages
pip install -r requirements.txt
```

### 3. Run AI Services

```bash
# Start the FastAPI server
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. Verify AI Services are Running

Open your browser and go to:
- API Docs: http://localhost:8001/docs
- Health Check: http://localhost:8001/health

---

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE inscriptionservice;

-- Create user (optional)
CREATE USER inscription_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE inscriptionservice TO inscription_user;
```

### 2. Database will Auto-Initialize

The application uses `spring.jpa.hibernate.ddl-auto=update`, so tables will be created automatically on first run.

---

## 🚀 Running the Complete System

### Quick Start (All Services)

Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd InscriptionService
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd InscriptionService/front
npm run dev
```

**Terminal 3 - AI Services:**
```bash
cd InscriptionService/IA/eni-ia-services
# Activate venv first
python main.py
```

### Using a Script (Windows)

Create `start-all.bat`:
```batch
@echo off
start "Backend" cmd /k "cd /d %~dp0 && mvnw.cmd spring-boot:run"
start "Frontend" cmd /k "cd /d %~dp0\front && npm run dev"
start "AI Services" cmd /k "cd /d %~dp0\IA\eni-ia-services && venv\Scripts\activate && python main.py"
```

---

## 📖 API Documentation

### Backend API (Spring Boot)
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

### AI Services API (FastAPI)
- **Interactive Docs**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Main API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register/student` | POST | Student registration |
| `/api/auth/register/institution` | POST | Institution registration |
| `/api/institution/events` | GET/POST | Manage contests |
| `/api/institution/dossiers` | GET | Get registration dossiers |
| `/api/events/public` | GET | Public events list |

---

## 🔌 Default Ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8080 | http://localhost:8080 |
| Frontend | 3000 | http://localhost:3000 |
| AI Services | 8001 | http://localhost:8001 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 🔐 Environment Variables

### Backend (application.properties)

| Variable | Description | Default |
|----------|-------------|---------|
| `spring.datasource.url` | Database URL | `jdbc:postgresql://localhost:5432/inscriptionservice` |
| `spring.datasource.username` | DB username | `postgres` |
| `spring.datasource.password` | DB password | - |
| `app.jwt.secret` | JWT signing key | - |
| `app.jwt.expiration` | Token expiry (ms) | `86400000` |

### Frontend (vite.config.js)

| Variable | Description | Default |
|----------|-------------|---------|
| `server.port` | Dev server port | `3000` |
| `server.proxy` | API proxy | `http://localhost:8080` |

---

## ❓ Troubleshooting

### Backend Issues

**Port 8080 already in use:**
```bash
# Find process using port 8080
netstat -ano | findstr :8080
# Kill the process
taskkill /PID <PID> /F
```

**Database connection failed:**
- Ensure PostgreSQL is running
- Verify credentials in `application.properties`
- Check if database exists

### Frontend Issues

**npm install fails:**
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS errors:**
- Ensure backend is running
- Check CORS configuration in `SecurityConfig.java`

### AI Services Issues

**ModuleNotFoundError:**
```bash
# Ensure virtual environment is activated
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

**CUDA/GPU issues:**
```bash
# Install CPU-only PyTorch
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

---

## 👥 User Roles

| Role | Description | Access |
|------|-------------|--------|
| `STUDENT` | Contest candidates | Register for events, view results |
| `INSTITUTION_ADMIN` | University administrators | Full dashboard access |
| `CONTEST_MANAGER` | Sub-account for grade entry | Grades page only |

---

## 📝 License

This project is developed for educational purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
