import React, { useState } from 'react';
import { Tile } from './Tile';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { ICON_MAP } from '../constants';
import { X, Plus, Check } from 'lucide-react';
import { AppTileConfig } from '../types';

export const Dashboard: React.FC = () => {
  const { tiles, addTile } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Tile State
  const [newTile, setNewTile] = useState<Partial<AppTileConfig>>({
    title: '',
    description: '',
    color: 'cyan',
    icon: 'BrainCircuit'
  });

  const availableColors = ['cyan', 'purple', 'pink', 'emerald', 'blue', 'amber', 'indigo', 'slate'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTile.title || !newTile.description) return;

    const id = newTile.title.toLowerCase().replace(/\s+/g, '-');
    const tile: AppTileConfig = {
      id: `${id}-${Date.now()}`,
      title: newTile.title,
      description: newTile.description,
      color: newTile.color || 'cyan',
      icon: newTile.icon || 'Box',
      route: `/app/${id}`
    };

    addTile(tile);
    setIsModalOpen(false);
    setNewTile({ title: '', description: '', color: 'cyan', icon: 'BrainCircuit' });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      
      {/* Header Section */}
      <div className="mb-8 md:mb-12">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold text-white md:text-5xl tracking-tight"
        >
          Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Commander</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-lg text-slate-400 max-w-2xl"
        >
          System status is nominal. Select a module to begin operations.
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
            {tiles.map((app, index) => (
            <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
            >
                <Tile app={app} index={index} />
            </motion.div>
            ))}
        </AnimatePresence>
        
        {/* Add New Tile Button */}
        <motion.button
            layout
            onClick={() => setIsModalOpen(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col items-center justify-center min-h-[200px] rounded-2xl border-2 border-dashed border-white/10 bg-white/5 backdrop-blur-sm transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/5"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400 group-hover:text-cyan-400 transition-colors">
                <Plus />
            </div>
            <span className="mt-4 font-medium text-slate-400 group-hover:text-cyan-400">Add Module</span>
        </motion.button>
      </div>

      {/* Add Module Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsModalOpen(false)}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Initialize New Module</h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Module Name</label>
                            <input 
                                type="text" 
                                required
                                value={newTile.title}
                                onChange={(e) => setNewTile({...newTile, title: e.target.value})}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                placeholder="e.g. Deep Space Comms"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                            <input 
                                type="text" 
                                required
                                value={newTile.description}
                                onChange={(e) => setNewTile({...newTile, description: e.target.value})}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                placeholder="Purpose of this module..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Accent Color</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {availableColors.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setNewTile({...newTile, color: c})}
                                            className={`h-8 w-8 rounded-full border-2 transition-all ${newTile.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: `var(--color-${c}-500, ${c === 'slate' ? '#64748b' : c})` }}
                                        >
                                          {/* We can't easily access tailwind colors in JS without computing styles, so adding inline styles for preview using standard hexes or fallback classes */}
                                          <div className={`w-full h-full rounded-full bg-${c}-500`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Icon</label>
                                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1">
                                    {Object.keys(ICON_MAP).map(iconName => {
                                        const Icon = ICON_MAP[iconName];
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setNewTile({...newTile, icon: iconName})}
                                                className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-all ${newTile.icon === iconName ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                                title={iconName}
                                            >
                                                <Icon size={16} />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                            >
                                Deploy Module
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
