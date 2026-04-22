import React, { useEffect, useState, useRef } from 'react';
import { Tile } from './Tile';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { User, ArrowLeft, Loader2 } from 'lucide-react';
import { loadPublicModules } from '../context/AppContext';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/config';

export const PublicDashboard: React.FC = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const { tiles, loading: modulesLoading, searchQuery } = useAppContext();
  const { user } = useAuth();
  const [userNotFound, setUserNotFound] = useState(false);
  const [ownerTileSize, setOwnerTileSize] = useState<'small' | 'medium' | 'large'>('medium');
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (nickname) {
      setUserNotFound(false);
      loadPublicModules(nickname.toLowerCase());
      
      // Unsubscribe from previous listener if exists
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // Set up real-time listener for owner's preferred tile size
      const q = query(collection(db, 'users'), where('nickname', '==', nickname.toLowerCase()));
      unsubscribeRef.current = onSnapshot(q,
        (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setOwnerTileSize(data.preferredTileSize || 'medium');
          }
        },
        (error) => {
          console.error('Error listening to owner tile size:', error);
        }
      );
    }

    // Cleanup listener on unmount or nickname change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [nickname]);

  const isOwner = user && tiles.length > 0 && tiles[0].ownerId === user.uid;

  const filteredTiles = tiles.filter(app => 
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back to Home</span>
            </Link>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                <User size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {nickname}'s Dashboard
                </h1>
                <p className="text-sm text-slate-400">
                  modulesdashboard.com/{nickname}
                </p>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-cyan-400 max-w-2xl mt-2"
              style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.3)' }}
            >
              {isOwner
                ? 'This is your workspace. You can manage these modules.'
                : 'Browse this user\'s public modules.'}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min">
        {modulesLoading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-400 text-lg">
              <Loader2 size={24} className="animate-spin" />
              Loading modules...
            </div>
          </div>
        ) : tiles.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <User size={48} className="text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg mb-2">No modules found</p>
            <p className="text-slate-500 text-sm">
              {nickname} hasn't created any modules yet.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTiles.map((app, index) => {
              const sizeClass = ownerTileSize === 'small' ? 'h-[100px]' : ownerTileSize === 'large' ? 'h-[300px]' : 'h-[200px]';
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
                  <Tile app={app} index={index} onEdit={() => {}} tileSize={ownerTileSize} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
