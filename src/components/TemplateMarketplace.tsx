import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TEMPLATES, type Template } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, Heart, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { useFirebase } from './FirebaseProvider';
// Mock Firebase for testing
const useMockFirebase = () => ({
  user: null,
  signIn: async () => {},
  logout: async () => {},
  isAuthReady: true,
  projects: [],
  saveProject: async () => {},
  deleteProject: async () => {},
  saveSnapshot: async () => {},
  getSnapshots: async () => [],
  restoreSnapshot: async () => ({}),
  fetchProjectById: async () => () => {}
});
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, deleteDoc, collection, query, where, increment, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface TemplateMarketplaceProps {
  onSelect: (template: Template) => void;
}

export function TemplateMarketplace({ onSelect }: TemplateMarketplaceProps) {
  const { user } = useMockFirebase();
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});

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

    const likeId = `${user.uid}_${templateId}`;
    const isLiked = userLikes[templateId];

    try {
      if (isLiked) {
        await deleteDoc(doc(db, 'template_likes', likeId));
        await updateDoc(doc(db, 'template_stats', templateId), {
          likes: increment(-1)
        });
      } else {
        await setDoc(doc(db, 'template_likes', likeId), {
          userId: user.uid,
          templateId,
          createdAt: new Date().toISOString()
        });
        await setDoc(doc(db, 'template_stats', templateId), {
          likes: increment(1)
        }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `template_likes/${likeId}`);
      toast.error('Failed to update like');
    }
  };

  return (
    <div className="py-12 space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tight">Project Templates</h2>
        <p className="text-muted-foreground">Start your next big idea with a pre-configured foundation.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TEMPLATES.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative rounded-[48px] liquid-glass border border-[var(--bdr)] overflow-hidden hover:border-primary/30 transition-all duration-500 cursor-pointer"
            onClick={() => onSelect(template)}
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
    </div>
  );
}

// In-memory cache for generated srcDoc to speed up re-renders within the same session
const templatePreviewCache = new Map<string, string>();

// Persistent cache helper
const getTemplatePersistentCache = (id: string): string | null => {
  try {
    return sessionStorage.getItem(`aether_template_preview_${id}`);
  } catch {
    return null;
  }
};

const setTemplatePersistentCache = (id: string, content: string) => {
  try {
    sessionStorage.setItem(`aether_template_preview_${id}`, content);
  } catch {
    // Silently fail if storage is full
  }
};

function TemplatePreview({ template }: { template: Template }) {
  const [srcDoc, setSrcDoc] = useState<string | null>(() => {
    return templatePreviewCache.get(template.id) || getTemplatePersistentCache(template.id);
  });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !template || !template.files) return;
    
    // Check in-memory cache first
    if (templatePreviewCache.has(template.id)) {
      setSrcDoc(templatePreviewCache.get(template.id)!);
      return;
    }

    // Check persistent cache
    const cached = getTemplatePersistentCache(template.id);
    if (cached) {
      templatePreviewCache.set(template.id, cached);
      setSrcDoc(cached);
      return;
    }

    const html = template.files['index.html'] || '';
    const css = template.files['style.css'] || '';
    const js = template.files['script.js'] || '';

    if (!html.trim()) {
      return;
    }

    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; background: #ffffff; min-height: 100vh; }
            ${css}
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
    
    templatePreviewCache.set(template.id, combined);
    setTemplatePersistentCache(template.id, combined);
    setSrcDoc(combined);
  }, [template, isVisible]);

  if (!srcDoc) {
    return (
      <div ref={containerRef} className="w-full h-full bg-[#1a1a1a] flex flex-col">
        <div className="h-8 bg-[#1a1a1a] flex items-center px-4 gap-2 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white/5 px-3 py-0.5 rounded text-[10px] text-white/40 font-medium truncate max-w-[120px]">
              {template.name || 'Untitled Template'}
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          {/* Placeholder content removed as requested */}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden pointer-events-none select-none bg-[var(--bg3)]">
      <iframe
        srcDoc={srcDoc}
        className="w-[1200px] h-[800px] border-none origin-top-left scale-[0.25] md:scale-[0.3] lg:scale-[0.28]"
        title={template.name}
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="absolute inset-0 bg-transparent" />
    </div>
  );
}

function Code2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </svg>
  );
}
