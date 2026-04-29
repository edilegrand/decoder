import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppTileConfig } from '../types';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface AppContextType {
  tiles: AppTileConfig[];
  addTile: (tile: AppTileConfig, userId: string, userEmail: string, userNickname: string) => Promise<boolean>;
  removeTile: (id: string) => Promise<void>;
  updateTile: (id: string, updatedTile: Partial<AppTileConfig>) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  globalTileSize: 'small' | 'medium' | 'large';
  setGlobalTileSize: (size: 'small' | 'medium' | 'large') => void;
  userModuleCount: number;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [globalTileSize, setGlobalTileSize] = useState<'small' | 'medium' | 'large'>(() => {
    try {
      const saved = localStorage.getItem('global_tile_size');
      return (saved as 'small' | 'medium' | 'large') || 'medium';
    } catch {
      return 'medium';
    }
  });

  useEffect(() => {
    localStorage.setItem('global_tile_size', globalTileSize);
  }, [globalTileSize]);

  const [tiles, setTiles] = useState<AppTileConfig[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Ref to store the current unsubscribe function
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Cleanup listener on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const loadUserModules = useCallback((userId: string) => {
    // Clear any existing listener immediately
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setLoading(true);
    const q = query(
      collection(db, 'modules'),
      where('ownerId', '==', userId)
    );

    // Use a local variable to track this specific listener
    const currentUnsubscribe = onSnapshot(q, 
      (snapshot) => {
        const modules = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        } as AppTileConfig));
        // Sort client-side by createdAt (newest first)
        modules.sort((a, b) => {
          const aTs = (a as any).createdAt;
          const bTs = (b as any).createdAt;
          const aTime = aTs?.seconds || aTs?._seconds || 0;
          const bTime = bTs?.seconds || bTs?._seconds || 0;
          return bTime - aTime;
        });
        setTiles(modules);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading user modules:', error);
        setLoading(false);
      }
    );
    
    // Only set as current if it hasn't been replaced
    unsubscribeRef.current = currentUnsubscribe;
  }, []);

  const loadPublicModules = useCallback((nickname: string) => {
    // Clear any existing listener immediately
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setLoading(true);
    const q = query(
      collection(db, 'modules'),
      where('ownerNickname', '==', nickname)
    );

    // Use a local variable to track this specific listener
    const currentUnsubscribe = onSnapshot(q, 
      (snapshot) => {
        const modules = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        } as AppTileConfig));
        // Sort client-side by createdAt (newest first)
        modules.sort((a, b) => {
          const aTs = (a as any).createdAt;
          const bTs = (b as any).createdAt;
          const aTime = aTs?.seconds || aTs?._seconds || 0;
          const bTime = bTs?.seconds || bTs?._seconds || 0;
          return bTime - aTime;
        });
        setTiles(modules);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading public modules:', error);
        setLoading(false);
      }
    );
    
    // Only set as current if it hasn't been replaced
    unsubscribeRef.current = currentUnsubscribe;
  }, []);

  const loadAllPublicModules = useCallback(() => {
    // Clear any existing listener immediately
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setLoading(true);
    // No where clause — fetches every module for public discovery
    const q = collection(db, 'modules');

    // Use a local variable to track this specific listener
    const currentUnsubscribe = onSnapshot(q,
      (snapshot) => {
        const modules = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        } as AppTileConfig));
        modules.sort((a, b) => {
          const aTs = (a as any).createdAt;
          const bTs = (b as any).createdAt;
          const aTime = aTs?.seconds || aTs?._seconds || 0;
          const bTime = bTs?.seconds || bTs?._seconds || 0;
          return bTime - aTime;
        });
        setTiles(modules);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading all public modules:', error);
        setLoading(false);
      }
    );
    
    // Only set as current if it hasn't been replaced
    unsubscribeRef.current = currentUnsubscribe;
  }, []);

  // Expose load functions via context for child components to call
  // We'll attach them to window temporarily so Dashboard/PublicDashboard can access them
  useEffect(() => {
    (window as any).__loadUserModules = loadUserModules;
    (window as any).__loadPublicModules = loadPublicModules;
    (window as any).__loadAllPublicModules = loadAllPublicModules;
    return () => {
      delete (window as any).__loadUserModules;
      delete (window as any).__loadPublicModules;
      delete (window as any).__loadAllPublicModules;
    };
  }, [loadUserModules, loadPublicModules, loadAllPublicModules]);

  const getUserModuleCount = (userId: string) => {
    return tiles.filter(tile => tile.ownerId === userId).length;
  };

  const addTile = async (tile: AppTileConfig, userId: string, userEmail: string, userNickname: string): Promise<boolean> => {
    const userCount = getUserModuleCount(userId);
    const isAdmin = userEmail === 'edilegrand@gmail.com';
    
    if (!isAdmin && userCount >= 20) {
      return false;
    }

    try {
      const docRef = await addDoc(collection(db, 'modules'), {
        ...tile,
        ownerId: userId,
        ownerEmail: userEmail,
        ownerNickname: userNickname,
        createdAt: serverTimestamp()
      });

      // Update the document with its own ID and route (Firestore auto-generated ID)
      const route = `/app/${docRef.id}`;
      await updateDoc(docRef, { id: docRef.id, route });
      
      // onSnapshot will automatically update state
      return true;
    } catch (error) {
      console.error('Error adding module:', error);
      return false;
    }
  };

  const removeTile = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'modules', id));
      // onSnapshot will automatically update state
    } catch (error) {
      console.error('Error removing module:', error);
    }
  };

  const updateTile = async (id: string, updatedTile: Partial<AppTileConfig>) => {
    try {
      const tileRef = doc(db, 'modules', id);
      const { id: _, ...dataToUpdate } = updatedTile;
      await updateDoc(tileRef, dataToUpdate);
      // onSnapshot will automatically update state
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };

  const userModuleCount = tiles.length;

  return (
    <AppContext.Provider value={{ 
      tiles, 
      addTile, 
      removeTile, 
      updateTile, 
      searchQuery, 
      setSearchQuery, 
      globalTileSize, 
      setGlobalTileSize,
      userModuleCount,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Helper functions for components to load modules
export const loadUserModules = (userId: string) => {
  (window as any).__loadUserModules?.(userId);
};

export const loadPublicModules = (nickname: string) => {
  (window as any).__loadPublicModules?.(nickname);
};

export const loadAllPublicModules = () => {
  (window as any).__loadAllPublicModules?.();
};
