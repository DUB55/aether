export const CONFIG = {
  USE_LIQUID_DESIGN: true,
  GITHUB_CLIENT_ID: process.env.VITE_GITHUB_CLIENT_ID || '',
  GITHUB_REGISTRY: {
    REPO: 'DUB55/aether',
    PATH: 'projects.json',
    BRANCH: 'main'
  },
  BRAND: {
    NAME: 'Aether',
    // For now, we'll use a placeholder URL or a specific string to indicate we should use the AetherLogo component.
    // Later this can be replaced with a real URL.
    LOGO_URL: 'AETHER_LOGO_COMPONENT', 
  }
};
