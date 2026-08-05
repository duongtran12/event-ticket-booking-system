# 🎫 Event Ticket Booking System

[![Java](https://img.shields.io/badge/Java-21-%23ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-%236DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-%2361DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-%234479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-%232496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack event ticket booking system built with **Spring Boot 4** (backend) and **React 18** (frontend). This project demonstrates a production-style monolithic architecture with secure authentication, payment integration, AI-powered chat, and containerized deployment — designed for learning and internship portfolio purposes.

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login with JWT-based authentication
- Role-based access control: `USER` and `ADMIN`
- Secure password hashing with Spring Security

### 🎪 Event Management
- Full CRUD operations for events (admin only)
- Event search with keyword, date range, and category filters
- Paginated event listing
- Multiple ticket types per event (e.g., VIP, Standard, Economy)

### 🎟️ Booking & Reservation
- Reservation flow with **pessimistic locking** for stock safety
- Status lifecycle: `AVAILABLE` → `RESERVED` → `SOLD`
- Automatic release of expired reservations after **10 minutes**
- Email notification on successful booking

### 💳 Payment Integration
- **VNPay** sandbox payment gateway
- Payment callback handling and status verification
- Secure transaction flow

### 🤖 AI Chat Assistant
- Configurable AI provider: **Google Gemini** (default) or **OpenAI**
- Context-aware responses about events and bookings
- Fallback mechanism between providers

### 📊 Admin Dashboard
- Statistics overview (total events, bookings, revenue)
- User management
- Event and booking monitoring

### 📧 Email Notifications
- Booking confirmation emails via **Mailtrap SMTP** (sandbox)
- Configurable sender and template

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Core language |
| Spring Boot 4.0.6 | Application framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA / Hibernate | ORM & database access |
| JWT (jjwt) | Token-based authentication |
| Lombok | Boilerplate code reduction |
| Validation | Request validation |
| Swagger / OpenAPI 3 | API documentation |
| Spring Mail | Email sending |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite 5 | Build tool & dev server |

### Infrastructure & Integrations
| Technology | Purpose |
|------------|---------|
| MySQL 8 | Relational database |
| Docker & Docker Compose | Containerization |
| VNPay Sandbox | Payment gateway |
| Google Gemini API | AI chat (default) |
| OpenAI API | AI chat (fallback) |
| Mailtrap | Email testing SMTP |

---

## 📁 Project Structure

```
event-ticket-booking-system/
├── src/
│   ├── main/
│   │   ├── java/com/duong/eventticket/
│   │   │   ├── config/              # App configuration (CORS, OpenAPI, DataInitializer)
│   │   │   ├── controller/          # REST controllers
│   │   │   │   ├── AdminController.java
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── BookingController.java
│   │   │   │   ├── ChatController.java
│   │   │   │   ├── EventController.java
│   │   │   │   └── UserController.java
│   │   │   ├── dto/                 # Data Transfer Objects (request/response)
│   │   │   ├── entity/              # JPA entities (User, Event, Booking, Role, TicketType)
│   │   │   ├── exception/           # Global exception handling
│   │   │   ├── repository/          # Spring Data JPA repositories
│   │   │   ├── security/            # JWT & security configuration
│   │   │   ├── service/             # Business logic layer
│   │   │   └── EventticketApplication.java
│   │   └── resources/
│   │       └── application.yml      # Application configuration
│   └── test/                        # Unit & integration tests
├── frontend/
│   ├── public/                      # Static assets
│   ├── src/                         # React source code
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml               # Docker services (app + MySQL)
├── Dockerfile                        # Backend Docker image
├── pom.xml                          # Maven build file
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **JDK 21** or later
- **Maven** (or use the included `mvnw` wrapper)
- **Node.js** 18+ and **npm** (for frontend)
- **MySQL** 8.0+ (or Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/duongtran12/event-ticket-booking-system.git
cd event-ticket-booking-system
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)
```bash
docker compose up -d
```
This starts both MySQL and the application containers.

#### Option B: Local MySQL
1. Ensure MySQL is running on `localhost:3307`
2. Create the database:
```sql
CREATE DATABASE IF NOT EXISTS event_ticket_db;
```

### 3. Configuration

Copy the environment template and replace its placeholder values (do **not** commit `.env`):

```bash
cp .env.example .env
```

On PowerShell, use `Copy-Item .env.example .env` instead. For local backend runs outside Docker, export the same variables in your shell or IDE run configuration.

| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | MySQL connection URL (default: `jdbc:mysql://localhost:3307/event_ticket_db`) |
| `SPRING_DATASOURCE_USERNAME` | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | MySQL password |
| `FLYWAY_BASELINE_ON_MIGRATE` | Set `true` once when adopting Flyway for an existing database; use `false` afterwards |
| `JWT_SECRET` | JWT signing key (min 32 bytes) |
| `BOOTSTRAP_ADMIN_EMAIL` | Optional email used to create the first admin account |
| `BOOTSTRAP_ADMIN_PASSWORD` | Optional initial admin password (minimum 12 characters) |
| `VNPAY_TMN_CODE` | VNPay merchant code |
| `VNPAY_HASH_SECRET` | VNPay secret key |
| `VNPAY_RETURN_URL` | Payment callback URL |
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `CHAT_PROVIDER` | AI provider — `gemini` or `openai` |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USERNAME` | SMTP username |
| `MAIL_PASSWORD` | SMTP password |

> ⚠️ **Security:** The repository does not provide default secrets. Generate your own values and keep them outside version control. If this repository previously contained real credentials, revoke and rotate them because removing them from the latest commit does not remove them from Git history.

### 4. Run the Application

#### Backend (Local)
```bash
./mvnw spring-boot:run
```
The API will be available at `http://localhost:8081`.

#### Frontend (Local)
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

### Database migrations

Flyway runs the scripts in `src/main/resources/db/migration` before Hibernate validates the schema. A fresh database runs `V1__baseline_schema.sql`. An existing project database is baselined at version 1 without recreating its tables or deleting its data.

After the first successful startup against an existing database, set `FLYWAY_BASELINE_ON_MIGRATE=false`. Every later schema change must be added as the next versioned script, for example `V2__add_event_category.sql`; do not edit a migration that has already run.

#### Docker (Full Stack)
```bash
docker compose up --build
```
- API: `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`

---

## 📖 API Documentation

### Swagger UI
Once the application is running, access the interactive API documentation:
- **Local**: `http://localhost:8081/swagger-ui.html`
- **Docker**: `http://localhost:8081/swagger-ui.html`

### API Endpoints Overview

#### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/events` | List events (paginated, filterable) |
| GET | `/api/events/{id}` | Get event details |

#### Authenticated Endpoints (require JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a booking reservation |
| GET | `/api/bookings/my` | Get current user's bookings |
| GET | `/api/bookings/{id}` | Get booking details |
| POST | `/api/bookings/{id}/pay` | Initiate VNPay payment |
| GET | `/api/bookings/payment-callback` | VNPay payment callback |
| POST | `/api/chat` | Send message to AI assistant |
| GET | `/api/users/me` | Get current user profile |

#### Admin Endpoints (require ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/events` | Create a new event |
| PUT | `/api/admin/events/{id}` | Update an event |
| DELETE | `/api/admin/events/{id}` | Delete an event |
| GET | `/api/admin/stats` | Get dashboard statistics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/bookings` | List all bookings |

---

## 🐳 Docker Deployment

### Build & Run
```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up --build -d

# Stop services
docker compose down

# Remove volumes (reset database)
docker compose down -v
```

### Services
| Service | Port | Description |
|---------|------|-------------|
| `app` | `8081` | Spring Boot backend |
| `mysql` | `3307` | MySQL database |

The application container connects to the MySQL container through the Docker internal network, so no local MySQL instance is required.

---

## 👤 Default Data

On startup, the application initializes:

### Roles
| Role | Description |
|------|-------------|
| `USER` | Standard user — can browse events, make bookings |
| `ADMIN` | Administrator — full access to all features |

### Initial Admin Account

The project does not contain a default admin credential. To create the first admin, set both `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` before the first startup. If that email already exists, its password and role are left unchanged. After the account has been created, remove both values from the runtime environment.

---

## 💡 Key Design Decisions

- **Pessimistic Locking**: Prevents overselling tickets when multiple users book simultaneously
- **Reservation Timeout**: Unpaid reservations auto-release after 10 minutes, making tickets available again
- **Configurable AI Provider**: Switch between Gemini and OpenAI without code changes
- **Environment Variables**: All sensitive configs are externalized via `application.yml` with `SPRING_*` overrides
- **Monolithic Architecture**: Simple deployment, suitable for intern/fresher level while demonstrating production patterns

---

## 🔮 Future Improvements

- [ ] OAuth2 social login (Google, Facebook)
- [ ] Payment refund flow
- [ ] Real-time seat selection with WebSocket
- [ ] PDF ticket generation
- [ ] Rate limiting and API throttling
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Kubernetes deployment manifests
- [ ] End-to-end testing with Playwright/Cypress

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

- [Spring Boot](https://spring.io/projects/spring-boot)
- [VNPay Sandbox](https://sandbox.vnpayment.vn/)
- [Google Gemini API](https://ai.google.dev/)
- [Mailtrap](https://mailtrap.io/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)

---

<p align="center">
  Built with ❤️ for learning and portfolio purposes
</p>
