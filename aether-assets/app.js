import { APP_CONFIG } from './config.js';
import {
  createEncryptedSharePayload,
  createQuickLink,
  createViewerUrls,
  unpackEncryptedShare,
  unpackQuickLink,
} from './share-crypto.js';

function refreshIcons() {
  try { window.lucide?.createIcons(); } catch (e) { console.error(e); }
}

function escapeHTML(v) {
  return (v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/**
 * CopyButton - A reusable button component with instant visual feedback
 * Provides clipboard copy functionality with state management
 * States: idle (default), success (checkmark), error (error indicator)
 * Auto-resets to idle state after 2 seconds
 */
class CopyButton {
  constructor(targetElementId, buttonElement) {
    this.targetElementId = targetElementId;
    this.buttonElement = buttonElement;
    this.state = 'idle';
    this.timeoutId = null;
    this.originalHTML = buttonElement.innerHTML;
    
    // Bind click handler
    this.buttonElement.addEventListener('click', () => this.copy());
  }

  /**
   * Copy text to clipboard with fallback support
   * Returns a promise that resolves on success or rejects on failure
   */
  async copy() {
      // Get the text to copy
      const targetElement = document.getElementById(this.targetElementId);
      if (!targetElement) {
        this.showError();
        return;
      }

      const text = targetElement.value || targetElement.textContent || '';
      if (!text) {
        this.showError();
        return;
      }

      try {
        // Try modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          this.showSuccess();
        } else {
          // Fallback for older browsers
          this.copyFallback(text);
        }
      } catch (error) {
        // Check if error is due to permissions policy or security restrictions
        if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
          console.warn('Clipboard API blocked, using fallback:', error.message);
          this.copyFallback(text);
        } else {
          console.warn('Copy failed, trying fallback:', error);
          // Try fallback as last resort
          this.copyFallback(text);
        }
      }
    }


  /**
   * Fallback copy method using execCommand
   * Used when Clipboard API is not available
   */
  copyFallback(text) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (success) {
        this.showSuccess();
      } else {
        this.showError();
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
      this.showError();
    }
  }

  /**
   * Show success state with checkmark icon
   * Auto-resets to idle after 2 seconds
   */
  showSuccess() {
    this.clearTimeout();
    this.state = 'success';
    this.buttonElement.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    this.buttonElement.style.color = '#10b981'; // Green color for success
    this.timeoutId = setTimeout(() => this.reset(), 2000);
  }

  /**
   * Show error state with error indicator
   * Auto-resets to idle after 2 seconds
   */
  showError() {
    this.clearTimeout();
    this.state = 'error';
    this.buttonElement.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    this.buttonElement.style.color = '#ef4444'; // Red color for error
    this.timeoutId = setTimeout(() => this.reset(), 2000);
  }

  /**
   * Reset to idle state with original icon
   */
  reset() {
    this.clearTimeout();
    this.state = 'idle';
    this.buttonElement.innerHTML = this.originalHTML;
    this.buttonElement.style.color = '';
  }

  /**
   * Clear any pending timeout
   */
  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * SettingsPanel - A modal component for managing user preferences
 * Provides a settings dialog with link mode toggle and persistence
 * Features: link mode selection (safe/quick), localStorage persistence
 */
class SettingsPanel {
  constructor() {
    this.isVisible = false;
    this.settings = {
      linkMode: 'safe' // Default to 'safe'
    };
  }

  /**
   * Load settings from localStorage
   * Returns the loaded settings or defaults if unavailable
   */
  loadSettings() {
    try {
      const stored = localStorage.getItem('aether-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate settings structure
        if (parsed && typeof parsed === 'object') {
          // Validate linkMode
          if (parsed.linkMode === 'safe' || parsed.linkMode === 'quick') {
            this.settings.linkMode = parsed.linkMode;
          } else {
            console.warn('Invalid linkMode in settings, using default');
            this.settings.linkMode = 'safe';
          }
        } else {
          console.warn('Invalid settings structure, using defaults');
        }
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
      // Fall back to in-memory settings (session-only)
    }
    return this.settings;
  }

  /**
   * Save settings to localStorage
   * @param {Object} settings - Settings object to save
   */
  saveSettings(settings) {
    try {
      // Validate settings before saving
      if (!settings || typeof settings !== 'object') {
        console.error('Invalid settings object');
        return;
      }
      
      // Validate linkMode
      if (settings.linkMode !== 'safe' && settings.linkMode !== 'quick') {
        console.error('Invalid linkMode value');
        return;
      }
      
      this.settings = { ...settings };
      localStorage.setItem('aether-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      // Settings will remain in memory but won't persist
    }
  }

  /**
   * Get current settings
   * @returns {Object} Current settings object
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Open the settings panel
   */
  open() {
    const bg = document.getElementById('settings-panel-bg');
    if (!bg) {
      console.error('SettingsPanel: Modal element not found in DOM');
      return;
    }

    // Load current settings and update UI
    this.loadSettings();
    
    // Update radio buttons to reflect current setting
    const safeRadio = document.getElementById('link-mode-safe');
    const quickRadio = document.getElementById('link-mode-quick');
    
    if (safeRadio && quickRadio) {
      safeRadio.checked = this.settings.linkMode === 'safe';
      quickRadio.checked = this.settings.linkMode === 'quick';
    }

    // Show modal
    bg.classList.add('on');
    this.isVisible = true;

    // Refresh icons
    refreshIcons();
  }

  /**
   * Close the settings panel
   */
  close() {
    const bg = document.getElementById('settings-panel-bg');
    if (bg) {
      bg.classList.remove('on');
    }
    this.isVisible = false;
  }

  /**
   * Handle link mode change
   * @param {string} mode - The selected link mode ('safe' or 'quick')
   */
  setLinkMode(mode) {
    if (mode !== 'safe' && mode !== 'quick') {
      console.error('Invalid link mode:', mode);
      return;
    }
    
    this.settings.linkMode = mode;
    this.saveSettings(this.settings);
  }
}

/**
 * CustomMessagebox - A reusable modal component for displaying messages
 * Provides a clean modal dialog with optional URL field and interactive buttons
 * Features: title, message, optional URL field, copy button, open button
 */
class CustomMessagebox {
  constructor() {
    this.isVisible = false;
    this.copyButton = null;
  }

  /**
   * Show the messagebox with the provided configuration
   * @param {Object} config - Configuration object
   * @param {string} config.title - Modal title
   * @param {string} config.message - Modal message/description
   * @param {string} [config.url] - Optional URL to display
   * @param {boolean} [config.showCopyButton] - Show copy button (default: false)
   * @param {boolean} [config.showOpenButton] - Show open in new tab button (default: false)
   * @param {Function} [config.onClose] - Callback when modal is closed
   */
  show(config) {
    const {
      title = '',
      message = '',
      url = '',
      showCopyButton = false,
      showOpenButton = false,
      onClose = null
    } = config;

    // Get modal elements
    const bg = document.getElementById('custom-messagebox-bg');
    const titleEl = document.getElementById('custom-messagebox-title');
    const messageEl = document.getElementById('custom-messagebox-message');
    const urlRow = document.getElementById('custom-messagebox-url-row');
    const urlInput = document.getElementById('custom-messagebox-url');
    const copyBtn = document.getElementById('custom-messagebox-copy-btn');
    const openBtn = document.getElementById('custom-messagebox-open-btn');
    const closeBtn = document.getElementById('custom-messagebox-close-btn');

    if (!bg) {
      console.error('CustomMessagebox: Modal element not found in DOM');
      return;
    }

    // Set content
    titleEl.textContent = title;
    messageEl.textContent = message;

    // Handle URL field
    if (url) {
      urlInput.value = url;
      urlRow.style.display = 'flex';
    } else {
      urlRow.style.display = 'none';
    }

    // Handle copy button
    if (showCopyButton && url) {
      copyBtn.style.display = 'inline-flex';
      // Initialize CopyButton for the URL field
      if (this.copyButton) {
        this.copyButton.clearTimeout();
      }
      this.copyButton = new CopyButton('custom-messagebox-url', copyBtn);
    } else {
      copyBtn.style.display = 'none';
    }

    // Handle open button
    if (showOpenButton && url) {
      openBtn.style.display = 'inline-flex';
      openBtn.onclick = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
      };
    } else {
      openBtn.style.display = 'none';
    }

    // Handle close button
    closeBtn.onclick = () => {
      this.hide();
      if (onClose) onClose();
    };

    // Show modal
    bg.classList.add('on');
    this.isVisible = true;

    // Refresh icons
    refreshIcons();
  }

  /**
   * Hide the messagebox
   */
  hide() {
    const bg = document.getElementById('custom-messagebox-bg');
    if (bg) {
      bg.classList.remove('on');
    }
    this.isVisible = false;
    
    // Clean up copy button
    if (this.copyButton) {
      this.copyButton.clearTimeout();
      this.copyButton = null;
    }
  }
}

function escapeAttr(v) { return escapeHTML(v).replace(/'/g,'&#39;'); }
function formatTime(v) { return new Date(v).toLocaleString(); }

let projects = JSON.parse(localStorage.getItem('dub5-projects') || '[]');
let currentProjectId = null;
let sessionId = '';
let chatHist = [];
let notes = [];
let files = [];
let snapshots = [];
let activeFile = 'index.html';
let streaming = false;
let ctrl = null;
let currentRunTouchedFiles = [];

function withDefaults(p) {
  return {
    id: p.id,
    name: p.name || 'Untitled project',
    sessionId: p.sessionId || `dub5-${Math.random().toString(36).slice(2,10)}`,
    html: p.html || '',
    files: Array.isArray(p.files) && p.files.length ? p.files : [{ name: 'index.html', content: p.html || '' }],
    chat: Array.isArray(p.chat) ? p.chat : [],
    notes: Array.isArray(p.notes) ? p.notes : [],
    snapshots: Array.isArray(p.snapshots) ? p.snapshots : [],
    updatedAt: p.updatedAt || Date.now(),
    lastOpened: p.lastOpened || Date.now(),
  };
}

projects = projects.map(withDefaults);

function persistProjects() { localStorage.setItem('dub5-projects', JSON.stringify(projects)); }
function updateRunState(label) { /* Removed - UI element hidden */ }
function updateChangeSummary(text) { /* Removed - UI element hidden */ }
function getIndexHTML() { return files.find(f => f.name === 'index.html')?.content || ''; }
function getFileContent(name) { return files.find(f => f.name === name)?.content || ''; }

/**
 * Validates that a file name is properly formatted and exists
 * @param {string} fileName - The file name to validate
 * @returns {object} - { valid: boolean, error: string }
 */
function validateFileName(fileName) {
  const trimmed = (fileName || '').trim();
  
  // Check if empty
  if (!trimmed) {
    return { valid: false, error: 'File name cannot be empty' };
  }
  
  // Check for .html extension
  if (!trimmed.endsWith('.html')) {
    return { valid: false, error: 'Invalid file format. Use .html extension' };
  }
  
  // Check if file exists in files array
  const fileExists = files.some(f => f.name === trimmed);
  if (!fileExists) {
    return { valid: false, error: 'File not found' };
  }
  
  return { valid: true, error: null };
}

// File navigator error state
let fileNavErrorTimeout = null;

/**
 * Displays an error message in the file navigator
 * @param {string} message - The error message to display
 */
function showFileError(message) {
  const errorEl = document.getElementById('file-nav-error');
  if (!errorEl) return;
  
  // Clear any existing timeout
  if (fileNavErrorTimeout) {
    clearTimeout(fileNavErrorTimeout);
    fileNavErrorTimeout = null;
  }
  
  // Display error message
  errorEl.textContent = message;
  
  // Set auto-clear timeout (3 seconds)
  fileNavErrorTimeout = setTimeout(() => {
    clearFileError();
  }, 3000);
}

/**
 * Clears any displayed error message in the file navigator
 */
function clearFileError() {
  const errorEl = document.getElementById('file-nav-error');
  if (!errorEl) return;
  
  // Clear timeout if exists
  if (fileNavErrorTimeout) {
    clearTimeout(fileNavErrorTimeout);
    fileNavErrorTimeout = null;
  }
  
  // Clear error message
  errorEl.textContent = '';
}

/**
 * Loads and displays a file from the files array
 * @param {string} fileName - The name of the file to load
 * @returns {boolean} - true if file loaded successfully, false otherwise
 */
function loadFileByName(fileName) {
  // Trim whitespace
  const trimmed = (fileName || '').trim();
  
  // Default to index.html if empty
  const targetFile = trimmed || 'index.html';
  
  // Validate file name
  const validation = validateFileName(targetFile);
  
  if (!validation.valid) {
    showFileError(validation.error);
    return false;
  }
  
  // Get file content
  const content = getFileContent(targetFile);
  
  // Render preview
  renderPrev(content);
  
  return true;
}

/**
 * Handles file navigation when Enter key is pressed
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleFileNavigation(event) {
  // Check if Enter key was pressed
  if (event.key !== 'Enter') return;
  
  // Get input value
  const input = document.getElementById('file-nav-input');
  if (!input) return;
  
  const fileName = input.value;
  
  // Clear any existing errors
  clearFileError();
  
  // Load the file
  loadFileByName(fileName);
}

function isViewerMode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('mode') === 'viewer';
}

function initViewer() {
  // Add viewer-mode class to body element
  document.body.classList.add('viewer-mode');
  
  // The CSS (added in task 3.1) will handle:
  // - Hiding all editor UI elements (chat, code editor, tabs, toolbars, file tree)
  // - Making preview iframe occupy full viewport
  // - Disabling editor interactions
}

/**
 * Displays an error message in viewer mode
 * @param {string} title - Error title
 * @param {string} message - Error message
 */
function showViewerError(title, message) {
  const errorEl = document.getElementById('viewer-error');
  const titleEl = document.getElementById('viewer-error-title');
  const messageEl = document.getElementById('viewer-error-message');

  if (errorEl && titleEl && messageEl) {
    titleEl.textContent = title;
    messageEl.textContent = message;
    errorEl.classList.add('on');
  }
}


function showPreviewEmpty() {
  document.getElementById('prev-empty').style.display = 'flex';
  document.getElementById('pframe').style.display = 'none';
}
function hidePreviewEmpty() {
  document.getElementById('prev-empty').style.display = 'none';
  document.getElementById('pframe').style.display = 'block';
}
function renderPrev(html) {
  if (!html) { showPreviewEmpty(); return; }
  hidePreviewEmpty();
  // Resolve file references for multi-file projects
  // This handles CSS links, script tags, and other file references
  // Works in both editor mode and viewer mode
  const processedHtml = resolveFileReferences(html);
  document.getElementById('pframe').srcdoc = processedHtml;
}
/**
 * Resolves file references in HTML by converting them to data URLs or inline content
 * Handles CSS links, script tags, and other file references
 * @param {string} html - The HTML content to process
 * @returns {string} HTML with resolved file references
 */
/**
 * Resolves file references in HTML for multi-file projects
 * Converts external file references to inline content or data URLs
 * This ensures that CSS, JavaScript, and other assets work correctly
 * in both editor preview mode and fullscreen viewer mode
 * 
 * @param {string} html - The HTML content to process
 * @returns {string} - The processed HTML with resolved file references
 */
function resolveFileReferences(html) {
  if (!html) return html;

  let processedHtml = html;

  // Process CSS link tags: <link rel="stylesheet" href="style.css">
  processedHtml = processedHtml.replace(
    /<link\s+([^>]*\s)?href=["']([^"']+\.css)["']([^>]*)>/gi,
    (match, before, filename, after) => {
      const file = files.find(f => f.name === filename);
      if (file && file.content) {
        // Inline the CSS as a style tag
        return `<style>${file.content}</style>`;
      }
      return match; // Keep original if file not found
    }
  );

  // Process script tags: <script src="script.js"></script>
  processedHtml = processedHtml.replace(
    /<script\s+([^>]*\s)?src=["']([^"']+\.js)["']([^>]*)><\/script>/gi,
    (match, before, filename, after) => {
      const file = files.find(f => f.name === filename);
      if (file && file.content) {
        // Inline the JavaScript
        const attrs = (before || '') + (after || '');
        return `<script${attrs}>${file.content}</script>`;
      }
      return match; // Keep original if file not found
    }
  );

  // Process other file references (images, etc.) - convert to data URLs
  // This handles: <img src="image.png">, <source src="video.mp4">, etc.
  processedHtml = processedHtml.replace(
    /\b(src|href)=["']([^"':]+\.[a-zA-Z0-9]+)["']/gi,
    (match, attr, filename) => {
      // Skip if it's already a URL (http://, https://, data:, blob:, etc.)
      if (/^(https?:|data:|blob:|\/\/)/i.test(filename)) {
        return match;
      }

      const file = files.find(f => f.name === filename);
      if (file && file.content) {
        // Determine MIME type based on file extension
        const ext = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
          'html': 'text/html',
          'css': 'text/css',
          'js': 'application/javascript',
          'json': 'application/json',
          'txt': 'text/plain',
          'svg': 'image/svg+xml',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'webp': 'image/webp',
        };
        const mimeType = mimeTypes[ext] || 'text/plain';

        // For text-based files, create data URL with base64 encoding
        try {
          const base64Content = btoa(unescape(encodeURIComponent(file.content)));
          return `${attr}="data:${mimeType};base64,${base64Content}"`;
        } catch (e) {
          console.warn(`Failed to encode ${filename}:`, e);
          return match;
        }
      }

      return match; // Keep original if file not found
    }
  );

  return processedHtml;
}


function renderNotes() {
  const box = document.getElementById('hist-list');
  if (!notes.length) { box.textContent = 'No notes yet.'; return; }
  box.innerHTML = notes.map(n => `
    <div style="border-bottom:1px dashed #1f1f1f;padding:8px 0">
      <div style="font-family:var(--mono);font-size:12px;color:#9ca3af">${escapeHTML(n.at)}</div>
      <div style="white-space:pre-wrap;color:#fff;font-size:12.5px;margin-top:4px">${escapeHTML(n.text)}</div>
    </div>`).join('');
}

function renderSnapshots() {
  const box = document.getElementById('snapshot-list');
  if (!snapshots.length) { box.textContent = 'No snapshots yet.'; return; }
  box.innerHTML = snapshots.map((s, i) => `
    <div class="snapshot-item">
      <div class="snapshot-meta">
        <div class="snapshot-title">${escapeHTML(s.label || `Snapshot ${snapshots.length - i}`)}</div>
        <div class="snapshot-sub">${escapeHTML(formatTime(s.at))}</div>
      </div>
      <button class="btn" onclick="restoreSnapshot(${i})">Restore</button>
    </div>`).join('');
}

function saveCurrentProject() {
  if (!currentProjectId) return;
  const idx = projects.findIndex(p => p.id === currentProjectId);
  const project = withDefaults({
    id: currentProjectId,
    name: (document.getElementById('proj-name')?.value || 'Untitled project').trim() || 'Untitled project',
    sessionId,
    html: getIndexHTML(),
    files,
    chat: chatHist,
    notes,
    snapshots,
    updatedAt: Date.now(),
    lastOpened: Date.now(),
  });
  if (idx >= 0) projects[idx] = project;
  else projects.unshift(project);
  persistProjects();
}

function loadProjectIntoEditor(project) {
  currentProjectId = project.id;
  sessionId = project.sessionId;
  chatHist = [...project.chat];
  notes = [...project.notes];
  files = project.files.map(f => ({ ...f }));
  snapshots = [...project.snapshots];
  activeFile = files.find(f => f.name === 'index.html') ? 'index.html' : files[0]?.name || 'index.html';
  document.getElementById('proj-name').value = project.name;
  document.getElementById('code-editor').value = getFileContent(activeFile);
  document.getElementById('editor-info').textContent = activeFile;
  renderChatFromHistory(chatHist);
  renderFileTree();
  renderNotes();
  renderSnapshots();
  renderPrev(getIndexHTML());
  updateRunState('Ready');
  updateChangeSummary('No generation changes yet.');
}

function newProject() {
  sessionStorage.removeItem('dub5-open-project');
  sessionStorage.removeItem('dub5-start-prompt');
  location.href = 'editor.html';
}

function showProjects() {
  saveCurrentProject();
  location.href = 'projects.html';
}

function downloadBlob(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function exportCurrentProject() {
  const p = projects.find(x => x.id === currentProjectId);
  if (!p) return;
  const name = (p.name || 'dub5-project').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-_.]/g,'');
  downloadBlob(`${name}.json`, new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }));
  toast('Project exported');
}

function duplicateCurrentProject() {
  const p = projects.find(x => x.id === currentProjectId);
  if (!p) return;
  const copy = withDefaults({
    ...JSON.parse(JSON.stringify(p)),
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    name: `${p.name} Copy`,
    updatedAt: Date.now(),
    lastOpened: Date.now(),
  });
  projects.unshift(copy);
  persistProjects();
  toast('Project duplicated');
}

async function deleteProject(id) {
  if (!(await confirmBox('Delete this project? This cannot be undone.'))) return;
  projects = projects.filter(x => x.id !== id);
  if (currentProjectId === id) currentProjectId = null;
  persistProjects();
  toast('Deleted');
}

function triggerImport() { document.getElementById('import-project-input').click(); }

function addUserMsg(text) {
  const wrap = document.getElementById('msgs');
  const msg = document.createElement('div');
  msg.className = 'msg user';
  msg.innerHTML = '<div class="bubble"></div>';
  msg.querySelector('.bubble').textContent = text;
  wrap.appendChild(msg);
  wrap.scrollTop = wrap.scrollHeight;
}

function ensureAiMsg() {
  const wrap = document.getElementById('msgs');
  const msg = document.createElement('div');
  msg.className = 'msg ai';
  msg.innerHTML = '<div class="ai-line md"></div>';
  wrap.appendChild(msg);
  wrap.scrollTop = wrap.scrollHeight;
  return msg.querySelector('.ai-line');
}

function addTyping() {
  const wrap = document.getElementById('msgs');
  const node = document.createElement('div');
  node.id = '_typing'; node.className = 'typing';
  node.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  wrap.appendChild(node);
  wrap.scrollTop = wrap.scrollHeight;
}

function rmTyping() { document.getElementById('_typing')?.remove(); }

function addFileStatus(filename) {
  const wrap = document.getElementById('msgs');
  const el = document.createElement('div');
  el.className = 'file-status'; el.dataset.file = filename;
  el.innerHTML = `
    <div class="file-status-left">
      <svg data-lucide="file-code" width="14" height="14"></svg>
      <div class="file-status-name" title="${escapeHTML(filename)}">${escapeHTML(filename)}</div>
    </div>
    <div class="file-status-state"><div class="spinner"></div><span>Writing...</span></div>`;
  el.addEventListener('click', () => { switchTab('code'); openFile(filename); });
  wrap.appendChild(el);
  wrap.scrollTop = wrap.scrollHeight;
  refreshIcons();
  return el;
}

function setFileStatusDone(el) {
  if (!el) return;
  el.querySelector('.file-status-state').innerHTML =
    '<span class="check"><svg data-lucide="check" width="14" height="14"></svg></span><span>Saved</span>';
  refreshIcons();
}

function renderMarkdown(md) {
  if (!md) return '';
  const blocks = [];
  let source = md.replace(/\r\n/g,'\n').replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const i = blocks.length;
    blocks.push({ lang: lang || '', code });
    return `\u0000CODE_${i}\u0000`;
  });
  source = escapeHTML(source).replace(/\u0000CODE_(\d+)\u0000/g, (_, i) => {
    const b = blocks[Number(i)];
    return `<pre><code class="lang-${escapeHTML(b.lang)}">${escapeHTML(b.code)}</code></pre>`;
  });
  const lines = source.split('\n');
  const out = [];
  let inUL = false, inOL = false;
  const closeLists = () => {
    if (inUL) { out.push('</ul>'); inUL = false; }
    if (inOL) { out.push('</ol>'); inOL = false; }
  };
  lines.forEach(line => {
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { closeLists(); out.push(`<h${h[1].length}>${h[2]}</h${h[1].length}>`); return; }
    if (/^\s*[-*+]\s+/.test(line)) {
      if (inOL) { out.push('</ol>'); inOL = false; }
      if (!inUL) { out.push('<ul>'); inUL = true; }
      out.push(`<li>${line.replace(/^\s*[-*+]\s+/,'')}</li>`); return;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      if (inUL) { out.push('</ul>'); inUL = false; }
      if (!inOL) { out.push('<ol>'); inOL = true; }
      out.push(`<li>${line.replace(/^\s*\d+\.\s+/,'')}</li>`); return;
    }
    closeLists();
    if (!line.trim()) return;
    if (line.startsWith('&gt;')) { out.push(`<blockquote>${line.replace(/^&gt;\s?/,'')}</blockquote>`); return; }
    out.push(`<p>${line}</p>`);
  });
  closeLists();
  return out.join('\n')
    .replace(/`([^`\n]+)`/g,'<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,t,u)=>`<a href="${u}" target="_blank" rel="noreferrer noopener">${t}</a>`)
    .replace(/\*\*([^\*\n]+)\*\*/g,'<strong>$1</strong>');
}

function renderChatFromHistory(history) {
  const msgs = document.getElementById('msgs');
  msgs.innerHTML = '';
  history.forEach(e => {
    if (e.role === 'user') addUserMsg(e.content);
    if (e.role === 'assistant') { const el = ensureAiMsg(); el.innerHTML = renderMarkdown(e.content); }
  });
}

function setSendBtn(state) {
  const btn = document.getElementById('send-btn');
  btn.innerHTML = '';
  if (state === 'stop') {
    btn.title = 'Stop';
    btn.insertAdjacentHTML('afterbegin','<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>');
    return;
  }
  btn.title = 'Send';
  btn.insertAdjacentHTML('afterbegin','<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5,12 12,5 19,12"></polyline></svg>');
}

function beginRe() { return /(?:^|\n)\s*(?:---\s*)?BEGIN\s+FILE\s*:\s*([^\n-]+?)\s*(?:---)?\s*(?:\n|$)/i; }
function endRe()   { return /(?:^|\n)\s*(?:---\s*)?END\s+FILE\s*:\s*([^\n-]+?)\s*(?:---)?\s*(?:\n|$)/i; }

function writeFile(name, content, source = 'manual') {
  const safeName = (name || 'index.html').trim() || 'index.html';
  let file = files.find(f => f.name === safeName);
  if (!file) { file = { name: safeName, content: '' }; files.push(file); renderFileTree(); }
  file.content = content ?? '';
  if (activeFile === safeName) {
    const ed = document.getElementById('code-editor');
    if (ed.value !== file.content) ed.value = file.content;
    maybeRenderMd();
  }
  if (safeName === 'index.html') renderPrev(file.content);
  if (source === 'ai' && !currentRunTouchedFiles.includes(safeName)) currentRunTouchedFiles.push(safeName);
  saveCurrentProject();
  toast(`Saved ${safeName}`);
}

function renderFileTree() {
  const tree = document.getElementById('file-tree');
  tree.innerHTML = files.map(f => {
    const isIndex = f.name === 'index.html';
    return `
    <div class="file-row ${f.name === activeFile ? 'active' : ''}" onclick="openFile('${escapeAttr(f.name)}')">
      <div class="file-left">
        <svg data-lucide="${f.name.endsWith('.html') ? 'file-code' : f.name.endsWith('.md') ? 'file-text' : 'file'}"></svg>
        <div class="file-name" title="${escapeHTML(f.name)}">${escapeHTML(f.name)}</div>
      </div>
      <div style="display:flex;gap:4px" onclick="event.stopPropagation()">
        ${isIndex ? '' : `<button class="file-mini" title="Rename" onclick="uiRenameFile('${escapeAttr(f.name)}')"><svg data-lucide="edit-3"></svg></button>
        <button class="file-mini" title="Delete" onclick="uiDeleteFile('${escapeAttr(f.name)}')"><svg data-lucide="trash-2"></svg></button>`}
      </div>
    </div>`;
  }).join('');
  refreshIcons();
}

function openFile(name) {
  if (!files.some(f => f.name === name)) return;
  activeFile = name;
  document.getElementById('editor-info').textContent = name;
  document.getElementById('code-editor').value = getFileContent(name);
  renderFileTree();
  maybeRenderMd();
}

function maybeRenderMd() {
  const isMd = activeFile.toLowerCase().endsWith('.md');
  const preview = document.getElementById('md-preview');
  const editor = document.getElementById('code-editor');
  const toggle = document.getElementById('md-toggle');
  toggle.style.display = isMd ? 'inline-flex' : 'none';
  if (!isMd) { preview.style.display = 'none'; editor.style.display = 'block'; return; }
  if (preview.style.display === 'block') preview.innerHTML = renderMarkdown(getFileContent(activeFile));
}

function toggleMdPreview() {
  const preview = document.getElementById('md-preview');
  const editor = document.getElementById('code-editor');
  if (preview.style.display === 'block') { preview.style.display = 'none'; editor.style.display = 'block'; return; }
  preview.innerHTML = renderMarkdown(getFileContent(activeFile));
  preview.style.display = 'block'; editor.style.display = 'none';
}

function refreshPrev() { renderPrev(getIndexHTML()); }

function openTab() {
  const html = getIndexHTML();
  if (!html) return toast('Nothing to preview');
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function dlHTML() {
  const html = getIndexHTML();
  if (!html) return toast('Nothing to download');
  const name = (document.getElementById('proj-name').value || 'dub5-page').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-_.]/g,'');
  downloadBlob(`${name}.html`, new Blob([html], { type: 'text/html' }));
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(n => n.classList.toggle('active', n.dataset.tab === tab));

  const previewPane = document.getElementById('pane-preview');
  if (previewPane) {
    previewPane.style.display = tab === 'preview' ? 'flex' : 'none';
  }

  const codePane = document.getElementById('pane-code');
  if (codePane) {
    codePane.classList.toggle('on', tab === 'code');
  }

  ['history', 'deploy'].forEach(p => {
    const pane = document.getElementById(`pane-${p}`);
    if (pane) {
      pane.classList.toggle('on', tab === p);
    }
  });

  refreshIcons();
}


function dialog(title, msg, { input = false, okText = 'OK', cancelText = 'Cancel', value = '' } = {}) {
  return new Promise(resolve => {
    const bg = document.getElementById('dialog-bg');
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-msg').textContent = msg;
    const extra = document.getElementById('dialog-extra'); extra.innerHTML = '';
    let inputNode = null;
    if (input) {
      inputNode = document.createElement('input'); inputNode.type = 'text'; inputNode.value = value;
      extra.appendChild(inputNode); setTimeout(() => inputNode.focus(), 10);
    }
    const ok = document.getElementById('dialog-ok');
    const cancel = document.getElementById('dialog-cancel');
    ok.textContent = okText; cancel.textContent = cancelText;
    const close = () => { bg.classList.remove('on'); ok.onclick = null; cancel.onclick = null; };
    ok.onclick = () => { close(); resolve(input ? inputNode.value : true); };
    cancel.onclick = () => { close(); resolve(null); };
    bg.classList.add('on');
  });
}

function infoBox(title, msg) { return dialog(title, msg, { okText: 'OK', cancelText: 'Close' }); }
function confirmBox(msg) { return dialog('Confirm', msg, { okText: 'Yes', cancelText: 'No' }).then(v => v !== null); }
function promptBox(msg, value = '') { return dialog('Input', msg, { input: true, okText: 'Save', cancelText: 'Cancel', value }); }

async function uiNewFile() {
  const name = await promptBox('New file name (e.g. about.html)');
  if (name === null) return;
  const clean = name.trim();
  if (!clean) return toast('Name required');
  if (files.some(f => f.name === clean)) return toast('File exists');
  files.push({ name: clean, content: '' });
  activeFile = clean;
  renderFileTree(); openFile(clean); saveCurrentProject();
}

async function uiRenameFile(oldName) {
  const next = await promptBox('Rename file', oldName);
  if (next === null) return;
  const name = next.trim();
  if (!name || name === oldName) return;
  if (name === 'index.html') return toast('Cannot rename to index.html');
  if (files.some(f => f.name === name)) return toast('File exists');
  const file = files.find(f => f.name === oldName);
  if (!file) return;
  file.name = name;
  if (activeFile === oldName) activeFile = name;
  renderFileTree(); openFile(activeFile); saveCurrentProject();
}

async function uiDeleteFile(name) {
  if (name === 'index.html') return toast('Cannot delete index.html');
  if (!(await confirmBox(`Delete ${name}?`))) return;
  files = files.filter(f => f.name !== name);
  if (activeFile === name) activeFile = 'index.html';
  renderFileTree(); openFile(activeFile); saveCurrentProject();
}

function createSnapshot(label) {
  const html = getIndexHTML();
  if (!html) return toast('Nothing to snapshot yet');
  snapshots.unshift({ at: Date.now(), label: label || `Preview snapshot ${new Date().toLocaleTimeString()}`, html, files: files.map(f => ({ ...f })) });
  snapshots = snapshots.slice(0, 10);
  renderSnapshots(); saveCurrentProject(); toast('Snapshot saved');
}

function restoreSnapshot(index) {
  const s = snapshots[index];
  if (!s) return;
  files = s.files.map(f => ({ ...f }));
  activeFile = files.find(f => f.name === activeFile)?.name || 'index.html';
  renderFileTree(); openFile(activeFile); renderPrev(getIndexHTML());
  saveCurrentProject(); updateChangeSummary(`Restored snapshot from ${formatTime(s.at)}.`); toast('Snapshot restored');
}

function restoreLatestSnapshot() {
  if (!snapshots.length) return toast('No snapshot available');
  restoreSnapshot(0);
}

function addHistoryNote() {
  const ta = document.getElementById('hist-note');
  const text = (ta.value || '').trim();
  if (!text) return;
  notes.unshift({ text, at: new Date().toLocaleString() });
  ta.value = ''; renderNotes(); saveCurrentProject(); toast('Note saved');
}

function clearHistoryNotes() {
  confirmBox('Clear all notes?').then(a => { if (!a) return; notes = []; renderNotes(); saveCurrentProject(); });
}

function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  document.getElementById('toasts').appendChild(el); setTimeout(() => el.remove(), 2400);
}

function copyEl(id) {
  const el = document.getElementById(id);
  if (!el?.value) return toast('Nothing to copy');
  navigator.clipboard.writeText(el.value).then(() => toast('Copied'));
}

function openShare() { document.getElementById('share-bg').classList.add('on'); refreshIcons(); }
function closeShare() { document.getElementById('share-bg').classList.remove('on'); }

async function shareQuickLink() {
  document.getElementById('share-a-url').value = await createQuickLink(files);
  toast('Link ready');
}

async function shareGitHub() {
  const status = v => { document.getElementById('gh-status').textContent = v; };
  try {
    if (/github\.io$/i.test(window.location.hostname) && APP_CONFIG.publishEndpoint.startsWith(window.location.origin)) {
      throw new Error('Set window.AETHER_CONFIG.publishEndpoint to your deployed Vercel proxy before using secure publish from GitHub Pages.');
    }
    status('Packing');
    const { encryptedPayload, keyB64 } = await createEncryptedSharePayload(files);
    const projectId = currentProjectId || `proj-${Date.now()}`;
    status('Publishing');
    const response = await fetch(APP_CONFIG.publishEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, pathHint: `projects/${projectId}.json`, encryptedPayload, message: `DUB5: publish ${projectId}` }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.rawUrl) throw new Error(data.error || `Publish failed (${response.status})`);
    document.getElementById('share-g-url').value = `${location.origin}${location.pathname}?src=${encodeURIComponent(data.rawUrl)}#key=${keyB64}`;
    status('Done'); toast('Secure link ready');
  } catch (error) {
    console.error(error); status('Error');
    await infoBox('Publish failed', error.message || 'Could not publish the project.');
  }
}

async function deployProject() {
  // Get the deploy button from header
  const btn = document.querySelector('[onclick="deployProject()"]');
  if (!btn) {
    console.error('Deploy button not found');
    return;
  }

  // Show loading state on deploy button
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/></svg>';
  btn.style.animation = 'spin 1s linear infinite';

  try {
    // Read link mode from settings
    const settings = window.settingsPanel?.getSettings() || { linkMode: 'safe' };
    const linkMode = settings.linkMode || 'safe';

    let deployUrl = '';

    if (linkMode === 'quick') {
      // Quick link deployment (hash-based, works offline)
      deployUrl = await createQuickLink(files);
    } else {
      // Safe link deployment (encrypted, requires backend)
      if (/github\.io$/i.test(window.location.hostname) && APP_CONFIG.publishEndpoint.startsWith(window.location.origin)) {
        throw new Error('Set window.AETHER_CONFIG.publishEndpoint to your deployed Vercel URL.');
      }

      const { encryptedPayload, keyB64 } = await createEncryptedSharePayload(files);
      const projectId = currentProjectId || `proj-${Date.now()}`;
      
      const response = await fetch(APP_CONFIG.publishEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId, 
          pathHint: `projects/${projectId}.json`, 
          encryptedPayload, 
          message: `DUB5: deploy ${projectId}` 
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.rawUrl) {
        throw new Error(data.error || `Deploy failed (${response.status})`);
      }

      deployUrl = `${location.origin}${location.pathname}?src=${encodeURIComponent(data.rawUrl)}#key=${keyB64}`;
    }

    // Display success messagebox with deployment URL
    window.customMessagebox?.show({
      title: 'Deployment Successful',
      message: 'Your project has been deployed and is ready to share.',
      url: deployUrl,
      showCopyButton: true,
      showOpenButton: true
    });

  } catch (error) {
    console.error('Deployment error:', error);
    
    // Display error messagebox with error details
    window.customMessagebox?.show({
      title: 'Deployment Failed',
      message: error.message || 'An error occurred during deployment. Please try again.',
      showCopyButton: false,
      showOpenButton: false
    });
  } finally {
    // Restore button state
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    btn.style.animation = '';
    refreshIcons();
  }
}

// Copy button instances - initialized on page load
let copyDeployUrlBtn = null;
let copyViewerQuickUrlBtn = null;
let copyViewerSecureUrlBtn = null;

function copyDeployUrl() {
  // This function is now handled by CopyButton component
  // Kept for backward compatibility
  if (!copyDeployUrlBtn) {
    const btn = document.querySelector('[onclick="copyDeployUrl()"]');
    if (btn) {
      copyDeployUrlBtn = new CopyButton('deploy-url', btn);
    }
  }
  if (copyDeployUrlBtn) {
    copyDeployUrlBtn.copy();
  }
}

function copyViewerQuickUrl() {
  // This function is now handled by CopyButton component
  // Kept for backward compatibility
  if (!copyViewerQuickUrlBtn) {
    const btn = document.querySelector('[onclick="copyViewerQuickUrl()"]');
    if (btn) {
      copyViewerQuickUrlBtn = new CopyButton('viewer-quick-url', btn);
    }
  }
  if (copyViewerQuickUrlBtn) {
    copyViewerQuickUrlBtn.copy();
  }
}

function copyViewerSecureUrl() {
  // This function is now handled by CopyButton component
  // Kept for backward compatibility
  if (!copyViewerSecureUrlBtn) {
    const btn = document.querySelector('[onclick="copyViewerSecureUrl()"]');
    if (btn) {
      copyViewerSecureUrlBtn = new CopyButton('viewer-secure-url', btn);
    }
  }
  if (copyViewerSecureUrlBtn) {
    copyViewerSecureUrlBtn.copy();
  }
}


async function generateViewerUrls(githubUrl = null) {
  try {
    // Generate both quick link and secure viewer URLs
    const quickUrls = await createViewerUrls(files);
    const secureUrls = githubUrl ? await createViewerUrls(files, githubUrl) : null;
    
    // Populate quick link viewer URL
    const quickUrlInput = document.getElementById('viewer-quick-url');
    if (quickUrlInput) {
      quickUrlInput.value = quickUrls.viewerUrl;
    }
    
    // Populate secure link viewer URL (if GitHub URL is provided)
    const secureUrlInput = document.getElementById('viewer-secure-url');
    if (secureUrlInput && secureUrls) {
      secureUrlInput.value = secureUrls.viewerUrl;
    }
    
    // Show the viewer URLs card
    const viewerUrlsCard = document.getElementById('viewer-urls-card');
    if (viewerUrlsCard) {
      viewerUrlsCard.style.display = 'block';
    }
  } catch (error) {
    console.error('Failed to generate viewer URLs:', error);
  }
}

async function viewerAuto() {
  const inViewerMode = isViewerMode();

  // Handle quick link format (#v1:...)
  if (location.hash.startsWith('#v1:')) {
    try {
      const pkg = await unpackQuickLink(location.hash.slice(4));
      files = Object.entries(pkg.files).map(([name, content]) => ({ name, content }));
      activeFile = files.find(f => f.name === 'index.html') ? 'index.html' : files[0]?.name || 'index.html';

      if (inViewerMode) {
        // In viewer mode: just render the preview
        renderPrev(getIndexHTML());
      } else {
        // In editor mode: full initialization
        renderFileTree();
        openFile(activeFile);
        renderPrev(getIndexHTML());
        switchTab('preview');
      }
    } catch (e) {
      console.error(e);
      if (inViewerMode) {
        // In viewer mode: show error display
        showViewerError(
          'Unable to Load Preview',
          'Unable to load preview. The URL may be corrupted or incomplete.'
        );
      } else {
        // In editor mode: show toast
        toast('Failed to open quick link');
      }
    }
  }

  // Handle secure link format (?src=...#key=...)
  const search = new URLSearchParams(location.search);
  if (search.has('src') && location.hash.includes('key=')) {
    try {
      const response = await fetch(search.get('src'), { cache: 'no-store' });
      
      // Check for 404 error
      if (response.status === 404) {
        if (inViewerMode) {
          showViewerError(
            'Preview Not Found',
            'Preview not found. The shared resource may have been deleted.'
          );
        } else {
          toast('Shared resource not found');
        }
        return;
      }
      
      // Check for other HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const payload = await response.json();
      
      // Check if key is present in URL
      if (!location.hash.includes('key=')) {
        throw new Error('DECRYPTION_ERROR: Missing encryption key');
      }
      
      const keyB64 = location.hash.split('key=')[1].split('&')[0];
      
      // Check if key is empty
      if (!keyB64 || keyB64.trim() === '') {
        throw new Error('DECRYPTION_ERROR: Empty encryption key');
      }
      
      try {
        const pkg = await unpackEncryptedShare(payload, keyB64);
        files = Object.entries(pkg.files).map(([name, content]) => ({ name, content }));
        activeFile = files.find(f => f.name === 'index.html') ? 'index.html' : files[0]?.name || 'index.html';

        if (inViewerMode) {
          // In viewer mode: just render the preview
          renderPrev(getIndexHTML());
        } else {
          // In editor mode: full initialization
          renderFileTree();
          openFile(activeFile);
          renderPrev(getIndexHTML());
          switchTab('preview');
        }
      } catch (decryptError) {
        // Catch decryption-specific errors
        throw new Error('DECRYPTION_ERROR: ' + decryptError.message);
      }
    } catch (e) {
      console.error(e);
      if (inViewerMode) {
        // Check if this is a decryption error
        if (e.message && e.message.includes('DECRYPTION_ERROR')) {
          showViewerError(
            'Unable to Decrypt Preview',
            'Unable to decrypt preview. The URL may be incomplete or invalid.'
          );
        } else {
          // Generic error for other issues
          showViewerError(
            'Unable to Load Preview',
            'Unable to load preview. The URL may be corrupted or incomplete.'
          );
        }
      } else {
        // In editor mode: show toast
        toast('Failed to open shared link');
      }
    }
  }
}


async function send() {
  const input = document.getElementById('pinput');
  const userText = (input.value || '').trim();
  if (!userText || streaming) return;
  input.value = '';
  addUserMsg(userText);
  chatHist.push({ role: 'user', content: userText });
  saveCurrentProject();
  addTyping();
  currentRunTouchedFiles = [];
  streaming = true;
  ctrl = new AbortController();
  setSendBtn('stop');
  updateRunState('Generating');
  updateChangeSummary('Working on your request...');

  let visibleText = '';
  let aiEl = null;
  let inFile = false;
  let curFile = '';
  let fileBuffer = '';
  let statusEl = null;

  try {
    console.log('Sending AI request to:', APP_CONFIG.aiEndpoint);
    const response = await fetch(APP_CONFIG.aiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: userText,
        personality: 'coder',
        model: 'gpt-4o',
        thinking_mode: 'balanced',
        session_id: sessionId,
        history: chatHist.slice(0,-1).slice(-APP_CONFIG.maxHistoryMessages).map(e => ({ role: e.role, content: e.content })),
      }),
      signal: ctrl.signal,
    });
    if (!response.ok) {
      // Try to get error details from response body
      let errorDetails = '';
      try {
        const errorBody = await response.text();
        errorDetails = errorBody ? ` - ${errorBody}` : '';
        console.error('AI request failed:', {
          status: response.status,
          statusText: response.statusText,
          endpoint: APP_CONFIG.aiEndpoint,
          body: errorBody
        });
      } catch (e) {
        console.error('AI request failed:', {
          status: response.status,
          statusText: response.statusText,
          endpoint: APP_CONFIG.aiEndpoint
        });
      }
      throw new Error(`AI request failed (${response.status})${errorDetails}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let sse = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      sse += decoder.decode(value, { stream: true });
      const events = sse.split('\n\n');
      sse = events.pop() || '';
      for (const event of events) {
        for (const rawLine of event.split('\n')) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          let delta = '';
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'metadata' || parsed.type === 'ping' || parsed.type === 'error') continue;
            delta = parsed.content ?? parsed.choices?.[0]?.delta?.content ?? parsed.text ?? parsed.delta ?? parsed.message ?? '';
          } catch { delta = data; }
          if (!delta) continue;
          let chunk = delta;
          while (chunk.length) {
            if (!inFile) {
              const begin = chunk.match(beginRe());
              if (!begin) { visibleText += chunk; chunk = ''; break; }
              const idx = begin.index ?? 0;
              visibleText += chunk.slice(0, idx);
              curFile = (begin[1] || '').trim() || 'index.html';
              inFile = true; fileBuffer = '';
              statusEl = addFileStatus(curFile);
              chunk = chunk.slice(idx + begin[0].length);
            } else {
              const end = chunk.match(endRe());
              if (!end) { fileBuffer += chunk; chunk = ''; break; }
              const idx = end.index ?? 0;
              fileBuffer += chunk.slice(0, idx);
              writeFile((end[1] || '').trim() || curFile, fileBuffer, 'ai');
              setFileStatusDone(statusEl);
              inFile = false; curFile = ''; fileBuffer = ''; statusEl = null;
              chunk = chunk.slice(idx + end[0].length);
            }
          }
          if (visibleText.trim()) {
            if (!aiEl) { rmTyping(); aiEl = ensureAiMsg(); }
            aiEl.innerHTML = renderMarkdown(visibleText);
          }
        }
      }
    }
    rmTyping();
    chatHist.push({ role: 'assistant', content: visibleText.trim() || '' });
    if (currentRunTouchedFiles.length) {
      updateChangeSummary(`Updated ${currentRunTouchedFiles.join(', ')}.`);
      createSnapshot(`AI run - ${new Date().toLocaleTimeString()}`);
    } else {
      updateChangeSummary('Generation completed without file updates.');
    }
    updateRunState('Ready');
    saveCurrentProject();
  } catch (error) {
    rmTyping();
    if (error.name !== 'AbortError') {
      // Distinguish between network errors and HTTP errors
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      console.error('AI chat error:', {
        message: error.message,
        endpoint: APP_CONFIG.aiEndpoint,
        errorType: isNetworkError ? 'Network Error' : 'HTTP Error',
        error: error
      });
      
      const ai = ensureAiMsg();
      let userMessage = `Warning: ${error.message}`;
      if (isNetworkError) {
        userMessage += '. Please check your network connection and try again.';
      } else {
        userMessage += '. Please try again later or check the console for details.';
      }
      ai.textContent = userMessage;
      chatHist.push({ role: 'assistant', content: userMessage });
      updateRunState('Error'); updateChangeSummary(error.message); saveCurrentProject();
    } else {
      updateRunState('Stopped'); updateChangeSummary('Generation stopped.');
    }
  } finally {
    streaming = false; ctrl = null; setSendBtn('send');
  }
}

function abortStream() { ctrl?.abort(); }
function onSendBtn() { if (streaming) abortStream(); else send(); }

function handleImportChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  file.text().then(t => JSON.parse(t)).then(data => {
    const imported = withDefaults({ ...data, id: `proj-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, name: data.name || file.name.replace(/\.json$/i,''), updatedAt: Date.now(), lastOpened: Date.now() });
    projects.unshift(imported); persistProjects(); toast('Project imported');
  }).catch(e => { console.error(e); infoBox('Import failed', 'That file does not look like a DUB5 project.'); })
  .finally(() => { event.target.value = ''; });
}

function bindEvents() {
  document.getElementById('pinput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  
  // File navigator event listeners
  const fileNavInput = document.getElementById('file-nav-input');
  if (fileNavInput) {
    // Enter key to navigate
    fileNavInput.addEventListener('keydown', handleFileNavigation);
    
    // Clear errors on typing
    fileNavInput.addEventListener('input', clearFileError);
  }
  
  const editor = document.getElementById('code-editor');
  let editTimer = null;
  editor.addEventListener('input', () => { clearTimeout(editTimer); editTimer = setTimeout(() => writeFile(activeFile, editor.value ?? ''), 220); });
  const nameInput = document.getElementById('proj-name');
  let nameTimer = null;
  nameInput.addEventListener('input', () => { clearTimeout(nameTimer); nameTimer = setTimeout(saveCurrentProject, 250); });
  nameInput.addEventListener('blur', saveCurrentProject);
  document.getElementById('import-project-input').addEventListener('change', handleImportChange);
}

// --- Init ---
function initEditor() {
  const openId = sessionStorage.getItem('dub5-open-project');
  let startPrompt = sessionStorage.getItem('dub5-start-prompt');
  sessionStorage.removeItem('dub5-open-project');
  sessionStorage.removeItem('dub5-start-prompt');

  // Check for URL parameter prompt
  const urlParams = new URLSearchParams(window.location.search);
  const urlPrompt = urlParams.get('prompt');
  if (urlPrompt) {
    try {
      startPrompt = decodeURIComponent(urlPrompt);
      // Clear the URL parameter to avoid re-triggering on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Failed to decode URL prompt:', error);
    }
  }

  if (openId) {
    const p = projects.find(x => x.id === openId);
    if (p) { p.lastOpened = Date.now(); persistProjects(); loadProjectIntoEditor(p); switchTab('preview'); return; }
  }

  // New project
  sessionId = `dub5-${Math.random().toString(36).slice(2,10)}`;
  currentProjectId = `proj-${Date.now()}`;
  chatHist = []; notes = []; snapshots = [];
  files = [{ name: 'index.html', content: '' }];
  activeFile = 'index.html';
  document.getElementById('proj-name').value = 'Untitled project';
  document.getElementById('msgs').innerHTML = '';
  document.getElementById('code-editor').value = '';
  document.getElementById('editor-info').textContent = activeFile;
  renderFileTree(); renderNotes(); renderSnapshots(); showPreviewEmpty();
  
  // Initialize file navigator
  const fileNavInput = document.getElementById('file-nav-input');
  if (fileNavInput) {
    fileNavInput.value = '';
  }
  
  saveCurrentProject();
  switchTab('preview');

  if (startPrompt) {
    // Display the user message in chat
    addUserMsg(startPrompt);
    chatHist.push({ role: 'user', content: startPrompt });
    saveCurrentProject();
    
    // Auto-send after a brief delay to ensure UI is ready
    setTimeout(() => {
      send().catch(error => {
        console.error('Auto-send failed:', error);
        const aiEl = ensureAiMsg();
        aiEl.textContent = 'Failed to send message automatically. Please try sending manually.';
      });
    }, 100);
  }
}

Object.assign(window, {
  addHistoryNote, clearHistoryNotes, closeShare, copyEl, copyDeployUrl,
  createSnapshot, deleteProject, deployProject, dlHTML,
  duplicateCurrentProject, exportCurrentProject,
  newProject, onSendBtn, openFile, openShare, openTab,
  refreshPrev, restoreLatestSnapshot, restoreSnapshot, send,
  shareGitHub, shareQuickLink, showProjects,
  switchTab, toggleMdPreview, triggerImport,
  uiDeleteFile, uiNewFile, uiRenameFile,
});

// Initialize CustomMessagebox instance
window.customMessagebox = new CustomMessagebox();

// Initialize SettingsPanel instance
window.settingsPanel = new SettingsPanel();

// Load settings on application initialization
window.settingsPanel.loadSettings();

bindEvents();
setSendBtn('send');
renderNotes();
renderSnapshots();
refreshIcons();

// Check if we're in viewer mode
if (isViewerMode()) {
  // In viewer mode: load data and initialize viewer
  viewerAuto();
  initViewer();
} else {
  // In editor mode: normal initialization
  viewerAuto();
  initEditor();
}
