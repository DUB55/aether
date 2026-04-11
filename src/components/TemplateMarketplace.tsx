import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TEMPLATES, type Template } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, Heart, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from './FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, deleteDoc, collection, query, where, increment, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

// TemplatePreview component
function TemplatePreview({ template }: { template: Template }) {
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    // Generate HTML preview from template files
    const generatePreview = () => {
      const htmlFile = template.files['index.html'];
      if (htmlFile) {
        // Create a complete HTML document
        const preview = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${template.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-gray-50">
            ${htmlFile}
          </body>
          </html>
        `;
        setSrcDoc(preview);
      }
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
          className="w-full h-full border-0"
          title={`${template.name} preview`}
          sandbox="allow-scripts allow-same-origin"
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
  const { user } = useFirebase();
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
