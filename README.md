# ImgText

A modern Next.js 16 SaaS frontend for the ImgText Engine backend. Translate text in images to multiple languages with an Apple-inspired minimal design.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## Features

- 🖼️ **Single Image Translation** - Upload an image and translate text to your target language
- 📦 **Batch Translation** - Process multiple images to multiple languages simultaneously
- 📜 **Translation History** - View and download all your past translations
- 🎨 **Modern UI** - Apple-inspired minimal design with dark mode support
- 🔐 **Secure Authentication** - JWT-based auth with automatic token refresh
- 📊 **Error Tracking** - Integrated Sentry for production monitoring
- ⚡ **Real-time Updates** - Live batch job progress tracking
- 🌍 **11 Languages** - English, German, French, Spanish, Italian, Portuguese, Dutch, Swedish, Danish, Norwegian, Finnish

## Quick Start

### Prerequisites

- Node.js 18+ and Yarn
- Backend API running (see [imgtext-engine](https://github.com/mandosha652/imgtext-engine))

### Installation

```bash
# Clone the repository
git clone git@github-personal:mandosha652/imgtext.git
cd imgtext

# Install dependencies
yarn install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your backend URL
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_DEV_AUTH_BYPASS=true  # Only for development!

# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
yarn lint:fix     # Fix ESLint errors
yarn format       # Format code with Prettier
yarn format:check # Check code formatting
yarn typecheck    # Run TypeScript type checking
```

## Tech Stack

| Category       | Technology            | Version      |
| -------------- | --------------------- | ------------ |
| Framework      | Next.js (App Router)  | 16.0.10      |
| Runtime        | React                 | 19.2         |
| Language       | TypeScript            | 5.x (strict) |
| Styling        | Tailwind CSS          | v4           |
| UI Components  | shadcn/ui             | latest       |
| Icons          | Lucide React          | latest       |
| Data Fetching  | TanStack Query        | v5           |
| State          | Zustand               | latest       |
| Forms          | React Hook Form + Zod | latest       |
| HTTP Client    | Axios                 | latest       |
| Dark Mode      | next-themes           | latest       |
| Animations     | Framer Motion         | latest       |
| Error Tracking | Sentry                | latest       |
| Linting        | ESLint + Prettier     | latest       |
| Git Hooks      | Husky + lint-staged   | latest       |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── features/          # Feature-specific components
│   │   ├── auth/
│   │   ├── translate/
│   │   └── batch/
│   └── common/
├── lib/
│   ├── api/               # API client layer
│   ├── validators/        # Zod schemas
│   ├── constants/         # App constants
│   └── utils/             # Utility functions
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── providers/             # React context providers
├── types/                 # TypeScript types
└── config/                # App configuration
```

## Environment Variables

See [.env.example](.env.example) for all available environment variables.

### Development

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEV_AUTH_BYPASS=true  # Skip auth during development
```

### Production

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_DEV_AUTH_BYPASS=false  # MUST be false!

# Optional: Sentry error tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

## Key Features

### Authentication

- JWT-based authentication with secure cookie storage
- Automatic token refresh on expiry
- Protected routes via Next.js middleware
- Development bypass mode for testing

### Single Translation

- Upload single image (up to 10MB)
- Select source (auto-detect) and target language
- Exclude specific text patterns
- View side-by-side original and translated images
- Download translated results

### Batch Translation

- Upload up to 20 images
- Translate to up to 5 languages simultaneously
- Real-time progress tracking (polls every 2 seconds)
- Cancel running batch jobs
- Download all results

### Translation History

- Local storage of translation results
- Filter by single/batch translations
- Expandable cards with full details
- Download images from history
- Delete individual items or clear all

### Error Handling

- Toast notifications (Sonner)
- User-friendly error messages
- Axios error interceptors
- Sentry integration for production errors
- Global error boundary

## Development Features

### Dev Auth Bypass

Set `NEXT_PUBLIC_DEV_AUTH_BYPASS=true` to skip authentication during development. A mock "Dev User" with pro tier access is used.

**⚠️ WARNING:** Always set to `false` in production!

### Type Safety

- Strict TypeScript configuration
- Zod validation for forms and API responses
- Type-safe API client
- No `any` types allowed

### Code Quality

- ESLint with Next.js config
- Prettier with Tailwind plugin
- Husky pre-commit hooks
- lint-staged for automatic formatting

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guide.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
# Deploy to production
vercel --prod
```

### Production Checklist

- [ ] Set `NEXT_PUBLIC_API_URL` to production backend
- [ ] Set `NEXT_PUBLIC_DEV_AUTH_BYPASS=false`
- [ ] Configure Sentry DSN (optional)
- [ ] Verify CORS on backend
- [ ] Test authentication flow
- [ ] Test translation features
- [ ] Enable HTTPS

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## API Integration

This frontend connects to the [imgtext-engine](https://github.com/mandosha652/imgtext-engine) backend.

**Required Backend Endpoints:**

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/translate/translate-image` - Single translation
- `POST /api/v1/translate/batch/translate` - Create batch
- `GET /api/v1/translate/batch/{id}` - Get batch status
- `POST /api/v1/translate/batch/{id}/cancel` - Cancel batch

## Troubleshooting

### Images not displaying

1. Check `next.config.ts` remote patterns match your backend domain
2. Verify backend CORS allows image URLs
3. Check browser console for errors

### Authentication issues

1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify backend is running
3. Check cookies are being set (DevTools → Application → Cookies)
4. Ensure backend CORS allows credentials

### Build errors

```bash
# Check types
yarn typecheck

# Fix linting
yarn lint:fix

# Clear cache and rebuild
rm -rf .next
yarn build
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## License

MIT License - see LICENSE file for details

## Support

- 📧 Email: support@imgtext.io
- 🐛 Issues: [GitHub Issues](https://github.com/mandosha652/imgtext/issues)
- 📖 Docs: See CLAUDE.md for development guidelines

## Roadmap

- [x] Single image translation
- [x] Batch translation
- [x] Translation history
- [x] Error tracking (Sentry)
- [x] Dark mode support
- [ ] Email verification
- [ ] Password reset flow
- [ ] Usage statistics
- [ ] Payment integration (Stripe)
- [ ] E2E tests (Playwright)
- [ ] Backend history API integration

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com/)
