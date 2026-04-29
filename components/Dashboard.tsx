import React, { useState, useRef, useEffect } from 'react';
import { Tile } from './Tile';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ICON_MAP } from '../constants';
import { X, Plus, Globe, FileCode, Upload, Image, Trash2, Lock } from 'lucide-react';
import { AppTileConfig } from '../types';
import { NicknameModal } from './NicknameModal';
import { loadUserModules, loadAllPublicModules } from '../context/AppContext';

export const Dashboard: React.FC = () => {
    const { tiles, addTile, updateTile, removeTile, searchQuery, setSearchQuery, loading: modulesLoading } = useAppContext();
    const { user, hasNickname, nickname, preferredTileSize, setPreferredTileSize, loading: authLoading } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<AppTileConfig | null>(null);
    const [moduleLimitError, setModuleLimitError] = useState('');
    const [showNicknameModal, setShowNicknameModal] = useState(false);

    // Load modules based on auth state (waits for Firebase to resolve first)
    useEffect(() => {
        if (authLoading) return;
        if (user && user.uid) {
            loadUserModules(user.uid);
        } else {
            // Guest on /dashboard — show all public modules
            loadAllPublicModules();
        }
    }, [user?.uid, authLoading]);

    // Show nickname modal if user is logged in but has no nickname
    // Delay by 1.5s so the login success message is visible first
    useEffect(() => {
        if (user && !hasNickname) {
            const timeout = setTimeout(() => {
                setShowNicknameModal(true);
            }, 1500);
            return () => clearTimeout(timeout);
        }
    }, [user, hasNickname]);

    // New Tile State
    const [newTile, setNewTile] = useState<Partial<AppTileConfig>>({
        title: '',
        description: '',
        color: 'cyan',
        icon: 'BrainCircuit',
        appType: 'html',
        appContent: '',
        htmlCode: '',
        cssCode: '',
        jsCode: '',
        deployUrl: '',
        imageUrl: '',
        imageBrightness: 70,
        titleColor: 'white',
        descriptionColor: 'white',
        gradientColor: 'cyan',
        gradientIntensity: 50,
        size: 'medium',
        titleFontSize: 18,
        descriptionFontSize: 14
    });
    const newImageInputRef = useRef<HTMLInputElement>(null);
    const editImageInputRef = useRef<HTMLInputElement>(null);
    const [showCodePanels, setShowCodePanels] = useState(false);
    const [showEditCodePanels, setShowEditCodePanels] = useState(false);

    const availableColors = ['cyan', 'purple', 'pink', 'emerald', 'blue', 'amber', 'indigo', 'slate', 'neon-cyan', 'neon-pink', 'neon-purple', 'neon-green', 'neon-orange'];
    const textColors = ['white', 'black', 'cyan', 'purple', 'pink', 'emerald', 'blue', 'amber', 'red', 'yellow', 'neon-cyan', 'neon-pink', 'neon-purple', 'neon-green', 'neon-orange'];
    const gradientColors = ['cyan', 'purple', 'pink', 'emerald', 'blue', 'amber', 'indigo', 'neon-cyan', 'neon-pink', 'neon-purple', 'neon-green', 'neon-orange'];

    const getColorGlowStyle = (color: string) => {
        const glowMap: Record<string, React.CSSProperties> = {
            'neon-cyan': { boxShadow: '0 0 8px #22d3ee, 0 0 16px #22d3ee' },
            'neon-pink': { boxShadow: '0 0 8px #f472b6, 0 0 16px #f472b6' },
            'neon-purple': { boxShadow: '0 0 8px #c084fc, 0 0 16px #c084fc' },
            'neon-green': { boxShadow: '0 0 8px #4ade80, 0 0 16px #4ade80' },
            'neon-orange': { boxShadow: '0 0 8px #fb923c, 0 0 16px #fb923c' },
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

    const filteredTiles = tiles.filter(app => 
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Allow creation if:
        // - Image is uploaded, OR
        // - Title OR description is provided
        const hasImage = newTile.imageUrl && newTile.imageUrl.trim() !== '';
        const hasTitle = newTile.title && newTile.title.trim() !== '';
        const hasDescription = newTile.description && newTile.description.trim() !== '';

        if (!hasImage && !hasTitle && !hasDescription) {
            setModuleLimitError('Please add an image or enter a title and/or description.');
            return;
        }

        setModuleLimitError('');

        const tile: AppTileConfig = {
            id: '', // Firestore will generate the actual document ID
            title: newTile.title,
            description: newTile.description,
            color: newTile.color || 'cyan',
            icon: newTile.icon || 'Box',
            route: '', // Will be set after Firestore creates the document
            appType: newTile.appType || 'html',
            appContent: newTile.appContent || '',
            htmlCode: newTile.htmlCode || '',
            cssCode: newTile.cssCode || '',
            jsCode: newTile.jsCode || '',
            deployUrl: newTile.deployUrl || '',
            imageUrl: newTile.imageUrl || '',
            imageBrightness: newTile.imageBrightness ?? 70,
            titleColor: newTile.titleColor || 'white',
            descriptionColor: newTile.descriptionColor || 'white',
            gradientColor: newTile.gradientColor || 'cyan',
            gradientIntensity: newTile.gradientIntensity ?? 50,
            size: newTile.size || 'medium',
            titleFontSize: newTile.titleFontSize || 18,
            descriptionFontSize: newTile.descriptionFontSize || 14
        };

        const success = await addTile(tile, user.uid, user.email || '', nickname || '');
        
        if (!success) {
            setModuleLimitError('Module limit reached (20). Delete some modules to create more.');
            return;
        }

        setIsModalOpen(false);
        setModuleLimitError('');
        setNewTile({
            title: '',
            description: '',
            color: 'cyan',
            icon: 'BrainCircuit',
            appType: 'html',
            appContent: '',
            htmlCode: '',
            cssCode: '',
            jsCode: '',
            deployUrl: '',
            imageUrl: '',
            imageBrightness: 70,
            titleColor: 'white',
            descriptionColor: 'white',
            gradientColor: 'cyan',
            gradientIntensity: 50,
            size: 'medium',
            titleFontSize: 18,
            descriptionFontSize: 14
        });
        setShowCodePanels(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            if (isEdit && editingApp) {
                setEditingApp({ ...editingApp, imageUrl: base64, imageBrightness: editingApp.imageBrightness ?? 70 });
            } else {
                setNewTile({ ...newTile, imageUrl: base64, imageBrightness: newTile.imageBrightness ?? 70 });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (isEdit: boolean) => {
        if (isEdit && editingApp) {
            setEditingApp({ ...editingApp, imageUrl: '', imageBrightness: 70 });
        } else {
            setNewTile({ ...newTile, imageUrl: '', imageBrightness: 70 });
        }
    };

    const getPlaceholder = () => {
        switch (newTile.appType) {
            case 'html':
                return '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script>\n    // Your JS here\n  </script>\n</body>\n</html>';
            case 'react':
                return 'export default function App() {\n  return (\n    <div className="p-8">\n      <h1 className="text-2xl font-bold">Hello from React!</h1>\n    </div>\n  );\n}';
            case 'iframe':
                return 'https://example.com';
            default:
                return '';
        }
    };

    const handleEdit = (app: AppTileConfig) => {
        setEditingApp(app);
        setShowEditCodePanels(!!(app.htmlCode || app.cssCode || app.jsCode));
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingApp) return;

        await updateTile(editingApp.id, editingApp);
        setIsEditModalOpen(false);
        setEditingApp(null);
    };

    const editPlaceholder = () => {
        switch (editingApp?.appType) {
            case 'html':
                return '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script>\n    // Your JS here\n  </script>\n</body>\n</html>';
            case 'react':
                return 'export default function App() {\n  return (\n    <div className="p-8">\n      <h1 className="text-2xl font-bold">Hello from React!</h1>\n    </div>\n  );\n}';
            case 'iframe':
                return 'https://example.com';
            default:
                return '';
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">

            {/* Header Section */}
            <div className="mb-8 md:mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-cyan-400 max-w-2xl"
                            style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.3)' }}
                        >
                            Select a module to begin operations.
                        </motion.p>
                    </div>

                    {/* Global Tile Size Selector - Admin Only */}
                    {user && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex-shrink-0"
                    >
                        <label className="block text-sm font-medium text-slate-400 mb-2 text-center sm:text-right">Module Size</label>
                        <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map(size => (
                        <button
                            key={size}
                            onClick={() => setPreferredTileSize(size)}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${preferredTileSize === size
                                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            <div className={`bg-current opacity-60 rounded ${size === 'small' ? 'w-6 h-4' : size === 'large' ? 'w-6 h-10' : 'w-6 h-6'}`}></div>
                            <span className="text-xs font-medium capitalize">{size}</span>
                        </button>
                    ))}
                        </div>
                    </motion.div>
                    )}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min">
                {modulesLoading ? (
                    <div className="col-span-full flex items-center justify-center py-20">
                        <div className="text-slate-400 text-lg">Loading modules...</div>
                    </div>
                ) : (
                <AnimatePresence>
                    {filteredTiles.map((app, index) => {
                        const sizeClass = preferredTileSize === 'small' ? 'h-[100px]' : preferredTileSize === 'large' ? 'h-[300px]' : 'h-[200px]';
                        return (
                            <motion.div
                                key={app.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className={sizeClass}
                            >
                                <Tile app={app} index={index} onEdit={handleEdit} tileSize={preferredTileSize} />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                )}

                {/* Add New Tile Button - Any logged-in user, or message for non-auth users */}
                {user ? (
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
                ) : (
                    <motion.div
                        layout
                        className="group flex flex-col items-center justify-center min-h-[200px] rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02]"
                    >
                        <Lock className="h-8 w-8 text-slate-600 mb-3" />
                        <span className="text-sm font-medium text-slate-500">Login to manage modules</span>
                    </motion.div>
                )}
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
                            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scroll-smooth rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
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
                                        value={newTile.title}
                                        onChange={(e) => setNewTile({ ...newTile, title: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                        placeholder="e.g. Deep Space Comms"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={newTile.description}
                                        onChange={(e) => setNewTile({ ...newTile, description: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                        placeholder="Purpose of this module..."
                                    />
                                </div>

                                {/* Module Limit Error */}
                                {moduleLimitError && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {moduleLimitError}
                                    </div>
                                )}

                                {/* App Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">App Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewTile({ ...newTile, appType: 'html' })}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${newTile.appType === 'html'
                                                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <FileCode size={24} />
                                            <span className="text-sm font-medium">HTML/CSS/JS</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewTile({ ...newTile, appType: 'iframe' })}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${newTile.appType === 'iframe'
                                                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <Globe size={24} />
                                            <span className="text-sm font-medium">Iframe</span>
                                        </button>
                                    </div>
                                </div>

                                {/* App Content */}
                                {newTile.appType !== 'iframe' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-slate-400">
                                                Code
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowCodePanels(!showCodePanels)}
                                                className="text-xs px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                {showCodePanels ? 'Single Field' : 'Split Panels'}
                                            </button>
                                        </div>
                                        
                                        {showCodePanels ? (
                                            <div className="grid grid-cols-3 gap-2 h-64">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-orange-400 mb-1 font-mono">HTML</span>
                                                    <textarea
                                                        value={newTile.htmlCode || ''}
                                                        onChange={(e) => setNewTile({ ...newTile, htmlCode: e.target.value })}
                                                        className="flex-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-white font-mono text-xs focus:border-orange-500 focus:outline-none resize-none"
                                                        placeholder="<div>HTML here</div>"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-cyan-400 mb-1 font-mono">CSS</span>
                                                    <textarea
                                                        value={newTile.cssCode || ''}
                                                        onChange={(e) => setNewTile({ ...newTile, cssCode: e.target.value })}
                                                        className="flex-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none resize-none"
                                                        placeholder=".class { color: red; }"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-yellow-400 mb-1 font-mono">JS</span>
                                                    <textarea
                                                        value={newTile.jsCode || ''}
                                                        onChange={(e) => setNewTile({ ...newTile, jsCode: e.target.value })}
                                                        className="flex-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-white font-mono text-xs focus:border-yellow-500 focus:outline-none resize-none"
                                                        placeholder="console.log('Hello');"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <textarea
                                                value={newTile.appContent}
                                                onChange={(e) => setNewTile({ ...newTile, appContent: e.target.value })}
                                                className="w-full h-64 rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                                placeholder={getPlaceholder()}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Deploy URL */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Deploy URL (optional)</label>
                                    <input
                                        type="url"
                                        value={newTile.deployUrl}
                                        onChange={(e) => setNewTile({ ...newTile, deployUrl: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                        placeholder="https://my-app.example.com"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">External URL to open when deploying this module</p>
                                </div>

                                {/* Module Image */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Module Image (optional)</label>
                                    <input
                                        ref={newImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, false)}
                                        className="hidden"
                                    />
                                    {newTile.imageUrl ? (
                                        <div className="relative rounded-lg border border-white/10 overflow-hidden">
                                            <img src={newTile.imageUrl} alt="Module preview" className="w-full h-32 object-cover" />
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => newImageInputRef.current?.click()}
                                                    className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
                                                >
                                                    <Upload size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(false)}
                                                    className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            {/* Brightness Slider */}
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <label className="text-xs text-white/80 mb-1 block">Brightness</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={newTile.imageBrightness ?? 70}
                                                    onChange={(e) => setNewTile({ ...newTile, imageBrightness: Number(e.target.value) })}
                                                    className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(255,255,255,0.8) 100%)`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => newImageInputRef.current?.click()}
                                            className="w-full h-32 rounded-lg border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors"
                                        >
                                            <Image size={24} />
                                            <span className="text-sm">Upload an image</span>
                                        </button>
                                    )}
                                    <p className="mt-1 text-xs text-slate-500">Recommended: 400x200px or similar ratio (Max 5MB)</p>
                                </div>

                                {/* Gradient Background Color */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Gradient Background Color</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {gradientColors.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewTile({ ...newTile, gradientColor: c })}
                                                className={`h-8 w-8 rounded-lg border-2 transition-all flex items-center justify-center ${newTile.gradientColor === c ? 'border-cyan-500 scale-110' : 'border-white/20 hover:scale-105'}`}
                                                style={{ 
                                                    backgroundColor: getGradientColorHex(c),
                                                    ...getColorGlowStyle(c)
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Gradient Intensity */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Gradient Intensity</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={newTile.gradientIntensity ?? 50}
                                        onChange={(e) => setNewTile({ ...newTile, gradientIntensity: Number(e.target.value) })}
                                        className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, transparent 0%, ${getGradientColorHex(newTile.gradientColor || 'cyan')} 100%)`,
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Accent Color</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {availableColors.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setNewTile({ ...newTile, color: c })}
                                                    className={`h-8 w-8 rounded-full border-2 transition-all ${newTile.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                                    style={getColorGlowStyle(c)}
                                                >
                                                    <div className={`w-full h-full rounded-full bg-${c}-500`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Title Color</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {textColors.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setNewTile({ ...newTile, titleColor: c })}
                                                    className={`h-8 w-8 rounded-lg border-2 transition-all flex items-center justify-center ${newTile.titleColor === c ? 'border-cyan-500 scale-110' : 'border-white/20 hover:scale-105'}`}
                                                    style={{ 
                                                        backgroundColor: c === 'white' ? '#ffffff' : c === 'black' ? '#000000' : undefined,
                                                        ...getColorGlowStyle(c)
                                                    }}
                                                >
                                                    {c !== 'white' && c !== 'black' && (
                                                        <div className={`w-full h-full rounded-md bg-${c}-500`} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Description Color</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {textColors.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setNewTile({ ...newTile, descriptionColor: c })}
                                                    className={`h-8 w-8 rounded-lg border-2 transition-all flex items-center justify-center ${newTile.descriptionColor === c ? 'border-cyan-500 scale-110' : 'border-white/20 hover:scale-105'}`}
                                                    style={{ 
                                                        backgroundColor: c === 'white' ? '#ffffff' : c === 'black' ? '#000000' : undefined,
                                                        ...getColorGlowStyle(c)
                                                    }}
                                                >
                                                    {c !== 'white' && c !== 'black' && (
                                                        <div className={`w-full h-full rounded-md bg-${c}-500`} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Title Font Size */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Title Font Size</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[12, 14, 16, 18, 24].map(size => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setNewTile({ ...newTile, titleFontSize: size })}
                                                    className={`h-8 rounded-lg border transition-all flex items-center justify-center text-white ${newTile.titleFontSize === size || (size === 18 && !newTile.titleFontSize) ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description Font Size */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Description Font Size</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[10, 12, 14, 16, 18].map(size => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setNewTile({ ...newTile, descriptionFontSize: size })}
                                                    className={`h-8 rounded-lg border transition-all flex items-center justify-center text-white ${newTile.descriptionFontSize === size || (size === 14 && !newTile.descriptionFontSize) ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                                >
                                                    {size}
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
                                                        onClick={() => setNewTile({ ...newTile, icon: iconName })}
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

            {/* Edit Module Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scroll-smooth rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Edit Module</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Module Name</label>
                                    <input
                                        type="text"
                                        value={editingApp.title}
                                        onChange={(e) => setEditingApp({ ...editingApp, title: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={editingApp.description}
                                        onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                </div>

                                {/* App Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">App Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setEditingApp({ ...editingApp, appType: 'html' })}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${editingApp.appType === 'html'
                                                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <FileCode size={24} />
                                            <span className="text-sm font-medium">HTML/CSS/JS</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingApp({ ...editingApp, appType: 'iframe' })}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${editingApp.appType === 'iframe'
                                                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <Globe size={24} />
                                            <span className="text-sm font-medium">Iframe</span>
                                        </button>
                                    </div>
                                </div>

                                {/* App Content */}
                                {editingApp.appType !== 'iframe' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-slate-400">
                                                Code
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowEditCodePanels(!showEditCodePanels)}
                                                className="text-xs px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                {showEditCodePanels ? 'Single Field' : 'Split Panels'}
                                            </button>
                                        </div>
                                        
                                        {showEditCodePanels ? (
                                            <div className="grid grid-cols-3 gap-2 h-64">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-orange-400 mb-1 font-mono">HTML</span>
                                                    <textarea
                                                        value={editingApp.htmlCode || ''}
                                                        onChange={(e) => setEditingApp({ ...editingApp, htmlCode: e.target.value })}
                                                        className="flex-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-white font-mono text-xs focus:border-orange-500 focus:outline-none resize-none"
                                                        placeholder="<div>HTML here</div>"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-cyan-400 mb-1 font-mono">CSS</span>
                                                    <textarea
                                                        value={editingApp.cssCode || ''}
                                                        onChange={(e) => setEditingApp({ ...editingApp, cssCode: e.target.value })}
                                                        className="flex-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none resize-none"
                                                        placeholder=".class { color: red; }"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-yellow-400 mb-1 font-mono">JS</span>
                                                    <textarea
                                                        value={editingApp.jsCode || ''}
                                                        onChange={(e) => setEditingApp({ ...editingApp, jsCode: e.target.value })}
                                                        className="flex-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-white font-mono text-xs focus:border-yellow-500 focus:outline-none resize-none"
                                                        placeholder="console.log('Hello');"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <textarea
                                                value={editingApp.appContent || ''}
                                                onChange={(e) => setEditingApp({ ...editingApp, appContent: e.target.value })}
                                                className="w-full h-64 rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                                placeholder={editPlaceholder()}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Deploy URL */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Deploy URL (optional)</label>
                                    <input
                                        type="url"
                                        value={editingApp.deployUrl || ''}
                                        onChange={(e) => setEditingApp({ ...editingApp, deployUrl: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                        placeholder="https://my-app.example.com"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">External URL to open when deploying this module</p>
                                </div>

                                {/* Module Image */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Module Image (optional)</label>
                                    <input
                                        ref={editImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, true)}
                                        className="hidden"
                                    />
                                    {editingApp.imageUrl ? (
                                        <div className="relative rounded-lg border border-white/10 overflow-hidden">
                                            <img src={editingApp.imageUrl} alt="Module preview" className="w-full h-32 object-cover" />
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => editImageInputRef.current?.click()}
                                                    className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
                                                >
                                                    <Upload size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(true)}
                                                    className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            {/* Brightness Slider */}
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <label className="text-xs text-white/80 mb-1 block">Brightness</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={editingApp.imageBrightness ?? 70}
                                                    onChange={(e) => setEditingApp({ ...editingApp, imageBrightness: Number(e.target.value) })}
                                                    className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(255,255,255,0.8) 100%)`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => editImageInputRef.current?.click()}
                                            className="w-full h-32 rounded-lg border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors"
                                        >
                                            <Image size={24} />
                                            <span className="text-sm">Upload an image</span>
                                        </button>
                                    )}
                                    <p className="mt-1 text-xs text-slate-500">Recommended: 400x200px or similar ratio (Max 5MB)</p>
                                </div>

                                {/* Gradient Background Color */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Gradient Background Color</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {gradientColors.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setEditingApp({ ...editingApp, gradientColor: c })}
                                                className={`h-8 w-8 rounded-lg border-2 transition-all flex items-center justify-center ${editingApp.gradientColor === c ? 'border-cyan-500 scale-110' : 'border-white/20 hover:scale-105'}`}
                                                style={{ 
                                                    backgroundColor: getGradientColorHex(c),
                                                    ...getColorGlowStyle(c)
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Gradient Intensity */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Gradient Intensity</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={editingApp.gradientIntensity ?? 50}
                                        onChange={(e) => setEditingApp({ ...editingApp, gradientIntensity: Number(e.target.value) })}
                                        className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, transparent 0%, ${getGradientColorHex(editingApp.gradientColor || 'cyan')} 100%)`,
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Accent Color</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {availableColors.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setEditingApp({ ...editingApp, color: c })}
                                                    className={`h-8 w-8 rounded-full border-2 transition-all ${editingApp.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                                    style={getColorGlowStyle(c)}
                                                >
                                                    <div className={`w-full h-full rounded-full bg-${c}-500`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Title Color</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {textColors.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setEditingApp({ ...editingApp, titleColor: c })}
                                                    className={`h-8 w-8 rounded-lg border-2 transition-all flex items-center justify-center ${editingApp.titleColor === c ? 'border-cyan-500 scale-110' : 'border-white/20 hover:scale-105'}`}
                                                    style={{ 
                                                        backgroundColor: c === 'white' ? '#ffffff' : c === 'black' ? '#000000' : undefined,
                                                        ...getColorGlowStyle(c)
                                                    }}
                                                >
                                                    {c !== 'white' && c !== 'black' && (
                                                        <div className={`w-full h-full rounded-md bg-${c}-500`} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Description Color</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {textColors.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setEditingApp({ ...editingApp, descriptionColor: c })}
                                                    className={`h-8 w-8 rounded-lg border-2 transition-all flex items-center justify-center ${editingApp.descriptionColor === c ? 'border-cyan-500 scale-110' : 'border-white/20 hover:scale-105'}`}
                                                    style={{ 
                                                        backgroundColor: c === 'white' ? '#ffffff' : c === 'black' ? '#000000' : undefined,
                                                        ...getColorGlowStyle(c)
                                                    }}
                                                >
                                                    {c !== 'white' && c !== 'black' && (
                                                        <div className={`w-full h-full rounded-md bg-${c}-500`} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Title Font Size */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Title Font Size</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[12, 14, 16, 18, 24].map(size => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setEditingApp({ ...editingApp, titleFontSize: size })}
                                                    className={`h-8 rounded-lg border transition-all flex items-center justify-center text-white ${editingApp.titleFontSize === size || (size === 18 && !editingApp.titleFontSize) ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description Font Size */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Description Font Size</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[10, 12, 14, 16, 18].map(size => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setEditingApp({ ...editingApp, descriptionFontSize: size })}
                                                    className={`h-8 rounded-lg border transition-all flex items-center justify-center text-white ${editingApp.descriptionFontSize === size || (size === 14 && !editingApp.descriptionFontSize) ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                                >
                                                    {size}
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
                                                        onClick={() => setEditingApp({ ...editingApp, icon: iconName })}
                                                        className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-all ${editingApp.icon === iconName ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
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
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Nickname Selection Modal */}
            <NicknameModal isOpen={showNicknameModal} onClose={() => setShowNicknameModal(false)} />
        </div>
    );
};
