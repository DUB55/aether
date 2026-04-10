// CI/CD pipeline configuration service
// Generates CI/CD configuration files for various platforms

export interface CIConfig {
  platform: 'github' | 'gitlab' | 'circleci' | 'vercel' | 'netlify'
  framework: 'nextjs' | 'react' | 'vue' | 'svelte' | 'nuxt' | 'astro' | 'node' | 'other'
  buildCommand?: string
  installCommand?: string
  outputDirectory?: string
  environmentVariables?: Record<string, string>
  testsEnabled?: boolean
  lintEnabled?: boolean
  deployOnPush?: boolean
  branches?: string[]
}

export interface CIConfigResult {
  success: boolean
  config?: string
  fileName?: string
  error?: string
}

export const cicdService = {
  // Generate GitHub Actions configuration
  generateGitHubActions: (config: CIConfig): CIConfigResult => {
    try {
      const buildCommand = config.buildCommand || 'npm run build';
      const installCommand = config.installCommand || 'npm install';
      const outputDir = config.outputDirectory || 'dist';

      let workflow = `name: CI/CD Pipeline

on:
  push:
    branches: ${JSON.stringify(config.branches || ['main', 'develop'])}
  pull_request:
    branches: ${JSON.stringify(config.branches || ['main', 'develop'])}

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: ${installCommand}
`;

      if (config.lintEnabled !== false) {
        workflow += `
      - name: Run linter
        run: npm run lint
`;
      }

      if (config.testsEnabled !== false) {
        workflow += `
      - name: Run tests
        run: npm test
`;
      }

      workflow += `
      - name: Build application
        run: ${buildCommand}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: ${outputDir}
`;

      if (config.environmentVariables && Object.keys(config.environmentVariables).length > 0) {
        workflow += `
      - name: Set environment variables
        run: |
${Object.entries(config.environmentVariables).map(([key, value]) => `          echo "${key}=${value}" >> $GITHUB_ENV`).join('\n')}
`;
      }

      if (config.deployOnPush !== false) {
        workflow += `
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build

      - name: Deploy
        run: echo "Deploy to production"
`;
      }

      return {
        success: true,
        config: workflow,
        fileName: '.github/workflows/ci-cd.yml'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate GitHub Actions config'
      };
    }
  },

  // Generate GitLab CI configuration
  generateGitLabCI: (config: CIConfig): CIConfigResult => {
    try {
      const buildCommand = config.buildCommand || 'npm run build';
      const installCommand = config.installCommand || 'npm install';
      const outputDir = config.outputDirectory || 'dist';

      let gitlabCI = `stages:
  - build
  - test
  - deploy

variables:
  NODE_ENV: production

build:
  stage: build
  image: node:18
  cache:
    paths:
      - node_modules/
  script:
    - ${installCommand}
    - ${buildCommand}
  artifacts:
    paths:
      - ${outputDir}
`;

      if (config.lintEnabled !== false) {
        gitlabCI += `
lint:
  stage: test
  image: node:18
  cache:
    paths:
      - node_modules/
  script:
    - ${installCommand}
    - npm run lint
`;
      }

      if (config.testsEnabled !== false) {
        gitlabCI += `
test:
  stage: test
  image: node:18
  cache:
    paths:
      - node_modules/
  script:
    - ${installCommand}
    - npm test
`;
      }

      if (config.deployOnPush !== false) {
        gitlabCI += `
deploy:
  stage: deploy
  image: node:18
  script:
    - echo "Deploy to production"
  only:
    - main
`;
      }

      return {
        success: true,
        config: gitlabCI,
        fileName: '.gitlab-ci.yml'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate GitLab CI config'
      };
    }
  },

  // Generate CircleCI configuration
  generateCircleCI: (config: CIConfig): CIConfigResult => {
    try {
      const buildCommand = config.buildCommand || 'npm run build';
      const installCommand = config.installCommand || 'npm install';

      let circleCI = `version: 2.1

orbs:
  node: circleci/node@5.0.2

jobs:
  build-and-test:
    docker:
      - image: cimg/node:18.16
    steps:
      - checkout
      - node/install-packages
      - run: ${buildCommand}
`;

      if (config.lintEnabled !== false) {
        circleCI += `      - run: npm run lint\n`;
      }

      if (config.testsEnabled !== false) {
        circleCI += `      - run: npm test\n`;
      }

      circleCI += `
  deploy:
    docker:
      - image: cimg/node:18.16
    steps:
      - checkout
      - run: echo "Deploy to production"
    filters:
      branches:
        only: main
`;

      if (config.deployOnPush !== false) {
        circleCI += `
workflows:
  build-test-deploy:
    jobs:
      - build-and-test
      - deploy:
          requires:
            - build-and-test
`;
      }

      return {
        success: true,
        config: circleCI,
        fileName: '.circleci/config.yml'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate CircleCI config'
      };
    }
  },

  // Generate Vercel configuration
  generateVercelConfig: (config: CIConfig): CIConfigResult => {
    try {
      const buildCommand = config.buildCommand || 'npm run build';
      const outputDir = config.outputDirectory || 'dist';

      const vercelConfig = `{
  "buildCommand": "${buildCommand}",
  "outputDirectory": "${outputDir}",
  "installCommand": "${config.installCommand || 'npm install'}",
  "framework": "${config.framework}",
  "regions": ["iad1"],
  "env": ${JSON.stringify(config.environmentVariables || {})}
}`;

      return {
        success: true,
        config: vercelConfig,
        fileName: 'vercel.json'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate Vercel config'
      };
    }
  },

  // Generate Netlify configuration
  generateNetlifyConfig: (config: CIConfig): CIConfigResult => {
    try {
      const buildCommand = config.buildCommand || 'npm run build';
      const outputDir = config.outputDirectory || 'dist';

      let netlifyConfig = `[build]
  command = "${buildCommand}"
  publish = "${outputDir}"
`;

      if (config.environmentVariables && Object.keys(config.environmentVariables).length > 0) {
        netlifyConfig += `[build.environment]\n`;
        Object.entries(config.environmentVariables).forEach(([key, value]) => {
          netlifyConfig += `  ${key} = "${value}"\n`;
        });
      }

      return {
        success: true,
        config: netlifyConfig,
        fileName: 'netlify.toml'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate Netlify config'
      };
    }
  },

  // Generate Docker configuration
  generateDockerfile: (config: CIConfig): CIConfigResult => {
    try {
      const buildCommand = config.buildCommand || 'npm run build';
      const installCommand = config.installCommand || 'npm install';

      let dockerfile = `# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN ${installCommand}

COPY . .
RUN ${buildCommand}

# Stage 2: Production
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/${config.outputDirectory || 'dist'} ./dist
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
`;

      return {
        success: true,
        config: dockerfile,
        fileName: 'Dockerfile'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate Dockerfile'
      };
    }
  },

  // Generate Docker Compose configuration
  generateDockerCompose: (config: CIConfig): CIConfigResult => {
    try {
      const dockerCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
${Object.entries(config.environmentVariables || {}).map(([key, value]) => `      - ${key}=${value}`).join('\n')}
    restart: unless-stopped
`;

      return {
        success: true,
        config: dockerCompose,
        fileName: 'docker-compose.yml'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate docker-compose.yml'
      };
    }
  },

  // Get supported CI/CD platforms
  getSupportedPlatforms(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'github', label: 'GitHub Actions', description: 'Native CI/CD for GitHub repositories' },
      { value: 'gitlab', label: 'GitLab CI', description: 'Built-in CI/CD for GitLab repositories' },
      { value: 'circleci', label: 'CircleCI', description: 'Cloud-based CI/CD platform' },
      { value: 'vercel', label: 'Vercel', description: 'Deployment platform with built-in CI/CD' },
      { value: 'netlify', label: 'Netlify', description: 'JAMstack platform with CI/CD' }
    ];
  },

  // Get supported frameworks
  getSupportedFrameworks(): Array<{ value: string; label: string; buildCommand: string; outputDirectory: string }> {
    return [
      { value: 'nextjs', label: 'Next.js', buildCommand: 'npm run build', outputDirectory: '.next' },
      { value: 'react', label: 'React', buildCommand: 'npm run build', outputDirectory: 'dist' },
      { value: 'vue', label: 'Vue', buildCommand: 'npm run build', outputDirectory: 'dist' },
      { value: 'svelte', label: 'Svelte', buildCommand: 'npm run build', outputDirectory: 'dist' },
      { value: 'nuxt', label: 'Nuxt', buildCommand: 'npm run build', outputDirectory: '.output' },
      { value: 'astro', label: 'Astro', buildCommand: 'npm run build', outputDirectory: 'dist' },
      { value: 'node', label: 'Node.js', buildCommand: 'npm run build', outputDirectory: 'dist' },
      { value: 'other', label: 'Other', buildCommand: 'npm run build', outputDirectory: 'dist' }
    ];
  }
};
