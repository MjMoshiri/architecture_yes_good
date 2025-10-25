# Mobile Knowledge Webapp

A mobile-optimized Next.js web application for accessing the knowledge base system on-the-go.

## Features

- Mobile-first responsive design
- Touch-friendly interface optimized for 10-15 minute learning sessions
- Integration with existing knowledge base and ChromaDB
- Gemini CLI terminal interface
- Search, browse, and content management capabilities

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your mobile browser or device simulator.

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and API integrations
- `src/types/` - TypeScript type definitions

## Mobile Optimization

- Responsive design with mobile-first approach
- Touch-friendly interactive elements (minimum 44px touch targets)
- Safe area support for devices with notches
- Optimized for performance on mobile devices