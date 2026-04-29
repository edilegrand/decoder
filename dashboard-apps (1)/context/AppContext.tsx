import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTileConfig } from '../types';
import { DEFAULT_APP_TILES } from '../constants';

interface AppContextType {
  tiles: AppTileConfig[];
  addTile: (tile: AppTileConfig) => void;
  removeTile: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or fallback to defaults
  const [tiles, setTiles] = useState<AppTileConfig[]>(() => {
    try {
      const saved = localStorage.getItem('dashboard_tiles');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load tiles", e);
    }
    return DEFAULT_APP_TILES;
  });

  // Save to localStorage whenever tiles change
  useEffect(() => {
    localStorage.setItem('dashboard_tiles', JSON.stringify(tiles));
  }, [tiles]);

  const addTile = (tile: AppTileConfig) => {
    setTiles((prev) => [...prev, tile]);
  };

  const removeTile = (id: string) => {
    setTiles((prev) => prev.filter((tile) => tile.id !== id));
  };

  return (
    <AppContext.Provider value={{ tiles, addTile, removeTile }}>
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
