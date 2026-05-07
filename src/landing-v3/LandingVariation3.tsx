'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { Navbar } from './components/Navbar';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { Stats } from './sections/Stats';
import { ScaleFeatures } from './sections/ScaleFeatures';
import { Superpowers } from './sections/Superpowers';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';

interface LandingVariation3Props {
  onStartProject?: (prompt: string, attachments?: File[], designSystem?: string) => void;
}

export default function LandingVariation3({ onStartProject }: LandingVariation3Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem themes={['light', 'dark']}>
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
        <Navbar />
        <main>
          <Hero onStartProject={onStartProject} />
          <Features />
          <Stats />
          <ScaleFeatures />
          <Superpowers />
          <FinalCTA onStartProject={onStartProject} />
        </main>
        <Footer />
        <Toaster position="bottom-center" richColors />
      </div>
    </ThemeProvider>
  );
}
