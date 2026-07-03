# Contributing to Ecommerce Backend

Thank you for your interest in contributing! Please read this guide before opening a PR.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Branch Strategy](#branch-strategy)
- [Commit Message Format](#commit-message-format)
- [Pull Request Guidelines](#pull-request-guidelines)
- [PR Checklist](#pr-checklist)

---

## Getting Started

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/<your-username>/ecommerce.git
cd ecommerce

# 3. Add the original repo as upstream
git remote add upstream https://github.com/<original-owner>/ecommerce.git

# 4. Install dependencies
npm install

# 5. Copy environment variables
cp .env.example .env
# Fill in the required values in .env

# 6. Start the development server
npm run start:dev
```

---

## Branch Strategy

We follow a **feature-based branching** strategy.

```
main       → production-ready code only. Never commit here directly.
develop    → integration branch. All features merge here first.
feature/*  → new features
fix/*      → bug fixes
hotfix/*   → urgent production fixes (branch from main)
chore/*    → refactoring, dependency updates
docs/*     → documentation only
```

### Rules

- Always create your branch from `develop` (not `main`)
- Open all Pull Requests against `develop` (not `main`)
- Only maintainers merge `develop` → `main` during a release

### Branch Naming Examples

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/coupon-expiry-validation
git checkout -b fix/order-status-not-updating
git checkout -b docs/update-payments-swagger
git checkout -b chore/upgrade-sequelize-version
```

---

## Commit Message Format

We use **Conventional Commits**. Every commit must follow this format:

```
<type>(<scope>): <short description>
```

### Types

| Type       | When to use                                      |
|------------|--------------------------------------------------|
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `chore`    | Maintenance, refactoring, dependency updates     |
| `docs`     | Documentation only changes                      |
| `test`     | Adding or fixing tests                           |
| `style`    | Formatting changes (no logic change)             |
| `refactor` | Code change that is neither a feat nor a fix     |
| `hotfix`   | Urgent fix directly for production               |

### Scopes (match the module name)

`auth`, `users`, `products`, `orders`, `payments`, `categories`, `coupons`, `inventory`, `reviews`, `carts`, `wishlists`, `addresses`, `otp`, `mail`, `roles`, `common`, `config`, `docker`

### Examples

```bash
git commit -m "feat(orders): add order cancellation with refund trigger"
git commit -m "fix(auth): refresh token not expiring correctly"
git commit -m "chore(deps): upgrade sequelize to 6.37"
git commit -m "docs(api): add Swagger annotations for payments module"
git commit -m "test(users): add unit tests for user service"
git commit -m "refactor(coupons): extract validation logic into helper"
```

### Rules

- One commit = one logical change
- Keep the subject line under 72 characters
- Use present tense: "add feature" not "added feature"
- Do NOT mix multiple unrelated changes in one commit

---

## Pull Request Guidelines

1. Keep PRs small and focused — one feature or fix per PR
2. Write a clear title using the same Conventional Commit format
3. Fill out the PR description template
4. Link any related GitHub issues using `Closes #123`
5. Make sure all tests pass before requesting review
6. Respond to review comments within a reasonable time

### PR Description Template

When opening a PR, include:

```
## What this does
- Brief explanation of the change

## How to test
1. Step-by-step instructions to verify the change works

## Notes
- Any migration needed?
- Any breaking changes?
- Related issues?
```

---

## PR Checklist

Before marking your PR as ready for review, confirm:

- [ ] My branch was created from the latest `develop`
- [ ] I followed the branch naming convention
- [ ] All commits follow the Conventional Commit format
- [ ] My code matches the existing code style (ESLint + Prettier pass)
- [ ] I added/updated tests for the changes made
- [ ] All existing tests pass (`npm test`)
- [ ] I updated Swagger/JSDoc comments if I changed any API endpoints
- [ ] I did not commit `.env` or any secrets
- [ ] The PR targets `develop`, not `main`
