<div align="center">

# 🛡️ Digital Guardian

**A local-first desktop guardian for your digital identity.**

Scan. Understand. Monitor. Never send your data anywhere.

[![Build Status](https://img.shields.io/github/actions/workflow/status/CozyGuardian/digital-guardian/ci.yml?branch=main&style=flat-square&label=build)](https://github.com/CozyGuardian/digital-guardian/actions)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows&logoColor=white)](#build-targets)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-2021-DEA584?style=flat-square&logo=rust&logoColor=white)](src-tauri/Cargo.toml)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](frontend)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](tsconfig.json)
[![Version](https://img.shields.io/badge/version-0.1.0-informational?style=flat-square)](package.json)

</div>

---

## What is Digital Guardian?

Most people have no idea how much of their personal information is exposed online — old accounts, breached emails, impersonating profiles. OSINT tools can find that data, but they dump raw results on you with no context.

**Digital Guardian is different.** It's a local-first Windows desktop app that scans your digital footprint and evaluates it against your **Personal Spec** — a record of the accounts and identities you actually own. Instead of an undifferentiated wall of findings, you get a clear signal:

| Finding | In your Personal Spec? | What it means |
|---|---|---|
| Account found | ✅ Yes | Expected — that's you |
| Account found | ❌ No | Potential impersonation or forgotten exposure |
| Account not found | ✅ Yes | Missing or suspended — worth checking |

No cloud. No telemetry. No account required. Everything — your Personal Spec, scan history, and findings — stays encrypted on your device.

---

## ✨ Features

- 🔍 **OSINT scanning** across 500+ sites via the [WhatsMyName](https://github.com/WebBreacher/WhatsMyName) dataset, plus email breach lookups via [Have I Been Pwned](https://haveibeenpwned.com/)
- 🎯 **Delta analysis** — findings are only meaningful in context of what you told it is yours
- 🚦 **Plain-language risk levels** — Safe / Watch / At Risk, no raw status codes or jargon
- 🤖 **Local AI summaries** — a locally-run model explains findings in plain English; nothing you scan ever leaves your machine
- 🔐 **Encrypted storage** — SQLCipher database, key managed via Windows Credential Manager
- 📉 **Scan diffing** — track new exposures and resolved risks over time
- 🧭 **Guided onboarding** — a setup wizard builds your Personal Spec before your first scan

---

## 🏗️ How it works

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  Personal Spec   │────▶│   Scan Pipeline   │────▶│   Delta + Risk     │
│  (your identity) │     │  WhatsMyName+HIBP │     │     Scoring        │
└─────────────────┘     └──────────────────┘     └─────────┬──────────┘
                                                             │
                          ┌──────────────────┐               ▼
                          │   Local AI        │◀────  SQLCipher DB
                          │   Summary         │       (encrypted, local)
                          └──────────────────┘
```

1. You define your **Personal Spec** — usernames, emails, and known accounts
2. The scanner checks 500+ sites for matching usernames and queries HIBP for breach exposure
3. Every finding is classified against your Personal Spec
4. Risk scores are computed and a local AI model summarizes the results in plain English
5. Everything is stored encrypted, and diffed against your previous scan

See [`CONCEPT.md`](CONCEPT.md) for the full technical concept and [`docs/superpowers/specs/2026-08-04-digital-guardian-design.md`](docs/superpowers/specs/2026-08-04-digital-guardian-design.md) for the detailed design spec.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Tauri 2](https://tauri.app) |
| Backend | Rust (`src-tauri/`) |
| Frontend | React + TypeScript (`frontend/`) |
| UI | Tailwind CSS + shadcn/ui |
| Database | SQLCipher via [`rusqlite`](https://crates.io/crates/rusqlite) |
| OSINT | WhatsMyName dataset + HaveIBeenPwned API |
| Local AI | [`llama-cpp-2`](https://crates.io/crates/llama-cpp-2) (bundled) or [Ollama](https://ollama.com) HTTP (lite) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) + [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- Windows (current MVP target — see [Tauri prerequisites](https://tauri.app/start/prerequisites/) for platform setup)

### Install & run

```bash
# Install dependencies
pnpm install

# Start the dev server (Tauri + Vite, hot reload)
pnpm tauri dev
```

### Other useful commands

```bash
pnpm dev              # Frontend only (Vite)
pnpm typecheck         # TypeScript type check
pnpm lint              # Lint frontend

cargo test --manifest-path src-tauri/Cargo.toml   # Rust test suite
```

---

## 📦 Build Targets

Digital Guardian ships as two installer variants, controlled via Cargo features:

| Target | Command | Size | AI | Best for |
|---|---|---|---|---|
| **Bundled** | `pnpm build:bundled` | ~2.5GB | Model included | Zero-setup, best UX |
| **Lite** | `pnpm build:lite` | ~50MB | Requires [Ollama](https://ollama.com) at `localhost:11434` | Power users, choice of model |

Both are distributed via GitHub Releases with Tauri's built-in auto-updater.

---

## 📁 Project Structure

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

## 🔒 Privacy & Security

- **Local-first, always.** No cloud sync, no telemetry, no analytics.
- **Personal Spec data never leaves your device** — usernames, emails, and accounts live only in an encrypted SQLCipher database.
- **AI prompts are anonymized.** Only sanitized finding summaries are passed to the local model — never raw PII.
- **Encryption key** is derived from and stored in the Windows Credential Manager, never hardcoded.
- **You bring your own HIBP key.** Digital Guardian never proxies your breach lookups through a third party.

Found a security issue? Please report it responsibly rather than opening a public issue.

---

## 🗺️ Roadmap

**MVP (in progress)**
- [x] Personal Spec onboarding wizard
- [x] Username/identity scanning (WhatsMyName + HIBP)
- [x] Delta analysis against Personal Spec
- [ ] Risk scoring + scan diffing
- [ ] Local AI summary of findings
- [ ] Dashboard with risk overview
- [ ] Windows installer (bundled + lite)

**Post-MVP**
- [ ] Image exposure monitoring
- [ ] macOS + Linux support
- [ ] Scheduled background scans
- [ ] Browser extension integration

---

## 🤝 Contributing

This project is under active early development. Check [`CLAUDE.md`](CLAUDE.md) for architecture rules and conventions before opening a PR.

## 📄 License

Licensed under the [Apache License 2.0](LICENSE).

---

<div align="center">
<sub>Built with 🛡️ by <a href="https://github.com/CozyGuardian">CozyGuardian</a></sub>
</div>
