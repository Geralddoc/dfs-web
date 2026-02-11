# Next.js Demo

A basic Next.js boilerplate with Tailwind CSS v3 and shadcn/ui.

## Getting Started

### Prerequisites

- **Node.js 18+** - Download and install from [nodejs.org](https://nodejs.org/)

### Installation

1. Install Node.js 18+ from [nodejs.org](https://nodejs.org/) (LTS version recommended)

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v3** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library
- **npm** - Package manager

## Project Structure

```
.
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── globals.css   # Global styles with Tailwind
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   └── lib/             # Utility functions
├── public/              # Static assets
├── components.json      # shadcn/ui configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── next.config.js       # Next.js configuration
```

## Adding shadcn/ui Components

To add new shadcn/ui components, use the CLI:

```bash
npx shadcn-ui@latest add [component-name]
```

For example:
```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
