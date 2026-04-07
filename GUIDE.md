# Aether: User & Developer Guide

Welcome to Aether. This guide provides comprehensive instructions on how to run, use, modify, and improve the platform.

---

## 1. How to Run

### Prerequisites
- **Node.js**: Version 18 or higher.
- **npm**: Version 9 or higher.

### Installation
1. **Clone the Project**:
   ```bash
   git clone <your-repo-url>
   cd aether
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env` file in the root directory and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_key
   VITE_OPENAI_API_KEY=your_openai_key
   VITE_ANTHROPIC_API_KEY=your_anthropic_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

### Running the Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## 2. How to Use

### Starting a New Project
1. **The Marketplace**: Click the **Rocket Icon** in the top bar to explore templates.
2. **AI Chat**: Use the chat panel on the left to describe what you want to build.
3. **File Management**: Use the sidebar on the left to navigate and manage your project files.

### Configuring AI Models
1. Open **Settings** (Gear Icon).
2. Go to the **AI** tab.
3. Select your preferred provider (Google, OpenAI, or Anthropic).
4. Select the specific model (e.g., GPT-4o, Claude 3.5 Sonnet).
5. Ensure your API keys are saved in the **Keys** tab.

### Using the Preview
- **Live Updates**: Changes are applied instantly as the AI generates code.
- **Device Toggles**: Use the icons above the preview to switch between **Desktop**, **Tablet**, and **Mobile** views.
- **Inspect Mode**: Click the **Search Icon** in the preview header, then click any element in the preview to select it for editing.

### Collaboration
1. Open **Settings** -> **Collaboration**.
2. Toggle **Collaborative Mode** to ON.
3. Copy the **Invite Link** and share it with others.

---

## 3. How to Modify

### Project Structure
- `/src/components`: Contains all UI components (Editor, Preview, Chat, etc.).
- `/src/lib`: Core logic for AI streaming, GitHub integration, and Firebase sync.
- `/src/types.ts`: Global TypeScript definitions.
- `/src/index.css`: Global styles and Tailwind configuration.

### Customizing the AI Personality
To change how the AI behaves or what libraries it favors, modify the `personality` string in `/src/components/editor/Editor.tsx`.

### Adding New UI Components
We use **shadcn/ui**. To add a new component:
1. Use the terminal: `npx shadcn-ui@latest add <component-name>`
2. Import it from `@/components/ui/<component-name>`.

---

## 4. How to Improve

### Performance Optimization
- **Code Splitting**: Use React's `lazy` and `Suspense` for large components like the Code Editor.
- **Memoization**: Use `useMemo` and `useCallback` in the File Tree and Preview components to prevent unnecessary re-renders during AI generation.

### Feature Ideas
- **Voice-to-Code**: Integrate a speech-to-text API for hands-free prompting.
- **Plugin System**: Allow users to create and share custom AI agents or UI themes.
- **Advanced Debugging**: Add a built-in debugger that can automatically fix runtime errors using the AI.

### Contributing
1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request with a detailed description of your changes.
