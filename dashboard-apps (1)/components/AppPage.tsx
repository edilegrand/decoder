import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ICON_MAP } from '../constants';
import { ArrowLeft, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

export const AppPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const { tiles } = useAppContext();
  
  // Find tile by ID or route inclusion
  const app = tiles.find(t => t.id === appId || t.route.includes(appId || ''));

  if (!app) {
    return (
        <div className="flex h-[80vh] flex-col items-center justify-center text-center p-4">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="text-slate-500 mb-4"
            >
                <Hexagon size={64} className="opacity-20" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Module Not Found</h2>
            <p className="text-slate-400 mb-6 max-w-md">The requested module "{appId}" appears to be offline or decommissioned.</p>
            <Link 
                to="/" 
                className="rounded-full bg-white/10 px-6 py-2 text-white hover:bg-white/20 transition-colors"
            >
                Return to Dashboard
            </Link>
        </div>
    )
  }

  const Icon = ICON_MAP[app.icon] || Hexagon;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <Link 
        to="/" 
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="border-b border-white/10 bg-white/5 p-6 md:p-10">
          <div className="flex items-center gap-6">
            <div className={`rounded-2xl bg-white/10 p-4 shadow-2xl ring-1 ring-white/10`}>
              <Icon size={48} className={`text-${app.color}-500`} style={{ color: `var(--tw-${app.color}-500)` }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">{app.title}</h1>
              <p className="mt-2 text-lg text-slate-400">{app.description}</p>
            </div>
          </div>
        </div>

        {/* Content Placeholder */}
        <div className="p-6 md:p-10">
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5"
             >
                <div className="h-10 w-10 rounded-full border-t-2 border-r-2 border-cyan-500 opacity-50"></div>
             </motion.div>
             <h3 className="text-xl font-medium text-white">Module Active</h3>
             <p className="mt-2 text-slate-400">
               Interactive interface for {app.title} is currently initializing...
             </p>
             <div className="mt-8 flex justify-center gap-4">
               <button className="rounded-lg bg-cyan-600 px-6 py-2 font-medium text-white hover:bg-cyan-500 transition-colors">
                 Run Diagnostics
               </button>
               <button className="rounded-lg border border-white/10 bg-transparent px-6 py-2 font-medium text-white hover:bg-white/5 transition-colors">
                 Configure
               </button>
             </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
             {[1,2,3].map(i => (
                 <div key={i} className="h-32 rounded-xl border border-white/5 bg-white/5 p-4">
                    <div className="h-2 w-20 rounded bg-white/20 mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-2 w-full rounded bg-white/10"></div>
                        <div className="h-2 w-3/4 rounded bg-white/10"></div>
                    </div>
                 </div>
             ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
