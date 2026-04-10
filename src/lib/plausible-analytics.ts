// Plausible Analytics service
// Privacy-focused analytics integration

export interface AnalyticsEvent {
  name: string
  props?: Record<string, string | number | boolean>
}

export interface PageViewEvent {
  url: string
  referrer?: string
}

const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN || 'aether.dev';
const PLAUSIBLE_URL = import.meta.env.VITE_PLAUSIBLE_URL || 'https://plausible.io';

export const plausibleAnalytics = {
  // Initialize Plausible Analytics
  init: () => {
    if (typeof window === 'undefined') return;

    // Load Plausible script
    const script = document.createElement('script');
    script.defer = true;
    script.src = `${PLAUSIBLE_URL}/js/script.js`;
    script.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
    document.head.appendChild(script);

    // Set up event queue for events fired before script loads
    (window as any).plausible = (window as any).plausible || function() {
      ((window as any).plausible.q = (window as any).plausible.q || []).push(arguments);
    };
  },

  // Track page view
  trackPageView: (event?: PageViewEvent) => {
    if (typeof window === 'undefined' || !(window as any).plausible) return;

    if (event) {
      (window as any).plausible('pageview', { 
        u: event.url,
        r: event.referrer
      });
    } else {
      (window as any).plausible('pageview');
    }
  },

  // Track custom event
  trackEvent: (event: AnalyticsEvent) => {
    if (typeof window === 'undefined' || !(window as any).plausible) return;

    (window as any).plausible(event.name, { props: event.props });
  },

  // Track user signup
  trackSignup: (userId: string, method: string) => {
    plausibleAnalytics.trackEvent({
      name: 'Signup',
      props: {
        userId,
        method
      }
    });
  },

  // Track project creation
  trackProjectCreated: (projectId: string, projectName: string) => {
    plausibleAnalytics.trackEvent({
      name: 'Project Created',
      props: {
        projectId,
        projectName
      }
    });
  },

  // Track deployment
  trackDeployment: (projectId: string, status: 'success' | 'failed') => {
    plausibleAnalytics.trackEvent({
      name: 'Deployment',
      props: {
        projectId,
        status
      }
    });
  },

  // Track API usage
  trackAPIUsage: (provider: string, model: string, tokens: number) => {
    plausibleAnalytics.trackEvent({
      name: 'API Usage',
      props: {
        provider,
        model,
        tokens
      }
    });
  },

  // Track workspace creation
  trackWorkspaceCreated: (workspaceId: string, workspaceName: string) => {
    plausibleAnalytics.trackEvent({
      name: 'Workspace Created',
      props: {
        workspaceId,
        workspaceName
      }
    });
  },

  // Track team member invitation
  trackMemberInvited: (workspaceId: string) => {
    plausibleAnalytics.trackEvent({
      name: 'Member Invited',
      props: {
        workspaceId
      }
    });
  },

  // Track feature usage
  trackFeatureUsed: (feature: string) => {
    plausibleAnalytics.trackEvent({
      name: 'Feature Used',
      props: {
        feature
      }
    });
  },

  // Track error
  trackError: (error: string, context?: string) => {
    plausibleAnalytics.trackEvent({
      name: 'Error',
      props: {
        error,
        context
      }
    });
  },

  // Track session duration
  trackSessionDuration: (duration: number) => {
    plausibleAnalytics.trackEvent({
      name: 'Session Duration',
      props: {
        duration,
        durationUnit: 'seconds'
      }
    });
  },

  // Track upgrade/cancellation
  trackSubscriptionChange: (action: 'upgrade' | 'downgrade' | 'cancel', plan: string) => {
    plausibleAnalytics.trackEvent({
      name: 'Subscription Change',
      props: {
        action,
        plan
      }
    });
  }
};
