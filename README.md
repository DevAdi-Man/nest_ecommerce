<div align="center">
  <img src="https://nestjs.com/img/logo-small.svg" alt="NestJS Logo" width="120" />
  
  # 🛒 Next-Gen E-Commerce Backend API
  
  **A production-grade, highly scalable REST API built for modern e-commerce platforms.**
  
  [![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
  [![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org)
  [![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-modules">API Modules</a>
  </p>
</div>

---

## ✨ Features

This backend is engineered to handle complex e-commerce workflows with security and performance at its core:

- 🔐 **Robust Authentication** — JWT-based authentication (Access & Refresh tokens) with Role-Based Access Control (RBAC).
- ✉️ **Secure Onboarding** — OTP-based email verification & password resets powered by Nodemailer & MJML.
- 📦 **Advanced Catalog** — Infinite-depth nested categories with soft-deletion and slug-based routing.
- 🛒 **Smart Checkout Flow** — Persistent shopping carts converting seamlessly into Orders with history tracking.
- 🖼️ **Media Management** — S3-compatible object storage integration (MinIO) for secure product image uploads.
- 🛡️ **Bulletproof Data** — Strict DTO validations, safe DB transactions, and comprehensive error handling.

---

## 🛠 Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **NestJS 11** | Progressive Node.js framework (TypeScript) |
| **Database** | **PostgreSQL** | Primary relational database |
| **ORM** | **Sequelize** | Type-safe SQL querying and schema modeling |
| **Storage** | **MinIO** | S3-Compatible scalable object storage |
| **Email** | **Mailpit & Nodemailer** | Local SMTP testing & production mailer |
| **Validation** | **Class-Validator** | Robust payload parsing and validation |

---

## 📂 API Modules

The architecture is strictly modular. Below are the core domains driving the business logic:

<details>
<summary><strong>🔐 Auth & Users</strong> (Click to expand)</summary>

- `POST /auth/register` - User Registration
- `POST /auth/login` - Secure Login
- `POST /auth/verify-email` - OTP Verification
- `GET /users` - Manage users (Admin)
</details>

<details>
<summary><strong>🛍️ Catalog (Products & Categories)</strong></summary>

- `POST /categories` - Create nested tree categories
- `GET /products` - Browse catalog with filters
- `PATCH /categories/:id/restore` - Soft delete recovery
</details>

<details>
<summary><strong>📦 Cart, Address & Orders</strong></summary>

- `POST /cart` - Add/Update items
- `POST /addresses` - Multiple address book entries
- `POST /orders` - Atomic checkout converting Cart to Order
</details>

*(Check the Swagger UI at `/api` for full documentation of all endpoints!)*

---

## 🚀 Getting Started

Follow these steps to set up the backend locally.

### 1️⃣ Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v22+)
- **Docker & Docker Compose** (For DB, MinIO, and Mailpit)

### 2️⃣ Clone & Install
```bash
git clone https://github.com/DevAdi-Man/nest_ecommerce.git
cd nest_ecommerce
npm install
```

### 3️⃣ Environment Setup
Create your local environment file:
```bash
cp .env.example .env
```
*(Update `.env` with your desired DB credentials and JWT secrets).*

### 4️⃣ Spin up Infrastructure
Run the Docker containers for PostgreSQL, MinIO, and Mailpit:
```bash
docker-compose up -d
```

### 5️⃣ Run the Server
Start the NestJS application in watch mode:
```bash
npm run start:dev
```
🎉 **Voila!** The API is now running at `http://localhost:3000`.

---

## 📖 API Documentation (Swagger)

We use **Swagger / OpenAPI** for interactive API documentation. 
Once the server is running, visit:
👉 **[http://localhost:3000/api](http://localhost:3000/api)**

You can test all endpoints, view required payloads, and authorize using your JWT Bearer token directly from the browser!

---

## 🤝 Contributing

We love contributions! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) to learn about our development process, branching strategy, and pull request guidelines.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ by the Open Source Community.</p>
  <p>Released under the <a href="./LICENSE">MIT License</a>.</p>
</div>
