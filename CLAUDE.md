# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

Digital Guardian — a local-first Tauri desktop app (Windows MVP) that helps non-technical users scan, understand, and monitor their digital identity footprint. Core differentiator: **Personal Spec** (user's known intentional accounts) used for delta analysis against OSINT scan findings.

See `CONCEPT.md` for full technical concept. See `docs/superpowers/specs/2026-08-04-digital-guardian-design.md` for detailed design spec.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri 2 |
| Backend | Rust (`src-tauri/`) |
| Frontend | React + TypeScript (`frontend/`) — configured via `tauri.conf.json` |
| UI | Tailwind + shadcn/ui |
| Database | SQLCipher via `rusqlite` crate |
| OSINT | WhatsMyName dataset + HaveIBeenPwned API |
| Local AI | `llama-cpp-2` crate (bundled) / Ollama HTTP (lite) |

---

## Directory Structure

```
src-tauri/src/
├── commands/       # Tauri IPC handlers — thin, delegate to modules
├── scanner/        # OSINT pipeline: WhatsMyName + HIBP + risk scoring
├── ai/             # llama-cpp-2 inference + Ollama HTTP fallback
├── db/             # SQLCipher init, migrations, query helpers
└── models/         # Shared serde types used across backend

frontend/
├── pages/          # Dashboard, PersonalSpec, Scan, Results, Settings
├── components/
├── hooks/
└── lib/
    └── api.ts      # ALL invoke() calls — typed wrappers, single source of truth

bundled/            # AI model file (gitignored, bundled build only)
```

---

## Commands

```bash
# Install dependencies
pnpm install

# Dev server (Tauri + Vite hot reload)
pnpm tauri dev

# Build — lite installer (~50MB, Ollama at runtime)
pnpm build:lite

# Build — bundled installer (~2.5GB, model included)
pnpm build:bundled

# Frontend only (Vite)
pnpm dev

# Type check
pnpm typecheck

# Lint
pnpm lint

# Rust tests
cargo test --manifest-path src-tauri/Cargo.toml

# Rust single test
cargo test --manifest-path src-tauri/Cargo.toml <test_name>
```

---

## Architecture Rules

**IPC boundary:** all frontend→backend calls go through `frontend/lib/api.ts` typed wrappers. Never call `invoke()` directly in components — always add a typed function to `api.ts` first.

**Tauri commands:** keep `commands/` handlers thin — they validate input and delegate to `scanner/`, `ai/`, or `db/` modules. No business logic in command handlers.

**PII handling:** Personal Spec data (usernames, emails, accounts) lives only in SQLCipher. Never log PII. Never include PII in AI prompts — pass anonymized finding summaries only.

**DB key:** SQLCipher key is derived from Windows Credential Manager. Never hardcode or expose the key.

**WhatsMyName:** dataset fetched at scan time from the community repo with local cache fallback. Never bundle the dataset statically — it must stay current.

**Concurrency:** scanner uses configurable concurrency cap (default 20 parallel requests). Never remove this limit.

---

## Two Build Targets

Controlled via Cargo features:

- `bundled` — includes AI model file from `bundled/` directory
- `lite` — no model; AI module detects Ollama at `localhost:11434`

AI module must handle both modes gracefully and surface clear UI state when AI is unavailable (lite build + no Ollama detected).

---

## UX Constraints

Non-technical users are the primary audience:

- Risk levels shown as **Safe / Watch / At Risk** — never expose raw HTTP status codes or technical error strings to the UI
- AI summary always shown first; raw findings behind "Show details"
- Onboarding wizard must be completed (Personal Spec) before first scan is allowed
- All destructive actions (delete scan history, clear Personal Spec) require explicit confirmation

---

## Key External Dependencies

| Dependency | Purpose | Notes |
|-----------|---------|-------|
| WhatsMyName | Username site list | Fetched at scan time, cached locally |
| HaveIBeenPwned API | Email breach data | User provides own API key (free tier available) |
| Ollama | AI runtime (lite build) | Optional; detected at `localhost:11434` |
| GitHub Releases | Distribution + auto-update | Tauri updater checks on launch |
