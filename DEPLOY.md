ADHRA React app — Deployment Guide

This guide describes quick ways to build and deploy the `adhra-react` site.

1) Build for production

```bash
# from project root (adhra-react)
npm run build
# output in dist/
```

2) Deploy to Vercel (recommended)

Vercel is the simplest option for modern static sites and provides fast CI/CD. The `vercel.json` file is included in this project to help Vercel detect the static build.

Quick deploy steps (Dashboard)

- Push the repository to GitHub (or Git provider).
- Go to https://vercel.com/new and import the repo.
- In the Build & Output settings set:
  - Framework Preset: Other
  - Root Directory: `adhra-react`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Deploy — Vercel will build and publish the site.

Quick deploy steps (CLI)

```bash
# install CLI once
npm i -g vercel
# from project root
cd adhra-react
vercel --prod
```

3) Optional: Netlify

Netlify remains a great choice; deploy the `dist/` folder or connect the repo and set build command `npm run build` and publish directory `dist`.

4) Optional: GitHub Pages

If you prefer GitHub Pages, use `gh-pages` to publish the `dist/` folder. Note that GitHub Pages may require setting a base path in `vite.config.js` for project pages.

CI / Environment Notes

- If you need environment variables (e.g., `PAYSTACK_PUBLIC_KEY`), set them in the Vercel project settings (Environment Variables) or Netlify site settings.
- For project pages on GitHub Pages set the `base` option in `vite.config.js` before building.

If you want, I can:
- Add a small GitHub Actions workflow that builds the site and deploys to Vercel using `vercel` CLI (requires a Vercel token), or
- Create a `netlify.toml` for Netlify-specific settings.

Tell me which automation you'd like and I'll add the workflow and any needed scripts.

Automate with GitHub Actions (recommended for CI)

1) Add GitHub repository and push your code.

2) Add the required repository secrets in GitHub (Settings → Secrets & variables → Actions):
  - `VERCEL_TOKEN` — your Vercel personal token
  - `VERCEL_ORG_ID` — your Vercel organization ID
  - `VERCEL_PROJECT_ID` — your Vercel project ID

3) The included GitHub Actions workflow `.github/workflows/deploy-vercel.yml` will run on pushes to `main`, build the app in `adhra-react`, and deploy to Vercel using the provided secrets.

Notes:
- To get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`, visit your project settings on Vercel and copy the IDs.
- If you prefer GitHub Pages or Netlify, I can add equivalent workflows as well.
 - I added example GitHub Actions workflows for both Vercel and Netlify, and a `netlify.toml`.
  
Netlify notes:
- Set the following repository secrets in GitHub: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` to enable the Netlify workflow.

GitHub Pages notes:
- Install `gh-pages` and then run `npm run deploy:gh-pages` from `adhra-react` to publish `dist/` to GitHub Pages. You will need to add `gh-pages` as a dev dependency and set the `homepage` or Vite `base` appropriately if deploying to a project subpath.
            - name: Cloud Maker Deploy
  # You may pin to the exact commit or the version.
  # uses: cloud-maker-ai/github-action-deploy@f86239fb28b589a9898a361b3df1dac5f3d3fc8f
  uses: cloud-maker-ai/github-action-deploy@v1.0.1
  with:
    # Cloud Maker API Token
    CLOUD_MAKER_TOKEN: 
    # Cloud Maker Pipeline ID to be deployed
    CLOUD_MAKER_PIPELINE_ID: 
    # Cloud Maker Stage ID to be deployed
    CLOUD_MAKER_STAGE_ID:
