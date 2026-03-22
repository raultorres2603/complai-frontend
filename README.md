# ComplAI Frontend — React + TypeScript Chatbot UI

A modern, responsive React + TypeScript frontend for the ComplAI citizen chatbot system. Provides a user-friendly interface for querying information and generating complaint letters with AI assistance.

## Features

✅ **Conversational AI Chat** — Interactive chat interface with message history
✅ **Complaint Letter Generation** — Generate formal complaint letters in PDF/JSON format
✅ **JWT Authentication** — Secure API communication with JWT token support
✅ **Multi-City Support** — City-based content scoping and locale selection
✅ **Responsive Design** — Works seamlessly on desktop, tablet, and mobile
✅ **TypeScript Strict Mode** — Full type safety throughout the application
✅ **Error Handling** — User-friendly error messages and recovery flows
✅ **Service Layer Architecture** — Clean separation of concerns with API service abstraction
✅ **Session Management** — Conversation history persistence and management
✅ **Multiple Languages** — Support for Catalan, Spanish, and English

## Tech Stack

- **React 18+** with TypeScript (strict mode)
- **Vite** for fast development and optimized builds
- **CSS Modules** for component-scoped styling
- **Custom Hooks** for state management (useChat, useAuth, useCity)
- **Vitest + React Testing Library** for unit and component tests
- **ESLint + TypeScript ESLint** for code quality

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ChatWindow.tsx    # Main chat container
│   │   ├── MessageList.tsx   # Message display  
│   │   ├── MessageInput.tsx  # User input form
│   │   ├── Header.tsx        # Navigation & settings
│   │   ├── ErrorBoundary.tsx # Error boundary
│   │   └── *.module.css      # Component styles
│   ├── pages/               # Page-level components
│   ├── hooks/               # Custom React hooks
│   │   ├── useChat.ts       # Chat state management
│   │   ├── useAuth.ts       # JWT authentication
│   │   ├── useCity.ts       # City selection
│   │   └── usePdfPolling.ts # S3 PDF polling
│   ├── services/            # Business logic & API calls
│   │   ├── apiService.ts    # Backend API client
│   │   ├── sessionService.ts# Conversation management
│   │   └── storageService.ts# Local storage
│   ├── types/               # TypeScript type definitions
│   │   ├── api.types.ts     # Backend API DTOs
│   │   └── domain.types.ts  # UI domain types
│   ├── layouts/             # Layout components
│   ├── styles/              # Global styles
│   ├── App.tsx              # Root application component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

## Getting Started

### Prerequisites

- **Node.js**: v20.19+ or v22.12+
- **npm**: v10+

### Installation

```bash
# Install dependencies
npm install
```

### Environment Configuration

The frontend uses **GitHub Environment Variables and Secrets** for CI/CD deployments. No local `.env` files are needed or committed to the repository.

**For local development**, create a `.env.local` file (git-ignored):

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:3000

# Default city (must match backend city IDs)
VITE_DEFAULT_CITY=testcity

# JWT token for API auth (optional, can be entered in UI)
VITE_JWT_TOKEN=your-dev-jwt-token
```

**For CI/CD deployments**, configure GitHub Environments (see the [GitHub Environment Configuration](#github-environment-configuration) section below).

### Development Server

Start the development server with hot module reload:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The app will automatically reload when you make changes.

### Building for Production

Create an optimized production build:

```bash
npm run build
```

Output is in the `dist/` folder, ready for deployment.

### Preview Production Build

```bash
npm run preview
```

## API Integration

The frontend communicates with the ComplAI backend through two main endpoints:

### `/complai/ask` — Conversational AI

Ask questions about city services and information.

**Request:**
```typescript
{
  text: "Quan tanca la biblioteca?",
  conversationId: "uuid-v4"
}
```

**Response:**
```typescript
{
  success: true,
  message: "La biblioteca tanca a les 20:00...",
  sources: [{ url: "...", title: "Horari" }],
  errorCode: 0
}
```

### `/complai/redact` — Complaint Generation

Generate formal complaint letters with AI assistance.

**Request:**
```typescript
{
  text: "El carrer no té llum",
  format: "pdf" | "json" | "auto",
  conversationId: "uuid-v4",
  requesterName?: "Maria",
  requesterSurname?: "Garcia",
  requesterIdNumber?: "12345678A"
}
```

**Response (200 OK — Synchronous):**
```typescript
{
  success: true,
  message: "Quina és la teva identitat?",
  errorCode: 0
}
```

**Response (202 Accepted — Asynchronous):**
```typescript
{
  success: true,
  message: "Queixa generada...",
  pdfUrl: "https://s3.amazonaws.com/...", // Presigned URL for polling
  errorCode: 0
}
```

## JWT Authentication

The frontend supports JWT token-based authentication:

1. **Input Method**: Users can paste JWT tokens in the header UI
2. **Storage**: Tokens are persisted in localStorage for session continuity
3. **Header Injection**: Every API request includes the token as `Authorization: Bearer {token}`
4. **City Extraction**: City ID is extracted from the JWT's `city` claim

## Testing

Run the test suite:

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run coverage
```

## Type Checking

Run TypeScript strict mode check without building:

```bash
npm run type-check
```

## Linting

Check and fix code quality:

```bash
npm run lint
```

## Deployment Options

### AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/ s3://your-bucket/
# Configure CloudFront distribution
```

### Vercel
```bash
vercel deploy
```

### Docker
Create a `Dockerfile`:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
```

Build and run:
```bash
docker build -t complai-frontend .
docker run -p 8080:8080 -e VITE_BACKEND_URL=http://backend:3000 complai-frontend
```

## Component Guide

### ChatWindow
Main chat container managing message display and input. Shows error alerts, loading states, and message history.

### MessageList
Displays all messages with timestamps, role indicators (user/assistant), and source links.

### MessageInput
Form for composing new messages with character limit (5000 chars), complaint meta-fields, and format selector.

### Header
Navigation header with city selector dropdown, JWT token input, and settings options.

### SourceLink
Renders clickable source references with URL and title.

### ErrorBoundary
Catches React component errors and displays them gracefully to the user.

## State Management

Uses custom React hooks for state (no Redux/Zustand needed):

- **useChat**: Manages conversation state (messages, loading, errors)
- **useAuth**: Handles JWT token persistence and injection
- **useCity**: Manages city selection and scoping
- **usePdfPolling**: Handles async PDF delivery polling

## Error Codes

Mapped from backend ErrorCode enum:

```typescript
SUCCESS = 0        // Request successful
REFUSAL = 1        // AI refused (off-topic)
VALIDATION = 2     // Input validation error
UPSTREAM = 3       // Backend/AI service unavailable
INTERNAL = 4       // Internal server error
UNKNOWN = 5        // Unknown error
```

## GitHub Environment Configuration

The ComplAI frontend uses **GitHub Environments and Secrets** exclusively for CI/CD deployments. All configuration is managed through GitHub's Environment settings; no local `.env` files are committed to the repository.

### Creating GitHub Environments

Follow these steps to configure the GitHub Environments for automated deployments:

#### Development Environment

1. Go to your GitHub repository → **Settings** → **Environments**
2. Click **New environment** and name it `development`
3. Add the following **Environment Variables**:
   - **`VITE_BACKEND_URL`**: Development API URL
     - Example: `https://dev-api.complai.com`
     - This is the backend server your development frontend will connect to
   - **`VITE_DEFAULT_CITY`**: Default city for development
     - Example: `testcity`
     - Must match a valid city ID configured in your backend
4. Add the following **Secrets**:
   - **`VITE_JWT_TOKEN`**: Development JWT authentication token
     - This token is used to authenticate API requests from the frontend
     - Keep this secure; never commit it to the repository
5. (Optional) Under **Deployment branches**, restrict to the `develop` branch only
6. Save the environment

#### Production Environment

1. Go to your GitHub repository → **Settings** → **Environments**
2. Click **New environment** and name it `production`
3. Add the following **Environment Variables**:
   - **`VITE_BACKEND_URL`**: Production API URL
     - Example: `https://api.complai.com`
     - This is the production backend server
   - **`VITE_DEFAULT_CITY`**: Default city for production
     - Example: `barcelona`
     - Should match your production city configuration
4. Add the following **Secrets**:
   - **`VITE_JWT_TOKEN`**: Production JWT authentication token
     - This must be a valid production token
     - Keep this secure; never commit it to the repository
5. (Optional) Under **Deployment branches**, restrict to the `main` branch only
6. (**Recommended**) Enable **"Require reviewers"** to enforce manual approval before production deployments
7. Save the environment

### How It Works

1. When you push to the `develop` branch, the workflow uses the `development` environment variables and secrets
2. When you push to the `main` branch, the workflow uses the `production` environment variables and secrets
3. During the build process, these variables are injected into the Vite build, making them available as `process.env.VITE_*` in your code
4. The compiled application contains these values embedded in the JavaScript bundle

### Security Best Practices

- ✅ **Store secrets in GitHub Secrets only** — Never commit JWT tokens or sensitive values to the repository
- ✅ **Use strong, unique tokens** — Generate strong JWT tokens for each environment
- ✅ **Rotate tokens regularly** — Update JWT tokens periodically for security
- ✅ **Restrict environment access** — Use GitHub's branch deployment restrictions to prevent accidental deployments
- ✅ **Require approvals for production** — Always require manual review before deploying to production
- ✅ **Verify token expiry** — Ensure JWT tokens are valid for the deployment duration
- Check the `.env*` pattern is in `.gitignore` to prevent accidental commits of local files

### Local Testing

To test the build locally with the same configuration:

```bash
# Development build
VITE_BACKEND_URL=https://dev-api.complai.com \
VITE_DEFAULT_CITY=testcity \
VITE_JWT_TOKEN=your-dev-token \
VITE_DEPLOYMENT_ENV=development \
npm run build

# Production build
VITE_BACKEND_URL=https://api.complai.com \
VITE_DEFAULT_CITY=barcelona \
VITE_JWT_TOKEN=your-prod-token \
VITE_DEPLOYMENT_ENV=production \
npm run build

# Preview the build
npm run preview
```

### Workflow Trigger

The deployment workflow (`.github/workflows/deploy.yml`) automatically:
1. Triggers on push to `main` (→ production environment) or `develop` (→ development environment)
2. Checks out your code
3. Installs dependencies
4. Runs TypeScript type checking
5. Runs the test suite
6. Builds the application with GitHub environment variables
7. Deploys to GitHub Pages using the appropriate base path:
   - Development: `/complai-frontend-dev/` subdirectory
   - Production: `/` (root)

No local `.env` files are required for CI/CD; all configuration comes from GitHub Environments.

**Workflow Failed:**
1. Check the **Actions** tab for error details
2. Common issues:
   - Missing `VITE_BACKEND_URL` environment variable
   - TypeScript type checking failed (`npm run type-check`)
   - Tests failed (`npm test -- --run`)
   - Build failed (`npm run build`)

**Site Not Updating:**
1. Verify the workflow completed successfully (green checkmark)
2. Force refresh the GitHub Pages URL (Cmd+Shift+R or Ctrl+Shift+F5)
3. Check that the `gh-pages` branch was updated in the **Branches** section

**API Calls Failing:**
1. Ensure `VITE_BACKEND_URL` environment variable is set correctly in GitHub
2. Verify the backend server is accessible from the client
3. Check browser console for network errors

### CI/CD Best Practices

- Always push to `develop` first for testing before merging to `main`
- Use GitHub's branch protection rules to require pull requests before merging to `main`
- Require approvals for production deployments
- Monitor workflow execution in the Actions tab
- Review deployment logs if issues occur

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 13+, Chrome Android

## Performance

- **Bundle Size**: ~150-200 KB (gzipped)
- **First Paint**: < 1s on 4G
- **Core Web Vitals**: 90+ Lighthouse score

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Install dependencies: `npm install`
3. Make changes and test: `npm run build && npm run test`
4. Commit: `git commit -am 'Add your feature'`  
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

## Troubleshooting

### vite build fails on M1/M2 Mac
```bash
npm install --legacy-peer-deps
npm run build
```

### API CORS errors
Ensure backend is configured with CORS headers matching frontend origin.

### JWT token not persisting
Check browser localStorage is enabled. Verify token doesn't exceed 4KB.

### S3 PDF URL times out
Increase polling timeout in `usePdfPolling.ts` (DEFAULT_MAX_RETRIES).

## License

MIT License - See LICENSE file

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error messages in browser console
3. Check backend logs for API errors
4. Open an issue on GitHub

---

**Built with ❤️ for ComplAI citizens**
