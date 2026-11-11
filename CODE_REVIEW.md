# Backend and ERD review — 2026-11-09

**Current scope update:** Orders and other deferred modules have since been removed at the user’s request. This document records the original review; see [current scope](docs/CURRENT_SCOPE.md) and [current fixes](docs/REVIEW_FIXES.md) for the code that remains.

**Original review (before fixes): Request changes** for the implemented features. See [the fix record](docs/REVIEW_FIXES.md) for the implemented corrections, migration requirements and current verification.

Generated, unused modules are treated as planned work, not as completed features or defects merely because they are unfinished.

Scope: baseline repository at `33b84ba`, with a clean working tree at review start; authentication, users, roles, seller onboarding, catalog/listings, recommendations, media, addresses, cart and order creation. Compared model and route definitions with `/home/devadi/Projects/Work/AeroNotes/Backend/ecommerce_erd.excalidraw`. This is a repository review, not only a review of the latest commit. The diagram was read as JSON, including its route and architecture notes; its rendered layout was not inspected.

## Findings, ordered by impact

### 1. Critical / P1: default administrator credentials can become live

`src/users/users.service.ts:44` seeds a verified administrator using a known fallback password and email when environment variables are absent. `src/config/env.validation.ts` does not require admin credentials. A fresh deployment without those variables can therefore expose a usable administrator account. Require explicit bootstrap credentials or a deliberate development-only seed command; fail closed in deployment environments. Test startup with missing credentials and an empty user table.

### 2. Critical / P1: refresh-token rotation accepts older distinct tokens

`src/auth/auth.service.ts:124` and `:146` bcrypt-hash the raw JWT; `src/auth/strategies/refresh.strategy/refresh.strategy.ts:35` compares the raw JWT against that hash. Locally reproduced with the installed libraries: two distinct signed tokens for the same user, with different issue/expiry times, shared their first 72 bytes and the old token matched the new token's bcrypt hash. A still-unexpired stolen refresh token can survive rotation. Store a full-token cryptographic digest, compare that digest, and issue a unique token identifier on rotation. Make rotation atomic so concurrent refreshes cannot both consume the same token. Add a behavioral test asserting that refresh A fails after refresh B replaces it.

### 3. Critical / P1: any seller can modify or delete the shared catalog

`src/products/products.controller.ts:299` onward permits Seller on product update/delete and image deletion. Those handlers pass no caller identity to `update`, `remove`, or `deleteProductImage`; the service looks up only the target IDs. Seller A can change Seller B's shared product or delete its images/product. Since the ERD uses a shared master catalog, restrict master mutation to administrators or introduce an explicit catalog contribution/moderation policy. Keep seller offer changes in the existing seller-scoped listing methods. Also cover the existing-product branch of `POST /products`, which can append shared attributes/images.

### 4. Critical / P1: checkout persists zero prices and cannot identify the purchased offer

`src/orders/orders.service.ts:60` and `:105` read `(item.product as any)?.price || 0`, but `Product` has no price column; price belongs to `Listing`. A local execution of the actual service with the current Product shape created an order with `totalAmount: 0` and `priceAtPurchase: 0`. `CartItem` and `OrderItem` still identify a product rather than a seller listing, so size/color/seller are also lost. Migrate cart items to `listingId`, snapshot that listing's server-side price, and link order lines to listings under seller suborders as in the ERD. Reject missing/unavailable listings rather than substituting zero. Add a checkout test using a product with no price field and a listing with a nonzero price.

### 5. Required / P1: checkout writes and stock reservation are not atomic

`src/orders/orders.service.ts:80` through `:114` creates the order, address and items, then clears the cart without a transaction, stock check/reservation, or duplicate-submit protection. An item-insert failure leaves a partial order; simultaneous checkouts can create multiple orders from the same cart. Use one transaction, lock/conditionally reserve stock, snapshot prices and addresses, and enforce checkout idempotency. Clear only the cart items consumed by that checkout. Test rollback, insufficient stock, and concurrent/retried checkout.

### 6. Required / P1: seller approval does not gate listing operations

`src/products/products.service.ts:723` checks only that a seller profile exists. After an approved seller changes GSTIN, `SellerService.updateMe` returns them to PENDING but leaves the Seller role, so they can continue creating/reactivating offers. Public Buy Box selection checks listing status and stock, not seller approval. Centralize an approved-seller policy for offer writes and customer offer eligibility, including what happens to existing offers during re-verification. Separately, `create` at `:62` falls back from a missing seller profile to the user's numeric ID; if that ID happens to match another seller, the listing can be attached to the wrong seller. Reuse a strict resolver and define the administrator creation policy explicitly.

### 7. Required / P2: valid listing updates can fail due to decimal string comparison

`src/products/products.service.ts:877` compares persisted DECIMAL values without normalization. PostgreSQL numeric values can reach this code as strings despite the TypeScript `number` declaration. Reproduced with the actual service: stored price `'90.00'` and MRP `'100.00'` caused a SKU-only PATCH to throw “Selling price cannot exceed Maximum Retail Price.” Normalize monetary values at the persistence boundary and compare exact monetary units. Test partial updates with database-shaped string values, including equal price/MRP and updates to either field alone.

### 8. Required / P2: product onboarding can leave partially created catalog data

`src/products/products.service.ts:57` writes product, attributes, variant, listing and images without the transaction promised in the diagram. A late variant conflict or image/listing failure leaves earlier writes committed. Validate seller and monetary invariants first, then use a single transaction for the complete operation. The nested listing path also bypasses the price <= MRP check in `addListing`. Route both creation paths through one listing policy. Test rollback after a late failure and reject an embedded listing with price above MRP.

### 9. Required / P2: hybrid recommendation merging bypasses exclusion rules

`src/recommendations/recommendations.service.ts:873` onward merges A/B/C and returns the result without a final eligibility filter. Recent-view and seller exclusions run only in strategy A; B/C can reintroduce those products. `excludeProductId` is not propagated from the hybrid query to any strategy. Cart/order exclusions promised by the diagram are absent. Apply common eligibility rules after merging, with caller identity and exclusions available, and test a forbidden product contributed only by B/C. Avoid checking only the Buy Box seller when the intended policy excludes any owned inventory.

### 10. Required / P2: co-view counts represent repeated clicks, not distinct sessions

`src/recommendations/recommendations.service.ts:317` through `:367` increments both product pairs on each event. Refreshing A/B repeatedly in one session inflates the collaborative signal; concurrent find/update operations can lose increments. The implementation uses a three-hour window and does not enforce the diagram's two-session minimum, while the diagram claims a 30-minute window with distinct joint sessions. Track a unique pair/session contribution and aggregate atomically; decide which window is authoritative. Test repeated events in one session versus two independent sessions.

### 11. Required / P2: upload size is checked after unrestricted buffering

`src/media/media.controller.ts:41` uses `FileInterceptor('file')` without multipart size limits. The service's 5 MB check runs only after buffering the upload, so a much larger upload can consume memory first. Set Multer `limits.fileSize` at the interceptor boundary and verify oversized multipart requests fail there. MIME allowlisting currently trusts client metadata; verify file content for the image formats the application accepts.

### 12. Required / P2: indirect category cycles are allowed

`src/categories/categories.service.ts:155` rejects self-parenting only. With B already a child of A, updating A.parentId to B succeeds; both disappear from the root-based category tree. Walk the prospective parent's ancestor chain before changing parentId, rejecting descendants and existing cycles. Add an A -> B -> A regression case.

## Additional observations

- **Required before deployment:** restore meaningful tests for implemented features. Sixteen suites currently fail because generated fixtures do not supply required dependencies. Replace those fixtures with behavior tests/mocks, not simply disabled tests. The e2e test still expects the removed `Hello World!` root route and imports the full infrastructure-dependent app. It was inspected but not executed against services.
- **Required before concurrent use:** cart creation and quantity increments use read-then-write operations without database uniqueness/atomic increments (`src/carts/cart.service.ts:20`). A user can get duplicate active carts or lose quantity increments. Add an active-cart uniqueness policy and atomic item upsert keyed by cart/listing.
- **Consider:** separate catalog persistence, offer management and product formatting into focused owners. `products.service.ts` has 1,006 lines and recommendations has 966, including a duplicate association tree. Keep one canonical product projection instead of expanding the duplicated formatter/query shape.
- **FYI:** `synchronize: true` in `src/app.module.ts` is not a migration strategy. The ERD's substantial cart/order/stock changes need explicit migrations and data backfill; simply changing the model will not safely migrate existing purchases.
- **FYI:** the payout account model contains a plain bank account field; the ERD specifies an encrypted field. There are no payout-account handlers yet. Resolve encryption, masking, verification and access rules before implementing those planned routes.

## ERD alignment and route status

The marketplace direction is consistent: shared Product -> Variant -> seller Listing. The diagram is a target architecture, not an accurate representation of all currently implemented capabilities.

| Area | Repository status | Diagram correction / next step |
| --- | --- | --- |
| Auth | Implemented handlers | Add existing `GET /auth/me` and `POST /auth/resend-verification` to route notes. |
| Users / roles | Implemented admin CRUD; user has one roleId | ERD models UserRole many-to-many. Choose the intended role model before adding role-assignment routes. User GET/PATCH by ID are currently Admin only. |
| Seller onboarding | Implemented | `POST /seller` is Admin account creation; `POST /seller/upgrade` is customer onboarding, not tier upgrade. `GET /seller/:id` is Admin only. |
| Brands | Implemented | Existing diagram route list broadly matches. |
| Categories | Implemented | Add existing `GET /categories/search`, `GET /categories/:id/children`, `GET /categories/deleted/all` [Admin], `PATCH /categories/:id/restore` [Admin]. |
| Products / listings | Implemented, with findings above | Add existing `PATCH /products/listings/:id/deactivate`. Canonical plural listing routes already exist; singular aliases need not be promoted. Image deletion uses `:imageId`. |
| Recommendations | Five handlers implemented | Canonical paths are `POST /recommendations/view`, `GET /recommendations/frequently-viewed-categories`, `GET /recommendations/similar/:productId`, `GET /recommendations/viewed-together/:productId`, `GET /recommendations/personalized`. The architecture panel names different paths; align it to these. No batch-retrain endpoint exists. |
| Addresses | Implemented owner-scoped CRUD | Existing notes match the routes. |
| Media | Upload implemented | Delete and presigned-URL routes in the diagram are planned, not implemented. Media currently has no owner field; define ownership before deletion. |
| Cart | Implemented against Product | Migrate request/model to listingId before calling it marketplace checkout ready. |
| Orders | POST partially implemented; remaining CRUD returns strings | Mark history/tracking/status/cancellation planned. Implement seller suborders, status history and listing-based lines first. |
| Coupons / payments / reviews / wishlist | Generated controllers/services return placeholder strings | Mark planned. These modules are imported into AppModule, so their placeholder routes are reachable even though not used by the frontend. Preserve scaffolding; avoid advertising success as completed behavior. |
| Inventory | Generated module, not imported into AppModule | Not mounted. Preserve it as requested; warehouse stock and reservations remain planned. |
| Payouts / shipping / delivery / returns / analytics | Diagram plans only; payout/ledger have partial models | Keep future-route labels; implement after their underlying models, ownership and state transitions exist. |

## Recommended future routes

These are design recommendations, **not newly implemented endpoints**. Most missing domain routes are already in the diagram; duplicating them is unnecessary.

| Priority | Route | Access / behavior |
| --- | --- | --- |
| Next, small feature | `PATCH /users/me` | Authenticated user; separate DTO allowing profile fields only. No role, verification, token or password assignment. Put the static route before `:id`. Existing `GET /auth/me` already covers profile reading. |
| After cart model migration | `DELETE /cart/items` | Current user only; clear active cart with explicit semantics. Register before the parameterized delete route. |
| After order model migration | `GET /orders`, `GET /orders/:id` | Current user's orders, paginated; verify ownership for details. Existing controller paths are placeholders. |
| After order model migration | `POST /orders/:id/cancel` | Owner with cancellable-state policy, idempotent stock release; clearer than deleting financial records. Coordinate refunds separately. |
| After suborders | `GET /seller/orders`, `GET /seller/orders/:id` | Approved seller; only that seller's suborders and necessary fulfillment data. Never expose other sellers' lines. |
| After suborders | `PATCH /seller/orders/:id/status` | Approved seller; enforce allowed fulfillment transitions, append history. No unrestricted status assignment. |

For payment routes already planned in the diagram, separate customer initiation from signature-verified gateway webhooks. Clients must not be allowed to mark their own payments successful. Reserve refund and payout processing for authorized server/admin operations with idempotency and ledger reconciliation.

## Verification evidence and limitations

- `npm run build`: passed.
- ESLint, invoked directly without `--fix` across `src/**/*.ts` and `test/**/*.ts`: passed, zero errors/warnings.
- `npm test -- --runInBand --watchman=false`: **20 suites passed, 16 failed; 89 tests passed, 16 failed**. Initial normal invocation hit a sandbox Watchman filesystem restriction; the rerun completed and exposed the test failures.
- Mutation experiment: temporarily reversed `addListing`'s price > MRP condition. Its suite failed (7 failed / 15 passed). Source restored byte-for-byte; unchanged suite then passed **22/22**. This demonstrates detection of that mutation, not overall test completeness.
- Actual OrdersService execution with mocked repositories and the current product shape reproduced zero order/item prices.
- Actual ProductsService execution with mocked persisted DECIMAL strings reproduced the SKU-only update failure.
- Installed JWT/bcrypt libraries reproduced a distinct old refresh token matching the newly stored hash; test data used no project secrets.
- PostgreSQL, MinIO, mail and payment services were not exercised. No live gateway, load test, dependency-advisory audit or rendered Excalidraw check was performed. Findings about concurrency and state transitions come from code inspection; targeted reproductions above use mocks/local libraries.
- At the time of this initial review, no application source, generated modules, database data or external ERD file had been changed. The subsequent fixes are documented in [docs/REVIEW_FIXES.md](docs/REVIEW_FIXES.md).
