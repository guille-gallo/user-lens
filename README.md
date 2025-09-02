# User Lens

A modern React application for user management with comprehensive CRUD operations, responsive design, and robust testing infrastructure.

## 🏗️ Architecture

Built with enterprise-grade patterns and scalable architecture:

- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Zustand with persistence
- **Styling**: SCSS with design tokens
- **Routing**: React Router DOM v7
- **Testing**: Jest + React Testing Library + Playwright
- **Backend**: JSON Server (development)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd user-lens
```

2. Install dependencies:
```bash
npm install
```

## 🔧 Configuration

### Environment Setup

The application uses Vite for development and build processes. Configuration files:

- `vite.config.ts` - Vite configuration with React plugin and SCSS preprocessor
- `tsconfig.json` - TypeScript configuration with project references
- `package.json` - Dependencies and scripts
- `db.json` - Mock database for development

### Database Configuration

The development server uses JSON Server with a mock database (`db.json`) containing:
- Users data with CRUD operations
- Notifications data
- Company metrics

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
- **API Services**: Domain-specific API interactions
- **Data Service**: Data transformation and caching
- **Mock Service**: Development data mocking

## 📱 Features

- **User Management**: Complete CRUD operations for user data
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

## 🚦 Available Scripts

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
