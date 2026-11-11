# Bazaar marketplace design

Open **Bazaar.figcraft** in FigCraft. The live desktop app was launched with local control port 7979, and the design was authored through the app's attached native MCP server.

## Contents

- Core pages: foundations/components, web discovery, web purchase/account, mobile shopping, seller workspace, states/API handoff, auth/address book, mobile forms/filters, and responsive reference layouts.
- **39 primary screen frames**, plus three responsive reference screens (320, 768 and 1024 px), two foundation/component boards, and two state/handoff boards. Main web screens use 1440 px; main mobile screens use 390 px.
- Nine reusable native component masters (four product-card examples and five button states), instances, shared paint/text styles, and editable original product illustrations.
- Three prototype starting flows: web shopping, mobile shopping and seller workspace. Key discovery → product → bag → checkout → confirmation transitions are linked. Clicking the brand returns home. These are selected navigation flows, not a fully functional commerce application.
- Nine state patterns: loading, empty bag, no search results, out of stock, network failure, expired session, payment pending, pending seller approval and form errors.

The approved brand is **Bazaar / Open Basket (H)**, with deep-teal navigation, amber conversion actions, ivory/white surfaces and Inter UI typography. See [BRAND.md](BRAND.md). Replace the working brand and sample content to suit the final product. Product imagery now uses four downloaded local photographs with matching generic sample titles. Their sources and the Lucide icon license are recorded in [references/README.md](references/README.md). Sample names, prices, delivery estimates and ratings illustrate layout and are not live commerce claims.

## Scope and handoff

Current API-supported designs cover authentication, categories/brands/catalog, seller profiles/listings, addresses, cart and recommendations. Checkout, payments, orders, reviews, wishlist, analytics and logistics are **future designs**: their backend functionality is not restored or implemented by this design task.

The handoff canvas maps current routes separately from future capabilities. `view-models.d.ts` proposes presentation contracts for a future frontend adapter; it does not redefine current server payloads. `tokens.json` and `tokens.css` provide shared design values and semantic mappings for web/mobile implementation.

Responsive guidance: 16 px mobile gutters; 24 px desktop grid gutters; search remains primary; desktop category navigation becomes mobile discovery controls; product conversion actions sit near the mobile bottom edge; filters become a dedicated mobile surface. Use 44 px minimum tap targets, visible focus treatment and inline error messages. All 42 screen frames now contain bounded vertical scrolling regions. Root-level headers and mobile bottom navigation stay outside those regions; product/bag/checkout primary actions stay outside the scroller too. Screens whose content fits do not scroll unnecessarily. Implementation must add keyboard/focus management, responsive constraints and screen-reader semantics.

## Verification and limitations

Native FigCraft PNG exports were visually inspected for desktop/mobile hierarchy, photography, icons, logo sizing, wrapping and spacing. Wheel input was injected into the actual desktop Home and mobile Product detail presenters; hotspot movement verified scrolling in both. Evidence is in `scroll-runtime-check.json`, with all-screen structural settings in `scroll-audit.json`. Core text/background token contrasts were measured in sRGB. This is design QA, not a browser accessibility audit or proof of a working responsive frontend. Static frames and selected prototype hotspots do not simulate form submission, payment processing, quantity changes, all filter states or every navigation path. No backend code was changed by this design task.

The native `.figcraft` file is the editable source of truth. `.json` is an engine-readable snapshot; PNGs are visual references. The desktop app can remain open while you inspect pages or enter prototype presentation.

## References and decisions

[FigCraft native MCP documentation](https://github.com/storytold/figcraft/blob/main/docs/mcp.md) informed the attached-app workflow and reusable native layers. [Amazon's explanation of featured and alternative offers](https://www.aboutamazon.com/news/how-amazon-works/how-customers-get-to-pick-the-winners-in-amazons-store) informed the separate seller-comparison flow. Navigation, pricing hierarchy and mobile conversion conventions were adapted into original layouts; Amazon and Flipkart branding/assets were not copied.

## Latest additions

The live file includes a Lucide icon library, two logo-exploration pages, and the approved Open Basket identity guide. The seller revenue chart now has a zero baseline, currency ticks, direct values, and explicit demo-data labelling plus a text data table. Product photos are embedded in the native file and stored locally. No 3D viewer or 3D chart has been added.

## Discovery, product-content and workspace completion

Web Discover now ends with complete personalised recommendation rails, a festive deals edit, browsing history and a four-column footer with a working Back to top hotspot. Product detail adds related purchases, manufacturer-style photography and narrative, description/specification rows, a video poster/preview section, rating distribution, sample written reviews, complementary purchases, browsing-based recommendations, browsing history and a footer. `home-content.png` and `product-content.png` show full-length content; the live screens remain bounded scroll viewports.

Access forms have been rebuilt with leading field icons, password visibility icons and visible primary actions directly after their fields. The address book has a prominent Add new address action linked to an address-entry design. Seller operations now includes orders/fulfillment, inventory alerts, settlements, returns, account health and settings/support designs with dashboard entry points. These are planned UI views; no removed backend feature was recreated.

Video content is a poster/preview design, not a downloaded or playable manufacturer video. Specifications, ratings, reviews, seasonal offers and seller records remain illustrative content awaiting real API/media integration. Review summaries and recommendation cohorts are not claims about actual customer behavior.

Runtime checks: `footer-runtime-check.json` confirms that both the web homepage and product-detail footer Back to top controls are reachable after wheel-scrolling to the end. The create-account viewport export confirms the primary button is fully visible. Original web/mobile wheel checks are preserved in `scroll-runtime-check.json`.

Seller workspace coverage was informed by [Amazon's Seller Central overview](https://sell.amazon.in/grow-your-business/tools/amazon-seller-central), adapted into original layouts and sample data.
