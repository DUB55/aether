# Aether (ALOV) - AI-Powered Web App Builder

A Next.js-based platform for building web applications with AI assistance using DUB5 AI.

## Features

- 🤖 **AI-Powered Code Generation** - Real-time code generation with DUB5 AI
- 👁️ **Live Preview** - Instant preview with device responsive testing
- 📁 **File Management** - Create, edit, and delete files with Monaco editor
- 🚀 **GitHub Integration** - Push code directly to GitHub repositories
- 📦 **Project Export** - Download projects as ZIP files
- 🗄️ **Supabase Integration** - Database connection testing
- 📚 **Knowledge Base** - Store and manage project documentation
- 🎨 **Modern UI** - Clean, professional interface with dark mode support

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Animations**: Framer Motion
- **Editor**: Monaco Editor
- **AI**: DUB5 AI (Free, no API key required)

## Project Structure

```
alov/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   └── hooks/            # Custom React hooks
├── components/           # Shared components (liquid-glass)
├── public/               # Static assets
├── docs/                 # Documentation
└── .kiro/                # Kiro specs and settings
```

## Documentation

See the [`docs/`](docs/) directory for detailed documentation:

- [Getting Started](docs/guides/START_HERE.md)
- [Implementation Status](docs/implementation/IMPLEMENTATION_COMPLETE.md)
- [Latest Fixes](docs/fixes/FIXES_ACTUALLY_APPLIED.md)
- [Production Status](docs/PRODUCTION_READY_STATUS.md)

## Key Features

### AI Code Generation
- Real-time streaming responses
- File creation and modification via BEGIN_FILE/END_FILE directives
- Chat history and context management
- Suggestion chips for common tasks

### GitHub Integration
- Push all project files to GitHub
- Automatic file creation and updates
- Personal access token authentication
- UTF-8 encoding support

### Project Management
- Create and manage multiple projects
- File tree navigation
- Monaco editor with syntax highlighting
- Real-time preview with error detection

### Deployment (OAuth Setup Required)
- Vercel deployment (requires OAuth configuration)
- Netlify deployment (requires OAuth configuration)
- Manual deployment via ZIP download

## Environment Variables

For deployment features, add these to `.env.local`:

```env
NEXT_PUBLIC_VERCEL_CLIENT_ID=your_vercel_client_id
NEXT_PUBLIC_NETLIFY_CLIENT_ID=your_netlify_client_id
```

## Development

```bash
# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check
```

## Production Ready

✅ Core features fully functional
✅ Real GitHub integration
✅ Project export working
✅ AI code generation operational
✅ No fake success messages
✅ Proper error handling

## Contributing

This is a personal project, but suggestions and feedback are welcome.

## License

MIT

## Credits

Built with ❤️ using Next.js, TypeScript, and DUB5 AI.
