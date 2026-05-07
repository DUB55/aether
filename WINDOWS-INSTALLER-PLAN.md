# Custom Windows Installer Plan for Aether AI IDE

## 📍 Current Desktop App Location

**Development Build**: `C:\Users\Mohammed\Downloads\aether-ai (5)\src-tauri\target\debug\app.exe`
- Size: ~19MB
- This is the debug version for development

**Production Build Location**: `C:\Users\Mohammed\Downloads\aether-ai (5)\src-tauri\target\release\app.exe` (after running `npm run tauri:build`)

## 🎯 Custom Installer Strategy

### Phase 1: Small Bootstrap Installer (~2MB)
- **Purpose**: Download manager and initial setup
- **Features**:
  - Modern UI with Aether branding
  - Progress indicator for download
  - System requirements check
  - Download chunk management
  - Integrity verification
  - Silent installation option

### Phase 2: Main Application Package (~50-100MB)
- **Components**:
  - Aether AI IDE executable
  - Runtime dependencies
  - Default configuration
  - Required system libraries
  - Uninstaller

### Phase 3: Chunked Download System
- **Chunk Size**: 10MB chunks for reliable downloads
- **Features**:
  - Resume capability
  - Parallel downloads
  - Integrity checks per chunk
  - Fallback servers
  - Bandwidth optimization

## 🛠️ Implementation Plan

### 1. Bootstrap Installer (NSIS/Inno Setup)
```nsis
; Example NSIS script structure
Name "Aether AI IDE"
OutFile "AetherAI-Setup.exe"
InstallDir "$PROGRAMFILES\Aether AI"

Section "MainSection" SEC01
  ; Download main application
  Call DownloadApplication
  ; Install application
  Call InstallApplication
SectionEnd
```

### 2. Download Manager Component
```typescript
interface DownloadChunk {
  id: string;
  url: string;
  checksum: string;
  size: number;
}

class DownloadManager {
  async downloadApplication(): Promise<void>
  async verifyChunk(chunk: DownloadChunk): Promise<boolean>
  async resumeDownload(): Promise<void>
}
```

### 3. Server Infrastructure
- **CDN**: Store application chunks on multiple CDNs
- **API**: Endpoint for chunk metadata and download URLs
- **Fallback**: Multiple download sources for reliability

### 4. Update System
- **Auto-updater**: Built-in update mechanism
- **Delta Updates**: Only download changed components
- **Rollback**: Ability to revert to previous version

## 📦 File Structure

### Bootstrap Installer Contents
```
AetherAI-Setup.exe (2MB)
├── Download Manager
├── UI Components
├── Configuration
└── System Check
```

### Download Server Structure
```
https://releases.aether-ai.com/v1.0.0/
├── chunks/
│   ├── chunk-001.bin (10MB)
│   ├── chunk-002.bin (10MB)
│   └── ...
├── metadata.json
├── checksums.sha256
└── version.json
```

## 🔧 Technical Implementation

### 1. Build Configuration
```json
// src-tauri/tauri.conf.json
{
  "bundle": {
    "targets": ["msi"],
    "windows": {
      "certificateThumbprint": "...",
      "timestampUrl": "http://timestamp.digicert.com",
      "wix": {
        "language": "en-US"
      }
    }
  }
}
```

### 2. Download Service
```typescript
// services/download-service.ts
export class DownloadService {
  private readonly CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
  
  async getManifest(version: string): Promise<DownloadManifest> {
    const response = await fetch(`https://releases.aether-ai.com/${version}/metadata.json`);
    return response.json();
  }
  
  async downloadChunk(chunk: DownloadChunk): Promise<ArrayBuffer> {
    const response = await fetch(chunk.url);
    return response.arrayBuffer();
  }
}
```

### 3. Installation Process
```typescript
// services/install-service.ts
export class InstallService {
  async installApplication(chunks: DownloadChunk[]): Promise<void> {
    const installPath = path.join(process.env.PROGRAMFILES, 'Aether AI');
    
    // Create installation directory
    await fs.ensureDir(installPath);
    
    // Download and assemble chunks
    for (const chunk of chunks) {
      const data = await this.downloadChunk(chunk);
      await this.verifyChunk(chunk, data);
      await this.writeChunk(installPath, chunk.id, data);
    }
    
    // Create shortcuts
    await this.createShortcuts(installPath);
    
    // Register for auto-updates
    await this.setupAutoUpdate(installPath);
  }
}
```

## 🚀 Deployment Strategy

### 1. Release Pipeline
```yaml
# GitHub Actions workflow
name: Build and Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Application
        run: npm run tauri:build
      - name: Create Chunks
        run: npm run create-chunks
      - name: Upload to CDN
        run: npm run upload-release
```

### 2. Version Management
- **Semantic Versioning**: v1.0.0, v1.0.1, etc.
- **Release Channels**: Stable, Beta, Dev
- **Auto-update**: Check for updates on startup

### 3. Security Features
- **Code Signing**: Digital signatures for all executables
- **Checksum Verification**: SHA-256 verification for downloads
- **HTTPS**: All communications over HTTPS
- **Certificate Pinning**: Prevent MITM attacks

## 📋 Implementation Checklist

### Phase 1: Bootstrap Installer
- [ ] Create NSIS/Inno Setup script
- [ ] Design modern UI
- [ ] Implement download manager
- [ ] Add system requirements check
- [ ] Test on clean Windows system

### Phase 2: Download Infrastructure
- [ ] Set up CDN storage
- [ ] Create chunking utility
- [ ] Implement metadata API
- [ ] Add multiple download sources
- [ ] Test resume functionality

### Phase 3: Installation System
- [ ] Create installation service
- [ ] Implement shortcut creation
- [ ] Add uninstaller
- [ ] Setup auto-update mechanism
- [ ] Test installation/uninstallation

### Phase 4: Security & Distribution
- [ ] Obtain code signing certificate
- [ ] Implement checksum verification
- [ ] Setup release pipeline
- [ ] Create download page
- [ ] Test distribution

## 🎯 Benefits of This Approach

### For Users
- **Fast Initial Download**: Small bootstrap installer
- **Reliable Downloads**: Resume capability and multiple sources
- **Automatic Updates**: Built-in update mechanism
- **Clean Installation**: Proper Windows integration

### For Developers
- **Reduced Bandwidth**: Only download changed components
- **Easy Updates**: Delta updates possible
- **Analytics**: Download statistics and error tracking
- **Security**: Code signing and verification

### For Distribution
- **Flexible Hosting**: Can use any CDN or file hosting
- **Global Reach**: Multiple download sources
- **Scalability**: Chunked downloads handle many users
- **Cost Effective**: Only serve what users need

## 🚀 Next Steps

1. **Immediate**: Set up basic NSIS installer
2. **Week 1**: Implement download manager
3. **Week 2**: Create chunking system
4. **Week 3**: Setup CDN infrastructure
5. **Week 4**: Test and refine installation process
6. **Month 2**: Add auto-update and security features
7. **Month 3**: Full production deployment

This approach provides a professional, reliable installation experience while keeping the initial download small and ensuring reliable delivery of the main application.
