export interface AppTileConfig {
  id: string;
  title: string;
  description: string;
  icon: string; // Key for the ICON_MAP
  color: string; // Tailwind color class fragment (e.g., 'cyan', 'purple')
  route: string;
}

export interface NavItem {
  label: string;
  href: string;
}
