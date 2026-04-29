export interface AppTileConfig {
  id: string;
  title: string;
  description: string;
  icon: string; // Key for the ICON_MAP
  color: string; // Tailwind color class fragment (e.g., 'cyan', 'purple')
  route: string;
  // New fields for app content
  appType?: 'html' | 'react' | 'iframe';
  appContent?: string; // Single code field (backward compatibility)
  htmlCode?: string; // Separate HTML code for playground
  cssCode?: string; // Separate CSS code for playground
  jsCode?: string; // Separate JavaScript code for playground
  deployUrl?: string; // External URL to deploy/open the app
  imageUrl?: string; // Custom image URL for the module
  imageBrightness?: number; // Image brightness control (0-100, default 70)
  titleColor?: string; // Custom color for title
  descriptionColor?: string; // Custom color for description
  gradientColor?: string; // Background gradient color
  gradientIntensity?: number; // Background gradient intensity (0-100, default 50)
  size?: 'small' | 'medium' | 'large'; // Module size (default: 'medium')
  titleFontSize?: number; // Title font size in pixels (default: 18)
  descriptionFontSize?: number; // Description font size in pixels (default: 14)
  ownerId?: string; // User ID who created this module
  ownerEmail?: string; // Email of the owner
  ownerNickname?: string; // Nickname of the owner (for public URL)
}

export interface UserProfile {
  email: string;
  nickname?: string;
  role: 'super_admin' | 'admin' | 'user';
  displayName?: string;
  createdAt?: Date;
  preferredTileSize?: 'small' | 'medium' | 'large';
}

export interface NavItem {
  label: string;
  href: string;
}
