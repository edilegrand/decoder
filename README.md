# Loan Calculator Pro

A professional-grade loan amortization calculator built with React, Vite, Tailwind CSS, and Recharts. Features include dark mode, multiple loan types, extra payment analysis, property tax/insurance escrow, CSV export, and interactive charts.

## Features

- **Amortizing & Interest-Only** loan types
- **Payment frequencies**: Monthly, Bi-weekly, Weekly
- **Compound frequencies**: Monthly (US), Semi-Annual (Canada), Annual
- **Extra payments** with interest savings + time saved display
- **Escrow**: Property tax & insurance
- **Charts**: Area chart (balance vs. interest over time) + Donut cost breakdown
- **Amortization schedule** table with CSV export
- **Dark mode** (auto-detects OS preference)
- **Quick-start scenarios**: Home Mortgage, Auto Loan, Personal Loan

---

## Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ and npm

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
# Output goes to ./dist/
```

### Preview Production Build

```bash
npm run preview
```

---

## Deployment Options

### Option 1: Netlify (Recommended — Free)

1. Push this folder to a GitHub repository
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
3. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy** — done!

Alternatively, drag-and-drop the `dist/` folder directly at [app.netlify.com/drop](https://app.netlify.com/drop).

### Option 2: Vercel (Free)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Vercel auto-detects Vite — just click **Deploy**

Or use the CLI:
```bash
npm install -g vercel
vercel
```

### Option 3: GitHub Pages

1. Install the gh-pages helper:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Add to `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/your-repo-name/',   // ← add this line
     plugins: [react()],
   })
   ```
3. Add to `package.json` scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```
4. Run:
   ```bash
   npm run deploy
   ```

### Option 4: Static File Hosting (Any CDN)

```bash
npm run build
```
Upload the entire `dist/` folder to any static host (AWS S3 + CloudFront, Firebase Hosting, Render, Surge.sh, etc.).

---

## Project Structure

```
loan-calculator-pro/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind + custom animations
├── index.html           # HTML shell
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Dependencies & scripts
```

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [React 18](https://react.dev) | UI framework |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first styling |
| [Recharts](https://recharts.org) | Charts |
| [Lucide React](https://lucide.dev) | Icons |
