// Connector configuration with BYOK enforcement
// All connectors require users to provide their own API keys

export interface Connector {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  docsUrl?: string;
  requiredKeys: string[];
  byokRequired: boolean;
}

export const CONNECTORS: Connector[] = [
  // Foundation & Backend
  {
    id: 'cloud',
    name: 'Cloud',
    category: 'Foundation & Backend',
    description: 'Built-in backend, ready to use',
    icon: '☁️',
    requiredKeys: [],
    byokRequired: false
  },
  {
    id: 'ai',
    name: 'AI',
    category: 'Foundation & Backend',
    description: 'Unlock powerful AI features',
    icon: '🤖',
    requiredKeys: ['apiKey'],
    byokRequired: true
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'Foundation & Backend',
    description: 'Build an eCommerce store',
    icon: '🛒',
    docsUrl: 'https://shopify.dev/docs',
    requiredKeys: ['shopDomain', 'accessToken'],
    byokRequired: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Foundation & Backend',
    description: 'Set up payments',
    icon: '💳',
    docsUrl: 'https://stripe.com/docs',
    requiredKeys: ['secretKey', 'publishableKey'],
    byokRequired: true
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'Foundation & Backend',
    description: 'Connect your own Supabase project',
    icon: '🗄️',
    docsUrl: 'https://supabase.com/docs',
    requiredKeys: ['url', 'anonKey'],
    byokRequired: true
  },

  // Project & Task Management
  {
    id: 'asana',
    name: 'Asana',
    category: 'Project & Task Management',
    description: 'Work management for tasks/teams',
    icon: '📋',
    docsUrl: 'https://developers.asana.com/docs',
    requiredKeys: ['accessToken'],
    byokRequired: true
  },
  {
    id: 'linear',
    name: 'Linear',
    category: 'Project & Task Management',
    description: 'Issue tracking for software teams',
    icon: '📝',
    docsUrl: 'https://developers.linear.app/docs',
    requiredKeys: ['apiKey'],
    byokRequired: true
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Project & Task Management',
    description: 'Access pages and databases',
    icon: '📚',
    docsUrl: 'https://developers.notion.com/docs',
    requiredKeys: ['integrationToken'],
    byokRequired: true
  },
  {
    id: 'miro',
    name: 'Miro',
    category: 'Project & Task Management',
    description: 'Boards and diagrams',
    icon: '🎨',
    docsUrl: 'https://developers.miro.com/docs',
    requiredKeys: ['accessToken'],
    byokRequired: true
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    category: 'Project & Task Management',
    description: 'Jira issues and Confluence pages',
    icon: '🏢',
    docsUrl: 'https://developer.atlassian.com/docs',
    requiredKeys: ['email', 'apiToken'],
    byokRequired: true
  },

  // Communication & Sales
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Communication & Sales',
    description: 'Read, send, and manage emails',
    icon: '📧',
    docsUrl: 'https://developers.google.com/gmail/api',
    requiredKeys: ['clientId', 'clientSecret', 'refreshToken'],
    byokRequired: true
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication & Sales',
    description: 'Messages and workspace interaction',
    icon: '💬',
    docsUrl: 'https://api.slack.com/docs',
    requiredKeys: ['botToken'],
    byokRequired: true
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    category: 'Communication & Sales',
    description: 'Emails and channel management',
    icon: '📨',
    docsUrl: 'https://docs.microsoft.com/graph/api',
    requiredKeys: ['clientId', 'clientSecret', 'tenantId'],
    byokRequired: true
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'Communication & Sales',
    description: 'Messaging with Bot API',
    icon: '✈️',
    docsUrl: 'https://core.telegram.org/bots/api',
    requiredKeys: ['botToken'],
    byokRequired: true
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'Communication & Sales',
    description: 'SMS, voice, and messaging',
    icon: '📞',
    docsUrl: 'https://www.twilio.com/docs',
    requiredKeys: ['accountSid', 'authToken'],
    byokRequired: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'Communication & Sales',
    description: 'CRM for sales/marketing',
    icon: '🎯',
    docsUrl: 'https://developers.hubspot.com/docs',
    requiredKeys: ['apiKey'],
    byokRequired: true
  },

  // Data & Analytics
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'Data & Analytics',
    description: 'Read and update spreadsheet data',
    icon: '📊',
    docsUrl: 'https://developers.google.com/sheets/api',
    requiredKeys: ['clientId', 'clientSecret', 'refreshToken'],
    byokRequired: true
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'Data & Analytics',
    description: 'Spreadsheet-database hybrid',
    icon: '📋',
    docsUrl: 'https://airtable.com/developers/web/api',
    requiredKeys: ['apiKey', 'baseId'],
    byokRequired: true
  },
  {
    id: 'bigquery',
    name: 'BigQuery',
    category: 'Data & Analytics',
    description: 'Query and analyze data',
    icon: '🔍',
    docsUrl: 'https://cloud.google.com/bigquery/docs',
    requiredKeys: ['projectId', 'keyFilePath'],
    byokRequired: true
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    category: 'Data & Analytics',
    description: 'Cloud data platform',
    icon: '❄️',
    docsUrl: 'https://docs.snowflake.com',
    requiredKeys: ['account', 'username', 'password'],
    byokRequired: true
  },
  {
    id: 'databricks',
    name: 'Databricks',
    category: 'Data & Analytics',
    description: 'Unified analytics and AI',
    icon: '🧪',
    docsUrl: 'https://docs.databricks.com',
    requiredKeys: ['workspaceUrl', 'token'],
    byokRequired: true
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    category: 'Data & Analytics',
    description: 'Read and write data files',
    icon: '🗃️',
    docsUrl: 'https://docs.aws.amazon.com/s3',
    requiredKeys: ['accessKeyId', 'secretAccessKey', 'region'],
    byokRequired: true
  },

  // Content & AI Tools
  {
    id: 'google-docs',
    name: 'Google Docs',
    category: 'Content & AI Tools',
    description: 'Create and manage Google files',
    icon: '📄',
    docsUrl: 'https://developers.google.com/docs/api',
    requiredKeys: ['clientId', 'clientSecret', 'refreshToken'],
    byokRequired: true
  },
  {
    id: 'contentful',
    name: 'Contentful',
    category: 'Content & AI Tools',
    description: 'Headless CMS',
    icon: '📝',
    docsUrl: 'https://www.contentful.com/developers/docs',
    requiredKeys: ['spaceId', 'accessToken'],
    byokRequired: true
  },
  {
    id: 'storyblok',
    name: 'Storyblok',
    category: 'Content & AI Tools',
    description: 'Visual page builder',
    icon: '🎭',
    docsUrl: 'https://www.storyblok.com/docs',
    requiredKeys: ['spaceId', 'accessToken'],
    byokRequired: true
  },
  {
    id: 'sanity',
    name: 'Sanity',
    category: 'Content & AI Tools',
    description: 'Content management',
    icon: '🧠',
    docsUrl: 'https://www.sanity.io/docs',
    requiredKeys: ['projectId', 'dataset', 'apiToken'],
    byokRequired: true
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    category: 'Content & AI Tools',
    description: 'Access sites and posts',
    icon: '📰',
    docsUrl: 'https://developer.wordpress.org/rest-api',
    requiredKeys: ['url', 'username', 'applicationPassword'],
    byokRequired: true
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'Content & AI Tools',
    description: 'AI voice and speech-to-text',
    icon: '🎙️',
    docsUrl: 'https://elevenlabs.io/docs',
    requiredKeys: ['apiKey'],
    byokRequired: true
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'Content & AI Tools',
    description: 'AI-powered search',
    icon: '🔮',
    docsUrl: 'https://docs.perplexity.ai',
    requiredKeys: ['apiKey'],
    byokRequired: true
  },

  // Security, Ops & Dev
  {
    id: 'aikido',
    name: 'Aikido',
    category: 'Security, Ops & Dev',
    description: 'AI-powered security scanning',
    icon: '🛡️',
    docsUrl: 'https://docs.aikido.dev',
    requiredKeys: ['apiKey'],
    byokRequired: true
  },
  {
    id: 'wiz',
    name: 'Wiz',
    category: 'Security, Ops & Dev',
    description: 'Cloud security posture',
    icon: '🔒',
    docsUrl: 'https://docs.wiz.io',
    requiredKeys: ['clientId', 'clientSecret'],
    byokRequired: true
  },
  {
    id: 'sentry',
    name: 'Sentry',
    category: 'Security, Ops & Dev',
    description: 'Error and insight tracking',
    icon: '📡',
    docsUrl: 'https://docs.sentry.io',
    requiredKeys: ['dsn'],
    byokRequired: true
  },
  {
    id: 'inngest',
    name: 'Inngest',
    category: 'Security, Ops & Dev',
    description: 'Background jobs and workflows',
    icon: '⚡',
    docsUrl: 'https://www.inngest.com/docs',
    requiredKeys: ['signingKey', 'eventId'],
    byokRequired: true
  },
  {
    id: 'n8n',
    name: 'n8n',
    category: 'Security, Ops & Dev',
    description: 'Power apps with workflows',
    icon: '🔄',
    docsUrl: 'https://docs.n8n.io',
    requiredKeys: ['apiUrl', 'apiKey'],
    byokRequired: true
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'Security, Ops & Dev',
    description: 'Local design file access',
    icon: '🎨',
    docsUrl: 'https://www.figma.com/developers/api',
    requiredKeys: ['accessToken'],
    byokRequired: true
  },
  {
    id: 'polar',
    name: 'Polar',
    category: 'Security, Ops & Dev',
    description: 'Subscription billing',
    icon: '💳',
    docsUrl: 'https://docs.polar.sh',
    requiredKeys: ['apiKey'],
    byokRequired: true
  }
];

export interface ConnectorConfig {
  connectorId: string;
  keys: Record<string, string>;
  configured: boolean;
  configuredAt?: string;
}

// Get connector configuration from localStorage
export function getConnectorConfig(connectorId: string): ConnectorConfig | null {
  if (typeof window === 'undefined') return null;
  
  const configs = localStorage.getItem('aether_connector_configs');
  if (!configs) return null;
  
  try {
    const allConfigs = JSON.parse(configs);
    return allConfigs[connectorId] || null;
  } catch (error) {
    console.error('Failed to get connector config:', error);
    return null;
  }
}

// Save connector configuration to localStorage
export function saveConnectorConfig(connectorId: string, keys: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  
  const configs = localStorage.getItem('aether_connector_configs') || '{}';
  const allConfigs = JSON.parse(configs);
  
  allConfigs[connectorId] = {
    connectorId,
    keys,
    configured: true,
    configuredAt: new Date().toISOString()
  };
  
  localStorage.setItem('aether_connector_configs', JSON.stringify(allConfigs));
}

// Remove connector configuration
export function removeConnectorConfig(connectorId: string): void {
  if (typeof window === 'undefined') return;
  
  const configs = localStorage.getItem('aether_connector_configs') || '{}';
  const allConfigs = JSON.parse(configs);
  
  delete allConfigs[connectorId];
  
  localStorage.setItem('aether_connector_configs', JSON.stringify(allConfigs));
}

// Check if connector is configured
export function isConnectorConfigured(connectorId: string): boolean {
  const config = getConnectorConfig(connectorId);
  return config?.configured || false;
}
