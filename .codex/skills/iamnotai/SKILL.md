---
name: iamnotai
description: Polish Korean drafts, UI copy, release notes, and docs when the user asks for 문서 보정, wording cleanup, tone normalization, or a more natural non-robotic rewrite.
---

# IAMNOTAI

Use this skill when a draft already exists and needs to read like a person wrote it.

## Core Rule

Preserve meaning first. Improve rhythm, clarity, and tone without inventing new claims.

## What To Fix

- awkward translation tone
- repeated phrases
- stiff or machine-like openings and endings
- inconsistent honorific level
- stacked noun phrases
- unnecessary filler or over-explaining

## Workflow

1. Identify the target format.
   - email
   - notice
   - release note
   - README or doc
   - UI microcopy
   - Korean chat reply

2. Detect the intended tone.
   - concise
   - neutral
   - formal
   - business
   - friendly

3. Rewrite in natural Korean first.
   - keep the same intent
   - keep terminology stable
   - cut filler
   - avoid literal translation order

4. Review the result once.
   - check that no new facts were added
   - check that the tone is consistent
   - check that long sentences still read cleanly
   - for CTA/status copy, confirm the wording matches the visual state and contrast still reads on light and dark backgrounds

## Editing Rules

- Do not change the meaning unless the user asks.
- Do not over-formalize casual writing.
- Keep domain terms when they are standard.
- Prefer short, direct Korean over verbose rephrasing.
- If the original is already tight, make minimal edits.
- If the user asks for a stronger rewrite, provide the polished version only.

## When To Be Conservative

- legal or policy text
- user-visible product copy with fixed terminology
- technical docs where wording change can imply behavior change
- quoted material that should remain close to the original

## Output

Return the polished Korean text directly unless the user asks for explanation or comparison.

## Reference

Read [edit-checklist.md](references/edit-checklist.md) for a quick final pass.

## Project Notes

This project keeps the following UI-writing rules alongside the general rewrite rules:

- Do not move workflow controls into admin-only screens when users need them on dashboard/watchlist.
- Keep score summaries compact and let the detailed evidence open on demand.
- Avoid copy that introduces the same concept twice in two different sections.
- If a screen uses a light shell, keep the text, CTA, and tab states legible on that surface.

Refer to `.codex/harness/references/design.md` for the current product design rules before rewriting UI copy that sits on a screen with fixed layout or contrast constraints.
