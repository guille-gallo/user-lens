# Design Decisions & Technical Choices

## 🎨 UI/CSS Framework Choice

### SCSS with Custom Design System

**Framework Choice**: Pure SCSS with custom design system (no external UI framework)

**Why:**:
- **Flexibility**: Custom design system allows complete control over styling without framework constraints
- **Performance**: No external CSS framework bloat - only styles we actually use are included
- **Maintainability**: Design tokens (`_tokens.scss`) provide centralized theming and consistent design
- **Scalability**: SCSS mixins and responsive utilities create reusable patterns
- **Team Standards**: Pure CSS/SCSS aligns with enterprise development practices

**Implementation Details**:
- **Design Tokens**: Centralized color palette, typography, spacing, and breakpoints
- **Mixins Library**: Reusable SCSS mixins for typography, spacing, and responsive design
- **Component-Scoped Styles**: Each component has its own SCSS file preventing style conflicts
- **Mobile-First Approach**: All responsive design built mobile-first with progressive enhancement

## 📱 Responsive Design Strategy

### Mobile-First Implementation

**The Challenge**: Tables are problematic on mobile devices due to:
- Limited horizontal space causing content overflow
- Poor touch interaction with small clickable areas
- Difficult data scanning in cramped layouts
- Accessibility issues with horizontal scrolling

**Our Solution**:

1. **Adaptive Data Display**:
   ```scss
   // Desktop: Traditional table
   @include respond-to(md) {
     .data-table__wrapper { display: block; }
     .data-table__mobile-cards { display: none; }
   }
   
   // Mobile: Card-based layout
   .data-table__mobile-cards { display: block; }
   .data-table__wrapper { display: none; }
   ```

2. **Card-Based Mobile Layout**:
   - Users displayed as individual cards instead of table rows
   - Essential information (name, email) always visible
   - Expandable sections for additional details
   - Touch-friendly action buttons (36px minimum)

3. **Progressive Disclosure**:
   - Primary information shown immediately
   - Secondary data revealed through expand/collapse
   - Reduces cognitive load and screen clutter

4. **Responsive Breakpoints**:
   - **768px+**: Full table with all columns visible
   - **480px-768px**: Condensed table with reduced padding
   - **<480px**: Card layout with touch-optimized interactions

**Result**: Maintains full functionality across all devices while providing optimal UX for each screen size.
