# Firebase OAuth Verification Fix Guide

## Issues to Fix:
1. "Website of your home page URL is not registered to you"
2. "Home page URL does not include a link to your privacy policy"

## Solution Steps:

### 1. Replace Your Current aether.html
Use the content from `aether-fixed.html` - it includes:
- Footer with Privacy Policy link
- Hidden verification elements for Firebase
- Meta tags for domain ownership

### 2. Domain Ownership Verification
Since you're using `dub5.zapto.org`, you need to:

**Option A: Use Your Vercel URL (Recommended)**
- Change home page URL to: `https://aether-vert.vercel.app`
- This URL is automatically verified since you own the Vercel project

**Option B: Verify dub5.zapto.org**
- Add Firebase verification meta tag to your HTML
- Upload verification file to your hosting
- Contact zapto.org support if needed

### 3. Privacy Policy Link
The new aether-fixed.html includes:
- Footer with "Privacy Policy" link
- Link points to: `?page=privacy-policy`
- Opens in new tab (target="_blank")

### 4. Update Firebase Console
Go to Firebase Console > Authentication > Settings:
- **Home page URL**: `https://aether-vert.vercel.app` (recommended)
- **Privacy Policy URL**: `https://aether-vert.vercel.app/#/privacy-policy`
- **Terms of Service URL**: `https://aether-vert.vercel.app/#/terms-of-service`

### 5. Alternative: Use Better Domain
Get a free domain and point it to Vercel:
- `aether.ml` (free via Freenom)
- `aether.eu.org` (free forever)
- Then use that as your home page URL

## Quick Fix:
1. Deploy `aether-fixed.html` to dub5.zapto.org/aether.html
2. Update Firebase home page URL to your Vercel URL
3. Re-run verification

This should resolve both issues!
