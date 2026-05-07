import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TEMPLATES, type Template } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, Heart, Layout, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from './FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, deleteDoc, collection, query, where, increment, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { type Project } from '@/types';

// TemplatePreview component
function TemplatePreview({ template }: { template: Template }) {
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    // Generate HTML preview from template files
    const generatePreview = () => {
      // Create a static preview based on template type
      let previewHTML = '';

      switch (template.id) {
        case 'react-tailwind-starter':
          previewHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-slate-50 text-slate-900 min-h-screen">
              <div class="max-w-4xl mx-auto p-8 space-y-12">
                <header class="text-center space-y-4">
                  <div class="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto border border-blue-500/20">
                    <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                    </svg>
                  </div>
                  <h1 class="text-5xl font-black tracking-tight text-slate-900">Aether Starter</h1>
                  <p class="text-xl text-slate-500 max-w-xl mx-auto">Your autonomous development journey starts here.</p>
                </header>
                <div class="grid md:grid-cols-3 gap-6">
                  <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div class="w-6 h-6 text-blue-500 mb-4">⚛️</div>
                    <h3 class="font-bold text-lg mb-2">React 18</h3>
                    <p class="text-sm text-slate-500">Modern functional components</p>
                  </div>
                  <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div class="w-6 h-6 text-blue-500 mb-4">🎨</div>
                    <h3 class="font-bold text-lg mb-2">Tailwind 4</h3>
                    <p class="text-sm text-slate-500">Utility-first styling</p>
                  </div>
                  <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div class="w-6 h-6 text-blue-500 mb-4">⚡</div>
                    <h3 class="font-bold text-lg mb-2">Fast Refresh</h3>
                    <p class="text-sm text-slate-500">Instant preview updates</p>
                  </div>
                </div>
                <div class="flex justify-center">
                  <button class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl">
                    Count is 0
                  </button>
                </div>
              </div>
            </body>
            </html>
          `;
          break;
        case 'landing-page-bento':
          previewHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-black text-white p-8">
              <div class="max-w-7xl mx-auto space-y-8">
                <nav class="flex justify-between items-center p-6 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10">
                  <div class="text-2xl font-black tracking-tighter">BENTO.</div>
                  <button class="px-6 py-2 bg-white text-black rounded-full font-bold text-sm">Get Started</button>
                </nav>
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[48px] h-64 flex flex-col justify-end">
                    <h1 class="text-4xl font-black">Build faster than ever.</h1>
                  </div>
                  <div class="p-8 bg-white/5 border border-white/10 rounded-[40px]">
                    <div class="w-10 h-10 text-blue-400 mb-4">🌍</div>
                    <h3 class="text-xl font-bold">Global Scale</h3>
                    <p class="text-sm text-white/40">Deploy to 100+ edge locations</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;
          break;
        default:
          // Generic preview for other templates
          previewHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center">
              <div class="text-center p-8">
                <div class="text-6xl mb-4">${template.icon}</div>
                <h1 class="text-3xl font-bold mb-2">${template.name}</h1>
                <p class="text-gray-500">${template.description}</p>
              </div>
            </body>
            </html>
          `;
      }

      setSrcDoc(previewHTML);
    };

    generatePreview();
  }, [template, isVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      {srcDoc ? (
        <iframe
          srcDoc={srcDoc}
          className="w-full h-full border-0 pointer-events-none select-none"
          title={`${template.name} preview`}
          sandbox="allow-scripts allow-same-origin"
          style={{ 
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[var(--bg3)]">
          <div className="text-center space-y-2">
            <Layout className="w-8 h-8 text-[var(--t3)] mx-auto" />
            <p className="text-sm text-[var(--t3)]">Loading preview...</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface TemplateMarketplaceProps {
  onSelect: (template: Template) => void;
}

export function TemplateMarketplace({ onSelect }: TemplateMarketplaceProps) {
  const { user, saveProject } = useFirebase();
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    // Listen to all likes counts
    const unsubLikes = onSnapshot(collection(db, 'template_stats'), (snapshot) => {
      const newLikes: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        newLikes[doc.id] = doc.data().likes || 0;
      });
      setLikes(newLikes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'template_stats');
    });

    // Listen to current user's likes
    let unsubUserLikes = () => {};
    if (user) {
      const q = query(collection(db, 'template_likes'), where('userId', '==', user.uid));
      unsubUserLikes = onSnapshot(q, (snapshot) => {
        const newUserLikes: Record<string, boolean> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          newUserLikes[data.templateId] = true;
        });
        setUserLikes(newUserLikes);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'template_likes');
      });
    }

    return () => {
      unsubLikes();
      unsubUserLikes();
    };
  }, [user]);

  const toggleLike = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to like templates');
      return;
    }

    try {
      const likeRef = doc(db, 'template_likes', `${user.uid}_${templateId}`);
      const statsRef = doc(db, 'template_stats', templateId);

      if (userLikes[templateId]) {
        // Remove like
        await deleteDoc(likeRef);
        await updateDoc(statsRef, { likes: increment(-1) });
      } else {
        // Add like
        await setDoc(likeRef, {
          userId: user.uid,
          templateId,
          createdAt: new Date().toISOString()
        });
        await updateDoc(statsRef, { likes: increment(1) });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'template_like');
    }
  };

  const handleTemplateSelect = async (template: Template) => {
    const newProject: Project = {
      id: `template-${template.id}-${Date.now()}`,
      name: template.name,
      files: template.files,
      lastModified: Date.now(),
      ownerId: user?.uid || 'local',
      messages: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    await saveProject(newProject)
    
    // Close preview modal first
    setPreviewTemplate(null);
    
    // Navigate to editor immediately
    window.history.pushState({}, '', `/editor/${newProject.id}`)
    window.dispatchEvent(new Event('routechange'))
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
          Template <span className="text-primary">Marketplace</span>
        </h1>
        <p className="text-xl text-[var(--t2)] max-w-2xl mx-auto">
          Jumpstart your next project with professionally crafted templates. Each template is fully customizable and ready to use.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TEMPLATES.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative rounded-[48px] liquid-glass border border-[var(--bdr)] overflow-hidden hover:border-primary/30 transition-all duration-500 cursor-pointer"
            onClick={() => setPreviewTemplate(template)}
          >
            <div className="aspect-video bg-[var(--bg3)] relative overflow-hidden">
              <div className="w-full h-full">
                <TemplatePreview template={template} />
              </div>
            </div>

            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-primary/60">
                  {template.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--t)] group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-[var(--t2)] line-clamp-2 leading-relaxed">
                {template.description}
              </p>
              <div className="pt-4 flex items-center justify-between border-t border-[var(--bdr)]">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => toggleLike(e, template.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-bold transition-colors",
                      userLikes[template.id] ? "text-red-500" : "text-[var(--t3)] hover:text-red-500"
                    )}
                  >
                    <Heart className={cn("w-3.5 h-3.5", userLikes[template.id] && "fill-current")} />
                    {likes[template.id] || 0}
                  </button>
                  <div className="text-primary font-bold text-xs flex items-center gap-1">
                    Preview <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-8"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl h-[90vh] bg-[var(--bg)] rounded-[48px] overflow-hidden liquid-glass border border-[var(--bdr)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewTemplate(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[var(--bg3)] border border-[var(--bdr)] flex items-center justify-center text-[var(--t)] hover:bg-[var(--bg2)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full h-full flex flex-col">
                <div className="p-6 border-b border-[var(--bdr)] flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[var(--t)]">{previewTemplate.name}</h2>
                    <p className="text-sm text-[var(--t2)]">{previewTemplate.description}</p>
                  </div>
                  <Button
                    onClick={() => {
                      onSelect(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                    className="px-8 py-3 rounded-2xl font-bold"
                  >
                    Use Template
                  </Button>
                </div>

                <div className="flex-1 relative overflow-hidden bg-[var(--bg3)]">
                  <div className="absolute inset-0 flex items-center justify-center transform scale-[0.3] origin-center">
                    <div className="w-[333%] h-[333%]">
                      <TemplatePreview template={previewTemplate} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
