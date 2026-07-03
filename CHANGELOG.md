# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- MinIO integration as S3-compatible object storage (Docker)

---

## [1.0.0] - 2026-06-22

### Added
- JWT authentication with access and refresh tokens
- OTP-based email verification flow
- Role-based access control (RBAC) with admin and user roles
- Users module with profile management
- Categories module with full CRUD, tree structure, slug support, soft delete, and restore
- Products module
- Orders module
- Payments module
- Coupons module
- Inventory module
- Reviews module
- Cart module
- Wishlist module
- Addresses module
- Mail module with MJML email templates
- Swagger/OpenAPI documentation
- Rate limiting
- Response transformer interceptor
- Logger interceptor with route timing
- Docker Compose setup with PostgreSQL
- Environment variable validation with Joi
- Pagination, search, filter, and ordering support across modules

---

<!-- 
Versioning guide:
  MAJOR (1.x.x) → breaking changes
  MINOR (x.1.x) → new features, backward compatible
  PATCH (x.x.1) → bug fixes, backward compatible

Release entry format:
## [x.y.z] - YYYY-MM-DD
### Added     → new features
### Changed   → changes to existing features
### Deprecated → features that will be removed
### Removed   → features that were removed
### Fixed     → bug fixes
### Security  → security patches
-->
