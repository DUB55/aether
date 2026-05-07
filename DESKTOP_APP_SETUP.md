# Aether AI Desktop App - Setup & Auto-Update Guide

## 🚀 Build Status: COMPLETED

The Aether AI Desktop app has been successfully built with auto-update functionality.

### 📦 Built Artifacts

**Windows Installers:**
- `src-tauri\target\release\bundle\msi\Aether AI IDE_1.0.0_x64_en-US.msi`
- `src-tauri\target\release\bundle\nsis\Aether AI IDE_1.0.0_x64-setup.exe`

## 🔧 Environment Variables Setup

### Vercel Environment Variables

Add these to your Vercel project settings:

```bash
# Update Server Configuration
AETHER_DESKTOP_VERSION=1.0.0
AETHER_DESKTOP_UPDATE_URL=https://your-cdn-domain.com/releases
AETHER_DESKTOP_UPDATE_SIGNATURE=your-signature-here
```

### Local Development (Optional)

For local testing, add to `.env.local`:

```bash
TAURI_SIGNING_PRIVATE_KEY=your-private-key-here
```

## 🔄 Auto-Update System

### How It Works

1. **Check Frequency**: App checks for updates every 30 minutes
2. **Update Endpoint**: `https://aether-ai.vercel.app/api/update/{{target}}/{{current_version}}`
3. **Update Flow**: 
   - App checks for new version
   - Shows update notification if available
   - User can click "Install Update"
   - App downloads and installs update
   - App restarts with new version

### Update Server API

The update server endpoint (`pages/api/update/[...slug].ts`) handles:
- Version comparison
- Platform-specific update URLs
- Update signatures for security

## 📋 Release Process

### When Creating New Version

1. **Update Version Number**:
   ```json
   // src-tauri/tauri.conf.json
   "version": "1.0.1"
   ```

2. **Update Vercel Environment Variable**:
   ```bash
   AETHER_DESKTOP_VERSION=1.0.1
   ```

3. **Build New Version**:
   ```bash
   npm run tauri build
   ```

4. **Upload Artifacts**:
   - Upload installers to your CDN/storage
   - Update `AETHER_DESKTOP_UPDATE_URL` if needed

5. **Deploy Update Server**:
   ```bash
   vercel --prod
   ```

## 🛡️ Security

### Update Signatures

For production, you should:
1. Generate a private/public key pair
2. Set `TAURI_SIGNING_PRIVATE_KEY` environment variable
3. Update the `pubkey` in `tauri.conf.json`

### Generate Keys (One-time setup)

```bash
# Generate private key
npm run tauri signer generate -w ~/.tauri/myapp.key

# Add to environment
TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/myapp.key)"
```

## 🎯 Features Implemented

### ✅ Auto-Update System
- Periodic update checks (30 minutes)
- Update notifications with install button
- Silent background checking
- Version comparison logic
- Platform-specific update URLs

### ✅ Desktop App Features
- Native window (1200x800, resizable)
- System tray integration
- File system access
- Command execution
- Auto-update UI component

### ✅ Build System
- Production builds for Windows
- MSI and NSIS installers
- Update artifacts generation
- Cross-platform support (configured)

## 🚀 Distribution

### Current Version: 1.0.0

**Download Links:**
- [Windows MSI Installer](path/to/msi)
- [Windows EXE Installer](path/to/exe)

### Installation

1. Download the appropriate installer
2. Run as administrator
3. Follow installation wizard
4. Launch "Aether AI IDE"

## 🔍 Testing Auto-Updates

### Manual Update Check

1. Open the desktop app
2. Look for update notification in bottom-right
3. Click "Install Update" if available

### Simulate New Version

1. Change version in `tauri.conf.json` to higher number
2. Update Vercel environment variable
3. Build and deploy new version
4. Test update flow

## 📞 Support

### Common Issues

**Update Not Showing:**
- Check Vercel environment variables
- Verify update server is deployed
- Check app logs for errors

**Build Fails:**
- Ensure Rust and Cargo are installed
- Check Tauri CLI version
- Verify all dependencies

**Installation Issues:**
- Run as administrator
- Check Windows security settings
- Verify installer integrity

### Logs

Enable debug logging by setting:
```bash
RUST_LOG=debug
```

---

**Status**: ✅ Ready for distribution with auto-update functionality
