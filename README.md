# AssetVision Frontend

A Next.js application for portfolio optimization and asset management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm

### Local Development Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Create `.env.local` in the root directory:
   ```bash
   # Required: Backend API URL (without /api suffix)
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌍 Environment Configuration

### Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (without /api suffix) | `https://api.alphaoptimize.com` | ✅ Yes |

**Important**: This environment variable is **required** for all environments. The application will fail to start without it (no defaults or fallbacks).

### Environment Examples

```bash
# Local Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Custom Development (different port, Docker, etc.)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://host.docker.internal:8000

# Production
NEXT_PUBLIC_API_BASE_URL=https://api.alphaoptimize.com

# Staging
NEXT_PUBLIC_API_BASE_URL=https://staging-api.alphaoptimize.com
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Deploy to Vercel**
   - Connect your repository to Vercel
   - Or use: `npx vercel --prod`

2. **Configure Environment Variables**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add: `NEXT_PUBLIC_API_BASE_URL` = `https://api.alphaoptimize.com`
   - Select environments: Production (and Preview/Development if needed)

3. **Deploy**
   - Trigger deployment
   - The build will fail if environment variables are missing

### Switching API URLs

To change the API URL (staging, different backend, etc.):
1. Update the `NEXT_PUBLIC_API_BASE_URL` environment variable in Vercel
2. Trigger a new deployment
3. **No code changes required!**

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: Redux Toolkit
- **Real-time**: Socket.io
- **Code Quality**: ESLint

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Shadcn base components
│   ├── dashboard/      # Dashboard-specific components
│   ├── portfolio/      # Portfolio-related components
│   └── charts/         # Chart components
├── services/           # API services
├── store/              # Redux store and slices
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### API Integration

The application automatically constructs all API endpoints from the base URL:
- Base URL: `${NEXT_PUBLIC_API_BASE_URL}`
- API URL: `${NEXT_PUBLIC_API_BASE_URL}/api`
- Auth endpoints: `${NEXT_PUBLIC_API_BASE_URL}/api/auth/*`
- Portfolio endpoints: `${NEXT_PUBLIC_API_BASE_URL}/api/portfolio/*`
- Plaid endpoints: `${NEXT_PUBLIC_API_BASE_URL}/api/plaid/*`

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Configuration Features

- **Fail-fast approach**: Application throws clear errors if misconfigured
- **No hardcoded URLs**: Everything is environment-driven
- **Clear logging**: Console messages show which API URL is being used
- **Flexible deployment**: Change APIs without code changes

### Debugging

The application logs the detected API URL on startup:
- Check browser console for configuration messages
- Look for messages like: `🔧 Using API URL: https://api.alphaoptimize.com`
- Missing configuration shows helpful error messages

## 🌐 CORS Configuration

Ensure your backend API allows requests from:
- `https://www.alphaoptimize.com` (production frontend)
- `https://alphaoptimize.com` (production frontend)  
- `http://localhost:3000` (local development)

## 🔒 Security

- Environment variables are properly scoped with `NEXT_PUBLIC_` prefix
- No sensitive data is exposed to the client
- CORS is handled by the backend API
- JWT tokens are managed securely

## 📝 Key Features

- **Portfolio Management**: Create and manage investment portfolios
- **Performance Analytics**: Track portfolio performance and metrics
- **Risk Optimization**: Advanced portfolio optimization algorithms
- **Real-time Data**: Live market data and updates
- **Alert System**: Configurable portfolio alerts
- **Tax Strategies**: Tax-loss harvesting and optimization
- **Account Integration**: Plaid integration for account linking

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Add documentation for new functions and classes
4. Use strongly typed interfaces and types
5. Follow the existing project structure

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🆘 Troubleshooting

### Common Issues

**Build fails with "NEXT_PUBLIC_API_BASE_URL environment variable is required"**
- Solution: Set the environment variable in your deployment platform or `.env.local` file

**API calls failing**
- Check the console for the logged API URL
- Verify the backend is running and accessible
- Check CORS configuration on the backend

**Development server won't start**
- Ensure `.env.local` exists in the root directory
- Verify the `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Check that the backend API is running

---

Built with ❤️ using Next.js and TypeScript