import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Zap, Code2, Brain, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to Aether",
    description: "The autonomous development environment that builds your ideas in real-time.",
    icon: Rocket,
  },
  {
    title: "Instant Previews",
    description: "See your changes instantly as you code. No build steps, no waiting.",
    icon: Zap,
  },
  {
    title: "Pure HTML/CSS/JS",
    description: "Aether keeps things simple. No complex frameworks, just clean web code.",
    icon: Code2,
  },
  {
    title: "DUB5 AI",
    description: "Our AI builds everything for you in seconds. It creates the files, the design, and the logic automatically.",
    icon: Brain,
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/40 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-2xl shadow-2xl"
      >
        <div className="p-12 text-center">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
              <step.icon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="min-h-[120px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {step.title}
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-12 mb-10">
            {STEPS.map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === currentStep ? "w-10 bg-white" : "w-2 bg-white/10"
                )}
              />
            ))}
          </div>

          <Button 
            onClick={nextStep}
            className="w-full h-14 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-lg transition-all active:scale-[0.98]"
          >
            {currentStep === STEPS.length - 1 ? "Start Building" : "Next"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
