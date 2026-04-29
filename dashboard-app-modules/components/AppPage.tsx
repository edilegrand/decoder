import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ICON_MAP } from '../constants';
import { ArrowLeft, Hexagon, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

// Component to render HTML/JS apps in an iframe
const HTMLAppRenderer: React.FC<{ content?: string }> = ({ content }) => {
  if (!content || content.trim() === '') {
    return (
      <div className="w-full h-full min-h-[600px] rounded-xl border border-white/10 bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">No HTML content provided</p>
      </div>
    );
  }
  
  return (
    <iframe
      srcDoc={content}
      className="w-full h-full min-h-[600px] rounded-xl border border-white/10 bg-white"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      title="App Content"
    />
  );
};

// Component to render iframe apps
const IframeAppRenderer: React.FC<{ url: string }> = ({ url }) => {
  return (
    <iframe
      src={url}
      className="w-full h-full min-h-[600px] rounded-xl border border-white/10"
      title="External App"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    />
  );
};

export const AppPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const { tiles } = useAppContext();

  // Find tile by ID or route 
  const app = tiles.find(t => t.id === appId || t.route === `/app/${appId}`);

  if (!app) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-slate-500 mb-4"
        >
          <Hexagon size={64} className="opacity-20" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Module Not Found</h2>
        <p className="text-slate-400 mb-6 max-w-md">The requested module "{appId}" appears to be offline or decommissioned.</p>
        <Link
          to="/dashboard"
          className="rounded-full bg-white/10 px-6 py-2 text-white hover:bg-white/20 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const Icon = ICON_MAP[app.icon] || Hexagon;
  const brightness = app.imageBrightness ?? 70;
  const overlayOpacity = (100 - brightness) / 100;
  const overlayDark = `rgba(0, 0, 0, ${Math.min(0.95, overlayOpacity + 0.3)})`;
  const overlayMid = `rgba(0, 0, 0, ${Math.min(0.6, overlayOpacity * 0.7)})`;
  const overlayLight = `rgba(0, 0, 0, ${Math.min(0.3, overlayOpacity * 0.3)})`;

  const getTextColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      white: 'text-white',
      black: 'text-black',
      cyan: 'text-cyan-400',
      purple: 'text-purple-400',
      pink: 'text-pink-400',
      emerald: 'text-emerald-400',
      blue: 'text-blue-400',
      amber: 'text-amber-400',
      red: 'text-red-400',
      yellow: 'text-yellow-400',
      'neon-cyan': 'text-cyan-300',
      'neon-pink': 'text-pink-400',
      'neon-purple': 'text-purple-400',
      'neon-green': 'text-green-400',
      'neon-orange': 'text-orange-400',
    };
    return colorMap[color] || 'text-white';
  };

  const getTextGlowStyle = (color: string) => {
    const glowMap: Record<string, React.CSSProperties> = {
      'neon-cyan': { textShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee' },
      'neon-pink': { textShadow: '0 0 10px #f472b6, 0 0 20px #f472b6, 0 0 30px #f472b6' },
      'neon-purple': { textShadow: '0 0 10px #c084fc, 0 0 20px #c084fc, 0 0 30px #c084fc' },
      'neon-green': { textShadow: '0 0 10px #4ade80, 0 0 20px #4ade80, 0 0 30px #4ade80' },
      'neon-orange': { textShadow: '0 0 10px #fb923c, 0 0 20px #fb923c, 0 0 30px #fb923c' },
    };
    return glowMap[color] || {};
  };

  // Combine separate HTML/CSS/JS code into a single document
  const getCombinedContent = (): string | undefined => {
    const { htmlCode, cssCode, jsCode, appContent } = app;
    
    // If separate code panels exist, combine them
    if (htmlCode || cssCode || jsCode) {
      const html = htmlCode || '';
      const css = cssCode ? `<style>${cssCode}</style>` : '';
      const js = jsCode ? `<script>${jsCode}<\/script>` : '';
      
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${css}
</head>
<body>
  ${html}
  ${js}
</body>
</html>`;
    }
    
    // Fall back to single appContent field
    // If appContent is a URL (iframe type), return undefined here
    if (app.appType === 'html' && appContent && appContent.trim()) {
      return appContent;
    }
    
    return undefined;
  };

  // Render the app content based on type
  const renderAppContent = () => {
    const combinedContent = getCombinedContent();
    
    if (!combinedContent) {
      return (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5"
          >
            <div className="h-10 w-10 rounded-full border-t-2 border-r-2 border-cyan-500 opacity-50"></div>
          </motion.div>
          <h3 className="text-xl font-medium text-white">Module Active</h3>
          <p className="mt-2 text-slate-400">
            No app content configured for this module yet.
          </p>
        </div>
      );
    }

    switch (app.appType) {
      case 'html':
        return <HTMLAppRenderer content={combinedContent} />;
      case 'iframe':
        return <IframeAppRenderer url={combinedContent} />;
      default:
        return (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-slate-400">Unknown app type</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50">
      {/* Floating Back Button */}
        <Link
          to="/dashboard"
          className="absolute top-4 left-4 z-50 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/50 backdrop-blur-sm px-3 py-2 rounded-full border border-white/10 hover:bg-slate-900"
        >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back</span>
      </Link>

      {/* Deploy button if exists */}
      {app.deployUrl && (
        <a
          href={app.deployUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-50 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <ExternalLink size={18} />
          Deploy
        </a>
      )}

      {/* Full Screen App Content */}
      <div className="w-full h-full">
        {renderAppContent()}
      </div>
    </div>
  );
};
