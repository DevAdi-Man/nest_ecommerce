# 🛒 Ecommerce Backend API

A production-ready, fully-featured ecommerce REST API built with **NestJS**, **Sequelize**, and **PostgreSQL**. Includes authentication, role-based access control, product management, orders, payments, coupons, inventory, reviews, and more.

---

## Tech Stack

- **Framework** — NestJS 11 (Node.js + TypeScript)
- **Database** — PostgreSQL + Sequelize ORM
- **Auth** — JWT (access + refresh tokens), Passport.js
- **Mail** — Nodemailer + MJML templates (Mailpit for local dev)
- **Storage** — MinIO (S3-compatible object storage)
- **Validation** — class-validator, class-transformer, Joi
- **Docs** — Swagger / OpenAPI
- **Testing** — Jest

---

## Modules

| Module | Description |
|---|---|
| `auth` | JWT login, register, refresh token, OTP email verification |
| `users` | User profile management |
| `roles` | Role-based access control (Admin / User) |
| `products` | Product CRUD with slugs and image upload |
| `categories` | Hierarchical categories with tree structure and soft delete |
| `orders` | Order creation and management |
| `payments` | Payment processing |
| `coupons` | Discount coupon management |
| `inventory` | Stock tracking |
| `reviews` | Product reviews and ratings |
| `carts` | Shopping cart |
| `wishlists` | User wishlists |
| `addresses` | User address book |
| `otp` | One-time password service |
| `mail` | Email service with MJML templates |

---

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL
- Docker (recommended for local services)

### 1. Clone the repository

```bash
git clone https://github.com/DevAdi-Man/nest_ecommerce.git
cd nest_ecommerce
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Fill in the values in `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ecommerce

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Mail (Mailpit for local dev)
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM="Ecommerce <no-reply@ecommerce.local>"

# MinIO (S3 Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET=ecommerce

# Default Admin Seed
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

### 4. Start local services (PostgreSQL + MinIO + Mailpit)

```bash
docker-compose up -d
```

### 5. Run the application

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run start:prod
```

The API will be running at `http://localhost:3000`

Swagger docs available at `http://localhost:3000/api`

---

## Scripts

```bash
npm run start:dev     # development with hot reload (webpack HMR)
npm run start:debug   # debug mode
npm run start:prod    # production

npm run build         # compile TypeScript
npm run format        # format with Prettier
npm run lint          # lint with ESLint

npm run test          # unit tests
npm run test:watch    # unit tests in watch mode
npm run test:cov      # test coverage report
npm run test:e2e      # end-to-end tests
```

---

## API Documentation

Swagger UI is available at `/api` when the server is running.

All endpoints are documented with:
- Request/response schemas
- Auth requirements (Bearer token)
- Query parameters for pagination, search, filter, and sorting

---

## Contributing

This is an open source project. Contributions are welcome!

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR. Key points:

- Branch from `develop`, not `main`
- Use conventional commit messages: `feat(scope): description`
- Open PRs against `develop`
- Follow the PR checklist in CONTRIBUTING.md

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

---

## License

This project is [MIT licensed](./LICENSE).
