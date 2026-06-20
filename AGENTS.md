# Career-Ops for OpenCode

Read `CLAUDE.md` for all project instructions, routing, and behavioral rules — they apply equally to OpenCode.

## Critical Rules
- **Reuse existing modes, scripts, templates, and tracker flow** — do not create parallel logic.
- **Data contract**: User files (`cv.md`, `config/profile.yml`, `modes/_profile.md`, `data/*`, `reports/*`) are NEVER auto-updated. System files (`modes/_shared.md`, `*.mjs`, `templates/*`) are safe to update.
- **Personalization**: User content → `modes/_profile.md` or `config/profile.yml`. NEVER `modes/_shared.md`.
- **Never submit applications** — STOP before clicking Submit.
- **Verify liveness with Playwright**, not WebSearch/WebFetch. Batch mode exception: mark `**Verification:** unconfirmed (batch mode)`.
- **Update check**: `node update-system.mjs check` on session start.

## Tracker Workflow
- **Additions**: Write TSV to `batch/tracker-additions/{num}-{slug}.tsv`, then `node merge-tracker.mjs`. NEVER edit `data/applications.md` directly to add entries.
- **TSV columns** (tab-separated): `num\tdate\tcompany\trole\tstatus\tscore/5\tpdf_emoji\treport_link\tnotes`
- **Column order trap**: TSV has status BEFORE score. `data/applications.md` has score BEFORE status. The merge script handles this swap automatically.
- **Canonical states** (`templates/states.yml`): `Evaluated`, `Applied`, `Responded`, `Interview`, `Offer`, `Rejected`, `Discarded`, `SKIP`. No markdown bold, no dates in status field.

## Commands
| Command | Purpose |
|---------|---------|
| `npm run doctor` | Validate setup |
| `npm run verify` | Pipeline health check |
| `npm run normalize` | Normalize statuses |
| `npm run dedup` | Dedup tracker |
| `npm run merge` | Merge TSV additions |
| `npm run pdf` | Generate ATS PDF |

## Report Headers
Must include `**URL:**` between Score and PDF sections.

## Language Modes
Default: `modes/` (EN). Also: `modes/de/`, `modes/fr/`, `modes/ja/`, `modes/pt/`. Switch via `language.modes_dir` in `config/profile.yml`.

For Codex-specific setup, see `docs/CODEX.md`.
