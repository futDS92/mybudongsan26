# Harness Roles

## Implementer

Responsibility: make the requested code or product change with minimal unrelated churn.

Inputs:

- User request.
- Current repo files.
- Existing product behavior and deployment constraints.

Outputs:

- Scoped code diff.
- Local verification commands and results.
- Notes on any unresolved risk.

Delegate when independent research or a bounded non-overlapping implementation can run in parallel.

Do not delegate when the next local action depends directly on the answer.

Must preserve:

- Default query filters should not be surfaced unless explicitly reintroduced.
- Compact score summaries stay visible in the card/list row.
- Detailed evidence only appears after an explicit click.
- Recompute stale evidence on startup when the stored model version is behind the current one.

## Release QA

Responsibility: block broken deployments before they reach the user.

Inputs:

- Current diff.
- Deployment files: `package.json`, `vercel.json`, `.vercelignore`, `index.js`, build scripts.
- Critical route list.

Outputs:

- Blocker/Warn/Pass report.
- Exact commands/routes checked.
- Production status when deployment is involved.

Use `$pre-deploy-qa` for every deployment or production-fix turn.

Do not pass a release if:

- Vercel has no valid entrypoint.
- Runtime-served files are missing from `includeFiles`.
- `/`, `/app`, CSS, JS, or data routes fail.
- A server function imports browser-only code at module load.
- The fix only hides an error message without making the feature work.
- The public alias still points at an older deployment than the one just shipped.
- A recovery flow claims success but the live endpoint still returns 501/401/404.
- Admin navigation or shell colors diverge from the shared product theme without a deliberate reason.
- A filter, score, or evidence control is present on a page where the workflow does not use it.

## Data/API Reviewer

Responsibility: keep external data and provider behavior coherent.

Inputs:

- MOLIT, Kakao, VWorld, news, and location-score code paths.
- Provider key placement and domain/CSP requirements.
- Sample UI state that should be populated.

Outputs:

- Mapping issues and concrete fixes.
- Fallback behavior review.
- Provider-specific deployment risks.

Do not approve API work when UI fields remain "미입력" because data was not actually fetched, matched, or applied.

Also reject internal source labels leaking into user-facing UI unless they are explicitly needed for debugging.

## Release Sentinel

Responsibility: verify that the shipped deployment is the one the user will actually hit.

Inputs:

- Latest deployment URL from Vercel.
- Custom alias target.
- Live smoke-test commands for recovery/API/map behavior.

Outputs:

- Alias-to-deployment confirmation.
- Production smoke-test result.
- Explicit note when a stale snapshot is still reachable.

When to delegate:

- After any deployment that changes routes, env handling, recovery, or public CTA copy.

When not to delegate:

- Pure local copy cleanup that does not affect live routing or state.

## Document Polish

Responsibility: rewrite Korean drafts, UI copy, notices, and release notes so they read naturally without changing meaning.

Inputs:

- Existing draft text.
- Target tone and audience.
- Terms that must remain unchanged.

Outputs:

- Polished Korean copy.
- Optional brief note on meaningful changes when the user asks.

Use `iamnotai` when the text already exists and needs a natural rewrite.

Do not:

- add new claims
- change policy or legal meaning
- over-formalize casual copy
- rewrite technical terms into awkward Korean

For UI copy, verify the wording matches the visual state, the available action, and the contrast of the live surface.
