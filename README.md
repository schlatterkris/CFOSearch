# Career-Ops

[English](README.md) | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | [한국어](README.ko-KR.md) | [日本語](README.ja.md)

AI-powered job search command center: evaluate offers, generate CVs, scan portals, track applications.

## Quick Start (already configured)

```bash
npm install              # Install dependencies
npx playwright install chromium   # Required for PDF generation
npm run doctor           # Verify setup
```

## Running a Search

Scan job portals for new opportunities:

```bash
npm run scan
```

This checks all configured portals (Greenhouse, Ashby, Lever, etc.) and adds matching roles to the pipeline. Results appear in `data/scan-history.tsv`.

To evaluate a specific job, paste its URL into the CLI when prompted — the system will generate a full report with match score, gap analysis, comp research, and CV personalization.

## Viewing the Dashboard

Launch the web dashboard:

```bash
cd dashboard
go build -o web.exe .\cmd\web\
.\web.exe -port 8080
```

Open http://localhost:8080 to browse all applications, scores, status breakdowns, and pipeline metrics.

### Key Files

| Path | Purpose |
|------|---------|
| `cv.md` | Your CV (markdown) |
| `portals.yml` | Companies and search queries |
| `config/profile.yml` | Your profile, preferences, comp targets |
| `data/applications.md` | Application tracker |
| `data/pipeline.md` | Pending/processed pipeline |
| `reports/` | Evaluation reports per role |
| `output/` | Generated ATS PDFs |

## Commands

| Command | Purpose |
|---------|---------|
| `npm run doctor` | Validate setup |
| `npm run verify` | Pipeline health check |
| `npm run scan` | Scan job portals |
| `npm run pdf` | Generate ATS CV PDF |
| `npm run normalize` | Normalize statuses |
| `npm run dedup` | Dedup tracker entries |
| `npm run merge` | Merge TSV additions |
| `npm run liveness` | Verify portal liveness |

## Project Structure

```
career-ops/
├── cv.md                        # Your CV
├── config/profile.yml           # Your profile
├── portals.yml                  # Scanner configuration
├── modes/                       # Agent skill modes
├── templates/                   # CV HTML, states, portal examples
├── dashboard/                   # Web dashboard (Go)
├── data/                        # Tracker, pipeline, scan history
├── reports/                     # Evaluation reports
├── output/                      # Generated PDFs
├── batch/                       # Batch processing
├── fonts/                       # Space Grotesk + DM Sans
└── docs/                        # Full documentation
```

## Project Info

- **Author**: Santiago Fernández de Valderrama ([santifer.io](https://santifer.io))
- **License**: MIT
- **Disclaimer**: This is a local tool — you control your data. AI evaluations are recommendations, not truth. Always review before submitting. See [LEGAL_DISCLAIMER.md](LEGAL_DISCLAIMER.md).
