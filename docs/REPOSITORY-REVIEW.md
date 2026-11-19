# Repository review — `Holydjo/DEEPSEEKMARKET`

Reviewed on 2026-11-18. Repository: https://github.com/Holydjo/DEEPSEEKMARKET

## 1. What exists today

**Nothing. The repository is empty.**

I verified this three independent ways rather than assuming from the clone output:

| Check | Result |
| --- | --- |
| `git clone --depth 1` | `warning: You appear to have cloned an empty repository.` |
| `git ls-remote origin` | No refs returned |
| `git branch -a` / `git log --all` | No branches, no commits |
| GitHub REST `GET /repos/Holydjo/DEEPSEEKMARKET` | `"size": 0`, `"language": null`, no description, no homepage |
| GitHub REST `GET /repos/.../branches` | `[]` |
| GitHub REST `GET /repos/.../commits` | `409 — Git Repository is empty.` |
| GitHub REST `GET /repos/.../contents/` | `404 — This repository is empty.` |
| `https://github.com/Holydjo/DEEPSEEKMARKET` | HTTP 200, empty default branch `main` |

Repository metadata: public, default branch `main`, created 2026-11-19T01:20:18Z, last push
2026-11-19T01:20:20Z, size 0, no README, no licence, no releases, no tags, no issues content.

## 2. Structure, technologies, and code

There are none:

- **No application structure** — no `src/`, `app/`, `pages/`, `components/`, or configuration files.
- **No technology choices** — no `package.json`, lockfile, framework config, CI, or database schema.
- **No assets or copy** — no logo, images, fonts, or product text to preserve.
- **No history** — no commits, so there is no prior architecture or convention to follow.
- **No licence or security policy** — worth adding once the stack is set.

The only thing inherited is the repository itself: its name (`DEEPSEEKMARKET`), owner, and
`main` branch. The working tree has been moved to the project root, so its `origin` remote can
remain the deployment source while the product is named **HOLYDO MARKET**.

## 3. What this means for the build

Because this is a **greenfield repository**, there is no migration, refactor, or compatibility
work. The first version can establish the conventions deliberately:

1. One TypeScript codebase for web and mobile web (responsive + installable PWA), rather than a
   separate native app in v1.
2. A single full-stack framework (Next.js App Router) with server-side data access and secure
   cookie sessions — no separate API service to keep in sync for v1.
3. A relational schema designed around **provider approval** and **location-based discovery**
   from day one, because those are product-critical, not add-ons.
4. Original branding, layout, copy, and components. The three Awwwards sites are used only as
   high-level references for *community framing*, *marketplace logic*, and *directory
   presentation*; none of their design, text, logos, or code will be reproduced.

## 4. Risks and open decisions

- **Scope**: booking is a large area. V1 should ship appointment *requests* (provider confirms
  manually), not real-time calendar sync or payments.
- **Location data**: geolocation in the browser needs a fallback for denied permission. V1 uses
  city/neighbourhood search with a seeded coordinate lookup, plus optional device coordinates.
- **Trust**: "verified" must mean something. V1 ties it to a human admin approval record, not a
  paid badge.
- **Production hosting**: SQLite is excellent for local/v1 validation but not for serverless
  multi-instance hosting. Schema will stay Postgres-compatible and Prisma-based so it can be
  switched with a connection-string change and migration.

These are addressed in [V1-PLAN.md](./V1-PLAN.md).
