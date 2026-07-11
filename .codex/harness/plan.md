# Real Estate Monitor Harness

## Project Goal

Ship a mobile-first Korean real-estate monitoring web app that reliably serves on Vercel, loads the map/app routes, and keeps interest assets, MOLIT data, news, and location-score datasets connected.

## Recurring Task Types

- Product/UI changes for the landing page and app shell.
- Data/API changes for MOLIT, Kakao, VWorld, news RSS, and location-score datasets.
- Deployment fixes for Vercel routing, serverless entrypoints, static asset inclusion, alias drift, and production verification.
- Regression cleanup for mobile map rendering, markers, stale news, and missing price/rent display.
- Korean copy and document polishing for UI text, release notes, docs, and user-facing notices.
- UI placement cleanup for filters, summary chips, score displays, and detail evidence.
- Contrast cleanup for CTA text, admin shells, and any surface that can read as a dark box on the live theme.

## Execution Pattern

Use `producer-reviewer` for deployable changes:

1. Implement the scoped change.
2. Run the `pre-deploy-qa` skill before push/deploy.
3. Treat any blocker as a stop-ship item.
4. Push only after local route/build checks pass.
5. Inspect production, confirm the custom alias points at the newest deployment, and fetch critical routes after deployment.

Use `fanout-fanin` only for independent investigations such as separate map-provider/API/news failures.

Borrow the evaluation shape from SWE-bench-style harnesses and Harness-Bench-style execution tracing:

- prefer oracle-checkable outcomes over vague "looks good" judgments
- keep the runbook reproducible from a clean workspace
- save the command trail, response snippets, and deployment target that produced the result
- treat harness configuration drift as a first-class regression, not just the code diff

## Agent Roles

- Implementer: changes code and keeps edits scoped.
- Release QA: uses `$pre-deploy-qa` to verify build, routing, assets, data files, mobile risks, and production responses.
- Data/API Reviewer: checks external API assumptions, key handling, and data mapping.
- Document Polish: uses `iamnotai` to rewrite Korean drafts, UI copy, and docs without changing meaning.

## Verification Rules

Before any production claim:

- `git status --short` is understood.
- `node --check index.js` passes when the serverless handler exists.
- `npm run build` passes when present.
- Local handler or server returns expected HTML/CSS/JS/data/API responses.
- Vercel production alias is `Ready`.
- The public alias resolves to the most recent deployment, not a stale snapshot.
- Production `/`, `/app`, and required assets return `200`.
- Any recovery, API, or map fix is smoke-tested on the live URL, not inferred from local code alone.
- Draft copy changes are reviewed with the `iamnotai` skill before shipping.
- Default query filters stay out of the main UI unless the user explicitly asks to reopen them.
- Fit score is visible in a compact summary and the detailed evidence only appears after a click.
- No product surface should introduce a black-looking box just to hold a status or input.
- Keep filters out of admin unless the user explicitly needs them there.

Never claim "fixed" based only on a code edit. Production or local route evidence must be included.

## Outputs

- Keep durable QA cases in `.codex/harness/evals/cases.md`.
- Keep blocking criteria in `.codex/harness/evals/rubric.md`.
- Keep command sequence in `.codex/harness/evals/runbook.md`.
- Keep UI and color rules in `.codex/harness/references/design.md`.
- Keep copy-polish examples in `.codex/harness/evals/cases.md` when the repo has user-facing text changes.

## Cadence

Run release QA before every push that affects routing, deployment config, map loading, API proxy behavior, or data file inclusion. For pure copy/CSS edits, run at least build plus root/app route checks.
