<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **student-parttime-marketplace** (380 symbols, 680 relationships, 2 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/student-parttime-marketplace/context` | Codebase overview, check index freshness |
| `gitnexus://repo/student-parttime-marketplace/clusters` | All functional areas |
| `gitnexus://repo/student-parttime-marketplace/processes` | All execution flows |
| `gitnexus://repo/student-parttime-marketplace/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->


---

# AI Engineering Skills & Architecture Standards — JobNest

## 1. UI/UX Craft & Auditing — Impeccable Framework
- **Skill reference:** `.agents/skills/impeccable/SKILL.md` (by Paul Bakaus).
- **When to use:** Whenever reviewing, crafting, or polishing frontend components in `04_frontend/src/`.
- **Mandatory guidelines:**
  - Strictly adhere to `PRODUCT.md` and `DESIGN.md`.
  - Always preserve the **Soft Lavender (`#7565A8`)** and **Warm Peach (`#F4B99D`)** brand design system.
  - Reject generic AI templates (AI slop: uninspired purple/blue gradients, non-semantic divs, monotonous cards).
  - Guarantee 4 UI states: Loading skeleton, Empty state with recovery action, Error toast/alert, and Success confirmation.
  - Maintain WCAG 2.1 AA accessibility standards and mobile touch targets (>= 44x44px).

## 2. DevSecOps & Security Auditing — Security Audit Skill
- **Skill reference:** `.agents/skills/security-audit/SKILL.md`.
- **When to use:** Before deploying, committing major backend/auth changes, or performing milestone reviews.
- **5-Step Audit Pipeline:**
  1. `Recon`: Map trust boundaries, public vs protected endpoints, and input surfaces.
  2. `Hunt`: Methodically inspect for OWASP Top 10 flaws (JWT secret leaks, IDOR, SQLi, XSS, CSRF, container privilege).
  3. `Validate`: Trace input flow from Source to Sink; reject false positives.
  4. `Verify`: Cross-check with test suite (`npm test`) and active environment variables.
  5. `Report`: Document findings in `docs/security/SECURITY_AUDIT_REPORT.md`.
- **Safety rules:** Strictly non-destructive. Never drop database tables, delete user files, or tamper with credentials.

## 3. Academic & Defense Presentation — PPT Master
- **Skill reference:** `.agents/skills/ppt-master/SKILL.md` (by Hugo He).
- **When to use:** Preparing slide presentations for milestone reviews, sprint demonstrations, or graduation thesis defense.
- **Mandatory guidelines:**
  - Follow the 15-slide defense curriculum documented in `docs/presentation/README.md`.
  - Ingest facts strictly from approved documentation (`01_docs/`, `02_database/Data_v2.xlsx`, `docs/architecture/`). Never fabricate metrics or features.
  - Produce native, editable DrawingML vector shapes in `.pptx` format via `scripts/generate_presentation.py`.

## 4. Draw.io Architecture Diagram Maintenance
- **Standard format:** `.drawio.svg` (editable vector SVG with embedded XML) inside `docs/architecture/`.
- **Recommended VS Code Extension:** `hediet.vscode-drawio`.
- **Managed diagrams:**
  1. `system-context.drawio.svg`: Context level (Student, Employer, Admin, External APIs).
  2. `application-architecture.drawio.svg`: 3-Tier Layered Architecture (React, Express, PostgreSQL).
  3. `deployment-architecture.drawio.svg`: Docker Compose containers, networks, and volumes.
  4. `database-erd.drawio.svg`: 13 Core tables bám sát `02_database/Data_v2.xlsx`.
  5. `authentication-flow.drawio.svg`: Sequence flow for JWT, bcrypt, and RBAC middleware.
- **Git synchronization rule:** Always commit updated `.drawio.svg` diagrams alongside code changes when modifying database schemas, API routes, or Docker setups.

## 5. Centralized AI Tooling & Skills Hub (`.ai/`)
- **Single Source of Truth:** All agent personas, categorized skills, master prompt templates, rules, workflows, and MCP configurations are centrally maintained in `.ai/`.
- **Reference guide:** Consult `.ai/README.md` for directory structure, agent roles, adding new skills, and cross-machine usage instructions.
