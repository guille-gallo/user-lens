# Accessibility Standards Implementation

## 🌐 Overview

This application follows WCAG 2.1 AA standards and implements comprehensive accessibility features to ensure an inclusive user experience for all users, including those using assistive technologies.

## 🔧 Core Accessibility Features

### Semantic HTML Structure

**Implementation**:
```tsx
// Header component uses proper semantic roles
<header className="header" role="banner">
  <nav role="navigation" aria-label="Primary navigation">
    <Link to="/" aria-label="Go to home page">
      User Lens
    </Link>
  </nav>
</header>
```

**Standards Applied**:
- Proper HTML5 semantic elements (`header`, `nav`, `main`, `section`)
- ARIA roles for enhanced screen reader support
- Landmark roles for page structure navigation

### Keyboard Navigation

#### Table Navigation System

**Arrow Key Navigation**:
```tsx
// useTableKeyboardNavigation hook implementation
const handleKeyDown = (event: React.KeyboardEvent) => {
  switch (event.key) {
    case KEYBOARD_KEYS.ARROW_UP:
      navigateToCell(focusedRow - 1, focusedColumn);
      break;
    case KEYBOARD_KEYS.ARROW_DOWN:
      navigateToCell(focusedRow + 1, focusedColumn);
      break;
    case KEYBOARD_KEYS.ARROW_LEFT:
      navigateToCell(focusedRow, focusedColumn - 1);
      break;
    case KEYBOARD_KEYS.ARROW_RIGHT:
      navigateToCell(focusedRow, focusedColumn + 1);
      break;
  }
};
```

**Navigation Features**:
- **Arrow Keys**: Navigate between table cells in all directions
- **Tab Key**: Move to interactive elements (buttons, links)
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and cancel actions

**TabIndex Management**:
```tsx
// Only one table cell is focusable at a time (roving tabindex pattern)
const tabIndex = isFocused || (!focusedCell && isFirstCell) ? 0 : -1;
```

### Screen Reader Support

#### ARIA Labels and Descriptions

**Centralized ARIA Constants**:
```typescript
export const ARIA_LABELS = {
  REQUIRED_FIELD: 'required',
  SORT_ASCENDING: 'sorted ascending',
  SORT_DESCENDING: 'sorted descending',
  LOADING: 'Loading content',
  ERROR_MESSAGE: 'Error message',
  USER_ACTIONS: 'User actions',
  HOME_NAVIGATION: 'Go to home page',
  PRIMARY_NAVIGATION: 'Primary navigation'
} as const;
```

#### Live Regions for Dynamic Content

**Screen Reader Announcements**:
```typescript
// Announces messages to screen readers without interrupting workflow
const announceToScreenReader = (message: string): void => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.position = 'absolute';
  announcer.style.left = '-10000px';
  announcer.textContent = message;
  document.body.appendChild(announcer);
};
```

**Use Cases**:
- Form validation errors
- Data loading states
- Search result updates
- User action confirmations

### Form Accessibility

#### Field Associations and Descriptions

**Label-Input Relationships**:
```tsx
<FormField 
  label="Email Address" 
  htmlFor="email-input" 
  required={true}
  error={errors.email}
>
  <input 
    id="email-input"
    type="email"
    aria-describedby={errors.email ? 'email-error' : undefined}
    aria-invalid={!!errors.email}
    required
  />
</FormField>
```

**Error Handling**:
```tsx
// Focus management for form errors
const focusFirstError = (errors: ValidationErrors): void => {
  const firstErrorField = Object.keys(errors)[0];
  const element = document.getElementById(firstErrorField);
  
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus();
    
    // Announce error to screen readers
    const announcement = `Please correct the error: ${errors[firstErrorField]}`;
    announceToScreenReader(announcement);
  }
};
```

### Visual Focus Management

#### Custom Focus Styles

**Consistent Focus Indicators**:
```scss
@mixin interactive-focus {
  &:focus {
    outline: 2px solid $color-secondary-light;
    outline-offset: 2px;
  }
  
  &:focus-visible {
    outline: 2px solid $color-secondary-light;
    outline-offset: 2px;
  }
}
```

**Focus Trap Implementation**:
```scss
// Modal focus trap styling
.modal {
  &:focus {
    outline: none; // Remove default outline for container
  }
  
  .modal__content {
    @include interactive-focus;
  }
}
```

### Responsive Accessibility

#### Mobile Touch Targets

**Minimum Touch Target Sizes**:
```scss
// All interactive elements meet 44px minimum touch target
.data-table__action-btn {
  min-height: 44px;
  min-width: 44px;
  
  @media (max-width: 480px) {
    min-height: 48px; // Larger targets on small screens
    min-width: 48px;
  }
}
```

#### Screen Reader Optimized Mobile Cards

**Alternative Data Presentation**:
```tsx
// Mobile card view replaces table for better screen reader experience
<div className="data-table__mobile-cards">
  {users.map(user => (
    <article 
      key={user.id} 
      className="data-table__card"
      role="article"
      aria-labelledby={`user-${user.id}-name`}
    >
      <h3 id={`user-${user.id}-name`}>{user.name}</h3>
      <div aria-label="User details">
        <span>Email: {user.email}</span>
        <span>Phone: {user.phone}</span>
      </div>
    </article>
  ))}
</div>
```

## 🛠️ Implementation Examples

### Table Navigation in Action

**Keyboard Navigation Flow**:
1. **Tab to table**: Focus moves to first data cell
2. **Arrow keys**: Navigate between cells in grid pattern
3. **Tab from cell**: Focus moves to next interactive element outside table
4. **Screen reader**: Announces "Row 2, Column 3" when navigating

**Implementation**:
```tsx
const DataTable = () => {
  const { focusedCell, getCellProps } = useTableKeyboardNavigation({
    rowCount: users.length,
    columnCount: 4,
    tableId: 'users-table'
  });

  return (
    <table id="users-table" role="table">
      <caption className="data-table__caption">
        Users list with {users.length} entries
      </caption>
      <tbody>
        {users.map((user, rowIndex) => (
          <tr key={user.id}>
            <td {...getCellProps(rowIndex, 0)}>
              {user.name}
            </td>
            <td {...getCellProps(rowIndex, 1)}>
              {user.email}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### Form Error Announcements

**Error Handling Flow**:
1. **Form submission**: Validation runs on submit
2. **Error focus**: First error field receives focus
3. **Screen reader**: Error message announced immediately
4. **Visual indicator**: Field highlighted with error styling

**Implementation**:
```tsx
const handleSubmit = async (data: UserFormData) => {
  const validationResult = validateUser(data);
  
  if (!validationResult.isValid) {
    // Focus first error and announce to screen readers
    focusFirstError(validationResult.errors);
    return;
  }
  
  // Success announcement
  announceToScreenReader('User saved successfully');
};
```

### Skip Links and Page Structure

**Skip Navigation**:
```tsx
<a 
  href="#main-content" 
  className="skip-link"
  aria-label="Skip to main content"
>
  Skip to main content
</a>

<main id="main-content" role="main">
  <h1>Users</h1>
  {/* Page content */}
</main>
```

**Hidden Skip Link Styling**:
```scss
.skip-link {
  @include visually-hidden;
  
  &:focus {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999;
    padding: $space-2 $space-4;
    background: $color-primary;
    color: $color-white;
    text-decoration: none;
    clip: auto;
    width: auto;
    height: auto;
  }
}
```

## 📊 Accessibility Testing

### Automated Testing
- **Jest + Testing Library**: Tests include accessibility assertions
- **ARIA attributes**: Verified through automated tests
- **Focus management**: Tested in user interaction flows

### Manual Testing Checklist
- ✅ **Keyboard navigation**: All functionality accessible via keyboard
- ✅ **Screen reader**: Content properly announced and navigable
- ✅ **Color contrast**: WCAG AA compliant color ratios
- ✅ **Touch targets**: Minimum 44px for all interactive elements
- ✅ **Focus indicators**: Visible focus states on all interactive elements

### Screen Reader Compatibility
- **NVDA**: Primary testing screen reader
- **JAWS**: Secondary compatibility testing
- **VoiceOver**: macOS/iOS accessibility testing

## 🎯 WCAG 2.1 Compliance

### Level AA Standards Met

**Perceivable**:
- Color contrast ratios meet AA standards (4.5:1 for normal text)
- Text can be resized up to 200% without loss of functionality
- Images have appropriate alt text

**Operable**:
- All functionality available via keyboard
- No content causes seizures or physical reactions
- Users have enough time to read content

**Understandable**:
- Text is readable and understandable
- Content appears and operates predictably
- Input assistance provided for forms

**Robust**:
- Content works with assistive technologies
- Markup is valid and semantic

### Future Enhancements
- High contrast mode support
- Reduced motion preferences
- Enhanced voice navigation support
- Multi-language accessibility improvements
