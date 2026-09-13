# NestJS E-Commerce Backend

A powerful, multi-vendor e-commerce backend built with [NestJS](https://nestjs.com/), [Sequelize (PostgreSQL)](https://sequelize.org/), and [TypeScript](https://www.typescriptlang.org/).

## Features

- **Multi-Vendor Architecture**: Support for Sellers, Delivery Partners, Admins, and Customers.
- **Product Variants**: Advanced product architecture supporting variants (e.g. size, color), centralized inventory, and multiple brand integrations.
- **Flexible Authentication**: Secure JWT-based authentication using **Email & Password** or **Phone & OTP**.
- **Role-Based Access Control**: Highly customizable guards that restrict endpoints based on user roles.
- **Mock External Services**: Built-in Mailpit for SMTP email testing and a custom `SmsService` for local phone OTP mocking.
- **Robust Order & Cart Management**: Cart, Wishlist, Order Items, Checkout logic, and Address snapshots.
- **Coupons & Payments**: Integrated framework for discounting and handling payment states.
- **Extensively Tested**: 100% passing base test coverage across all major service/controller specs.

## Prerequisites
- [Node.js](https://nodejs.org/en/) (v16+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (Ensure an active `ecommerce` database exists)
- [MinIO](https://min.io/) (for media storage, optional but recommended)
- [Mailpit](https://mailpit.axllent.org/) (for local email capture)

## Environment Setup
Create a `.env` file in the root directory and configure the variables (Reference the existing `.env` for keys like `DB_HOST`, `JWT_ACCESS_SECRET`, `SMS_PROVIDER=mock`, etc.).

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running Tests

```bash
# unit tests
$ npm run test
```

## Authentication Testing Flow (Postman / Swagger)
1. **Email User**: `POST /auth/register` (Email + Password) -> Verify via Mailpit -> `POST /auth/login`.
2. **Phone User**: `POST /auth/register` (Phone only) -> Check Server Console for OTP -> `POST /auth/verify-phone` -> `POST /auth/send-login-otp` -> `POST /auth/verify-login-otp`.

## License
Nest is [MIT licensed](LICENSE).
