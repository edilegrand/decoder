import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BrainCircuit, BarChart3, Globe, Code2, Palette, Share2, ArrowRight, Lock } from 'lucide-react';
import { LoginModal } from './LoginModal';

const sampleModules = [
  {
    id: 'demo-ai',
    title: 'AI Assistant',
    description: 'Interactive chat interface with real-time responses',
    icon: 'BrainCircuit',
    color: 'cyan',
    gradientColor: 'cyan',
    type: 'html',
    height: 'h-[200px]',
  },
  {
    id: 'demo-analytics',
    title: 'Analytics Dashboard',
    description: 'Live data visualization with dynamic charts',
    icon: 'BarChart3',
    color: 'purple',
    gradientColor: 'purple',
    type: 'iframe',
    height: 'h-[200px]',
  },
  {
    id: 'demo-github',
    title: 'GitHub Repo',
    description: 'Quick access to your favorite repositories',
    icon: 'Globe',
    color: 'emerald',
    gradientColor: 'emerald',
    type: 'link',
    height: 'h-[200px]',
  },
];

const features = [
  {
    icon: Code2,
    title: 'Code Your App',
    description: 'Write HTML, CSS, and JavaScript directly in your browser. Use split panels or a single editor.',
    color: 'cyan',
  },
  {
    icon: Palette,
    title: 'Customize Everything',
    description: 'Choose from 13 accent colors, neon effects, custom fonts, images, and gradient backgrounds.',
    color: 'purple',
  },
  {
    icon: Share2,
    title: 'Share Publicly',
    description: 'Get a unique URL (yourdomain.com/yourname) to showcase your modules to anyone.',
    color: 'pink',
  },
];

const colorMap: Record<string, string> = {
  cyan: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10',
  purple: 'text-purple-400 border-purple-500/50 bg-purple-500/10',
  pink: 'text-pink-400 border-pink-500/50 bg-pink-500/10',
  emerald: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
};

const glowMap: Record<string, string> = {
  cyan: 'shadow-cyan-500/50',
  purple: 'shadow-purple-500/50',
  pink: 'shadow-pink-500/50',
  emerald: 'shadow-emerald-500/50',
};

const gradientMap: Record<string, string> = {
  cyan: 'from-cyan-500/20 to-cyan-500/5',
  purple: 'from-purple-500/20 to-purple-500/5',
  pink: 'from-pink-500/20 to-pink-500/5',
  emerald: 'from-emerald-500/20 to-emerald-500/5',
};

export const LandingPage: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const getIcon = (iconName: string) => {
    const Icon = { BrainCircuit, BarChart3, Globe }[iconName] || Globe;
    return <Icon size={32} />;
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Modules Dashboard
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
            Create, customize, and share your own web applications, 
            or shortcut links with simple, customizable modules.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLoginModalOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            Login to Get Started
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>

      {/* Sample Modules */}
      <div className="max-w-5xl mx-auto mb-20">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white text-center mb-8"
        >
          See What You Can Build
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleModules.map((mod, index) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] ${colorMap[mod.color]} hover:border-${mod.color}-500/50`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientMap[mod.color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10 p-4 flex items-start justify-between">
                <div className={`rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:ring-white/20 ${colorMap[mod.color]}`}>
                  {getIcon(mod.icon)}
                </div>
                <Lock className="text-white/30 group-hover:text-white/50 transition-colors" size={18} />
              </div>
              <div className="relative z-10 px-4 pb-4 text-center">
                <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
                  {mod.title}
                </h3>
                <p className="mt-1 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  {mod.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto mb-20">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl font-bold text-white text-center mb-8"
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`group relative flex flex-col items-center text-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] hover:border-${feature.color}-500/50`}
            >
              <div className={`rounded-xl bg-white/5 p-4 mb-4 ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:ring-white/20 ${colorMap[feature.color]}`}>
                <feature.icon size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto text-center pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Build Your Dashboard?
          </h2>
          <p className="text-slate-400 mb-6">
            Join now and start creating your own customizable modules.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLoginModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            Get Started Free
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};
