# Current backend scope

The user will build unstarted features later. Their generated code and unused model registrations have been removed rather than treated as working features.

## Kept

Auth, users, roles, seller onboarding/approval, products/listings, brands, categories, media upload, addresses, cart and recommendations contain real implementation and remain available.

The core `Seller` model and `SellerModule` remain because product offers, seller approval, customer product projections and seller-exclusion rules use them. There is no separate implemented `SellerAccount` class. The ERD's seller-account design is a future architectural reference, while the existing seller profile is a current catalog dependency.

## Removed

- Entire orders module, including the checkout/suborder implementation added in the previous pass, DTOs, entities and its tests.
- Generated payments, coupons, reviews, wishlist and inventory modules, including their controllers, services, DTOs, empty entities and generated tests.
- Unused `SellerPayOut` (payout-account model) and `SellerLedgerEntry` entities and their seller associations/registrations. No standalone SellerPayout service/module existed.
- The empty, unused generated `Auth` entity.
- Order associations on User/Product and order-history queries in recommendations. Recommendations still exclude recent views, explicit exclusions, seller-owned inventory and cart contents. Purchased-item exclusions can be added when orders are implemented.
- Draft migration statements that would create checkout/suborder fields and tables.

No shipment module existed to remove. The Excalidraw diagram remains the future feature/route roadmap; its earlier implementation/progress notes may refer to the previous pass. This document describes the current source scope.

No database schema or stored data was deleted. Existing tables can stay until a separately planned schema cleanup. The user successfully applied the catalog/cart/recommendation migration. The migration and scripts folders were subsequently removed at their request; the applied database changes remain.
