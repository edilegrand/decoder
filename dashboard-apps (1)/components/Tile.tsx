import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AppTileConfig } from '../types';
import { ArrowUpRight, Trash2, Hexagon } from 'lucide-react';
import { ICON_MAP } from '../constants';
import { useAppContext } from '../context/AppContext';

interface TileProps {
  app: AppTileConfig;
  index: number;
}

const colorMap: Record<string, string> = {
  cyan: 'group-hover:text-cyan-400 group-hover:shadow-cyan-500/50 group-hover:border-cyan-500/50',
  purple: 'group-hover:text-purple-400 group-hover:shadow-purple-500/50 group-hover:border-purple-500/50',
  pink: 'group-hover:text-pink-400 group-hover:shadow-pink-500/50 group-hover:border-pink-500/50',
  emerald: 'group-hover:text-emerald-400 group-hover:shadow-emerald-500/50 group-hover:border-emerald-500/50',
  blue: 'group-hover:text-blue-400 group-hover:shadow-blue-500/50 group-hover:border-blue-500/50',
  amber: 'group-hover:text-amber-400 group-hover:shadow-amber-500/50 group-hover:border-amber-500/50',
  indigo: 'group-hover:text-indigo-400 group-hover:shadow-indigo-500/50 group-hover:border-indigo-500/50',
  slate: 'group-hover:text-slate-200 group-hover:shadow-slate-500/50 group-hover:border-slate-500/50',
};

const bgGlowMap: Record<string, string> = {
  cyan: 'group-hover:bg-cyan-500/10',
  purple: 'group-hover:bg-purple-500/10',
  pink: 'group-hover:bg-pink-500/10',
  emerald: 'group-hover:bg-emerald-500/10',
  blue: 'group-hover:bg-blue-500/10',
  amber: 'group-hover:bg-amber-500/10',
  indigo: 'group-hover:bg-indigo-500/10',
  slate: 'group-hover:bg-slate-500/10',
};

const iconColorMap: Record<string, string> = {
  cyan: 'text-cyan-500',
  purple: 'text-purple-500',
  pink: 'text-pink-500',
  emerald: 'text-emerald-500',
  blue: 'text-blue-500',
  amber: 'text-amber-500',
  indigo: 'text-indigo-500',
  slate: 'text-slate-400',
};

export const Tile: React.FC<TileProps> = ({ app, index }) => {
  const { removeTile } = useAppContext();
  const Icon = ICON_MAP[app.icon] || Hexagon;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete module "${app.title}"?`)) {
        removeTile(app.id);
    }
  };

  return (
    <Link to={app.route} className="block h-full relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 ${colorMap[app.color] || ''} hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] ${bgGlowMap[app.color] || ''}`}
      >
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex items-start justify-between">
          <div className={`rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:ring-white/20 ${iconColorMap[app.color]}`}>
            <Icon size={32} />
          </div>
          
          <div className="flex gap-2">
            <button
                onClick={handleDelete}
                className="z-20 rounded-full p-2 text-slate-500 opacity-0 transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                title="Remove Module"
            >
                <Trash2 size={18} />
            </button>
            <ArrowUpRight className="text-slate-500 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>

        <div className="relative z-10 mt-8">
          <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-white transition-colors">
            {app.title}
          </h3>
          <p className="mt-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
            {app.description}
          </p>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:bg-white/10" />
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 h-24 w-24 rounded-full bg-black/20 blur-2xl" />
      </motion.div>
    </Link>
  );
};
