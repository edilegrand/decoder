import { 
  BrainCircuit, 
  BarChart3, 
  Image, 
  Activity, 
  Settings, 
  Globe,
  ShieldCheck,
  Zap,
  Box,
  Terminal,
  Cpu,
  Database,
  Cloud,
  Lock,
  Wifi,
  Radio,
  LucideIcon
} from 'lucide-react';
import { AppTileConfig } from './types';

export const ICON_MAP: Record<string, LucideIcon> = {
  BrainCircuit,
  BarChart3,
  Image,
  Activity,
  Settings,
  Globe,
  ShieldCheck,
  Zap,
  Box,
  Terminal,
  Cpu,
  Database,
  Cloud,
  Lock,
  Wifi,
  Radio
};

export const DEFAULT_APP_TILES: AppTileConfig[] = [
  {
    id: 'ai-core',
    title: 'Nexus AI',
    description: 'Advanced neural processing unit interface.',
    icon: 'BrainCircuit',
    color: 'cyan',
    route: '/app/ai-core'
  },
  {
    id: 'analytics',
    title: 'Data Vis',
    description: 'Real-time market analytics and projections.',
    icon: 'BarChart3',
    color: 'purple',
    route: '/app/analytics'
  },
  {
    id: 'media',
    title: 'Media Hub',
    description: 'Holographic asset management system.',
    icon: 'Image',
    color: 'pink',
    route: '/app/media'
  },
  {
    id: 'system',
    title: 'Sys Status',
    description: 'Network topology and server health.',
    icon: 'Activity',
    color: 'emerald',
    route: '/app/system'
  },
  {
    id: 'security',
    title: 'Guardian',
    description: 'Firewall and intrusion detection.',
    icon: 'ShieldCheck',
    color: 'blue',
    route: '/app/security'
  },
  {
    id: 'power',
    title: 'Energy Grid',
    description: 'Power distribution monitoring.',
    icon: 'Zap',
    color: 'amber',
    route: '/app/power'
  },
  {
    id: 'network',
    title: 'Global Net',
    description: 'Satellite uplink controls.',
    icon: 'Globe',
    color: 'indigo',
    route: '/app/network'
  },
  {
    id: 'settings',
    title: 'Config',
    description: 'User preferences and interface settings.',
    icon: 'Settings',
    color: 'slate',
    route: '/app/settings'
  }
];
