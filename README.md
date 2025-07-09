# Consultancy App - Next.js Migration

This project has been migrated from Vite React to Next.js with TypeScript and Tailwind CSS.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Clerk keys:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Key Changes Made

- ✅ Migrated from Vite to Next.js 14
- ✅ Updated routing from React Router to Next.js App Router
- ✅ Converted to full TypeScript
- ✅ Updated Clerk integration for Next.js
- ✅ Configured Tailwind CSS for Next.js
- ✅ Updated all navigation components
- ✅ Maintained all existing functionality

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── category/[category]/page.tsx
│   ├── consultancy/[id]/page.tsx
│   └── ...
├── components/            # Reusable components
├── pages/                 # Page components (legacy structure maintained)
└── index.css             # Global styles
```

## Features

- 🚀 Next.js 14 with App Router
- 📱 Responsive design with Tailwind CSS
- 🔐 Authentication with Clerk
- ⚡ Fast page transitions with Framer Motion
- 🎯 TypeScript for type safety
- 📊 Dynamic routing for categories and consultancies