# Release QA Rubric

## Blocker

- Build fails.
- Vercel entrypoint is missing or invalid.
- Runtime throws before serving a response.
- `/`, `/app`, CSS, JS, or required JSON data returns 404/500.
- Server imports browser-only code and crashes with `window is not defined`.
- Map cannot render because key/CSP/domain handling is broken.
- UI claims data is configured but price/rent/marker state is still not actually applied.
- Filters appear in the wrong surface, especially inside admin-only settings.
- Score is hidden in the summary or the evidence cannot be opened on click.
- Evidence shows the wrong property or an untraceable source.
- Old cached evidence remains visible after a model-version change or startup refresh.
- Admin tab or shell styling diverges from the shared theme for no product reason.
- Production verification was skipped after a deployment fix.
- The public alias still serves an older deployment after a claimed release.
- A recovery endpoint falls back silently instead of showing an explicit configured failure.

## Warn

- External API is rate-limited or temporarily unavailable, but fallback is visible and honest.
- Manual provider-domain setup is still required and clearly stated.
- Mobile layout is likely usable but not screenshot-verified.
- News results are fetched but source quality is mixed.
- Copy polish is natural but could be slightly tighter.
- CTA contrast is technically correct in code but not yet verified on the live theme.
- A control exists but the user still needs a second place to learn the same thing.

## Pass

- Build and syntax checks pass.
- Local route matrix passes.
- Production deployment is `Ready`.
- Production route matrix passes.
- The response contains a marker unique to the new change.
- Any remaining limitations are explicit.
- Korean copy keeps the original meaning and reads naturally.
