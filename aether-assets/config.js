const defaultPublishEndpoint = (() => {
  if (typeof window === 'undefined') return 'https://aether-vert.vercel.app/api/publish-project';
  if (/github\.io$/i.test(window.location.hostname)) {
    return 'https://aether-vert.vercel.app/api/publish-project';
  }
  return `${window.location.origin}/api/publish-project`;
})();

export const APP_CONFIG = {
  aiEndpoint: 'https://chatbot-beta-weld.vercel.app/api/chatbot',
  publishEndpoint: window.AETHER_CONFIG?.publishEndpoint || defaultPublishEndpoint,
  maxHistoryMessages: 12,
};
