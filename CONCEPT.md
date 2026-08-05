# Digital Guardian — Technical Concept

## What It Is

Local-first Tauri desktop application (Windows MVP) that helps non-technical users understand, monitor, and protect their digital identity. Scans the web for exposed personal information and compares findings against a user-defined **Personal Spec** — a record of their intentional online presence.

No cloud. No telemetry. All data stays on the user's device.

---

## Core Concept: Personal Spec + Delta Analysis

The key differentiator from plain OSINT tools is the **Personal Spec**: a profile of the user's *known and intended* digital accounts. The scanner uses this to classify every finding:

| Finding | In Personal Spec? | Classification |
|---------|-----------------|---------------|
| Account found | Yes | Expected — green |
| Account found | No | Potential impersonation/risk — red/yellow |
| Account not found | Yes | Missing/suspended — informational |

This transforms raw OSINT results into *meaningful risk signal* for non-technical users.

---

## Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Desktop shell | Tauri 2 | Rust backend, small binary, native OS integration |
| Backend | Rust | Performance, safety, single binary, no runtime |
| Frontend | React + TypeScript + Tailwind + shadcn/ui | Ecosystem, polished UI |
| Database | SQLCipher (via rusqlite) | Encrypted at rest, embedded, no server |
| OSINT | WhatsMyName dataset + HIBP API | Community-maintained, 500+ sites, privacy-safe |
| Local AI | llama-cpp-2 crate (bundled) / Ollama HTTP (lite) | Fully local inference, no API keys |
| Installer | Tauri NSIS (Windows) | Native installer, auto-update support |

---

## Architecture

```
digital-guardian/
├── src-tauri/              # Rust backend (Tauri convention)
│   └── src/
│       ├── commands/       # IPC command handlers exposed to frontend
│       ├── scanner/        # OSINT pipeline (WhatsMyName + HIBP + risk scoring)
│       ├── ai/             # Local AI inference (llama-cpp-2 + Ollama fallback)
│       ├── db/             # SQLCipher storage + migrations
│       └── models/         # Shared data types
├── frontend/               # React + TypeScript UI
│   ├── pages/              # Dashboard, PersonalSpec, Scan, Results, Settings
│   └── lib/api.ts          # Typed invoke() wrappers — IPC boundary
├── bundled/                # Bundled AI model file (gitignored, bundled build only)
└── docs/
```

**IPC flow:** `frontend invoke()` → Tauri command → Rust module → SQLCipher → JSON response

---

## Scanner Pipeline

1. **Personal Spec input** — usernames, emails, full name, known social accounts per platform
2. **HaveIBeenPwned** — email breach lookup (user provides own HIBP API key)
3. **WhatsMyName** — concurrent username checks across 500+ sites (20 parallel requests default); dataset fetched fresh per scan with local cache fallback
4. **Delta analysis** — compare findings against Personal Spec → classify each result
5. **Risk scoring** — assign `safe` / `watch` / `at_risk` per finding
6. **Persist** — store findings in SQLCipher with timestamp; diff against previous scan

No PII is sent to any aggregator — only direct requests to individual sites.

---

## AI Module

Summarizes findings in plain English for non-technical users. Runs locally post-scan.

- **Bundled build:** Phi-3-mini or Llama-3.2-3B via `llama-cpp-2` Rust crate (~2GB, CPU-only)
- **Lite build:** Ollama at `localhost:11434` — model-agnostic, user-managed
- **Input:** anonymized finding summaries (no raw PII)
- **Output:** plain-English risk summary + prioritized action list

---

## Data Storage

SQLCipher database at `%APPDATA%\digital-guardian\`. Encryption key managed via Windows Credential Manager — transparent to user.

| Table | Contents |
|-------|---------|
| `personal_spec` | User's known identity + social accounts |
| `scans` | Scan run metadata (timestamp, status) |
| `findings` | Per-site results with risk classification |
| `risk_scores` | Computed risk levels |
| `ai_summaries` | AI-generated summaries per scan |

Scan results are diffed across runs to surface new exposures and resolved risks.

---

## Frontend Pages

| Page | Purpose |
|------|---------|
| Dashboard | Risk score overview, last scan summary, quick actions |
| Personal Spec | Setup and edit known identity + social accounts |
| Scan | Configure and run scan with live progress |
| Results | Findings table, scan diff, AI summary |
| Settings | AI mode, HIBP API key, data export, auto-update |

UX principle: risk shown as color + plain label (Safe / Watch / At Risk). AI summary shown prominently; raw technical findings behind "Show details". Onboarding wizard guides Personal Spec setup before first scan.

---

## Build Targets

| Target | Size | AI | Use case |
|--------|------|----|---------|
| Bundled installer | ~2.5GB | Phi-3-mini included | Best UX, zero setup |
| Lite installer | ~50MB | Ollama (user installs) | Power users, model choice |

Both distributed via GitHub Releases. Tauri auto-updater checks for new versions on launch.

---

## MVP Scope

**In scope:**
- Personal Spec setup (onboarding wizard)
- Username/identity scan (WhatsMyName + HIBP)
- Delta analysis against Personal Spec
- Risk scoring + scan diffing
- Local AI summary of findings
- Dashboard with risk overview
- Windows installer (both targets)

**Post-MVP:**
- Image exposure monitoring
- macOS + Linux support
- Scheduled background scans
- Browser extension integration
