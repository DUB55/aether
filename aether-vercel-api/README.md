# Aether Vercel Proxy

Deploy this folder with Vercel to provide the secure GitHub publish endpoint used by `aether.html`.

Required environment variables:

- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH` (optional, defaults to `main`)

Frontend setting:

- Set `window.AETHER_CONFIG.publishEndpoint` to your deployed endpoint, for example `https://aether-vert.vercel.app/api/publish-project`.
