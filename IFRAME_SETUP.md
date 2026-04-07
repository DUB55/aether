# Iframe Deep Linking Setup Instructions

## 🚀 Quick Setup Guide

### 1. Update Your Vercel URL
Edit `aether-wrapper.html` line 118:
```javascript
this.baseUrl = 'https://your-actual-vercel-app.vercel.app'; // Replace with your Vercel URL
```

### 2. Deploy to GitHub
1. Upload `aether-wrapper.html` to your GitHub repository
2. Make sure it's in the root directory
3. Commit and push to GitHub

### 3. Update dub5.zapto.org
Replace your current `aether.html` with the content from `aether-wrapper.html`

## 📱 Direct URLs Available

After deployment, these URLs will work:

- **Home**: `https://dub5.zapto.org/aether.html?page=home`
- **Projects**: `https://dub5.zapto.org/aether.html?page=projects`
- **Privacy Policy**: `https://dub5.zapto.org/aether.html?page=privacy-policy`
- **Terms of Service**: `https://dub5.zapto.org/aether.html?page=terms-of-service`
- **Templates**: `https://dub5.zapto.org/aether.html?page=templates`
- **Community**: `https://dub5.zapto.org/aether.html?page=community`

## 🔧 Features Included

### ✅ Deep Linking
- URL parameters automatically navigate iframe
- Browser back/forward buttons work
- Direct links to any page

### ✅ URL Synchronization
- Parent URL updates when navigating in iframe
- iframe navigates when parent URL changes
- Navigation highlights active page

### ✅ Professional Design
- Responsive header with navigation
- Beautiful gradient background
- Mobile-friendly layout
- Loading states

### ✅ Advanced Features
- Message passing between parent and iframe
- History API support
- SEO-friendly URLs

## 🎯 OAuth Consent Screen URLs

Use these URLs in your Google Cloud Console:

- **Privacy Policy**: `https://dub5.zapto.org/aether.html?page=privacy-policy`
- **Terms of Service**: `https://dub5.zapto.org/aether.html?page=terms-of-service`

## 📋 Testing Checklist

1. [ ] Update Vercel URL in the wrapper
2. [ ] Deploy to GitHub
3. [ ] Update dub5.zapto.org with new wrapper
4. [ ] Test direct URLs work
5. [ ] Test navigation between pages
6. [ ] Test mobile responsiveness
7. [ ] Update OAuth consent screen with new URLs

## 🔍 How It Works

The wrapper uses:
- **URL Parameters**: `?page=privacy-policy` determines content
- **Route Mapping**: Maps page names to app hash routes
- **History API**: Enables browser navigation
- **PostMessage**: Communication between parent and iframe
- **Dynamic Loading**: Updates iframe src without page reload

This creates a seamless experience where users have direct URLs while your app runs in an iframe.
