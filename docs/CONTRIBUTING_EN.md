# Contribution Guidelines

Thank you for your interest in contributing to **Gerege Nexus** (`open-gerege-nexus`)! We welcome contributions to build a high-performance modular platform.

<p>
  <a href="../CONTRIBUTING.md"><img src="assets/icons/flag-mn.png" width="18" height="18" alt=""> Монгол</a>
  &nbsp;·&nbsp;
  <img src="assets/icons/flag-en.png" width="18" height="18" alt=""> <b>English</b>
</p>

---

## Technical Stack Guidelines

- **Backend**: Node.js 22 LTS, Express.js CommonJS (CJS), native `pg` connection pool, zero heavy ORMs.
- **Frontend**: Next.js 16 (React 19) App Router, Pure Vanilla CSS (zero Tailwind CSS dependencies).
- **Database**: PostgreSQL with raw SQL migration scripts (`backend/db/migrations/`).

---

## How to Contribute

1. **Create a branch**: `git checkout -b feature/amazing-feature`
2. **Run tests**:
   ```bash
   cd backend
   npm test

   cd ../frontend
   npm run build
   ```
3. **Commit**: Use Conventional Commits standard (e.g. `feat: add new module`, `fix: resolve auth cookie issue`).
