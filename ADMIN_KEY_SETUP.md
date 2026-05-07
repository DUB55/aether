# Admin API Key Setup for Vercel

This guide shows you how to set up your admin API key for email sending functionality in Vercel.

## 🚀 Quick Setup

### Method 1: Using the Setup Script (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Run the setup script**:
   ```bash
   npm run setup:admin-key
   ```

4. **Follow the prompts**:
   - Choose to generate a new key or enter your own
   - The script will automatically set it in Vercel

### Method 2: Manual Setup

1. **Generate a secure admin API key**:
   ```bash
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   
   # Or use any random string generator
   ```

2. **Set the environment variable in Vercel**:
   ```bash
   vercel env add ADMIN_API_KEY
   ```

3. **Choose the environment**:
   - `production` (for live site)
   - `preview` (for preview deployments)
   - `development` (for local development)

4. **Enter your admin API key** when prompted

## 🔐 Using Your Admin API Key

Once set up, you can:

### Send Emails to All Subscribers
```bash
curl -X POST https://your-domain.vercel.app/api/email \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sendToAll": true,
    "subject": "New Feature Release!",
    "html": "<h1>Check out our new features</h1>",
    "text": "Check out our new features"
  }'
```

### Get Subscriber Count
```bash
curl -X GET https://your-domain.vercel.app/api/email \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

### Access Admin Interface
Visit: `https://your-domain.vercel.app/admin/email`

## 🛠️ Environment Variables

The script sets up these environment variables:

- `ADMIN_API_KEY` - Your secret admin API key for authentication

## 📋 Troubleshooting

### "Command not found: vercel"
```bash
npm i -g vercel
```

### "Not logged in"
```bash
vercel login
```

### Environment variable not working
- Wait a few minutes for Vercel to propagate the change
- Redeploy your application
- Check the variable is set correctly: `vercel env ls`

### Lost your admin API key?
1. Generate a new one
2. Update it in Vercel: `vercel env add ADMIN_API_KEY`
3. Update your local `.env` file if needed

## 🔒 Security Tips

- Use a long, random string (32+ characters)
- Don't commit your admin API key to git
- Store it securely (password manager, etc.)
- Rotate it periodically if needed
- Never share it publicly

## 📞 Support

If you have issues:
1. Check Vercel CLI is installed and you're logged in
2. Verify you have the correct Vercel project permissions
3. Ensure the environment variable name is exactly `ADMIN_API_KEY`
