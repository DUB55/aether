# Environment Variables for Vercel Deployment

## Required Environment Variables

For AI functionality to work on the deployed Vercel app, you need to configure these environment variables in your Vercel dashboard:

### Gemini API (Primary)
```
GEMINI_API_KEYS=your_gemini_api_key_here
```

### Optional: Additional AI Providers
```
GROQ_API_KEYS=your_groq_api_key_here
OPENROUTER_API_KEYS=your_openrouter_api_key_here
CEREBRAS_API_KEYS=your_cerebras_api_key_here
MISTRAL_API_KEYS=your_mistral_api_key_here
```

### Other Variables
```
GITHUB_CLIENT_ID=your_github_client_id
APP_URL=https://your-app-name.vercel.app
```

## Setup Instructions

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the required variables above
5. Redeploy your application

## Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to `GEMINI_API_KEYS` environment variable

## Testing

After deployment, test AI functionality by:
1. Opening the app
2. Creating a new project
3. Sending a prompt like "Create a simple todo app"
4. The AI should respond with actual generated code
