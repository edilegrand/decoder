import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AppTileConfig } from '../types';
import { ArrowUpRight, Trash2, Hexagon, Pencil } from 'lucide-react';
import { ICON_MAP } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface TileProps {
  app: AppTileConfig;
  index: number;
  onEdit: (app: AppTileConfig) => void;
  tileSize?: 'small' | 'medium' | 'large';
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

export const Tile: React.FC<TileProps> = ({ app, index, onEdit, tileSize = 'medium' }) => {
  const { removeTile } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const Icon = ICON_MAP[app.icon] || Hexagon;

  // Check if current user owns this module
  const isOwner = user && app.ownerId === user.uid;

  const getTextColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      white: 'text-white',
      black: 'text-black',
      cyan: 'text-cyan-400',
      purple: 'text-purple-400',
      pink: 'text-pink-400',
      emerald: 'text-emerald-400',
      blue: 'text-blue-400',
      amber: 'text-amber-400',
      red: 'text-red-400',
      yellow: 'text-yellow-400',
      'neon-cyan': 'text-cyan-300',
      'neon-pink': 'text-pink-400',
      'neon-purple': 'text-purple-400',
      'neon-green': 'text-green-400',
      'neon-orange': 'text-orange-400',
    };
    return colorMap[color] || 'text-white';
  };

  const getTextGlowStyle = (color: string) => {
    const glowMap: Record<string, React.CSSProperties> = {
      'neon-cyan': { textShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee' },
      'neon-pink': { textShadow: '0 0 10px #f472b6, 0 0 20px #f472b6, 0 0 30px #f472b6' },
      'neon-purple': { textShadow: '0 0 10px #c084fc, 0 0 20px #c084fc, 0 0 30px #c084fc' },
      'neon-green': { textShadow: '0 0 10px #4ade80, 0 0 20px #4ade80, 0 0 30px #4ade80' },
      'neon-orange': { textShadow: '0 0 10px #fb923c, 0 0 20px #fb923c, 0 0 30px #fb923c' },
    };
    return glowMap[color] || {};
  };

  const getGradientColorHex = (color: string): string => {
    const colorMap: Record<string, string> = {
      cyan: '#06b6d4',
      purple: '#a855f7',
      pink: '#ec4899',
      emerald: '#10b981',
      blue: '#3b82f6',
      amber: '#f59e0b',
      indigo: '#6366f1',
      'neon-cyan': '#22d3ee',
      'neon-pink': '#f472b6',
      'neon-purple': '#c084fc',
      'neon-green': '#4ade80',
      'neon-orange': '#fb923c',
    };
    return colorMap[color] || '#06b6d4';
  };

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '6, 182, 212';
  };

  const brightness = app.imageBrightness ?? 70;
  const gradientIntensity = app.gradientIntensity ?? 50;
  const gradientColorHex = getGradientColorHex(app.gradientColor || 'cyan');
  
  const paddingClass = tileSize === 'small' ? 'p-0.5' : tileSize === 'large' ? 'p-6' : 'p-4';
  const iconPaddingClass = tileSize === 'small' ? 'p-0.5' : tileSize === 'large' ? 'p-4' : 'p-3';
  const iconSize = tileSize === 'small' ? 12 : tileSize === 'large' ? 48 : 32;
  const minHeightClass = tileSize === 'small' ? 'h-[100px]' : tileSize === 'large' ? 'h-[300px]' : 'h-[200px]';
  
  const overlayOpacity = (100 - brightness) / 100;
  const gradientOpacity = gradientIntensity / 100;
  
  const overlayDark = `rgba(0, 0, 0, ${Math.min(0.95, overlayOpacity + 0.3)})`;
  const overlayMid = `rgba(0, 0, 0, ${Math.min(0.6, overlayOpacity * 0.7)})`;
  const overlayLight = `rgba(0, 0, 0, ${Math.min(0.3, overlayOpacity * 0.3)})`;
  
  const gradientStart = `rgba(${hexToRgb(gradientColorHex)}, ${gradientOpacity * 0.5})`;
  const gradientEnd = `rgba(${hexToRgb(gradientColorHex)}, 0)`;

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onEdit(app);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (window.confirm(`Delete module "${app.title}"?`)) {
        await removeTile(app.id);
    }
  };

  const TileWrapper = app.deployUrl ? 'a' : Link;
  const tileProps = app.deployUrl 
    ? { href: app.deployUrl, target: '_blank', rel: 'noopener noreferrer' }
    : { to: app.route || '#' };

  return (
    <TileWrapper {...tileProps} className={`block h-full ${minHeightClass} relative`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 ${colorMap[app.color] || ''} hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] ${bgGlowMap[app.color] || ''}`}
      >
        {/* Background - Image or Gradient */}
        {app.imageUrl ? (
          <>
            <img 
              src={app.imageUrl} 
              alt={app.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              style={{ filter: `brightness(${brightness}%)` }}
            />
            <div 
              className="absolute inset-0" 
              style={{ 
                background: `linear-gradient(to top, ${overlayDark} 0%, ${overlayMid} 50%, ${gradientEnd} 100%), linear-gradient(135deg, ${gradientStart} 0%, transparent 50%)`
              }} 
            />
          </>
        ) : (
          /* Gradient background for modules without image */
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${gradientStart} 0%, rgba(0,0,0,0.3) 50%, ${gradientEnd} 100%)`
            }}
          />
        )}

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10" />

        <div className={`relative z-10 flex items-start justify-between ${paddingClass}`}>
          {/* Icon - hide when there's an image */}
          {!app.imageUrl && (
            <div className={`rounded-xl bg-white/5 ${iconPaddingClass} ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:ring-white/20 ${iconColorMap[app.color]}`}>
              <Icon size={iconSize} />
            </div>
          )}
          
          {/* Edit and Delete buttons - Owner Only */}
          {isOwner && (
            <div className="flex gap-1">
              <button
                  onClick={handleEdit}
                  className={`z-20 rounded-full text-white/70 transition-all duration-300 hover:bg-white/20 hover:text-white ${tileSize === 'small' ? 'p-1 opacity-100' : 'p-2 opacity-0 group-hover:opacity-100'}`}
                  title="Edit Module"
              >
                  <Pencil size={tileSize === 'small' ? 14 : 18} />
              </button>
              <button
                  onClick={handleDelete}
                  className={`z-20 rounded-full text-white/70 transition-all duration-300 hover:bg-red-500/50 hover:text-white ${tileSize === 'small' ? 'p-1 opacity-100' : 'p-2 opacity-0 group-hover:opacity-100'}`}
                  title="Remove Module"
              >
                  <Trash2 size={tileSize === 'small' ? 14 : 18} />
              </button>
            </div>
          )}
          <ArrowUpRight className="text-white/70 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>

        <div className={`absolute left-1/2 -translate-x-1/2 z-10 w-full px-4 text-center ${tileSize === 'large' ? 'top-1/2 -translate-y-1/2' : tileSize === 'small' ? 'top-[50%] -translate-y-1/2' : 'top-[30%] -translate-y-1/2'}`}>
          <h3 className={`${tileSize === 'small' ? 'text-sm' : tileSize === 'large' ? 'text-3xl' : 'text-xl'} font-bold tracking-tight group-hover:text-white transition-colors ${app.titleColor ? getTextColorClass(app.titleColor) : 'text-white'}`} style={{ ...getTextGlowStyle(app.titleColor || ''), fontSize: app.titleFontSize ? `${app.titleFontSize}px` : undefined }}>
            {app.title}
          </h3>
          <p className={`mt-1 ${tileSize === 'small' ? 'text-[10px]' : tileSize === 'large' ? 'text-base' : 'text-sm'} transition-colors ${app.descriptionColor ? getTextColorClass(app.descriptionColor) : 'text-white/60 group-hover:text-white/80'}`} style={{ ...(app.descriptionColor ? { ...getTextGlowStyle(app.descriptionColor), ...(app.descriptionColor !== 'white' && app.descriptionColor !== 'black' ? { opacity: 0.7 } : {}) } : {}), fontSize: app.descriptionFontSize ? `${app.descriptionFontSize}px` : undefined }}>
            {app.description}
          </p>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:bg-white/10" />
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 h-24 w-24 rounded-full bg-black/20 blur-2xl" />
      </motion.div>
    </TileWrapper>
  );
};
