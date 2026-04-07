import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  X, 
  Search, 
  Rocket, 
  Layout, 
  Smartphone, 
  Globe, 
  Database, 
  Zap,
  ArrowRight,
  Check,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'web' | 'mobile' | 'fullstack' | 'saas';
  tags: string[];
  stars: number;
  files: Record<string, string>;
}

const TEMPLATES: Template[] = [
  {
    id: 'react-vite',
    name: 'React + Vite Starter',
    description: 'Clean React setup with Vite, Tailwind CSS, and Lucide icons.',
    icon: Globe,
    category: 'web',
    tags: ['React', 'Vite', 'Tailwind'],
    stars: 1200,
    files: {
      'src/App.tsx': 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-black text-white flex items-center justify-center">\n      <h1 className="text-4xl font-bold">Hello Aether!</h1>\n    </div>\n  );\n}',
      'package.json': '{\n  "name": "aether-react-starter",\n  "private": true,\n  "version": "0.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "lucide-react": "^0.284.0",\n    "clsx": "^2.0.0",\n    "tailwind-merge": "^1.14.0"\n  },\n  "devDependencies": {\n    "@types/react": "^18.2.15",\n    "@types/react-dom": "^18.2.7",\n    "@vitejs/plugin-react": "^4.0.3",\n    "autoprefixer": "^10.4.14",\n    "postcss": "^8.4.27",\n    "tailwindcss": "^3.3.3",\n    "typescript": "^5.0.2",\n    "vite": "^4.4.5"\n  }\n}'
    }
  },
  {
    id: 'saas-starter',
    name: 'SaaS Boilerplate',
    description: 'Full-stack SaaS template with Auth, Database, and Dashboard UI.',
    icon: Zap,
    category: 'saas',
    tags: ['Next.js', 'Supabase', 'Stripe'],
    stars: 850,
    files: {
      'src/App.tsx': '// SaaS Dashboard Template\nimport React from "react";\n\nexport default function Dashboard() {\n  return (\n    <div className="p-8">\n      <h1 className="text-2xl font-bold">Dashboard</h1>\n      <div className="grid grid-cols-3 gap-4 mt-8">\n        {[1,2,3].map(i => (\n          <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl">Stat {i}</div>\n        ))}\n      </div>\n    </div>\n  );\n}'
    }
  },
  {
    id: 'expo-mobile',
    name: 'Expo Mobile App',
    description: 'React Native starter using Expo SDK for cross-platform mobile apps.',
    icon: Smartphone,
    category: 'mobile',
    tags: ['React Native', 'Expo', 'Mobile'],
    stars: 640,
    files: {
      'App.js': 'import { StyleSheet, Text, View } from "react-native";\n\nexport default function App() {\n  return (\n    <view style={styles.container}>\n      <text>Open up App.js to start working on your app!</text>\n    </view>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: "#fff",\n    alignItems: "center",\n    justifyContent: "center",\n  },\n});'
    }
  }
];

interface TemplateMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: Record<string, string>) => void;
}

export function TemplateMarketplace({ isOpen, onClose, onSelect }: TemplateMarketplaceProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'web' | 'mobile' | 'fullstack' | 'saas'>('all');

  const filtered = TEMPLATES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                         t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-6xl h-[85vh] liquid-glass rounded-[48px] shadow-2xl overflow-hidden flex flex-col border border-white/10"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Template Marketplace</h2>
                  <p className="text-sm text-white/30">Jumpstart your project with professional starters</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white/10 rounded-2xl transition-all group"
              >
                <X className="w-6 h-6 text-white/40 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="p-6 border-b border-white/10 flex items-center gap-6 bg-white/[0.02]">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {['all', 'web', 'mobile', 'saas'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat as any)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize",
                        activeCategory === cat 
                          ? "bg-white text-black shadow-xl shadow-white/5" 
                          : "text-white/40 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((template) => (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group p-6 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-primary/30 hover:bg-white/[0.05] transition-all flex flex-col gap-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          {template.stars}
                        </div>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <template.icon className="w-6 h-6 text-white/60" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold mb-1">{template.name}</h3>
                        <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{template.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {template.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-1 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-6 flex items-center justify-between">
                        <button 
                          onClick={() => {
                            onSelect(template.files);
                            onClose();
                            toast.success(`Applied ${template.name} template!`);
                          }}
                          className="flex-1 h-12 bg-white text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
                        >
                          Use Template
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
