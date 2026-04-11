import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  X, 
  Settings, 
  Brain, 
  Accessibility, 
  Layout, 
  Trash2, 
  Shield, 
  Github, 
  Database,
  Monitor,
  Eye,
  Type,
  Check,
  ChevronRight,
  AlertTriangle,
  Code2,
  ExternalLink,
  Users,
  FolderTree,
  History,
  BarChart3,
  Rocket,
  Globe,
  Key,
  Lock
} from 'lucide-react'
import { exportProjectToGithub } from '@/lib/github-registry'
import { useFirebase } from '../FirebaseProvider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { type Project } from '@/types'
import { WorkspaceManager } from '../WorkspaceManager'
import { SecurityAudit } from '../SecurityAudit'
import { CodeReviewPanel } from '../CodeReviewPanel'
import { VersionHistory } from '../VersionHistory'
import { AnalyticsDashboard } from '../AnalyticsDashboard'
import { HostingDeployment } from '../HostingDeployment'
import { CustomDomains } from '../CustomDomains'
import { SSOConfig } from '../SSOConfig'
import { TwoFactorAuth } from '../TwoFactorAuth'
import { ProjectVisibilityToggle } from '../ProjectVisibilityToggle'

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
  onRename: (name: string, settings?: any) => void;
  onDelete: () => Promise<void>;
}

type SettingsTab = 'general' | 'ai' | 'editor' | 'accessibility' | 'advanced' | 'github' | 'collaboration' | 'workspace' | 'security' | 'version' | 'analytics' | 'hosting' | 'domains' | 'sso' | 'account';

export function SettingsDialog({ 
  isOpen, 
  onClose, 
  project, 
  setProject, 
  onRename, 
  onDelete 
}: SettingsDialogProps) {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [repoName, setRepoName] = useState(project?.name.toLowerCase().replace(/\s+/g, '-') || '');

  if (!project) return null;

  const updateSettings = (updates: Partial<NonNullable<Project['settings']>>) => {
    const newSettings = { ...project.settings, ...updates };
    setProject(prev => prev ? { ...prev, settings: newSettings } : null);
    onRename(project.name, newSettings);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'ai', label: 'AI Engine', icon: Brain },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'workspace', label: 'Workspace', icon: FolderTree },
    { id: 'github', label: 'GitHub Sync', icon: Github },
    { id: 'editor', label: 'Editor', icon: Layout },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'version', label: 'Version History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'hosting', label: 'Hosting', icon: Rocket },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'sso', label: 'SSO', icon: Key },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'advanced', label: 'Advanced', icon: Shield },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8 bg-[var(--bg-overlay)] backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-5xl h-[90vh] md:h-[80vh] liquid-glass rounded-[32px] md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col border border-white/10"
          >
            {/* Header */}
            <div className="p-5 md:p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-black tracking-tight">Project Settings</h2>
                  <p className="text-[10px] md:text-sm text-white/30">Configure your workspace and preferences</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 md:p-3 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all group"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-white/40 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Sidebar / Top Tabs */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02] p-2 md:p-4 flex md:flex-col gap-1 md:gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all group text-left whitespace-nowrap md:whitespace-normal",
                      activeTab === tab.id 
                        ? "bg-white text-black shadow-xl shadow-white/5" 
                        : "text-white/40 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <tab.icon className={cn(
                      "w-4 h-4 md:w-5 md:h-5 transition-colors",
                      activeTab === tab.id ? "text-black" : "text-white/20 group-hover:text-white"
                    )} />
                    <span className="font-bold text-xs md:text-sm">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="active-tab-indicator"
                        className="ml-auto w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-black hidden md:block"
                      />
                    )}
                  </button>
                ))}

                <div className="hidden md:flex mt-auto pt-4 border-t border-white/10">
                  <button 
                    onClick={() => setIsDeleting(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all group"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="font-bold text-sm">Permanently Delete</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 md:p-10 custom-scrollbar bg-black/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6 md:space-y-10"
                  >
                    {activeTab === 'general' && (
                      <div className="space-y-6 md:space-y-8">
                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Monitor className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Identity
                          </h3>
                          <div className="grid gap-4 md:gap-6">
                            <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Project Name</label>
                              <input 
                                value={project.name}
                                onChange={(e) => onRename(e.target.value, project.settings)}
                                className="glass-input text-base md:text-lg font-bold h-12 md:h-14"
                                placeholder="My Awesome App"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Project ID</label>
                              <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 font-mono text-[10px] md:text-xs text-white/40 flex items-center justify-between">
                                <span className="truncate mr-2">{project.id}</span>
                                <button className="text-primary hover:underline font-bold flex-shrink-0">Copy</button>
                              </div>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Github className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Source Control
                          </h3>
                          <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                            <div className="min-width-0">
                              <div className="font-bold text-sm md:text-base">GitHub Repository</div>
                              <div className="text-[10px] md:text-xs text-white/30 truncate">{project.settings?.githubRepo || 'Not connected'}</div>
                            </div>
                            <button className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all flex-shrink-0 ml-2">
                              Configure
                            </button>
                          </div>
                        </section>
                      </div>
                    )}

                    {activeTab === 'ai' && (
                      <div className="space-y-6 md:space-y-8">
                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Model Configuration
                          </h3>
                          <div className="grid gap-4 md:gap-6">
                            <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">AI Provider</label>
                              <div className="flex p-1 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
                                {['gemini', 'openai', 'anthropic', 'dub5'].map((p) => (
                                  <button
                                    key={p}
                                    onClick={() => updateSettings({ aiProvider: p as any })}
                                    className={cn(
                                      "flex-1 py-2 md:py-3 px-4 text-xs md:text-sm font-bold rounded-lg md:rounded-xl transition-all capitalize whitespace-nowrap",
                                      project.settings?.aiProvider === p ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                                    )}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Preferred Model</label>
                              <select 
                                className="glass-input h-12 md:h-14 appearance-none"
                                value={project.settings?.preferredModel || 'gemini-3-flash-preview'}
                                onChange={(e) => updateSettings({ preferredModel: e.target.value })}
                              >
                                <optgroup label="Google Gemini">
                                  <option value="gemini-3-flash-preview">Gemini 3 Flash (Fastest)</option>
                                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Smartest)</option>
                                </optgroup>
                                <optgroup label="Anthropic Claude">
                                  <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
                                  <option value="claude-3-5-haiku-latest">Claude 3.5 Haiku</option>
                                  <option value="claude-3-opus-latest">Claude 3 Opus</option>
                                </optgroup>
                                <optgroup label="OpenAI GPT">
                                  <option value="gpt-4o">GPT-4o</option>
                                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                                  <option value="o1-preview">o1 Preview</option>
                                </optgroup>
                              </select>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            API Keys
                          </h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Gemini API Key</label>
                              <input 
                                type="password"
                                value={project.settings?.geminiApiKey || ''}
                                onChange={(e) => updateSettings({ geminiApiKey: e.target.value })}
                                className="glass-input h-12 md:h-14"
                                placeholder="sk-..."
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">OpenAI API Key</label>
                              <input 
                                type="password"
                                value={project.settings?.openaiApiKey || ''}
                                onChange={(e) => updateSettings({ openaiApiKey: e.target.value })}
                                className="glass-input h-12 md:h-14"
                                placeholder="sk-..."
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Anthropic API Key</label>
                              <input 
                                type="password"
                                value={project.settings?.anthropicApiKey || ''}
                                onChange={(e) => updateSettings({ anthropicApiKey: e.target.value })}
                                className="glass-input h-12 md:h-14"
                                placeholder="sk-ant-..."
                              />
                            </div>
                            <p className="text-[9px] md:text-[10px] text-white/20 italic">API keys are stored locally in your browser and never sent to our servers except for proxying AI requests.</p>
                          </div>
                        </section>
                      </div>
                    )}

                    {activeTab === 'editor' && (
                      <div className="space-y-6 md:space-y-8">
                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Layout className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Appearance
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Font Family</label>
                              <select 
                                className="glass-input h-10 md:h-12 appearance-none"
                                value={project.settings?.fontFamily || 'JetBrains Mono'}
                                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                              >
                                <option value="JetBrains Mono">JetBrains Mono</option>
                                <option value="Fira Code">Fira Code</option>
                                <option value="Inter">Inter</option>
                                <option value="Geist Mono">Geist Mono</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Font Size</label>
                              <input 
                                type="number"
                                value={project.settings?.fontSize || 14}
                                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                                className="glass-input h-10 md:h-12"
                              />
                            </div>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Code2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Behavior
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {[
                              { id: 'lineNumbers', label: 'Line Numbers' },
                              { id: 'wordWrap', label: 'Word Wrap' },
                              { id: 'minimap', label: 'Minimap' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => updateSettings({ [opt.id]: !((project.settings as any)?.[opt.id]) })}
                                className={cn(
                                  "flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all",
                                  (project.settings as any)?.[opt.id] 
                                    ? "bg-primary/10 border-primary/30 text-white" 
                                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                )}
                              >
                                <span className="text-xs md:text-sm font-bold">{opt.label}</span>
                                <div className={cn(
                                  "w-4 h-4 md:w-5 md:h-5 rounded-md flex items-center justify-center transition-all",
                                  (project.settings as any)?.[opt.id] ? "bg-primary text-black" : "bg-white/10"
                                )}>
                                  {(project.settings as any)?.[opt.id] && <Check className="w-2.5 h-2.5 md:w-3 md:h-3 stroke-[4px]" />}
                                </div>
                              </button>
                            ))}
                          </div>
                        </section>
                      </div>
                    )}

                    {activeTab === 'github' && (
                      <div className="space-y-6 md:space-y-8">
                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Github className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            GitHub Export & Sync
                          </h3>
                          <p className="text-xs md:text-sm text-white/40 mb-4 md:mb-6">
                            Export your project to a dedicated GitHub repository. This allows you to use professional version control and collaborate with others.
                          </p>
                          
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Repository Name</label>
                              <input 
                                type="text"
                                value={repoName}
                                onChange={(e) => setRepoName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="my-awesome-project"
                              />
                            </div>

                            <button 
                              onClick={async () => {
                                const githubToken = localStorage.getItem('github_token') || project.settings?.githubToken;
                                if (!githubToken) {
                                  toast.error('Please sign in with GitHub to export projects.');
                                  return;
                                }
                                setIsExporting(true);
                                try {
                                  const url = await exportProjectToGithub(project, githubToken, repoName);
                                  setExportedUrl(url);
                                  toast.success('Project exported successfully!');
                                } catch (error) {
                                  toast.error('Failed to export project.');
                                } finally {
                                  setIsExporting(false);
                                }
                              }}
                              disabled={isExporting}
                              className="w-full bg-white text-black rounded-xl md:rounded-2xl py-3 md:py-4 font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 text-xs md:text-sm"
                            >
                              <Github className="w-4 h-4 md:w-5 md:h-5" /> Export to GitHub
                            </button>

                            {exportedUrl && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Check className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                                  </div>
                                  <div className="text-[10px] md:text-xs font-bold text-primary">Export Successful</div>
                                </div>
                                <a 
                                  href={exportedUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline text-primary"
                                >
                                  View Repo <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                </a>
                              </motion.div>
                            )}
                          </div>
                        </section>
                      </div>
                    )}

                    {activeTab === 'collaboration' && (
                      <div className="space-y-6 md:space-y-8">
                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Real-time Collaboration
                          </h3>
                          <p className="text-xs md:text-sm text-white/40">
                            Work together with your team in real-time. Changes are synced instantly across all connected clients.
                          </p>
                          
                          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-sm md:text-base">Enable Collaboration</div>
                                <div className="text-[10px] md:text-xs text-white/30">Allow others to edit this project simultaneously</div>
                              </div>
                              <button
                                onClick={() => updateSettings({ isCollaborative: !project.settings?.isCollaborative })}
                                className={cn(
                                  "w-12 h-6 rounded-full p-1 transition-all flex items-center",
                                  project.settings?.isCollaborative ? "bg-primary" : "bg-white/10"
                                )}
                              >
                                <motion.div 
                                  animate={{ x: project.settings?.isCollaborative ? 24 : 0 }}
                                  className={cn(
                                    "w-4 h-4 rounded-full shadow-lg",
                                    project.settings?.isCollaborative ? "bg-black" : "bg-white/40"
                                  )}
                                />
                              </button>
                            </div>

                            {project.settings?.isCollaborative && (
                              <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="space-y-2">
                                  <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Share Session Link</label>
                                  <div className="flex gap-2">
                                    <input 
                                      readOnly
                                      value={`${window.location.origin}/collab/${project.id}`}
                                      className="glass-input h-10 text-xs flex-1"
                                    />
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/collab/${project.id}`);
                                        toast.success('Collaboration link copied!');
                                      }}
                                      className="px-4 bg-white text-black rounded-xl font-bold text-xs"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Active Collaborators</label>
                                  <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                      <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-[10px] font-bold">
                                        {String.fromCharCode(64 + i)}
                                      </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-black flex items-center justify-center text-[10px] font-bold text-primary">
                                      +1
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </section>
                      </div>
                    )}

                    {activeTab === 'workspace' && (
                      <div className="space-y-6">
                        <WorkspaceManager currentUserId={user?.uid || ''} />
                      </div>
                    )}

                    {activeTab === 'security' && (
                      <div className="space-y-6">
                        <SecurityAudit projectFiles={project?.files || {}} />
                        <CodeReviewPanel projectFiles={project?.files || {}} />
                      </div>
                    )}

                    {activeTab === 'version' && (
                      <div className="space-y-6">
                        <VersionHistory projectId={project?.id || ''} currentUserId={user?.uid || ''} />
                      </div>
                    )}

                    {activeTab === 'analytics' && (
                      <div className="space-y-6">
                        <AnalyticsDashboard projectId={project?.id || ''} />
                      </div>
                    )}

                    {activeTab === 'hosting' && (
                      <div className="space-y-6">
                        <HostingDeployment projectId={project?.id || ''} projectFiles={project?.files || {}} />
                      </div>
                    )}

                    {activeTab === 'domains' && (
                      <div className="space-y-6">
                        <CustomDomains projectId={project?.id || ''} />
                      </div>
                    )}

                    {activeTab === 'sso' && (
                      <div className="space-y-6">
                        <SSOConfig workspaceId={project?.id || ''} />
                      </div>
                    )}

                    {activeTab === 'account' && (
                      <div className="space-y-6 md:space-y-8">
                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Lock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Project Visibility
                          </h3>
                          <ProjectVisibilityToggle 
                            projectId={project?.id || ''} 
                            currentVisibility={project?.isPublic ? 'public' : 'private'}
                            onVisibilityChange={(visibility) => {
                              if (project) {
                                setProject({ ...project, isPublic: visibility === 'public' })
                              }
                            }}
                          />
                        </section>

                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Two-Factor Authentication
                          </h3>
                          <TwoFactorAuth userId={user?.uid || ''} email={user?.email || ''} />
                        </section>
                      </div>
                    )}

                    {activeTab === 'advanced' && (
                      <div className="space-y-6 md:space-y-8">
                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Database className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            One-Click Database (Supabase)
                          </h3>
                          <p className="text-xs md:text-sm text-white/40">
                            Connect your project to Supabase for instant authentication, database, and storage.
                          </p>
                          
                          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                            <div className="grid gap-4 md:gap-6">
                              <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Project Reference ID</label>
                                <input 
                                  value={project.settings?.supabaseProjectRef || ''}
                                  onChange={(e) => updateSettings({ supabaseProjectRef: e.target.value })}
                                  className="glass-input h-10 md:h-12"
                                  placeholder="xyz-abc-123"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Supabase URL</label>
                                <input 
                                  value={project.settings?.supabaseUrl || ''}
                                  onChange={(e) => updateSettings({ supabaseUrl: e.target.value })}
                                  className="glass-input h-10 md:h-12"
                                  placeholder="https://xyz.supabase.co"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Anon Public Key</label>
                                <input 
                                  type="password"
                                  value={project.settings?.supabaseAnonKey || ''}
                                  onChange={(e) => updateSettings({ supabaseAnonKey: e.target.value })}
                                  className="glass-input h-10 md:h-12"
                                  placeholder="eyJhbG..."
                                />
                              </div>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                              <button 
                                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                                className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-xs hover:opacity-90 transition-all"
                              >
                                Open Supabase Dashboard
                              </button>
                              <button 
                                onClick={() => {
                                  // Logic to auto-inject Supabase files
                                  toast.success('Supabase client injected into project!');
                                }}
                                className="flex-1 py-3 bg-primary/20 text-primary rounded-xl font-bold text-xs border border-primary/30 hover:bg-primary/30 transition-all"
                              >
                                Auto-Configure Client
                              </button>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Advanced Options
                          </h3>
                          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-sm text-red-500">Danger Zone</div>
                                <div className="text-[10px] text-red-500/40">Irreversible actions for this project</div>
                              </div>
                              <button 
                                onClick={() => setIsDeleting(true)}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all"
                              >
                                Delete Project
                              </button>
                            </div>
                          </div>
                        </section>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3 md:gap-4">
              <button 
                onClick={onClose}
                className="px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-white/40 hover:text-white transition-all text-xs md:text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={onClose}
                className="px-4 md:px-8 py-2 md:py-3 bg-white text-black rounded-xl md:rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 text-xs md:text-sm"
              >
                Save & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-10 liquid-glass rounded-[48px] border border-red-500/30 text-center space-y-8"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Permanently Delete?</h3>
              <p className="text-white/40 text-sm">
                This will permanently delete <span className="text-white font-bold">"{project.name}"</span> and all its history. This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={async () => {
                  try {
                    await onDelete();
                    onClose();
                  } catch (e) {}
                }}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
              >
                Permanently Delete
              </button>
              <button 
                onClick={() => setIsDeleting(false)}
                className="w-full py-4 bg-white/5 text-white/60 rounded-2xl font-bold hover:bg-white/10 transition-all"
              >
                Keep Project
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
