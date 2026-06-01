# Repository Instructions

This repository contains shareable Codex skills for building game projects. Treat any external game repository used as inspiration as raw research material, not as content to preserve.

## Summarization Standard

When extracting patterns from an existing project, summarize at the level another agent needs to reproduce the architecture:

- Describe folder responsibilities, module boundaries, runtime responsibilities, and data flow.
- Name generic roles such as `game/`, `ui/`, `bridge/`, `assets/`, `controllers/`, `npc/`, and `scenes/`.
- Capture reusable contracts and rules, such as where simulation state belongs, where React UI state belongs, and when a bridge context is appropriate.
- List package families and why they are used, such as renderer, UI framework, build tool, styling, desktop wrapper, icon library, or animation library.
- Convert concrete filenames to reusable examples when a name is domain-specific.

Prefer summaries that help an agent scaffold a similar project from scratch. Avoid summaries that read like an inventory of a specific product.

## Generalization Rules

Before adding content to a skill, convert source-specific details into reusable guidance:

- Replace product names, repository paths, character names, place names, story terms, and domain-specific labels with generic terms.
- Replace private game data with structural descriptions, type shapes, or placeholder examples.
- Replace source-specific component names with generic component roles when the original name is not itself a reusable convention.
- Keep exact package names, framework names, commands, and file extensions when they are part of the reusable technical pattern.
- Keep small reusable code assets only when they are generic, self-contained, and not tied to a private theme or product.

## Skill Content

Skills in this repository should contain only what future agents need:

- `SKILL.md` for concise workflow and decision guidance.
- `references/` for longer reusable architecture notes or package summaries.
- `assets/` for generic templates or components that can be copied into new projects.
- `scripts/` only when a repeatable operation benefits from deterministic tooling.

Do not add auxiliary documentation unless it directly improves skill execution.

## Review Checklist

Before finishing an edit:

- Search the changed files for source project names, local paths, product titles, character names, story terms, and other identifying details.
- Confirm examples are generic or explicitly public.
- Confirm copied code is reusable and not coupled to private game content.
- Confirm package lists and commands reflect reusable setup rather than one project's incidental history.
- Confirm the final skill would help an agent create a new game without revealing where the pattern came from.
