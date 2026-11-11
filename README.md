# Diagram Studio

A full-stack, collaborative diagramming and technical design workspace built with **React**, **Java / Spring Boot**, and **PostgreSQL**. **Diagram Studio** enables developers, architects, and teams to design, render, and manage dynamic technical diagrams (flowcharts, architecture diagrams, sequence flows, and system blueprints) with real-time state synchronization, project versioning, and document exports.

---

## Table of Contents

- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup (Spring Boot)](#2-backend-setup-spring-boot)
  - [3. Frontend Setup (React)](#3-frontend-setup-react)
  - [4. Running with Docker Compose](#4-running-with-docker-compose)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Database Schema & Migrations](#database-schema--migrations)
- [API Overview](#api-overview)
- [WebSocket & Real-Time Sync](#websocket--real-time-sync)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Interactive Canvas:** Drag-and-drop node placement, dynamic connectors, orthogonal edge routing, and zoom/pan functionality.
- **Real-Time Collaboration:** Synchronous multi-user editing, cursor presence, and instant node updates over WebSockets (STOMP).
- **Workspace & Access Control:** Multi-tenant workspace management, role-based access control (RBAC), and team-level sharing.
- **Version History & Snapshots:** Snapshot-based revision tracking with undo/redo rollbacks and audit logs.
- **Export & Import:** Export diagrams to SVG, PNG, and JSON formats; import reusable templates.
- **Robust Security:** Stateless JWT authentication, secure refresh token rotation, CORS configuration, and method-level access controls.

---

## Architecture & Tech Stack

### Backend
- **Language:** Java 17+
- **Framework:** Spring Boot 3.x
  - **Spring Web (MVC):** RESTful endpoints and request validation
  - **Spring Security:** JWT authentication and authorization
  - **Spring Data JPA / Hibernate:** Object-relational mapping and optimized query execution
  - **Spring WebSocket:** Real-time bi-directional messaging with STOMP & SockJS
- **Database & Cache:** PostgreSQL, Redis (session management & metadata caching)
- **Database Migrations:** Flyway
- **Build Tool:** Maven / Gradle

### Frontend
- **Framework:** React 18+
- **Styling:** Tailwind CSS / CSS Modules
- **State Management:** Redux Toolkit / Zustand
- **Canvas Rendering:** HTML5 Canvas / SVG / React Flow
- **Network Clients:** Axios (REST) & Stomp.js / SockJS-client (WebSockets)

### Infrastructure & Tooling
- **Containerization:** Docker, Docker Compose
- **API Documentation:** Springdoc OpenAPI (Swagger UI)
- **CI/CD:** GitHub Actions

---

## System Architecture

```
       +---------------------------------------------+
       |             React Frontend (SPA)            |
       |  (Canvas UI, Zustand/Redux, STOMP Client)   |
       +----------------------+----------------------+
                              |
                     HTTP/REST| |WebSocket (STOMP)
                              v v
       +---------------------------------------------+
       |         Spring Boot Application Server      |
       |  - Security & JWT Filter Chain              |
       |  - Diagram & Workspace REST Controllers     |
       |  - WebSocket Session & Event Broker         |
       |  - Business Services & JPA Repositories     |
       +--------------+---------------+--------------+
                      |               |
                      v               v
       +--------------------+   +--------------------+
       |  PostgreSQL (DB)   |   |   Redis (Cache)    |
       | - Workspaces       |   | - Session Presence |
       | - Diagram Schemas  |   | - Active Canvas    |
       | - Revision Logs    |   |   States           |
       +--------------------+   +--------------------+
```
Prerequisites
Before running the application locally, ensure you have the following installed:
 * Java Development Kit (JDK): Version 17 or higher
 * Node.js: Version 18.x or higher & npm or yarn
 * PostgreSQL: Version 14 or higher
 * Redis: Version 6 or higher (optional for local development, required if caching/clustering enabled)
 * Docker & Docker Compose: (optional, for running containerized services)
Getting Started
1. Clone the Repository
git clone [https://github.com/kunal472/Diagram-Studio.git](https://github.com/kunal472/Diagram-Studio.git)
cd Diagram-Studio

2. Backend Setup (Spring Boot)
 * Navigate to the backend directory:
   cd backend

 * Create a PostgreSQL database:
   CREATE DATABASE diagram_studio;

 * Configure your local database credentials in src/main/resources/application.yml or set them via environment variables:
   export DB_URL=jdbc:postgresql://localhost:5432/diagram_studio
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
export JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long

 * Build and run the application:
   # Using Maven
./mvnw clean spring-boot:run

# Or using Gradle
./gradlew bootRun

The backend server runs on http://localhost:8080. Swagger documentation is accessible at http://localhost:8080/swagger-ui.html.
3. Frontend Setup (React)
 * Open a new terminal and navigate to the frontend directory:
   cd frontend

 * Install dependencies:
   npm install

 * Create an environment file .env:
   REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
REACT_APP_WS_URL=http://localhost:8080/ws

 * Start the development server:
   npm start

The frontend application will be available at http://localhost:3000.
4. Running with Docker Compose
To start the complete environment (PostgreSQL, Redis, Backend, and Frontend) in one command:
docker-compose up --build

 * Frontend: http://localhost:3000
 * Backend API: http://localhost:8080
 * PostgreSQL: localhost:5432
 * Redis: localhost:6379
To stop all services:
docker-compose down

Configuration & Environment Variables
| Variable | Description | Default |
|---|---|---|
| SERVER_PORT | Port for the Spring Boot server | 8080 |
| SPRING_DATASOURCE_URL | PostgreSQL connection URL | jdbc:postgresql://localhost:5432/diagram_studio |
| SPRING_DATASOURCE_USERNAME | Database username | postgres |
| SPRING_DATASOURCE_PASSWORD | Database password | postgres |
| REDIS_HOST | Redis host address | localhost |
| REDIS_PORT | Redis port | 6379 |
| JWT_SECRET | Secret key for signing access tokens | (Set a strong secret) |
| JWT_EXPIRATION_MS | Access token lifespan in milliseconds | 86400000 (24h) |

Database Schema & Migrations
Database tables are version-controlled using Flyway scripts located in:
backend/src/main/resources/db/migration/
Key tables include:
 * users: User identity, password hashes, and profile settings.
 * workspaces: Workspaces and organization-level groupings.
 * workspace_members: User-workspace associations and authorization roles (OWNER, EDITOR, VIEWER).
 * diagrams: Metadata, active layout definitions, and diagram serialized JSON tree.
 * diagram_versions: Immutable snapshots for version history and audit trails.
API Overview
Authentication (/api/v1/auth)
 * POST /register – Register a new user account.
 * POST /login – Authenticate and retrieve JWT token.
 * POST /refresh – Rotate expired access token.
Workspaces (/api/v1/workspaces)
 * GET / – List workspaces for current user.
 * POST / – Create a new workspace.
 * GET /{id} – Get workspace details and diagram list.
 * DELETE /{id} – Remove a workspace.
Diagrams (/api/v1/diagrams)
 * GET /workspace/{workspaceId} – List diagrams in workspace.
 * GET /{id} – Fetch diagram structure and canvas elements.
 * POST / – Create a new diagram.
 * PUT /{id} – Update diagram layout, metadata, or elements.
 * POST /{id}/snapshot – Create a version checkpoint.
 * GET /{id}/versions – List revision history.
WebSocket & Real-Time Sync
 * Endpoint: /ws
 * Protocol: STOMP over SockJS
 * Topic Subscriptions:
   * /topic/diagram/{diagramId} – Receive canvas node/edge mutations from other active users.
   * /topic/diagram/{diagramId}/presence – User cursor updates and active user indicators.
 * Message Send Destinations:
   * /app/diagram/{diagramId}/update – Broadcast canvas state diffs.
   * /app/diagram/{diagramId}/cursor – Send real-time pointer coordinates.
Testing
Run Backend Unit & Integration Tests
cd backend
./mvnw test

Run Frontend Unit Tests
cd frontend
npm test

Contributing
 * Fork the repository.
 * Create a feature branch: git checkout -b feature/your-feature-name.
 * Commit your changes: git commit -m "Add new feature".
 * Push to your branch: git push origin feature/your-feature-name.
 * Open a Pull Request.
License
This project is licensed under the MIT License.

