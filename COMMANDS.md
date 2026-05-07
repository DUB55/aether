# Aether AI IDE - Complete Commands Reference

## 🚀 Development Commands

### Web Application
```bash
# Start web development server
npm run dev

# Build web application for production
npm run build

# Preview production build
npm run preview

# Clean build artifacts
npm run clean

# Run TypeScript type checking
npm run lint

# Setup admin environment variables
npm run setup:admin-key
```

### Desktop Application (Tauri)
```bash
# Start desktop app in development mode
npm run tauri:dev

# Build desktop application for production
npm run tauri:build

# Build desktop app with verbose output
npm run tauri build -- --verbose

# Clean Tauri build cache
cd src-tauri && cargo clean

# Run Tauri commands directly
npx tauri dev
npx tauri build
```

## 📦 Build & Distribution Commands

### Production Build
```bash
# Build both web and desktop applications
npm run build
npm run tauri:build

# Build with specific target (Windows)
npm run tauri build -- --target x86_64-pc-windows-msvc

# Build with custom configuration
npm run tauri build -- --config-path ./src-tauri/tauri.conf.json
```

### Installer Creation
```bash
# Create application chunks for installer
node scripts/create-chunks.js

# Generate icons for desktop app
node scripts/generate-icons.cjs

# Build NSIS installer (Windows)
# Requires NSIS to be installed
makensis installer/aether-installer.nsi

# Create release package
npm run release
```

## 🧪 Testing Commands

### Web Application Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Watch mode for tests
npm run test:watch
```

### Desktop Application Testing
```bash
# Test desktop app in development
npm run tauri:dev

# Test build process
npm run tauri:build

# Test installer
node installer/bootstrap-installer.html

# Validate installer chunks
node scripts/validate-chunks.js
```

## 🔧 Development Tools

### Code Quality
```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check

# Fix linting issues
npm run lint:fix

# Check for vulnerabilities
npm audit
npm audit fix
```

### Environment Setup
```bash
# Install dependencies
npm install

# Install development dependencies
npm install --dev

# Update dependencies
npm update

# Clean node modules
npm run clean
rm -rf node_modules package-lock.json
npm install
```

## 🖥️ Platform-Specific Commands

### Windows
```bash
# Build for Windows
npm run tauri build -- --target x86_64-pc-windows-msvc

# Build Windows installer
npm run tauri build -- --target x86_64-pc-windows-msvc --bundles msi

# Run on Windows
npm run tauri dev

# Clean Windows build
cd src-tauri && cargo clean && npm run build
```

### macOS
```bash
# Build for macOS
npm run tauri build -- --target x86_64-apple-darwin

# Build macOS app bundle
npm run tauri build -- --target x86_64-apple-darwin --bundles app

# Run on macOS
npm run tauri dev

# Notarize macOS app (requires Apple Developer account)
npm run tauri notarize
```

### Linux
```bash
# Build for Linux
npm run tauri build -- --target x86_64-unknown-linux-gnu

# Build Debian package
npm run tauri build -- --target x86_64-unknown-linux-gnu --bundles deb

# Run on Linux
npm run tauri dev

# Install Linux dependencies
sudo apt-get update
sudo apt-get install libwebkit2gtk-4.0-37 \
  libappindicator3-1 \
  librsvg2-4 \
  libayatana-appindicator3-1
```

## 📊 Performance & Analysis

### Build Analysis
```bash
# Analyze bundle size
npm run analyze

# Check bundle composition
npm run build:analyze

# Performance testing
npm run test:performance

# Memory profiling
npm run profile:memory
```

### Debugging
```bash
# Debug web app
npm run dev:debug

# Debug desktop app
npm run tauri:dev -- --debug

# Rust debugging
cd src-tauri && cargo build --features debug

# Enable verbose logging
RUST_LOG=debug npm run tauri:dev
```

## 🔄 CI/CD Commands

### GitHub Actions
```bash
# Local testing of CI pipeline
npm run ci:test

# Build artifacts for release
npm run ci:build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Release Management
```bash
# Create release candidate
npm run release:rc

# Create full release
npm run release

# Patch release
npm run release:patch

# Major release
npm run release:major
```

## 🛠️ Troubleshooting Commands

### Common Issues
```bash
# Clear all caches
npm run clean-all
rm -rf node_modules
rm -rf src-tauri/target
npm install

# Reset Tauri configuration
npm run tauri:reset

# Check system requirements
npm run check:system

# Validate configuration
npm run validate:config
```

### Port Conflicts
```bash
# Find available port
npx portfinder

# Kill processes on specific port
npx kill-port 3000
npx kill-port 8080

# Check what's running on ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080
```

### Build Issues
```bash
# Check Rust toolchain
rustc --version
cargo --version

# Update Tauri CLI
npm install -g @tauri-apps/cli@latest

# Rebuild from scratch
cd src-tauri
cargo clean
cargo build --release
```

## 📱 Mobile Development (Future)

### React Native (Planned)
```bash
# Initialize React Native (future)
npx react-native init AetherAI

# Run on iOS (future)
npm run ios

# Run on Android (future)
npm run android

# Build for mobile (future)
npm run build:mobile
```

## 🔐 Security Commands

### Code Signing
```bash
# Sign Windows executable
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com /tr SHA256 target/release/app.exe

# Notarize macOS app (future)
npm run tauri notarize

# Verify signatures
npm run verify:signatures
```

### Security Scanning
```bash
# Scan for vulnerabilities
npm audit

# Run security tests
npm run test:security

# Check dependencies
npm ci
```

## 🎯 Quick Start Workflow

### First Time Setup
```bash
# 1. Clone and install
git clone <repository>
cd aether-ai
npm install

# 2. Start development
npm run dev                    # Web app
npm run tauri:dev              # Desktop app

# 3. Build for production
npm run build                  # Web app
npm run tauri:build            # Desktop app

# 4. Create installer
node scripts/create-chunks.js
```

### Daily Development
```bash
# Start development server
npm run tauri:dev

# Run tests
npm test

# Check code quality
npm run lint
npm run type-check

# Build and test
npm run build
npm run tauri:build
```

### Release Process
```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Build applications
npm run build
npm run tauri:build

# 3. Create installer
node scripts/create-chunks.js

# 4. Test installer
node installer/bootstrap-installer.html

# 5. Deploy
npm run deploy:production
```

## 📚 Additional Resources

### Documentation
```bash
# Generate documentation
npm run docs:generate

# Serve documentation locally
npm run docs:serve

# Build API docs
npm run docs:api
```

### Monitoring
```bash
# Start monitoring
npm run monitor

# Check application health
npm run health:check

# Performance monitoring
npm run monitor:performance
```

---

## 🚨 Important Notes

1. **Port Configuration**: Desktop app uses port 8080 by default to avoid conflicts with other web apps
2. **Bundle Identifier**: Changed from `com.tauri.dev` to `com.aether.ai.ide` for uniqueness
3. **Icon Updates**: Icons are automatically generated from the Aether logo
4. **Build Cache**: Clean build cache if you encounter unexpected build issues
5. **Installer**: Bootstrap installer downloads main application in 10MB chunks

## 🔗 Related Files

- `package.json` - Web app dependencies and scripts
- `src-tauri/tauri.conf.json` - Desktop app configuration
- `src-tauri/Cargo.toml` - Rust dependencies
- `installer/` - Installer components and scripts
- `scripts/` - Build and utility scripts
