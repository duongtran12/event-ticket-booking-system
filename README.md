# Event Ticket Booking System

A backend project built with Java 21 and Spring Boot for learning and internship portfolio purposes.

## Tech Stack
- Java 21
- Spring Boot 4
- Spring Security
- JWT Authentication
- Spring Data JPA / Hibernate
- MySQL
- Maven
- Lombok
- Validation
- Swagger / OpenAPI

## Current Features
- User registration and login
- JWT-based authentication
- Role-based authorization for USER and ADMIN
- Event CRUD APIs
- Event search and pagination
- Booking creation, history, and cancellation
- Pessimistic lock for booking stock safety
- Global exception handling
- Swagger API documentation

## Project Structure
- controller
- service
- repository
- entity
- dto
- security
- config
- exception

## How to Run
1. Start MySQL and create the database configured in `src/main/resources/application.yml`.
2. Update datasource credentials if needed.
3. Run the application:

```bash
./mvnw spring-boot:run
```

4. Open Swagger UI:
- `/swagger-ui.html`

## Docker Run
1. Build and start both app and MySQL:

```bash
docker compose up --build
```

2. Open the API:
- `http://localhost:8080`

3. Open Swagger UI:
- `http://localhost:8080/swagger-ui.html`

The app container connects to the MySQL container through the Docker network, so you do not need a local MySQL instance for this mode.

## Default Data
- The application initializes default roles on startup.
- A default admin account is also created if it does not exist.

## API Notes
- Public endpoints: auth register/login, event listing, Swagger docs.
- Admin-only endpoints: event create/update/delete.
- Booking endpoints require authentication.

## Goal
This project focuses on backend engineering practice with a production-style monolithic architecture, while keeping the implementation simple enough for an intern/fresher level.
