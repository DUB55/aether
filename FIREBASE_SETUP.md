# Firebase Configuration Instructions

## What You Need to Provide

From your new Firebase project, please provide these values:

### 1. Project Settings
- **Project ID**: Found in Project Settings > General
- **Database ID**: Found in Firestore Database settings (if using Firestore)

### 2. App Configuration (Web App)
- **App ID**: Found in Project Settings > General > Your apps section
- **API Key**: Found in Project Settings > General > Your apps > Web app > Config
- **Auth Domain**: Usually `your-project-id.firebaseapp.com`
- **Storage Bucket**: Usually `your-project-id.firebasestorage.app`
- **Messaging Sender ID**: Found in Project Settings > Cloud Messaging
- **Measurement ID**: Found in Project Settings > Integrations > Google Analytics (if enabled)

## How to Get These Values

### Step 1: Create Web App
1. Go to Firebase Console
2. Select your new project
3. Click the web icon (</>) to add a web app
4. Give it a name (e.g., "Aether")
5. Click "Register app"
6. Copy the `firebaseConfig` object

### Step 2: Enable Services
1. **Authentication**: Build > Authentication > Get Started > Enable Google Sign-in
2. **Firestore**: Build > Firestore Database > Create database
3. **Storage**: Build > Storage > Get Started (optional)

### Step 3: Get Database ID
If using Firestore:
1. Go to Firestore Database
2. Click "Settings" (gear icon)
3. Copy the Database ID

## Example Format
Your config should look like this:
```json
{
  "projectId": "my-new-project-123",
  "appId": "1:123456789:web:abcdef123456",
  "apiKey": "AIzaSyABC123XYZ456",
  "authDomain": "my-new-project-123.firebaseapp.com",
  "firestoreDatabaseId": "my-new-project-123-default-rtdb",
  "storageBucket": "my-new-project-123.firebasestorage.app",
  "messagingSenderId": "123456789",
  "measurementId": "G-ABC123XYZ"
}
```

## After Configuration
1. Replace the placeholder values in `firebase-applet-config.json`
2. Add your development domains to Authentication > Settings > Authorized domains:
   - `localhost`
   - `localhost:3000`
   - `127.0.0.1`
   - `127.0.0.1:3000`
3. Test the login functionality
