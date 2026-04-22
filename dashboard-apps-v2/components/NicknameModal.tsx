import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({ isOpen, onClose }) => {
  const { setNickname, isNicknameAvailable } = useAuth();
  const [nickname, setNicknameInput] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!nickname) {
      setIsAvailable(null);
      setError('');
      return;
    }

    const normalized = nickname.toLowerCase().trim();
    
    if (normalized.length < 3) {
      setIsAvailable(false);
      setError('Must be at least 3 characters');
      return;
    }
    if (normalized.length > 20) {
      setIsAvailable(false);
      setError('Must be 20 characters or less');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(normalized)) {
      setIsAvailable(false);
      setError('Only letters, numbers, and hyphens allowed');
      return;
    }

    const checkAvailability = async () => {
      setIsChecking(true);
      try {
        const available = await isNicknameAvailable(normalized);
        setIsAvailable(available);
        setError(available ? '' : 'This nickname is already taken');
      } catch {
        setError('Error checking availability');
      } finally {
        setIsChecking(false);
      }
    };

    const timeout = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeout);
  }, [nickname, isNicknameAvailable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || isChecking) return;

    setIsSubmitting(true);
    try {
      const success = await setNickname(nickname.toLowerCase().trim());
      if (success) {
        onClose();
      } else {
        setError('Failed to set nickname. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Choose Your Nickname</h2>
            </div>

            <p className="text-slate-400 mb-4 text-sm">
              This will be your unique URL: <span className="text-cyan-400">modulesdashboard.com/{nickname || '...'}</span>
            </p>
            <p className="text-slate-500 mb-6 text-xs">
              This nickname is permanent and cannot be changed later.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nickname</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNicknameInput(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    className={`w-full rounded-lg border bg-white/5 px-4 py-2 text-white focus:outline-none focus:ring-1 pr-10 ${
                      isAvailable === true
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                        : isAvailable === false
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-white/10 focus:border-cyan-500 focus:ring-cyan-500'
                    }`}
                    placeholder="e.g. mikke2"
                    maxLength={20}
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking ? (
                      <Loader2 size={18} className="text-slate-400 animate-spin" />
                    ) : isAvailable === true ? (
                      <Check size={18} className="text-green-400" />
                    ) : isAvailable === false ? (
                      <AlertCircle size={18} className="text-red-400" />
                    ) : null}
                  </div>
                </div>
                {error && (
                  <p className="mt-1 text-xs text-red-400">{error}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  3-20 characters, letters, numbers, and hyphens only
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={!isAvailable || isChecking || isSubmitting}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
