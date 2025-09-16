# User Lens 🚀

A professional React application for user management with enterprise-grade development workflow, Docker containerization, and full CI/CD pipeline.

**🎥 Demo**: [Watch Demo Video](https://drive.google.com/file/d/1EOOwQgjZXXsK_PWmzcGrjyt7ayu1W8No/view?usp=sharing)  
**� Live**: [Production App](https://user-lens.vercel.app) | [Staging](https://user-lens-staging.vercel.app)

## 🏗️ Architecture

### Modern Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Express.js + Redis
- **State Management**: Zustand with persistence
- **Styling**: SCSS with design tokens
- **Database**: Redis (production) + JSON fallback
- **Testing**: Jest + React Testing Library + Playwright
- **DevOps**: Docker + GitHub Actions + Vercel

### Environment Strategy
```
🖥️  Local Dev (Docker)  →  🧪 Staging (GitHub Actions)  →  � Production (Vercel)
   Redis + 1K records       Redis + 10K records           Redis + Real data
```

## 🐳 Quick Start (Docker)

**Recommended for professional development experience:**

```bash
# Clone repository
git clone <repository-url>
cd user-lens

# Start complete development environment
npm run docker:dev

# Access application
open http://localhost:5173  # Frontend
open http://localhost:3001  # API
open http://localhost:8082  # Redis GUI (with tools profile)
```

**One-command setup** includes:
- ✅ Redis database with test data
- ✅ Express API server  
- ✅ React development server
- ✅ Hot reload enabled
- ✅ Database migrations

## 🛠️ Traditional Setup

If you prefer local Node.js development:

```bash
# Install dependencies
npm install

# Start development servers
npm run dev:express    # Starts both frontend and API
# OR
npm run dev           # Frontend only
npm run server:dev    # API only
```

## 📋 Prerequisites

### For Docker Development (Recommended)
- Docker Desktop 4.0+
- Node.js 22+ (for scripts)

### For Local Development
- Node.js 22+
- Redis server (optional - will fallback to JSON)

## 🗄️ Database Environments

### Development (Local)
- **Redis**: `redis://localhost:6379/0`
- **Data**: 1,000 synthetic users
- **Reset**: `npm run db:reset -- --force`

### Staging
- **Redis**: Managed Redis instance
- **Data**: 10,000 mixed synthetic/anonymized users
- **Deploy**: Push to `develop` branch

### Production  
- **Redis**: Production Redis cluster
- **Data**: Real user data
- **Deploy**: Push to `main` branch
- Notifications data
- Company metrics

**Data Persistence Strategy:**

The application implements data persistence approach to provide a fully functional demo experience:

- **JSONPlaceholder API**: Production build uses JSONPlaceholder (https://jsonplaceholder.typicode.com) - a fake REST API that doesn't persist data across sessions
- **localStorage Caching**: All CRUD operations are cached locally to simulate persistent data storage
- **Fallback Strategy**: API → Cache → Mock Data for graceful degradation
- **User Experience**: Enables complete CRUD functionality for reviewers despite using a non-persistent API

This approach ensures the application demonstrates full functionality while using publicly available testing APIs.

## 💻 Development

### Start Development Server

For full development experience (React app + JSON Server):
```bash
npm run dev:full
```

This starts:
- React development server on `http://localhost:5173`
- JSON Server API on `http://localhost:3001`

### Individual Commands

Start only the React app:
```bash
npm run dev
```

Start only the JSON Server:
```bash
npm run json-server
```

## 🧪 Testing

### Unit Tests

Run Jest tests with React Testing Library:
```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### End-to-End Tests

Run Playwright E2E tests:
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:ui       # Interactive UI mode
npm run test:e2e:headed   # With browser UI
npm run test:e2e:debug    # Debug mode
npm run test:e2e:report   # View test report
```

### Complete Test Suite

Run all tests (unit + E2E):
```bash
npm run test:all
```

## 🏗️ Build & Deployment

### Production Build

```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/          # Layout components (Header, etc.)
│   └── ui/              # UI components (Button, Modal, etc.)
├── constants/           # Application constants and configuration
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── router/              # Routing configuration
├── services/            # API and business logic services
├── store/               # Zustand state management
├── styles/              # Global styles and design tokens
├── types/               # TypeScript type definitions
└── utils/               # Utility functions

e2e/                     # Playwright E2E tests
├── fixtures/            # Test data fixtures
├── pages/               # Page object models
└── utils/               # Test utilities

public/                  # Static assets
```

## 🎨 Design System

The application implements a scalable design system with:

- **Design Tokens**: Centralized color, spacing, typography variables
- **Component Library**: Reusable UI components with consistent styling
- **Responsive Design**: Mobile-first approach with breakpoint management
- **Adaptive UX Patterns**: Context-sensitive interaction models (modals, sidepanels, in-place editing)
- **SCSS Architecture**: Modular stylesheets with mixins and utilities

## 🔄 State Management

Zustand store architecture with:

- **User Store**: User data management with CRUD operations
- **Notification Store**: Notification state and operations
- **UI Store**: Global UI state (modals, loading states)
- **Persistence**: Automatic state persistence to localStorage

## 🌐 API Integration

Service layer architecture with:

- **HTTP Service**: Centralized HTTP client with error handling
- **API Services**: Domain-specific API interactions (JSONPlaceholder integration)
- **Data Service**: Smart caching with localStorage persistence for demo functionality
- **Mock Service**: Development data mocking with graceful fallback strategy

## 📱 Features

- **User Management**: Complete CRUD operations for user data
- **Adaptive Editing Workflows**: Context-aware editing patterns - in-place editing in detail views, sidepanel for desktop table interactions, and modal overlays for mobile touch interfaces
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Search & Filtering**: Real-time user search functionality
- **Data Validation**: Form validation with error handling
- **Notifications**: User notification system
- **Metrics Dashboard**: Company metrics and analytics
- **Accessibility**: WCAG compliant with proper ARIA labels

## 🔍 Code Quality

- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting with React and TypeScript rules
- **Testing**: Comprehensive test coverage (unit + E2E)
- **Component Architecture**: Modular, reusable components
- **Error Boundaries**: Graceful error handling
- **Performance**: Optimized rendering and state management

## � Documentation

For detailed technical information:

- **[DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md)**: UI/CSS framework choices, responsive strategies, and UX interaction patterns
- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)**: WCAG compliance, keyboard navigation, and screen reader support
- **[PERFORMANCE.md](./PERFORMANCE.md)**: Performance optimizations, metrics, and caching strategies  
- **[COMPONENT_DESIGN.md](./COMPONENT_DESIGN.md)**: Reusable component architecture and design decisions
- **[AI_USAGE.md](./AI_USAGE.md)**: AI tool integration and development workflow documentation

## �🚦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:full` | Start dev server + JSON server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:all` | Run all tests |
| `npm run lint` | Run ESLint |
