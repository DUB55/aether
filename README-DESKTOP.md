# Aether AI IDE - Web & Desktop Application

A powerful AI-powered development environment that works both as a web application and a desktop app using Tauri v2. The desktop version provides enhanced capabilities including local file system access, command execution, and AI tool integration.

## Features

### 🌐 Web App Features
- AI-powered code generation
- Multiple AI model support
- Project management
- Real-time collaboration
- Cloud-based storage

### 🖥️ Desktop App Features (Additional)
- **Local File System Access**: Read, write, and manage files on your local machine
- **Command Execution**: Run terminal commands directly from the AI
- **AI Tool Calling**: Execute JSON-based tool calls for autonomous operations
- **Skills System**: Create and manage custom automation scripts
- **Plan & Execute Mode**: AI explains its plan before executing local commands
- **BYOK (Bring Your Own Key)**: Use personal API keys or shared pool
- **Puter.js Integration**: Free AI models without API keys

## Installation

### Prerequisites
- Node.js 18+ 
- Rust (for desktop app)
- npm or yarn

### Web App Setup
```bash
# Clone the repository
git clone <repository-url>
cd aether-ai

# Install dependencies
npm install

# Start the web app
npm run dev
```

### Desktop App Setup
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri CLI
npm install -g @tauri-apps/cli@latest
cargo install tauri-cli --version ^2.0

# Build and run the desktop app
npm run tauri dev
```

## Usage

### Web App
1. Open `http://localhost:3000` in your browser
2. Create an account or sign in
3. Start a new project by entering your prompt
4. Use the AI to generate and modify code

### Desktop App
1. Run `npm run tauri dev` to start the desktop app
2. The desktop app includes all web features plus:
   - **File Explorer**: Browse and manage local files
   - **Terminal**: Execute commands and see results
   - **Settings**: Configure API keys and execution modes
   - **Skills Manager**: Create custom automation scripts

## AI Tool Calling

The AI can execute local operations through JSON tool calls:

```json
{
  "type": "write_file",
  "params": {
    "path": "src/components/NewComponent.tsx",
    "content": "export function NewComponent() { return <div>Hello World</div>; }"
  }
}
```

### Available Tools
- `write_file(path, content)`: Create or overwrite files
- `read_file(path)`: Read file contents
- `manage_dir(action, path)`: Create, delete, or list directories
- `execute_command(command)`: Run terminal commands
- `get_current_dir()`: Get current working directory
- `set_current_dir(path)`: Change working directory

## Settings Configuration

### API Key Management
1. Open Settings (gear icon)
2. Toggle "Use Personal API Key" to use your own keys
3. Select provider: Google Gemini, OpenAI, or Kimi
4. Enter your API key

### Model Selection
- Choose from provider-specific models
- Use Puter.js for free models (no API key required)
- Models include: GPT-4o, Claude 3, Gemini, Llama, and more

### Execution Modes
- **Fast Mode**: AI executes commands immediately
- **Plan & Execute Mode**: AI explains plan before execution

## Skills System

Create custom automation scripts that the AI can execute:

### Built-in Skills
- **Create React Component**: Generates TypeScript React components
- **Setup Git Repository**: Initializes git and creates initial commit
- **Install Dependencies**: Runs npm install

### Custom Skills
1. Open Skills Manager
2. Click "New Skill"
3. Choose type: JavaScript, Shell, Prompt, or Python
4. Write your automation script
5. Save and execute

### JavaScript Skill Example
```javascript
// Create a new React component
const componentName = args.name || 'NewComponent';
const filePath = `src/components/${componentName}.tsx`;

const componentTemplate = `import React from 'react';

export function ${componentName}() {
  return (
    <div className="p-4">
      <h2>${componentName}</h2>
    </div>
  );
}
`;

await writeFile(filePath, componentTemplate);
console.log(`Created component: ${filePath}`);
```

## Plan & Execute Mode

When enabled, the AI will:
1. Parse its response for tool calls
2. Create a step-by-step execution plan
3. Show you the plan before executing
4. Execute each step with real-time feedback
5. Provide a summary of results

## File Explorer

The desktop app includes a full file explorer with:
- **Navigation**: Browse local directories
- **File Operations**: Create, read, write, delete files
- **Search**: Find files by name
- **Integration**: Click files to open them in the editor

## Terminal

Execute commands directly from the AI:
- **Command Input**: Type commands manually
- **AI Execution**: AI can execute commands through tool calls
- **Output Display**: See stdout, stderr, and exit codes
- **History**: Maintain command history
- **Export**: Download terminal logs

## Development

### Project Structure
```
src/
├── components/
│   ├── FileExplorer.tsx      # Local file browser
│   ├── TerminalOutput.tsx    # Command execution interface
│   ├── SettingsModal.tsx     # API key and model configuration
│   ├── SkillsManager.tsx     # Custom automation scripts
│   ├── PlanExecuteMode.tsx   # AI planning interface
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── tauri-commands.ts     # Tauri IPC interface
│   ├── ai-tools.ts          # AI tool calling logic
│   └── puter-service.ts     # Puter.js integration
└-tauri/
    ├── src/
    │   └── lib.rs           # Rust backend commands
    └── tauri.conf.json      # Tauri configuration
```

### Building for Production

#### Web App
```bash
npm run build
npm run preview
```

#### Desktop App
```bash
npm run tauri build
```

### Adding New Commands

To add new Rust commands:
1. Edit `src-tauri/src/lib.rs`
2. Add new command function with `#[command]` attribute
3. Register in `invoke_handler`
4. Add TypeScript interface in `src/lib/tauri-commands.ts`

Example Rust Command:
```rust
#[command]
async fn my_custom_command(param: String) -> Result<MyResult, String> {
    // Your logic here
    Ok(MyResult { success: true })
}
```

## Security

### Desktop App Security
- File access is limited to user directories
- Commands execute with user permissions
- API keys stored securely (Tauri Stronghold in production)
- Sandboxed execution environment

### Web App Security
- No file system access
- No command execution
- API keys managed server-side
- HTTPS enforced

## Troubleshooting

### Desktop App Issues
- **Rust not found**: Install Rust from https://rustup.rs/
- **Tauri CLI missing**: `npm install -g @tauri-apps/cli@latest`
- **Build fails**: Check Rust and Node.js versions

### AI Tool Issues
- **Commands not executing**: Ensure you're in desktop app
- **File access denied**: Check file permissions
- **API key errors**: Verify key in settings

### Performance
- **Slow startup**: Disable unused features in settings
- **Memory usage**: Clear terminal history and file cache
- **Build size**: Use `npm run build` for optimized builds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both web and desktop versions
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Web App Issues**: Check browser console and network tab
- **Desktop App Issues**: Check Tauri devtools and terminal output
- **AI Issues**: Verify API keys and model availability

---

**Note**: The desktop app provides enhanced capabilities but requires local installation. The web app offers the core AI features without installation.
