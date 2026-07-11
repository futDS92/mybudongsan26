# Design Reference

This app is a mobile-first monitoring tool for recurring checks. The interface should be calm, compact, and easy to scan.

## Product Shape

- Primary surfaces: dashboard and watchlist.
- Secondary surfaces: field records, alerts, admin.
- Keep filters contextual: dashboard and watchlist may expose them, admin must not.
- Admin is credential-gated and should not become a second copy of the dashboard.

## Layout Rules

- One main action per surface.
- Keep the first viewport short.
- Use progressive disclosure for detailed evidence.
- Avoid repeating the same number or status in multiple places.

## Information Rules

- Show the summary first.
- Put score and evidence in one chain: summary chip, then click-to-open detail.
- Hide internal labels from public views unless they help the user act.
- Keep text short when the action is obvious.
- Evidence must belong to the same property that triggered it.
- If a score is shown, the source or metric behind it must be discoverable from the detail view.

## Color Rules

- Do not use a black box for a form, summary, or status line unless the brand absolutely requires it.
- Keep the CTA text readable on the live background.
- Admin must use the same tab color logic as the rest of the app.
- Theme changes may affect the shell background, but not the meaning of the nav states.

## Copy Rules

- Prefer plain Korean.
- Remove repeated labels and stacked noun phrases.
- If a control needs a result message, keep it to one short sentence.
- The copy must match the actual UI state.
