# SYSTEM.md — Zap Platform Architecture

This document describes the **existing production system** called **Zap**.
It must be read by agents **before planning, scaffolding, or generating code**
when the user refers to an existing system, production environment, or containers.

---

## 1. System Overview

Zap is a **containerized, event-driven, microservices-based platform**
for managing WhatsApp messages with AI integration.

- Architecture style: Microservices
- Runtime: Docker / Docker Compose
- Environment: Linux (RHEL)
- Status: Production system (DO NOT recreate from scratch)

---

## 2. Core Stack

| Layer | Technology |
|------|------------|
| Frontend | React SPA |
| Backend | Node.js + Express |
| Database | PostgreSQL 14 |
| Cache | Redis |
| Message Queue | RabbitMQ |
| Reverse Proxy | Nginx |
| AI Integration | Google Gemini |
| Messaging | Meta Cloud API (WhatsApp) |
| Auth | LDAP |
| Observability | Pyroscope |

---

## 3. Containers (Logical View)

The system runs as **named containers**.  
Agents MUST reuse these services and MUST NOT create duplicates.

| Container | Responsibility |
|---------|----------------|
| zap-backend | Core API, business logic, WhatsApp integration |
| zap-frontend | React SPA UI |
| postgres | Persistent relational database |
| redis | Cache and temporary state |
| rabbitmq | Async message processing |
| nginx | Reverse proxy, SSL termination |
| n8n | Automation and workflows (if present) |

---

## 4. Networking Rules

- All containers communicate via **Docker internal networks**
- No service is accessed directly via IP
- External access is allowed **ONLY via Nginx**
- HTTPS termination happens at the reverse proxy

---

## 5. Message Flow (Webhook Processing)

Zap uses an **event-driven model** for inbound WhatsApp messages:

1. Meta Cloud API sends webhook
2. Nginx receives request
3. zap-backend validates and ACKs immediately
4. Message is published to RabbitMQ
5. Background consumers process:
   - Persistence
   - AI analysis
   - Business rules
6. Responses are sent asynchronously

This design guarantees:
- Fast webhook response
- Resilience
- Scalability

---

## 6. External Integrations

| Service | Purpose |
|-------|--------|
| Meta Cloud API | Official WhatsApp messaging |
| Google Gemini AI | Prompt analysis and response generation |
| LDAP | Centralized authentication |
| Pyroscope | Continuous profiling |

---

## 7. Project Structure (Logical)

| Path | Responsibility |
|----|----------------|
| `/backend` | API, queue handlers, integrations |
| `/frontend` | React UI |
| `/nginx` | Proxy config, certificates |
| `/tests` | Automated tests (Playwright) |

---

## 8. Critical Rules for Agents

**DO NOT:**
- Create a new backend service
- Create a new database
- Introduce a new message broker
- Generate a new docker-compose unless explicitly requested

**ALWAYS:**
- Extend existing containers
- Respect async processing via RabbitMQ
- Keep webhook handlers lightweight
- Follow existing naming conventions

---

## 9. When This File Must Be Read

Agents MUST read this file when the user mentions:
- "Zap"
- "existing system"
- "production"
- "containers"
- "backend", "frontend", "webhook", or "WhatsApp"

Failure to do so may result in incorrect architecture decisions.
