import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Users, 
  Share2, 
  ExternalLink, 
  Rocket,
  Copy,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/components/FirebaseProvider';
import { ProjectPreview } from '@/components/ProjectPreview';
import { AetherLogo } from '@/components/aether-logo';
import { CONFIG } from '@/config';
import { toast } from 'sonner';
import { type Project } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CommunityProject extends Project {
  authorName?: string;
  authorPhoto?: string;
}

export const CommunityGallery: React.FC<{ user: any }> = ({ user }) => {
  const { saveProject } = useFirebase();
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('all');
  const [shareProject, setShareProject] = useState<CommunityProject | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch projects from GitHub registry
        const { REPO, PATH, BRANCH } = CONFIG.GITHUB_REGISTRY;
        const [owner, repo] = REPO.split('/');
        
        console.log('[CommunityGallery] Fetching from:', `${owner}/${repo}/${PATH} on ${BRANCH}`);
        
        const contentRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${PATH}?ref=${BRANCH}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        console.log('[CommunityGallery] Response status:', contentRes.status);
        
        if (contentRes.ok) {
          const contentData = await contentRes.json();
          console.log('[CommunityGallery] Content data received:', contentData);
          
          const projectData = JSON.parse(atob(contentData.content));
          console.log('[CommunityGallery] Parsed project data:', projectData);
          
          // Sort by updatedAt descending and limit to 50
          const sortedProjects = projectData
            .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 50);
          
          console.log('[CommunityGallery] Setting projects:', sortedProjects.length, 'projects');
          setProjects(sortedProjects);
        } else if (contentRes.status === 404) {
          console.log('[CommunityGallery] Registry file not found (404), showing sample projects');
          // Show sample projects when registry doesn't exist
          const sampleProjects: CommunityProject[] = [
            {
              id: 'sample-1',
              name: 'Task Manager App',
              description: 'A beautiful task management application with drag-and-drop functionality',
              files: {
                'index.html': `
                  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
                    <div class="max-w-4xl mx-auto">
                      <h1 class="text-4xl font-bold text-gray-800 mb-8">Task Manager</h1>
                      <div class="bg-white rounded-lg shadow-lg p-6">
                        <div class="flex items-center gap-4 mb-6">
                          <input type="text" placeholder="Add a new task..." class="flex-1 px-4 py-2 border rounded-lg">
                          <button class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">Add Task</button>
                        </div>
                        <div class="space-y-2">
                          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <input type="checkbox" class="w-5 h-5">
                            <span class="flex-1">Complete project documentation</span>
                            <button class="text-red-500 hover:text-red-700">Delete</button>
                          </div>
                          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <input type="checkbox" class="w-5 h-5">
                            <span class="flex-1">Review pull requests</span>
                            <button class="text-red-500 hover:text-red-700">Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `
              },
              ownerId: 'sample-user',
              authorName: 'John Doe',
              updatedAt: new Date().toISOString(),
              isPublic: true,
              messages: [],
              createdAt: new Date().toISOString(),
              lastModified: Date.now()
            },
            {
              id: 'sample-2',
              name: 'Weather Dashboard',
              description: 'Real-time weather dashboard with beautiful charts and forecasts',
              files: {
                'index.html': `
                  <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-8">
                    <div class="max-w-6xl mx-auto">
                      <h1 class="text-5xl font-bold text-white mb-8 text-center">Weather Dashboard</h1>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-white">
                          <h3 class="text-2xl font-semibold mb-4">Today</h3>
                          <div class="text-6xl mb-4">72°F</div>
                          <p class="text-lg">Partly Cloudy</p>
                        </div>
                        <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-white">
                          <h3 class="text-2xl font-semibold mb-4">Tomorrow</h3>
                          <div class="text-6xl mb-4">68°F</div>
                          <p class="text-lg">Sunny</p>
                        </div>
                        <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-white">
                          <h3 class="text-2xl font-semibold mb-4">Week</h3>
                          <div class="text-6xl mb-4">65°F</div>
                          <p class="text-lg">Mixed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                `
              },
              ownerId: 'sample-user-2',
              authorName: 'Jane Smith',
              updatedAt: new Date().toISOString(),
              isPublic: true,
              messages: [],
              createdAt: new Date().toISOString(),
              lastModified: Date.now()
            },
            {
              id: 'sample-3',
              name: 'Portfolio Website',
              description: 'Modern portfolio website with smooth animations and responsive design',
              files: {
                'index.html': `
                  <div class="min-h-screen bg-gray-900 text-white">
                    <nav class="px-8 py-6">
                      <div class="max-w-6xl mx-auto flex justify-between items-center">
                        <h2 class="text-2xl font-bold">My Portfolio</h2>
                        <div class="flex gap-6">
                          <a href="#" class="hover:text-blue-400">Home</a>
                          <a href="#" class="hover:text-blue-400">About</a>
                          <a href="#" class="hover:text-blue-400">Projects</a>
                          <a href="#" class="hover:text-blue-400">Contact</a>
                        </div>
                      </div>
                    </nav>
                    <main class="max-w-6xl mx-auto px-8 py-16">
                      <section class="text-center mb-16">
                        <h1 class="text-6xl font-bold mb-4">Hi, I'm Alex</h1>
                        <p class="text-2xl text-gray-400">Full Stack Developer</p>
                      </section>
                      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div class="bg-gray-800 rounded-lg p-6 hover:transform hover:scale-105 transition">
                          <h3 class="text-xl font-semibold mb-2">E-Commerce Platform</h3>
                          <p class="text-gray-400">Modern shopping experience with React</p>
                        </div>
                        <div class="bg-gray-800 rounded-lg p-6 hover:transform hover:scale-105 transition">
                          <h3 class="text-xl font-semibold mb-2">Task Management</h3>
                          <p class="text-gray-400">Collaborative project management tool</p>
                        </div>
                        <div class="bg-gray-800 rounded-lg p-6 hover:transform hover:scale-105 transition">
                          <h3 class="text-xl font-semibold mb-2">Weather App</h3>
                          <p class="text-gray-400">Real-time weather forecasting</p>
                        </div>
                      </section>
                    </main>
                  </div>
                `
              },
              ownerId: 'sample-user-3',
              authorName: 'Alex Johnson',
              updatedAt: new Date().toISOString(),
              isPublic: true,
              messages: [],
              createdAt: new Date().toISOString(),
              lastModified: Date.now()
            }
          ];
          setProjects(sampleProjects);
        } else {
          const errorText = await contentRes.text();
          console.error('[CommunityGallery] Failed to fetch registry:', contentRes.status, errorText);
          throw new Error(`Failed to fetch registry: ${contentRes.statusText}`);
        }
      } catch (error) {
        console.error('[CommunityGallery] Error fetching community projects:', error);
        toast.error('Failed to load community gallery');
        // Show sample projects even on error
        const sampleProjects: CommunityProject[] = [
          {
            id: 'sample-1',
            name: 'Task Manager App',
            description: 'A beautiful task management application with drag-and-drop functionality',
            files: {
              'index.html': `
                <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
                  <div class="max-w-4xl mx-auto">
                    <h1 class="text-4xl font-bold text-gray-800 mb-8">Task Manager</h1>
                    <div class="bg-white rounded-lg shadow-lg p-6">
                      <div class="flex items-center gap-4 mb-6">
                        <input type="text" placeholder="Add a new task..." class="flex-1 px-4 py-2 border rounded-lg">
                        <button class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">Add Task</button>
                      </div>
                      <div class="space-y-2">
                        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input type="checkbox" class="w-5 h-5">
                          <span class="flex-1">Complete project documentation</span>
                          <button class="text-red-500 hover:text-red-700">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `
            },
            ownerId: 'sample-user',
            authorName: 'John Doe',
            updatedAt: new Date().toISOString(),
            isPublic: true,
            messages: [],
            createdAt: new Date().toISOString(),
            lastModified: Date.now()
          }
        ];
        setProjects(sampleProjects);
      }
    };

    fetchProjects();
  }, []);

  const handleRemix = async (project: CommunityProject) => {
    if (!user) {
      toast.error('Please sign in to remix projects');
      return;
    }

    try {
      const remixedProject: Project = {
        ...project,
        id: `remix-${project.id}-${Date.now()}`,
        name: `${project.name} (Remix)`,
        ownerId: user.uid,
        isPublic: false,
        lastModified: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };

      await saveProject(remixedProject);
      toast.success('Project remixed! Opening in editor...');
      window.location.hash = `#/editor/${remixedProject.id}`;
    } catch (error) {
      console.error('Error remixing project:', error);
      toast.error('Failed to remix project');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-xs">
            <Users className="w-4 h-4" />
            <span>Community Gallery</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
            Discover & <span className="text-primary">Remix</span>
          </h1>
          <p className="text-[var(--t3)] max-w-lg">
            Explore amazing projects built by the Aether community. Remix any project to start building on top of it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--t3)]" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="pl-10 pr-4 py-2 rounded-2xl bg-[var(--bg3)] border border-[var(--bdr)] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-[var(--bg3)] p-1 rounded-2xl border border-[var(--bdr)]">
            {(['all', 'trending', 'recent'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  filter === f 
                    ? 'bg-[var(--bg)] shadow-sm text-primary' 
                    : 'text-[var(--t3)] hover:text-[var(--t)]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative rounded-[40px] liquid-glass border border-[var(--bdr)] overflow-hidden hover:border-primary/30 transition-all duration-500 cursor-pointer"
            >
              <div className="aspect-video bg-[var(--bg3)] relative overflow-hidden">
                {/* Real Preview */}
                <ProjectPreview project={project} />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <Button 
                    className="rounded-2xl font-bold"
                    onClick={() => handleRemix(project)}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Remix
                  </Button>
                  <Button 
                    variant="secondary"
                    className="rounded-2xl font-bold"
                    onClick={() => window.open(`#/editor/${project.id}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg leading-tight">{project.name || 'Untitled Project'}</h3>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-[var(--bdr)]">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-primary/10 hover:text-primary"
                    title="Share Project"
                    onClick={() => setShareProject(project)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 space-y-4">
          <div className="w-20 h-20 bg-[var(--bg3)] rounded-full flex items-center justify-center mx-auto">
            <Rocket className="w-8 h-8 text-[var(--t3)]" />
          </div>
          <h3 className="text-xl font-bold">No projects found</h3>
          <p className="text-[var(--t3)]">The community gallery is empty. Be the first to share your project!</p>
        </div>
      )}

      <Dialog open={!!shareProject} onOpenChange={(open) => !open && setShareProject(null)}>
        <DialogContent className="rounded-[32px] liquid-glass border border-[var(--bdr)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Share Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--t3)]">Deployable Preview URL</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-[var(--bg3)] border border-[var(--bdr)] rounded-2xl px-4 py-3 text-sm font-mono truncate">
                  {shareProject && `${window.location.origin}/#/shared/${shareProject.id}`}
                </div>
                <Button 
                  onClick={() => shareProject && handleCopy(`${window.location.origin}/#/shared/${shareProject.id}`)}
                  className="rounded-2xl shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-[var(--t3)] leading-relaxed">
              This link allows anyone to view and interact with a full-screen preview of this project.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
