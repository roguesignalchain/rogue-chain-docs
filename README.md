# Rogue Signal Documentation Hub (`rogue-chain-docs`)

Official technical documentation website for the **Rogue Signal (ROGUE)** blockchain, built with [Docusaurus](https://docusaurus.io/) with full TypeScript support, bilingual internationalization (English & Spanish), and offline local search.

* **Live Subdomain:** [docs.roguechain.org](https://docs.roguechain.org)
* **GitHub Repository:** [roguesignalchain/rogue-chain-docs](https://github.com/roguesignalchain/rogue-chain-docs)

---

## 🛠️ Development Setup

This project uses **pnpm** as its primary package manager.

### Prerequisites
* Node.js v20.0 or higher
* pnpm v10+

### Installation
```bash
pnpm install
```

### Local Development Server
To launch the development server with live reload:
```bash
# Starts the English site by default
pnpm start

# Or develop with Spanish locale:
pnpm start -- --locale es
```
The documentation will be available locally at `http://localhost:3000`.

---

## 🏗️ Production Build

To build the static HTML/CSS/JS artifacts for both English and Spanish:
```bash
pnpm build
```

To preview the built static bundle locally:
```bash
pnpm serve
```

---

## 🌐 Localization (i18n)

Documentation is structured into two synchronized branches:
* **English (Default):** Located in `docs/`
* **Spanish:** Located in `i18n/es/docusaurus-plugin-content-docs/current/`

To translate blog posts or Docusaurus UI elements:
```bash
pnpm write-translations --locale es
```

---

## 🚀 Continuous Deployment (GitHub Pages)

Whenever changes are pushed to the `main` branch, the GitHub Actions workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) automatically builds and deploys the static documentation site to GitHub Pages.

The custom domain is preserved across builds via [`static/CNAME`](static/CNAME).

---

## 📄 License
This repository is part of the open-source Rogue Signal ecosystem.
