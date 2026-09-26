# Animorphia: Turn Story into Anime Studio 🎬✨

A Next.js, React, Tailwind CSS, TypeScript, and shadcn-ui powered studio that converts written stories and novel scripts into anime storyboards and cinematic cuts.

## 🚀 Key Architectural Features
- **shadcn Project Structure**: Standard component modularization (`/components/ui/` for primitives, `/components/` for domain features).
- **Tailwind CSS & CSS Variables**: Theme tokens, spring animations, and responsive layouts.
- **TypeScript Strict Mode**: Fully typed props, event handlers, and data structures.
- **Interactive Bottom Floating Menu (`/components/ui/bottom-menu.tsx`)**: Fluid spring tooltips with `framer-motion`.
- **Strict Anti-Nudity & NSFW Content Filter**: Real-time story text lexical scanner preventing explicit or adult generation.
- **Anti-AI Bot Protection**: `robots.txt` disallowing AI scrapers (GPTBot, ClaudeBot, etc.), `noai` meta headers, and client-side automation detection.
- **Uncluttered & Minimalist UI**: Sleek, focused dark-mode studio experience.

---

## 🛠️ Prerequisites & Setup Guide

### 1. Install Node.js (if not already installed)
Download and install the latest LTS release from:
👉 [https://nodejs.org](https://nodejs.org) (v18.x or v20.x+)

Verify in your terminal:
```bash
node -v
npm -v
```

### 2. Install Project Dependencies
Run from this directory (`c:/Users/Reddy/.antigravity-ide/story-to-anime`):
```bash
npm install
```

This installs:
- `framer-motion`
- `lucide-react`
- `clsx` & `tailwind-merge`
- `next`, `react`, `react-dom`
- `tailwindcss`, `typescript`, `@types/react`

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Setting Up a Fresh Project via shadcn CLI

If you ever wish to initialize a new project from scratch using the official CLI:

```bash
# 1. Create Next.js app with TypeScript and Tailwind CSS
npx create-next-app@latest my-anime-app --typescript --tailwind --eslint

# 2. Initialize shadcn
npx shadcn@latest init

# 3. Add framer-motion and icons
npm install framer-motion lucide-react clsx tailwind-merge

# 4. Add components to /components/ui
# (Place bottom-menu.tsx in /components/ui/bottom-menu.tsx)
```
