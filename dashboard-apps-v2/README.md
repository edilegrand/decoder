# Modules Dashboard

A futuristic, glassmorphism-styled dashboard application featuring interactive, customizable modules with real-time Firebase synchronization.

## Features

- **Customizable Modules** - Create, edit, and delete interactive tiles with HTML/CSS/JS, iframe embedding, or external URLs
- **Real-time Sync** - Changes reflect instantly across all connected clients via Firebase Firestore
- **Public Profiles** - Share your dashboard at `yourdomain.com/yourname`
- **Tile Size Control** - Switch between small, medium, and large module views
- **Custom Styling** - Choose from 13 accent colors, neon effects, custom fonts, gradient backgrounds, and image uploads
- **Authentication** - Secure login via email/password or Google Sign-In with Firebase Auth
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Landing Page** - Public-facing homepage with feature showcase and demo modules

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (with custom glassmorphism effects)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore, Authentication)
- **Routing**: React Router v7

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/edilegrand/dashboard-apps-v2-backup.git
   cd dashboard-apps-v2-backup
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local` and add your Firebase configuration
   - Required variables:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3003` in your browser

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## Project Structure

```
dashboard-apps-v2-backup/
├── components/          # React components
│   ├── AppPage.tsx      # Individual module view
│   ├── Dashboard.tsx    # User dashboard with module management
│   ├── LandingPage.tsx  # Public landing page
│   ├── LoginModal.tsx   # Authentication modal
│   ├── Navbar.tsx       # Navigation bar
│   ├── NicknameModal.tsx # User nickname setup
│   ├── PublicDashboard.tsx # Public profile view
│   └── Tile.tsx         # Interactive module card
├── context/             # React contexts
│   ├── AppContext.tsx   # Module CRUD operations
│   └── AuthContext.tsx  # Authentication state
├── firebase/            # Firebase configuration
│   └── config.ts
├── App.tsx              # Main application component
├── index.tsx            # Entry point
├── types.ts             # TypeScript interfaces
├── constants.tsx        # Icon mappings and defaults
└── vite.config.ts       # Vite configuration
```

## Deployment

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Vercel

1. Connect your GitHub repository to Vercel
2. Add Firebase environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

## License

Private project - All rights reserved
