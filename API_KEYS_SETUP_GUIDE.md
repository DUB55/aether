# Aether Enterprise Features - Complete API Keys Setup Guide

This guide provides step-by-step instructions for configuring all API keys required for the enterprise features to work properly.

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Vercel Deployment Setup](#vercel-deployment-setup)
3. [API Keys by Integration](#api-keys-by-integration)
   - [Gemini AI](#gemini-ai)
   - [Supabase](#supabase)
   - [Firebase](#firebase)
   - [Figma](#figma)
   - [PostgreSQL](#postgresql)
   - [MongoDB](#mongodb)
   - [MySQL](#mysql)
   - [GitHub](#github)
4. [Environment Variables Reference](#environment-variables-reference)
5. [Testing Your Configuration](#testing-your-configuration)
6. [Troubleshooting](#troubleshooting)

---

## 🖥️ Local Development Setup

### Step 1: Create `.env` file

Create a `.env` file in the root of your project:

```bash
# Navigate to project root
cd c:\Users\Mohammed\Downloads\aether-ai (5)

# Create .env file
# (Windows) type nul > .env
# (Mac/Linux) touch .env
```

### Step 2: Add API keys to `.env`

Copy the required API keys from the sections below into your `.env` file.

### Step 3: Restart development server

After adding API keys, restart your development server:

```bash
npm run dev
```

---

## 🚀 Vercel Deployment Setup

### Step 1: Go to Vercel Dashboard

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Aether project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add each environment variable from the [Environment Variables Reference](#environment-variables-reference) section.

### Step 3: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

---

## 🔑 API Keys by Integration

### Gemini AI

**Purpose:** AI-powered code generation and responses

**Required Environment Variables:**
```bash
GEMINI_API_KEYS=your_gemini_api_key_here
# Alternative single key format
GEMINI_API_KEY=your_gemini_api_key_here
```

**How to Get API Key:**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select or create a Google Cloud project
5. Copy the API key
6. Add to your environment variables

**Where to Add:**
- Local: `.env` file
- Vercel: Settings → Environment Variables → Add Variable
- Name: `GEMINI_API_KEYS`
- Value: Your API key

**Testing:**
```bash
# Test locally
curl -X POST http://localhost:5173/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello"}'

# Test on Vercel
curl -X POST https://your-app.vercel.app/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello"}'
```

---

### OpenAI (DALL-E Image Generation)

**Purpose:** AI-powered image generation for design assets

**Required Environment Variables:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**How to Get API Key:**

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in with your OpenAI account
3. Click **"Create new secret key"**
4. Give your key a name (e.g., "Aether Image Generation")
5. Copy the API key (you won't see it again!)
6. Add to your environment variables

**Where to Add:**
- Local: `.env` file
- Vercel: Settings → Environment Variables → Add Variable
- Name: `OPENAI_API_KEY`
- Value: Your API key

**Fallback (No API Key Required):**
If you don't have an OpenAI API key, Aether will automatically fall back to **Pollinations AI**, a free image generation service that requires no API key. The fallback happens automatically and provides good quality images without any setup.

**Testing:**
```bash
# Test image generation
curl -X POST http://localhost:5173/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A futuristic city at sunset", "size": "1024x1024"}'

# Test on Vercel
curl -X POST https://your-app.vercel.app/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A futuristic city at sunset", "size": "1024x1024"}'
```

**Usage in Chat:**
Simply type "generate an image [your description]" in the chat, and Aether will automatically generate and display the image. For example:
- "Generate an image of a modern office workspace"
- "Create a picture showing a mountain landscape at dawn"
- "Make a visual representation of a futuristic city"

The system will automatically use OpenAI DALL-E if you have an API key configured, or fall back to Pollinations AI if you don't. You'll be notified which provider was used in the chat response.

---

### Supabase

**Purpose:** Backend-as-a-service with PostgreSQL database, auth, and storage

**Required Environment Variables:**
```bash
SUPABASE_API_KEY=your_supabase_anon_key
SUPABASE_PROJECT_ID=your_supabase_project_id
SUPABASE_URL=your_supabase_project_url
```

**How to Get API Keys:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign up or log in
3. Click **"New Project"**
4. Enter project details and create project
5. Go to **Settings** → **API**
6. Copy the following:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public** key → `SUPABASE_API_KEY`
   - **Project Reference ID** → `SUPABASE_PROJECT_ID`

**Where to Add:**
- Local: `.env` file
- Vercel: Settings → Environment Variables → Add Variable (add all three)

**Testing:**
```bash
# Test connection via Backend Integration Dialog in editor
# Or test API directly
curl -X POST http://localhost:5173/api/backend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "supabase",
    "name": "Test Supabase",
    "config": {
      "apiKey": "your_key",
      "projectId": "your_project_id"
    }
  }'
```

---

### Firebase

**Purpose:** Google's backend-as-a-service platform

**Required Environment Variables:**
```bash
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_DATABASE_URL=your_firebase_database_url
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
```

**How to Get API Keys:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Follow setup wizard
4. Go to **Project Settings** (gear icon)
5. Scroll to **"Your apps"** section
6. Click **Web icon (</>)**
7. Register app and copy configuration
8. Extract the following values:
   - `apiKey` → `FIREBASE_API_KEY`
   - `authDomain` → `FIREBASE_AUTH_DOMAIN`
   - `projectId` → `FIREBASE_PROJECT_ID`
   - `storageBucket` → `FIREBASE_STORAGE_BUCKET`

**Where to Add:**
- Local: `.env` file
- Vercel: Settings → Environment Variables → Add Variable (add all five)

**Testing:**
```bash
# Test connection via Backend Integration Dialog in editor
curl -X POST http://localhost:5173/api/backend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "firebase",
    "name": "Test Firebase",
    "config": {
      "apiKey": "your_key",
      "projectId": "your_project_id",
      "authDomain": "your_project.firebaseapp.com"
    }
  }'
```

---

### Figma

**Purpose:** Design-to-app workflow - import Figma designs as code

**Required Environment Variables:**
```bash
FIGMA_ACCESS_TOKEN=your_figma_access_token
FIGMA_TEAM_ID=your_figma_team_id  # Optional
```

**How to Get API Token:**

1. Go to [Figma](https://www.figma.com/) and log in
2. Click your profile picture → **Settings**
3. Scroll to **"Personal Access Tokens"**
4. Click **"Generate new token"**
5. Enter a token name (e.g., "Aether Integration")
6. Set expiration (recommended: 90 days)
7. Click **"Generate token"**
8. Copy the token immediately (you won't see it again!)

**Where to Add:**
- Local: `.env` file
- Vercel: Settings → Environment Variables → Add Variable
- Name: `FIGMA_ACCESS_TOKEN`
- Value: Your access token

**Testing:**
```bash
# Test token validation
curl -X GET "http://localhost:5173/api/figma?action=validate-token"

# Test on Vercel
curl -X GET "https://your-app.vercel.app/api/figma?action=validate-token"
```

**Getting Figma File URL:**
1. Open your Figma design
2. Copy the URL from browser address bar
3. Format: `https://figma.com/file/[file-key]/[file-name]`

---

### PostgreSQL

**Purpose:** Direct PostgreSQL database connection

**Required Environment Variables:**
```bash
POSTGRES_CONNECTION_STRING=postgresql://user:password@host:port/database
```

**How to Get Connection String:**

**Option A: From Cloud Provider (e.g., Railway, Render, Neon)**
1. Create PostgreSQL database
2. Go to database settings
3. Copy the connection string

**Option B: From Local Development**
```bash
# Format: postgresql://username:password@localhost:5432/database_name
POSTGRES_CONNECTION_STRING=postgresql://postgres:password@localhost:5432/mydb
```

**Where to Add:**
- Local: `.env` file
- Vercel: Settings → Environment Variables → Add Variable
- Name: `POSTGRES_CONNECTION_STRING`

**Testing:**
```bash
# Test connection
curl -X POST http://localhost:5173/api/backend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "postgresql",
    "name": "Test PostgreSQL",
    "config": {
      "connectionString": "your_connection_string"
    }
  }'
```

---

### MongoDB

**Purpose:** NoSQL database integration

**Required Environment Variables:**
```bash
MONGODB_CONNECTION_STRING=mongodb+srv://user:password@host/database
```

**How to Get Connection String:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Go to **Database Access** → Create database user
4. Go to **Network Access** → Add IP address (0.0.0.0/0 for all)
5. Click **Connect** → Choose your driver
6. Copy connection string

**Where to Add:**
- Local: `.env` file
- Vercel: Settings → Environment Variables → Add Variable
- Name: `MONGODB_CONNECTION_STRING`

**Testing:**
```bash
# Test connection
curl -X POST http://localhost:5173/api/backend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mongodb",
    "name": "Test MongoDB",
    "config": {
      "connectionString": "your_connection_string"
    }
  }'
```

---

### MySQL

**Purpose:** MySQL database integration

**Required Environment Variables:**
```bash
MYSQL_CONNECTION_STRING=mysql://user:password@host:port/database
```

**How to Get Connection String:**

**From Cloud Provider (e.g., PlanetScale, Railway)**
1. Create MySQL database
2. Copy connection string from dashboard

**From Local Development:**
```bash
# Format: mysql://username:password@localhost:3306/database_name
MYSQL_CONNECTION_STRING=mysql://root:password@localhost:3306/mydb
```

**Where to Add:**
- Local: `.env` file
- Vercel: Settings → Environment Variables → Add Variable
- Name: `MYSQL_CONNECTION_STRING`

**Testing:**
```bash
# Test connection
curl -X POST http://localhost:5173/api/backend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mysql",
    "name": "Test MySQL",
    "config": {
      "connectionString": "your_connection_string"
    }
  }'
```

---

### GitHub

**Purpose:** Community gallery, project sharing, and GitHub integration

**Required Environment Variables:**
```bash
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
```

**How to Get Personal Access Token:**

1. Go to [GitHub Settings](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Enter token name (e.g., "Aether")
4. Select scopes:
   - `repo` (for private repositories)
   - `public_repo` (for public repositories)
   - `read:org` (for organization access)
5. Click **"Generate token"**
6. Copy the token

**How to Get OAuth App Credentials:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** → **"New OAuth App"**
3. Fill in:
   - Application name: "Aether"
   - Homepage URL: `http://localhost:5173` (local) or your Vercel URL
   - Authorization callback URL: Same as homepage
4. Click **"Register application"**
5. Copy **Client ID** and generate **Client Secret**

**Where to Add:**
- Local: `.env` file
- Vercel: Settings → Environment Variables → Add Variable

**Testing:**
```bash
# Test GitHub token
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

---

## 📝 Environment Variables Reference

### Complete `.env` File Template

```bash
# AI Services
GEMINI_API_KEYS=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key

# Backend Services
SUPABASE_API_KEY=your_supabase_api_key
SUPABASE_PROJECT_ID=your_supabase_project_id
SUPABASE_URL=your_supabase_url

FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_DATABASE_URL=your_firebase_database_url
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket

POSTGRES_CONNECTION_STRING=postgresql://user:password@host:port/database
MONGODB_CONNECTION_STRING=mongodb+srv://user:password@host/database
MYSQL_CONNECTION_STRING=mysql://user:password@host:port/database

# Design Tools
FIGMA_ACCESS_TOKEN=your_figma_access_token
FIGMA_TEAM_ID=your_figma_team_id

# GitHub Integration
GITHUB_TOKEN=your_github_token
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# App Configuration
APP_URL=http://localhost:5173
NODE_ENV=development
```

### Vercel Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
GEMINI_API_KEYS
SUPABASE_API_KEY
SUPABASE_PROJECT_ID
SUPABASE_URL
FIREBASE_API_KEY
FIREBASE_PROJECT_ID
FIREBASE_AUTH_DOMAIN
FIGMA_ACCESS_TOKEN
GITHUB_TOKEN
APP_URL (set to your Vercel URL)
```

---

## ✅ Testing Your Configuration

### Test AI Functionality

1. Open Aether in browser
2. Create a new project
3. Send a prompt like "Create a simple todo app"
4. Verify AI responds with generated code

### Test Backend Integration

1. Open the editor
2. Click **Settings** → **Backend Integration**
3. Select backend type (e.g., Supabase)
4. Enter your credentials
5. Click **Connect**
6. Verify connection succeeds

### Test Figma Integration

1. Open the editor
2. Click **Import from Figma**
3. Enter Figma file URL and access token
4. Click **Import Design**
5. Verify design is fetched and code is generated

### Test Interactive Chat

1. Start a new project
2. Enable **Interactive Chat Mode**
3. Answer the AI's questions
4. Verify design options are presented
5. Select a design and verify it's applied

### Test Team Management

1. Click **Team Management** in settings
2. Create a new team
3. Add team members
4. Verify permissions and settings work

---

## 🔧 Troubleshooting

### AI Not Responding

**Problem:** AI returns simulated responses or errors

**Solutions:**
1. Check `GEMINI_API_KEYS` is set correctly
2. Verify API key is valid in [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Check browser console for errors
4. Ensure development server is running: `npm run dev`

### Backend Connection Failed

**Problem:** Cannot connect to backend service

**Solutions:**
1. Verify connection string is correct
2. Check IP whitelist settings (for cloud databases)
3. Ensure database user has correct permissions
4. Test connection string with database client tool

### Figma Import Failed

**Problem:** Cannot import from Figma

**Solutions:**
1. Verify `FIGMA_ACCESS_TOKEN` is set
2. Check token hasn't expired
3. Ensure Figma file is shared publicly or with your account
4. Verify Figma file URL format is correct

### Environment Variables Not Loading

**Problem:** Environment variables not being read

**Solutions:**
1. Restart development server after adding `.env`
2. On Vercel, redeploy after adding environment variables
3. Check for typos in variable names
4. Verify `.env` file is in project root

### API Endpoints Not Working

**Problem:** API endpoints return 404 or errors

**Solutions:**
1. Ensure API files are in `api/` directory
2. Check `vercel.json` configuration
3. Verify API file exports default handler function
4. Check server logs for errors

---

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different API keys** for development and production
3. **Rotate API keys** regularly (every 90 days recommended)
4. **Limit API key permissions** to only what's needed
5. **Monitor API usage** to detect unauthorized access
6. **Use IP whitelisting** where possible
7. **Enable audit logging** for enterprise deployments

---

## 🆘 Need Help?

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review browser console for error messages
3. Check server logs: `npm run dev` output
4. Verify all required environment variables are set
5. Test API keys directly with provider's API console
6. Check [ENTERPRISE_FEATURES.md](./ENTERPRISE_FEATURES.md) for detailed architecture info

---

**Last Updated:** April 2026  
**Version:** 1.0.0
