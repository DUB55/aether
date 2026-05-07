import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from './navbar';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showBackButton?: boolean;
}

export function PageLayout({ children, title, description, showBackButton = true }: PageLayoutProps) {
  const handleBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('routechange'));
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {showBackButton && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-[#6b7ce5] transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </motion.button>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">{title}</h1>
            {description && (
              <p className="text-lg text-slate-400 mb-8">{description}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
