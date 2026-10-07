# Teacher AI Assistant — AI-Assisted Development Workflow & Antigravity Engineering Guide v1.0

## Operating model

Product Owner → ChatGPT Architect/Reviewer → Approved Task → Antigravity Implementation → Code/Tests/Browser Verification → Review → Commit → Next Task.

## Rules

Plan before code; small tasks; no one-shot full SaaS; preserve architecture; test changes; do not hide failures; do not bypass TypeScript; do not weaken tests; do not silently add dependencies; no automatic commit/push.

## Responsibilities

Antigravity implements/tests/reports. ChatGPT defines tasks, reviews architecture/specifications, debugs and determines next phase.

## Approval gates

Bootstrap, authentication, first vertical slice, major architecture changes, production release.

## Browser

Critical frontend tasks require real browser verification including routing/forms/API/loading/errors/console.

## Handoff

Report summary, files, tests, browser/API verification, git status, warnings and next task.

## Stop rule

Never automatically continue to the next feature after a task.
