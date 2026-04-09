import React, { useState, useEffect, useRef } from 'react';
import { type Project } from '@/types';

// In-memory cache for generated srcDoc to speed up re-renders within the same session
const previewCache = new Map<string, string>();

// Persistent cache helper
const getPersistentCache = (id: string): string | null => {
  try {
    return sessionStorage.getItem(`aether_preview_${id}`);
  } catch {
    return null;
  }
};

const setPersistentCache = (id: string, content: string) => {
  try {
    sessionStorage.setItem(`aether_preview_${id}`, content);
  } catch {
    // Silently fail if storage is full
  }
};

export function ProjectPreview({ project }: { project: Project }) {
  const [srcDoc, setSrcDoc] = useState<string | null>(() => {
    return previewCache.get(project.id) || getPersistentCache(project.id);
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
      { rootMargin: '400px' } // Load even earlier for smoother experience
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !project || !project.files) return;
    
    // Check in-memory cache first
    if (previewCache.has(project.id)) {
      setSrcDoc(previewCache.get(project.id)!);
      return;
    }

    // Check persistent cache
    const cached = getPersistentCache(project.id);
    if (cached) {
      previewCache.set(project.id, cached);
      setSrcDoc(cached);
      return;
    }

    const html = project.files['index.html'] || project.files['App.tsx'] || '';
    const css = project.files['style.css'] || project.files['index.css'] || '';
    const js = project.files['script.js'] || project.files['main.js'] || '';

    if (!html.trim()) {
      return;
    }

    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; }
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
    
    previewCache.set(project.id, combined);
    setPersistentCache(project.id, combined);
    setSrcDoc(combined);
  }, [project, isVisible]);

  if (!srcDoc) {
    return (
      <div ref={containerRef} className="w-full h-full bg-[#1a1a1a] flex flex-col">
        <div className="h-8 bg-[#1a1a1a] flex items-center px-4 relative border-b border-white/5">
          <div className="flex gap-1.5 absolute left-4">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white/5 px-3 py-0.5 rounded text-[10px] text-white/40 font-medium truncate max-w-[120px]">
              {project.name || 'Untitled App'}
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
    <div className="w-full h-full relative overflow-hidden pointer-events-none select-none">
      <iframe
        srcDoc={srcDoc}
        className="w-[1200px] h-[800px] border-none origin-top-left scale-[0.25] md:scale-[0.3] lg:scale-[0.28]"
        title={project.name}
        sandbox="allow-scripts"
      />
      <div className="absolute inset-0 bg-transparent" />
    </div>
  );
}
