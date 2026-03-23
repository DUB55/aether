# Phase 2: Cognitive AI Architecture

**Objective:** Transform the AI from a code generator into a proactive "Senior Engineer" that understands context, self-corrects, and reasons about the entire project.

## 2.1 Context-Aware Orchestrator
- [x] **Project Graph:** Build a dependency graph to understand file relationships.
- [x] **Smart Retrieval:** Implement RAG-lite to fetch only relevant context (dependency-based).
- [x] **Memory:** Maintain a session-long memory of decisions and user preferences.

## 2.2 Self-Correction Loop
- [x] **Pre-Flight Check:** Run linter on generated code before saving.
- [x] **Runtime Verification:** Capture preview errors and feed back to Fixer Agent.
- [x] **Test Generation:** Auto-generate unit tests for critical paths.

## 2.3 "Thinking" UI
- [ ] **Status Stream:** "Reading file...", "Analyzing dependencies...", "Verifying fix...".
- [ ] **Confidence Score:** Show how confident the AI is in its solution.
