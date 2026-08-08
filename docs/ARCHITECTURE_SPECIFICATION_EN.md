# Architecture Specification

**Gerege Nexus** system architecture, layers, and technical decisions.

<p>
  <a href="ARCHITECTURE_SPECIFICATION.md"><img src="assets/icons/flag-mn.png" width="18" height="18" alt=""> Монгол</a>
  &nbsp;·&nbsp;
  <img src="assets/icons/flag-en.png" width="18" height="18" alt=""> <b>English</b>
</p>

[Back to Documentation Center](README_EN.md)

---

## 1. Overall System Architecture

**Gerege Nexus** is a modular monolith platform built for high performance and deep integration with national digital infrastructure (DAN, E-ID, XYP).

### 1.1 Modular Monolith Core

- **Node.js 22 LTS & Express.js (CommonJS - CJS)** — Business modules (`contacts`, `products`, `inventory`, `billing`, `documents`, `developer_portal`, `esign`, `gov_services`, `ai`) are cleanly organized as Express routers without bloated frameworks or heavy ORMs.
- **Native PostgreSQL Connection Pool** — Uses official `pg` (node-postgres) driver with parameterized raw queries for maximum throughput and low memory footprint.
- **Tenant-Based App Store** — Dynamic module enablement per tenant controlled via PostgreSQL (`app_installations`) and Express `appGateMiddleware`.
- **Catalog Synchronization** — `catalog/apps.json` acts as the single source of truth, synced to the `apps` database table on application boot.

### 1.2 Frontend & Styling

- **Next.js 16 (React 19)** — Ultra-fast App Router frontend.
- **Pure Vanilla CSS Design System** — Zero Tailwind CSS overhead. Fully custom CSS custom properties (variables), light/dark themes, glassmorphism, responsive utilities, and micro-animations defined in `frontend/app/globals.css`.

---

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              Gerege Nexus                                         |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
      +-------------------+                               +-------------------+
      | Next.js Client    |                               | Node.js Express   |
      | (Pure Vanilla CSS)|                               | (CommonJS - CJS)  |
      +-------------------+                               +-------------------+
                |                                                   |
        +-------+-------+                                   +-------+-------+
        |               |                                   |               |
+---------------+ +---------------+                 +---------------+ +---------------+
| AI Copilot UI | | E-ID / DAN    |                 | Express       | | State Exchange|
|  Drawer Panel | | SSO Provider  |                 | Middlewares   | | (xyp.gerege)  |
+---------------+ +---------------+                 +---------------+ +---------------+
                                                            |
                                                    +---------------+
                                                    | Shared-Schema |
                                                    |  PostgreSQL   |
                                                    +---------------+
```
