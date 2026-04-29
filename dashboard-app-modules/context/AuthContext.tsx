import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

interface UserRole {
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  nickname?: string;
  displayName?: string;
  createdAt?: Date;
  preferredTileSize?: 'small' | 'medium' | 'large';
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  hasNickname: boolean;
  nickname: string | null;
  preferredTileSize: 'small' | 'medium' | 'large';
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (uid: string, newRole: 'super_admin' | 'admin' | 'user') => Promise<void>;
  setNickname: (nickname: string) => Promise<boolean>;
  isNicknameAvailable: (nickname: string) => Promise<boolean>;
  setPreferredTileSize: (size: 'small' | 'medium' | 'large') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to add timeout to promises
const withTimeout = (promise: Promise<any>, ms: number) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

const RESERVED_NICKNAMES = [
  'login', 'dashboard', 'admin', 'api', 'app', 'auth', 'signup', 'register',
  'settings', 'profile', 'logout', 'home', 'about', 'contact', 'help',
  'support', 'docs', 'status', 'health', 'favicon', 'robots',
  'sitemap', 'public', 'private', 'static', 'assets', 'dist', 'src'
];

const SUPER_ADMIN_EMAIL = 'edilegrand@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || userRole?.role === 'super_admin';
  const isAdmin = isSuperAdmin || userRole?.role === 'admin';
  const hasNickname = !!userRole?.nickname;
  const nickname = userRole?.nickname || null;
  const preferredTileSize = userRole?.preferredTileSize || 'medium';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      // Safety timeout - never stay loading for more than 5 seconds
      const safetyTimeout = setTimeout(() => {
        setLoading(false);
      }, 5000);

      try {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // Check if super admin by email
          const isEmailSuperAdmin = firebaseUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
          
          // Try to fetch role with 3-second timeout
          try {
            const userDoc = await withTimeout(getDoc(userDocRef), 3000);
            
            if ((userDoc as any).exists()) {
              const roleData = (userDoc as any).data() as UserRole;
              // Override to super_admin if email matches
              if (isEmailSuperAdmin && roleData.role !== 'super_admin') {
                await updateDoc(userDocRef, { role: 'super_admin' });
                roleData.role = 'super_admin';
              }
              setUserRole(roleData);
            } else {
              // New user - default to 'user' role, or super_admin if email matches
              const newRole: UserRole = {
                email: firebaseUser.email || '',
                role: isEmailSuperAdmin ? 'super_admin' : 'user',
                displayName: firebaseUser.displayName || undefined,
                createdAt: new Date()
              };
              await setDoc(userDocRef, newRole);
              setUserRole(newRole);
            }
          } catch {
            // Firestore failed or timed out - default to user role
            setUserRole({ 
              email: firebaseUser.email || '', 
              role: isEmailSuperAdmin ? 'super_admin' : 'user' 
            });
          }
        } else {
          // User logged out - clear everything
          setUserRole(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUserRole(firebaseUser ? { 
          email: firebaseUser.email || '', 
          role: firebaseUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'super_admin' : 'user' 
        } : null);
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    const newRole: UserRole = {
      email,
      role: 'user',
      displayName: displayName || undefined,
      createdAt: new Date()
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), newRole);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user document exists, create if not
    const userDocRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const newRole: UserRole = {
        email: result.user.email || '',
        role: 'user',
        displayName: result.user.displayName || undefined,
        createdAt: new Date()
      };
      await setDoc(userDocRef, newRole);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserRole = async (uid: string, newRole: 'super_admin' | 'admin' | 'user') => {
    if (!isSuperAdmin) {
      throw new Error('Only Super Admin can update user roles');
    }
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { role: newRole });
  };

  const isNicknameAvailable = async (nickname: string): Promise<boolean> => {
    const normalized = nickname.toLowerCase().trim();
    
    if (normalized.length < 3 || normalized.length > 20) return false;
    if (!/^[a-z0-9-]+$/.test(normalized)) return false;
    if (RESERVED_NICKNAMES.includes(normalized)) return false;

    const q = query(collection(db, 'users'), where('nickname', '==', normalized));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const setNickname = async (nickname: string): Promise<boolean> => {
    if (!user || userRole?.nickname) return false;
    
    const normalized = nickname.toLowerCase().trim();
    
    if (normalized.length < 3 || normalized.length > 20) return false;
    if (!/^[a-z0-9-]+$/.test(normalized)) return false;
    if (RESERVED_NICKNAMES.includes(normalized)) return false;

    const available = await isNicknameAvailable(normalized);
    if (!available) return false;

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { nickname: normalized });
    setUserRole(prev => prev ? { ...prev, nickname: normalized } : null);
    return true;
  };

  const setPreferredTileSize = async (size: 'small' | 'medium' | 'large') => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { preferredTileSize: size });
    setUserRole(prev => prev ? { ...prev, preferredTileSize: size } : null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, isSuperAdmin, isAdmin, hasNickname, nickname, preferredTileSize, signIn, signUp, signInWithGoogle, logout, updateUserRole, setNickname, isNicknameAvailable, setPreferredTileSize }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
