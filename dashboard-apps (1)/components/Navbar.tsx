import React, { useState } from 'react';
import { Search, Bell, User, Hexagon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <Hexagon className="h-8 w-8 text-cyan-500 fill-cyan-500/20" />
          </motion.div>
          <span className="text-xl font-bold tracking-wider text-white">
            DASHBOARD
          </span>
        </Link>

        {/* Desktop Search & Actions */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-6">
          <div className="relative group w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search apps, commands..."
              className="block w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 hover:bg-white/10 transition-colors">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px]">
                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <span className="text-sm font-medium text-white">Admin</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-slate-900/90 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 py-4 space-y-4">
               <input
                type="text"
                placeholder="Search..."
                className="block w-full rounded-md border border-white/10 bg-white/5 p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <div className="flex items-center gap-3 text-white p-2 hover:bg-white/5 rounded">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </div>
               <div className="flex items-center gap-3 text-white p-2 hover:bg-white/5 rounded">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};