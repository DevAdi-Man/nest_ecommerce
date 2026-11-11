# Current review fixes

Orders and other unstarted feature modules have been removed at the user's request. See [current scope](CURRENT_SCOPE.md) for the removal list. The [original review](../CODE_REVIEW.md) is historical; its checkout findings are deferred with the removed order feature.

The following fixes remain in implemented features:

- Administrator bootstrap requires explicit email/password configuration; no known fallback password.
- Refresh sessions use full-token SHA-256 digests, random JWT IDs and atomic replacement to prevent replay/concurrent reuse.
- Master catalog edits/deletion are admin-only; seller offers are owner-scoped and approval-gated.
- Monetary comparisons handle database decimals exactly, and product onboarding writes use a managed transaction.
- Customer catalog/recommendation projections exclude unapproved sellers' offers.
- Recommendations reapply exclusion/stock rules after merging; co-views count distinct sessions within the pairing window.
- Upload size limits run at multipart parsing and declared image MIME types must match file signatures.
- Category hierarchy updates reject indirect cycles.
- Cart input uses `listingId`; cart mutations serialize by user and the migration adds uniqueness constraints.

Generated boilerplate and tests belonging exclusively to removed modules were deleted with those features. Tests for retained behavior, catalog access control and upload boundaries remain. Source-reference and Sequelize model-registration checks cover the removed dependencies.

The user successfully applied the catalog/cart/recommendation migration. Its SQL files and runner were later removed at their request. This removal does not reverse the applied database changes; fresh database setup will need a new schema initialization/migration process. Checkout/order creation, purchased-product exclusions, payments, refunds, payouts, warehouse reservations and shipments will be implemented later.

## Verification

- Unit tests: **25 suites / 111 tests passed**.
- HTTP checks: **6 tests passed**, covering the retained catalog authorization and multipart boundaries with mocked infrastructure.
- Build, full TypeScript checking, ESLint and whitespace checks passed.
- All 18 remaining Sequelize model classes and associations registered successfully without connecting to a database.
- No source/test imports or current migration statements reference removed order/payout models or feature modules.
- No database service or schema migration was exercised. Existing database tables and the Excalidraw roadmap were left untouched.
