# Eval Cases

## Case 1: Vercel Entrypoint Regression

Change touches `package.json`, `vercel.json`, `index.js`, `.vercelignore`, or file layout.

Expected checks:

- Vercel can find a valid entrypoint.
- Runtime files in `includeFiles` match served files.
- `/` and `/app` route to different intended HTML when the landing/app split exists.
- The public alias is re-pointed after deploy and matches the newest production build.

## Case 2: Static Asset Regression

Change touches HTML, CSS, JS script tags, build output, or CSP.

Expected checks:

- `/styles.css`, `/client.js`, `/config.js` return `200` when referenced.
- Landing page does not load app JS.
- App page does load app JS.

## Case 3: Map Provider Regression

Change touches Kakao/VWorld keys, CSP, map loader, markers, coordinate resolution, or mobile layout.

Expected checks:

- SDK domains are allowed by CSP.
- Map container has visible height on mobile.
- Markers receive the real property object and numeric coordinates.
- Production domain is included in provider domain settings when required.

## Case 4: MOLIT And Price Display Regression

Change touches API proxy, service key handling, lawd/deal month logic, property matching, or price/rent rendering.

Expected checks:

- API key is server-side where required.
- Trade and rent endpoints are both represented.
- UI fields are populated from fetched/matched data, not just warning text removal.

## Case 5: News Stale Asset Regression

Change touches news collection, keywords, property deletion, watchlist filtering, or monitoring.

Expected checks:

- News tied to deleted assets is removed or filtered.
- Keyword generation uses active watchlist assets.
- No fallback attaches unmatched news to the first property.

## Case 6: Location Score Dataset Regression

Change touches `data/location-score`, GB R001 conversion, scoring, asset registration, or deploy inclusion.

Expected checks:

- Dataset index and concrete dataset JSON are fetchable in production.
- Score application supports non-Seoul datasets through the registry model.
- Missing dataset produces a graceful fallback.

## Case 7: Korean Draft Polish

User provides an awkward Korean draft for a notice, release note, or UI message.

Expected checks:

- Meaning is preserved.
- Tone matches the request.
- Awkward translation artifacts are removed.
- No new facts were invented.

## Case 8: Recovery Flow Smoke Test

Change touches admin recovery, secret handling, or email dispatch.

Expected checks:

- Clicking recovery immediately shows a visible in-progress state.
- The live endpoint returns a real success or an explicit configured failure, not a hidden fallback.
- No mailto fallback is used to fake success.

## Case 9: CTA Contrast Regression

Change touches landing buttons, nav CTAs, or theme colors.

Expected checks:

- Primary CTA text stays readable on the live light theme.
- Visited and hover states do not fall back to black text.
- Production screenshot or fetch proves the current styles, not just local CSS intent.

## Case 10: Score Disclosure Regression

Change touches score rendering, admin settings, or detail evidence.

Expected checks:

- Fit score is visible in the compact list/card summary.
- Detailed evidence appears only after clicking the score evidence control.
- Internal labels such as proxy source names do not leak into the public UI.

## Case 11: Theme Consistency Regression

Change touches sidebar, admin shell, nav tabs, or CTA colors.

Expected checks:

- Admin uses the same nav tab color logic as the rest of the app.
- No screen relies on a dark box to host a form or status line when a lighter surface works.
- CTA text contrast remains legible on the live theme.

## Case 12: Evidence Source Regression

Change touches fit-score calculation, map markers, property matching, or detail evidence.

Expected checks:

- A card-level score opens the same property's detail evidence, not a different property.
- Evidence fields are traceable to the current property's coordinates and dataset match, not a reused shared value.
- If the source cannot be confirmed, the UI should show the score as unavailable rather than inventing a source.

## Case 13: Stale Evidence Cache Regression

Change touches local storage, startup hydration, or score model versioning.

Expected checks:

- Old evidence objects are invalidated when the score model version changes.
- First render triggers a refresh so stale cached scores do not stay visible.
- Properties with different coordinates must not collapse to one shared evidence payload.
