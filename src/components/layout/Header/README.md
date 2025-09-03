# Header Component Refactoring

## Overview

The Header component has been refactored to follow React best practices by removing business logic and making it a generic, reusable component that follows composition patterns.

## What Changed

### Before (❌ Problems)
- Hard-coded business logic for different pages
- Tight coupling with routing and store
- Not reusable for different contexts
- Violated separation of concerns

### After (✅ Solutions)
- Generic, reusable component that accepts props
- Business logic extracted to separate components and hooks
- Follows composition pattern
- Clean separation of concerns

## New Architecture

### 1. `Header` Component (Generic)
A pure presentational component that accepts:
- `title`: Application title
- `homeUrl`: URL for home navigation
- `actions`: React node for header actions
- `notifications`: React node for notifications
- `className`: Additional CSS classes
- `homeAriaLabel` & `navigationAriaLabel`: Accessibility labels

### 2. `HeaderActions` Component (Business Logic)
Contains the page-specific logic that was previously in Header:
- Route-based conditional rendering
- Navigation handlers
- Notification actions

### 3. `useHeaderActions` Hook (Reusable Logic)
Located in `/src/hooks/useHeaderActions.ts`, provides common header action logic that can be used by any component:
- Route detection utilities
- Navigation functions
- Notification state and actions

## Usage Examples

### Basic Usage (Current Implementation)
```tsx
import { Header, HeaderActions } from './components/layout/Header';
import { NotificationBell } from './components/ui/NotificationBell';

// In AppLayout
<Header 
  actions={<HeaderActions />}
  notifications={<NotificationBell />}
/>
```

### Custom Actions for Specific Pages
```tsx
import { Header } from './components/layout/Header';
import { useHeaderActions } from './hooks';
import { Button } from './components/ui/Button';

const MyPageHeader = () => {
  const { navigateToUsers } = useHeaderActions();
  
  const customActions = (
    <>
      <Button onClick={navigateToUsers}>
        Back to Users
      </Button>
      <Button variant="primary">
        Save Changes
      </Button>
    </>
  );

  return (
    <Header
      title="My Custom Page"
      actions={customActions}
    />
  );
};
```

### Minimal Usage
```tsx
// Uses all defaults
<Header />
```

### Full Customization
```tsx
<Header
  title="Custom App"
  homeUrl="/dashboard"
  actions={<CustomActions />}
  notifications={<CustomNotifications />}
  className="custom-header"
  homeAriaLabel="Go to dashboard"
  navigationAriaLabel="Main navigation"
/>
```

## Benefits

1. **Reusability**: Header can now be used in different contexts with different actions
2. **Testability**: Logic is separated and easier to test in isolation
3. **Maintainability**: Changes to specific page logic don't affect the Header component
4. **Composition**: Follows React patterns by accepting children/props instead of hard-coding behavior
5. **Flexibility**: Easy to add new actions or notifications for different pages
6. **Separation of Concerns**: Presentation (Header) is separate from business logic (HeaderActions)

## Migration Guide

If you need to create custom header actions for a new page:

1. **Option 1: Use the hook**
   ```tsx
   import { useHeaderActions } from './hooks';
   
   const MyComponent = () => {
     const { navigateToUsers, isUserDetailPage } = useHeaderActions();
     // Build your custom actions using the hook
   };
   ```

2. **Option 2: Create custom actions**
   ```tsx
   const MyPageActions = () => (
     <Button onClick={() => console.log('Custom action')}>
       My Action
     </Button>
   );
   
   <Header actions={<MyPageActions />} />
   ```

3. **Option 3: Use inline actions**
   ```tsx
   <Header 
     actions={
       <Button onClick={handleSave}>
         Save
       </Button>
     }
   />
   ```

## Files Changed

- `Header.tsx`: Refactored to be generic
- `HeaderActions.tsx`: New component with page-specific logic
- `AppLayout.tsx`: Updated to use new composition pattern
- `index.ts`: Updated exports
- `/src/hooks/useHeaderActions.ts`: New hook with reusable logic (moved to hooks directory)
- `/src/hooks/index.ts`: Updated to export the new hook

## TypeScript Support

All components are fully typed with proper interfaces and props definitions for better development experience and type safety.
