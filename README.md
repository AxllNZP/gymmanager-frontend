# 🏋️ Olympus Gym — Sistema de Gestión

> Sistema web fullstack para la gestión integral de un gimnasio: clientes, membresías, pagos, asistencias y reportes.

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat&logo=angular)](https://angular.dev)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?style=flat&logo=spring)](https://spring.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://docker.com)

---

## 📸 Vista previa

| Dashboard | Clientes | Pagos |
|-----------|----------|-------|
| Métricas en tiempo real | CRUD completo con membresías | Registro con confirmación por email |

---

## ✨ Funcionalidades principales

| Módulo | Descripción |
|--------|-------------|
| 🔐 **Autenticación** | JWT + Argon2, bloqueo automático tras 5 intentos fallidos |
| 👥 **Clientes** | CRUD completo, datos médicos con consentimiento RGPD |
| 🎫 **Membresías** | Planes de 1-3 personas, renovación, estados automáticos |
| 💳 **Pagos** | EFECTIVO / YAPE / PLIN / TRANSFERENCIA, descuentos, correo automático |
| 📋 **Asistencias** | Control de entrada/salida en tiempo real |
| 📊 **Reportes** | Dashboard KPI, exportación PDF y Excel |
| 👤 **Usuarios** | Roles: ADMIN, RECEPCIONISTA, CONTADOR, DUEÑO |
| 🔍 **Auditoría** | Registro completo de acciones por usuario |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
│   Angular 21 + Angular Material + TypeScript 5.9   │
│   Standalone Components · RxJS · Reactive Forms    │
└─────────────────┬───────────────────────────────────┘
                  │  REST API (JSON)
                  │  Bearer JWT Token
┌─────────────────▼───────────────────────────────────┐
│                   BACKEND                           │
│   Spring Boot 4 · Spring Security · JPA/Hibernate  │
│   Argon2 Passwords · Scheduler · Async Email       │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              PostgreSQL 15                          │
│   Clientes · Membresías · Pagos · Asistencias      │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack tecnológico

### Frontend
- **Angular 21** — Standalone components, nuevos control flows (`@if`, `@for`)
- **Angular Material 21** — Design system completo
- **TypeScript 5.9** — Tipado estricto, interfaces 1:1 con DTOs del backend
- **RxJS** — `takeUntilDestroyed`, pipes reactivos
- **JWT Decode** — Validación de token en cliente

### Backend
- **Spring Boot 4.0** — REST API
- **Spring Security** — JWT Filter, Method Security (`@PreAuthorize`)
- **Spring Data JPA** — Hibernate + PostgreSQL
- **Argon2** — Hashing de contraseñas (más seguro que BCrypt)
- **JavaMail** — Confirmaciones de pago y avisos de vencimiento
- **iText PDF + Apache POI** — Exportación de reportes
- **Spring Scheduler** — Actualización automática de estados de membresía

---

## 🚀 Instalación y ejecución

### Prerrequisitos
- Java 21+
- Node.js 20+
- PostgreSQL 15+
- Docker (opcional)

### Con Docker (recomendado)

```bash
# Clonar repositorios
git clone https://github.com/AxllNZP/gymmanager-Backend.git
git clone https://github.com/AxllNZP/gymmanager-frontend.git

# Copiar y configurar variables de entorno
cd gymmanager-Backend
cp .env.example .env
# Editar .env con tus credenciales

# Levantar todo con Docker Compose
docker-compose up -d
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8080/api

### Sin Docker

**Backend:**
```bash
cd gymmanager-Backend
# Configurar .env con DB, JWT, MAIL
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd gymmanager-frontend
npm install
ng serve
```

---

## 🔑 Credenciales por defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN | axellzurita1003@gmail.com | Admin2026* |

> ⚠️ Cambiar las credenciales en producción editando el `.env`

---

## 📁 Estructura del proyecto

```
gymmanager-frontend/
├── src/app/
│   ├── core/
│   │   ├── guards/          # authGuard, roleGuard
│   │   ├── interceptors/    # JWT + manejo de errores HTTP
│   │   ├── models/          # Interfaces TypeScript (1:1 con DTOs backend)
│   │   └── services/        # HTTP services
│   ├── features/
│   │   ├── auth/            # Login
│   │   ├── clientes/
│   │   ├── membresias/
│   │   ├── pagos/
│   │   ├── asistencias/
│   │   ├── planes/
│   │   ├── reportes/
│   │   ├── usuarios/
│   │   └── dashboard/
│   ├── layouts/             # MainLayout con sidenav
│   └── shared/              # Pipes, componentes reutilizables

gymmanager-Backend/
├── src/main/java/com/gymmanager/
│   ├── config/              # Security, JWT, CORS, DataInitializer
│   ├── controller/          # REST controllers
│   ├── dto/                 # Request/Response DTOs
│   ├── entity/              # JPA entities
│   ├── exception/           # GlobalExceptionHandler
│   ├── repository/          # Spring Data repositories
│   ├── scheduler/           # MembresiaScheduler
│   └── service/             # Business logic
```

---

## 🔐 Seguridad implementada

- **JWT** con expiración configurable (por defecto 8h)
- **Argon2** para hashing de contraseñas
- **Bloqueo de cuenta** tras 5 intentos fallidos por 30 minutos
- **RBAC** — cada endpoint validado con `@PreAuthorize`
- **CORS** configurado para el origen del frontend
- **Audit Log** — registro de todas las operaciones críticas
- **Consentimiento RGPD** para datos médicos de clientes

---

## 📊 Endpoints principales

| Método | Endpoint | Roles |
|--------|----------|-------|
| POST | `/api/auth/login` | Público |
| GET | `/api/clientes` | ADMIN, RECEPCIONISTA |
| POST | `/api/membresias` | ADMIN, RECEPCIONISTA |
| POST | `/api/pagos` | ADMIN, RECEPCIONISTA |
| GET | `/api/reportes/dashboard` | Todos |
| GET | `/api/reportes/exportar/pdf` | ADMIN, CONTADOR, DUEÑO |

---

## 🌐 Variables de entorno

Ver `.env.example` en el repositorio del backend para la lista completa:

```env
DB_URL=jdbc:postgresql://localhost:5433/gymmanager
DB_USERNAME=...
DB_PASSWORD=...
JWT_SECRET=...          # min 64 caracteres
JWT_EXPIRATION_MS=28800000
MAIL_USERNAME=...
MAIL_PASSWORD=...       # App Password de Google
```

---

## 📄 Licencia

MIT © 2026 Axell Zurita — Lima, Perú

---

## 👤 Autor

**Axell Zurita**
- GitHub: [@AxllNZP](https://github.com/AxllNZP)
- LinkedIn: [linkedin.com/in/axellzurita](https://linkedin.com/in/axellzurita)

> Proyecto desarrollado como sistema de gestión real para gimnasios. Disponible para uso comercial bajo licencia MIT.
