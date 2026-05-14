# IIT Motorsports — Documentation Site

Internal documentation dashboard for the IIT Motorsports FSAE team. Team members can upload, browse, search, and filter technical documents. Built as a fully static site hosted on GitHub Pages, with GitHub as the backend for storage, versioning, and review.

## Using the site

### Browsing documents
Visit the live site at **https://iitmotorsports.github.io/Documentation-Site/**

- Use the search bar to find documents by title, subteam, author, or tag
- Use the sidebar filters to narrow by subteam, year, file type, or tags (multiple tags can be selected at once)
- Toggle between grid and list view
- Click any document to open a preview modal with metadata and a PDF viewer

### Uploading a document
1. Click **+ Upload Doc** on the dashboard, or go directly to `upload.html`
2. Fill in the document title, subteam, and year (required)
3. Optionally add authors, date, tags, and a description
4. Drag and drop your file or click to browse — supported formats: PDF, Markdown, Word, LaTeX (max 25 MB)
5. Click **Submit for review** — this opens a pull request on GitHub
6. A team lead reviews and merges the PR
7. The document appears on the site automatically within a minute of merging

### Updating an existing document
On the upload page, check **"This is an update to an existing document"**, select the document being replaced, and the form will pre-fill with its current metadata. Upload the new file and submit.

---

## Subteams

| Subteam | Description |
|---|---|
| Chassis | Frame, roll hoop, and structural design |
| Suspension | Corner geometry, kinematics, uprights |
| Driver Interface | Ergonomics, pedal box, steering wheel |
| Aerodynamics | Wings, undertray, CFD |
| Powertrain | Engine, drivetrain, differential |
| High-Voltage | Accumulator, tractive system, motor |
| Low-Voltage | Wiring harness, CAN bus, low-voltage systems |
| Software | Embedded software, DAQ, telemetry |
| Business | Cost report, business plan, sponsorships |
| Media | Photography, video, branding |
| General | Cross-team or miscellaneous documents |

---

## Repository structure

```
Documentation-Site/
├── site/
│   ├── index.html          # Dashboard — browse, search, filter documents
│   └── upload.html         # Upload form — creates GitHub PRs
├── docs/                   # Document files live here (added via upload form)
├── manifest.json           # Metadata for all documents (source of truth)
├── cloudflare-worker/
│   └── worker.js           # Cloudflare Worker proxy (keeps GitHub token server-side)
└── .github/workflows/
    ├── deploy.yml          # Deploys site/ to GitHub Pages on every push to main
    └── validate-pr.yml     # Validates manifest.json on every PR before merge
```

## How it works

Documents are never committed directly to `main`. Every upload goes through a pull request:

1. The upload form calls a **Cloudflare Worker** proxy, which holds the GitHub token server-side and forwards requests to the GitHub API
2. The Worker creates a new branch, uploads the file to `docs/`, and updates `manifest.json`
3. A PR is opened from that branch to `main`
4. The `validate-pr.yml` workflow checks that the manifest is valid and the file exists in `docs/`
5. A team lead reviews and merges — the `deploy.yml` workflow then redeploys the site automatically

## Setup (for administrators)

1. **GitHub Pages** — Settings → Pages → Source → GitHub Actions
2. **Branch protection** — Settings → Branches → Add rule for `main`: require PR, require 1 approval, require `validate` status check
3. **Cloudflare Worker** — deploy `cloudflare-worker/worker.js`, add `GITHUB_TOKEN` secret (fine-grained token with `contents: write` and `pull-requests: write` on this repo, or a classic token with `repo` scope)
4. **Worker URL** — paste your Worker URL into `WORKER_URL` in `site/upload.html`
