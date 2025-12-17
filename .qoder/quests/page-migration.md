# Page Migration Design Document

## Overview

This document outlines the design for migrating five pages from the gcms-shop-cd directory to the main Laravel Inertia React project, including routing configuration and integration with the existing architecture.

## Pages to Migrate

The following pages will be migrated from gcms-shop-cd to the main project:

| Page Name | Source Location | Purpose |
|-----------|----------------|---------|
| Main Shop Page | gcms-shop-cd/app/page.tsx | Homepage with header, search, categories, and product grid |
| Product Details | gcms-shop-cd/app/product/page.tsx | Individual product page with gallery, description, and reviews |
| Purchases | gcms-shop-cd/app/buys/page.tsx | User purchase history and downloads |
| Wallet Management | gcms-shop-cd/app/wallet/page.tsx | Balance management and payment history |
| Settings | gcms-shop-cd/app/settings/page.tsx | User profile and account settings |

## Target Architecture

### Current Project Structure

- **Framework**: Laravel with Inertia.js and React
- **Frontend Location**: resources/js/pages/
- **Components Location**: resources/js/components/
- **Routing**: Laravel routes in routes/web.php
- **Layout System**: Inertia layouts in resources/js/layouts/

### Source Project Structure

- **Framework**: Next.js with React
- **Pages Location**: gcms-shop-cd/app/
- **Components Location**: gcms-shop-cd/components/
- **Layout**: Next.js app directory layout with ShopHeader

## Migration Strategy

### Complete Frontend Replacement

The migration follows a complete replacement strategy rather than merging:

**Step 1: Clean Existing Frontend**
- Remove all files and directories from resources/js/
- Remove all files and directories from resources/css/
- Keep only resources/views/ for Laravel blade templates

**Step 2: Copy Frontend Structure**
- Copy all files from gcms-shop-cd/app/ to resources/js/pages/
- Copy all files from gcms-shop-cd/components/ to resources/js/components/
- Copy all files from gcms-shop-cd/lib/ to resources/js/lib/
- Copy gcms-shop-cd/styles/globals.css to resources/css/app.css

**Step 3: Adapt to Inertia Pattern**
- Transform Next.js pages to Inertia pages
- Remove Next.js specific code
- Create Inertia entry point (app.tsx)
- Setup layout system for Inertia

### File Structure Mapping

| Source Path | Target Path | Type |
|-------------|-------------|------|
| gcms-shop-cd/app/page.tsx | resources/js/pages/index.tsx | Page |
| gcms-shop-cd/app/product/page.tsx | resources/js/pages/product.tsx | Page |
| gcms-shop-cd/app/buys/page.tsx | resources/js/pages/buys.tsx | Page |
| gcms-shop-cd/app/wallet/page.tsx | resources/js/pages/wallet.tsx | Page |
| gcms-shop-cd/app/settings/page.tsx | resources/js/pages/settings.tsx | Page |
| gcms-shop-cd/app/layout.tsx | resources/js/layouts/shop-layout.tsx | Layout |
| gcms-shop-cd/components/** | resources/js/components/** | Components |
| gcms-shop-cd/lib/** | resources/js/lib/** | Utilities |

### Component Structure

All components will be copied as-is from gcms-shop-cd/components/ to resources/js/components/:

**UI Primitives** (components/ui/):
- avatar.tsx
- badge.tsx
- button.tsx
- card.tsx
- dialog.tsx
- input.tsx
- label.tsx

**Shop Components**:
- category-sidebar.tsx - Category filtering and search
- product-grid.tsx - Product listing grid
- product-card.tsx - Individual product card
- shop-header.tsx - Main navigation header

**Product Components**:
- product-hero.tsx - Product breadcrumb and title
- product-image-gallery.tsx - Image gallery with thumbnails
- product-sidebar.tsx - Product metadata and purchase
- product-description.tsx - Product description section
- product-reviews.tsx - Reviews and ratings

**User Components**:
- user-sidebar.tsx - User dashboard navigation
- purchase-card.tsx - Purchase history item

**Shared Components**:
- auth-modal.tsx - Authentication modal
- theme-toggle.tsx - Dark/light mode toggle
- theme-provider.tsx - Theme context provider
- image-slider.tsx - Image carousel
- example.tsx - Example components
- component-example.tsx - Component showcase

### Code Transformation Requirements

#### Remove Next.js Specific Features

The following Next.js-specific elements must be removed or replaced:

| Next.js Feature | Replacement Strategy |
|----------------|---------------------|
| "use client" directive | Remove from all files |
| next/link imports | Replace with standard anchor tags or Inertia Link (if navigation needed) |
| next/image imports | Replace with standard img elements |
| Metadata exports | Remove (handled by Laravel blade) |

#### Keep Client-Side Functionality

Since backend implementation is deferred, maintain client-side patterns:

**Data Fetching**:
- Keep existing useEffect with fetch patterns
- Keep mock data for demonstration
- Comment TODOs remain for future Laravel API integration
- All data fetching remains client-side for now

**Routing**:
- Use standard anchor tags for navigation between pages
- Route paths will match Laravel route definitions
- No need for Inertia router initially (can be added later)

**State Management**:
- Keep all useState hooks as-is
- Keep all local component state
- No changes to form handling (keep existing patterns)

**Authentication**:
- Keep mock authentication state
- Auth modal remains functional with client-side state
- Will be connected to Laravel auth later

### Layout System

#### Inertia Entry Point

Create resources/js/app.tsx as the Inertia application entry point:

**Responsibilities**:
- Initialize Inertia app
- Setup page component resolution
- Provide global context (theme, etc.)
- Handle progress bar configuration

#### Root Layout Component

Adapt gcms-shop-cd/app/layout.tsx to resources/js/layouts/shop-layout.tsx:

**Structure**:
- HTML wrapper removed (handled by blade template)
- ThemeProvider wrapper
- ShopHeader component
- Main content area with max-width container
- Footer section

**Features**:
- Wraps all pages consistently
- Provides theme switching capability
- Responsive container layout
- Global navigation

#### Page-Specific Layouts

Pages will handle their own internal layout:

**Shop Pages** (index, product):
- Use ShopLayout as wrapper
- Implement their own content structure

**User Pages** (buys, wallet, settings):
- Use ShopLayout as wrapper
- Include UserSidebar within page component
- Two-column layout (sidebar + content)

## Routing Configuration

### Complete Route Replacement

All existing routes in routes/web.php will be removed and replaced with new shop routes.

**Route File Structure**:
- Remove all existing routes from routes/web.php
- Remove routes/settings.php (if not needed)
- Keep routes/console.php (unchanged)

### New Route Definitions

The following routes will be defined in routes/web.php using Inertia::render():

**Public Routes**:

| Route Path | Page Component | Route Name | Description |
|-----------|----------------|------------|-------------|
| / | index | home | Main shop page |
| /product | product | product | Product details page |

**User Routes** (no auth middleware initially):

| Route Path | Page Component | Route Name | Description |
|-----------|----------------|------------|-------------|
| /buys | buys | buys | Purchase history |
| /wallet | wallet | wallet | Wallet management |
| /settings | settings | settings | User settings |

### Route Implementation Pattern

Routes will use direct Inertia rendering without controllers:

**Pattern**:
- Route::get() with closure
- Inertia::render() with page component name
- Empty props array initially (mock data remains in components)
- Route naming for easier reference

**Authentication**:
- No middleware applied initially
- Pages handle authentication state client-side
- Middleware can be added later when connecting to Laravel auth

### No Controllers Required

Since backend is not being implemented yet:
- No controller classes will be created
- All routes use closures with Inertia::render()
- Data remains mocked in frontend components
- Controllers can be added in future phase

## Data Flow Architecture

### Current Phase: Client-Side Only

Since backend implementation is deferred, data flow remains client-side:

**Pattern**:
- Pages use mock data defined within components
- No server-side data fetching
- No props passed from Laravel
- useEffect with setTimeout simulates API calls
- All state managed with React hooks

### Mock Data Locations

Each page contains its own mock data:

| Page | Mock Data Description |
|------|----------------------|
| index.tsx | Mock product list, categories in ProductGrid component |
| product.tsx | EXAMPLE_PRODUCT constant with sample product data |
| buys.tsx | Mock purchases array in useEffect |
| wallet.tsx | Mock balance, payment methods, and transaction history |
| settings.tsx | Mock user data in formData state |

### Future Backend Integration

Pages are prepared for future Laravel integration:

**Markers**:
- TODO comments indicate where Laravel API calls should go
- Example fetch patterns commented out
- Mock data can be easily replaced with props
- Component structure supports both patterns

**Example Pattern**:
```
// TODO: Replace with actual Laravel API call
// const response = await fetch('/api/products')
// const data = await response.json()

// Mock data for demonstration
setProducts([...])
```

## Component Adaptation Strategy

### Import Path Configuration

Import paths will use TypeScript path aliases:

**Alias Configuration** (tsconfig.json):
- @/* maps to resources/js/*
- All imports remain as @/components/..., @/lib/..., etc.
- No changes needed to import statements

**Example**:
```
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

### Minimal Code Changes

Components will require minimal changes:

**Required Changes**:
1. Remove "use client" directives from all files
2. Replace next/link with standard anchor tags where used
3. Replace next/image with img tags where used
4. Remove metadata exports from layout file

**No Changes Needed**:
- Keep all useState, useEffect hooks as-is
- Keep all mock data and fetch patterns
- Keep all form handling logic
- Keep all component props and interfaces
- Keep all styling and Tailwind classes
- Keep ThemeProvider and theme logic

### Authentication Handling

Authentication remains client-side for now:

**Current Approach**:
- ShopHeader maintains isAuthenticated state
- AuthModal handles login UI
- State managed with useState
- No connection to Laravel auth

**Future Integration** (noted for later):
- Can connect to Laravel Fortify
- Can use Inertia shared props for auth state
- Can replace client state with server session

### Link Replacements

Replace Next.js Link components with standard navigation:

| Component | Current | Replacement |
|-----------|---------|-------------|
| ShopHeader | Link from next/link | Standard <a> tags |
| Navigation | href props | href with route paths |
| Product links | Link wrapper | <a> tags with onClick handlers |

## Theme System

### Theme Provider Integration

The theme system from gcms-shop-cd will be preserved:

**Components**:
- theme-provider.tsx - Context provider for theme state
- theme-toggle.tsx - UI component for switching themes
- Uses local storage for persistence
- Supports light/dark mode

**Integration**:
- ThemeProvider wraps the entire app in shop-layout.tsx
- Theme toggle included in ShopHeader
- CSS variables defined in globals.css
- No changes needed to theme logic

### Styling Setup

**CSS Structure**:
- Replace resources/css/app.css with gcms-shop-cd/styles/globals.css
- Includes Tailwind directives
- Includes CSS variables for theming
- Includes custom utility classes

**Tailwind Configuration**:
- Update tailwind.config.js to match gcms-shop-cd configuration
- Ensure content paths include resources/js/**/*.tsx
- Preserve custom theme colors
- Maintain animation and keyframe definitions

**Design Tokens**:
- CSS variables for colors (--background, --foreground, etc.)
- Theme-specific values for light/dark modes
- Consistent spacing and radius variables
- Typography scale definitions

## Security Considerations

### Current Phase: No Backend Security

Since backend is not implemented, security is deferred:

**No Authentication Enforcement**:
- No middleware on routes
- No server-side auth checks
- Pages accessible to all users
- Client-side auth is cosmetic only

**No Authorization**:
- No permission checks
- No ownership validation
- No role-based access control

**No Data Validation**:
- No server-side validation
- No input sanitization
- Client-side validation only (UI/UX)

### Future Security Implementation

When backend is added, implement:

**Authentication**:
- Apply auth middleware to user routes
- Use Laravel Fortify for authentication
- Protect buys, wallet, settings pages

**Authorization**:
- Policy classes for product purchases
- Gate checks for reviews
- Ownership validation for settings

**Validation**:
- Form Request classes
- Input sanitization
- XSS protection
- CSRF protection (Laravel default)

## Performance Considerations

### Code Splitting

Inertia provides automatic code splitting:

**Per-Page Splitting**:
- Each page component is a separate bundle
- Components load on-demand when page is visited
- Shared components bundled separately
- Reduces initial bundle size

**Lazy Loading** (future optimization):
- Image gallery can be lazy loaded
- Review sections can load on scroll
- Modal components load on interaction

### Client-Side Performance

Optimizations for current client-side approach:

**Image Optimization**:
- Use appropriate image sizes
- Implement lazy loading for product images
- Consider next-gen formats (WebP)

**Component Rendering**:
- Minimize re-renders with proper key props
- Use React.memo for expensive components
- Optimize state updates

**Mock Data**:
- Keep mock data minimal
- Use realistic data volumes
- Simulate loading states

### Future Backend Optimizations

When backend is implemented:

**Data Fetching**:
- Server-side rendering for initial page load
- Pagination for large lists
- Efficient database queries
- Response caching where appropriate

**Asset Optimization**:
- Vite build optimization
- CSS/JS minification
- Tree shaking for unused code

## Error Handling

### Current Phase: Client-Side Only

Error handling is minimal since there's no backend:

**No Server Errors**:
- No 404/403/500 errors
- No validation errors from server
- No API failure handling

**Client-Side Errors**:
- JavaScript errors caught by React error boundaries (if added)
- Console logging for debugging
- No user-facing error messages needed currently

**Form Handling**:
- Client-side validation only
- Mock success/failure states
- Alert dialogs for demonstration

### Future Error Handling

When backend is implemented:

**Inertia Error Handling**:
- Validation errors automatically passed to pages
- Display errors with Inertia's error prop
- Inline field errors in forms

**HTTP Errors**:
- 404 for missing products
- 403 for unauthorized access
- 422 for validation failures
- Custom error pages

**User Feedback**:
- Toast notifications for actions
- Error messages in forms
- Loading states during requests

## Testing Strategy

### MCP Context7 Validation Strategy

**Critical Requirement**: Use MCP Context7 throughout the migration to validate code against official library documentation and best practices.

**When to Use MCP Context7**:

1. **React Component Validation**:
   - Validate React hooks usage (useState, useEffect)
   - Verify component patterns and props typing
   - Check for React best practices and anti-patterns
   - Ensure proper TypeScript typing for components

2. **Inertia.js Integration**:
   - Validate Inertia app setup and configuration
   - Verify page component structure
   - Check Inertia router usage if implemented
   - Validate shared data patterns

3. **Tailwind CSS Configuration**:
   - Validate tailwind.config structure
   - Verify custom theme configuration
   - Check PostCSS setup
   - Validate Tailwind directives in CSS

4. **TypeScript Configuration**:
   - Validate tsconfig.json settings
   - Verify path aliases configuration
   - Check compiler options
   - Validate type definitions

5. **Vite Build Configuration**:
   - Validate vite.config.ts structure
   - Verify Laravel plugin configuration
   - Check entry points and output settings
   - Validate build optimization options

6. **Laravel Blade Template**:
   - Validate Blade syntax
   - Verify @vite directive usage
   - Check @inertia directive implementation
   - Validate HTML structure and meta tags

**MCP Context7 Workflow**:

1. **Before Proceeding**: After each major code change, use MCP Context7 to validate against library docs
2. **Validate Full Context**: Review entire files, not just snippets
3. **Fix Immediately**: Address any issues found before moving to next phase
4. **Document Findings**: Note any patterns or recommendations from Context7

**Libraries to Validate Against**:

| Library | Context7 ID | Validation Focus |
|---------|------------|------------------|
| React | /facebook/react | Component patterns, hooks, TypeScript types |
| Inertia.js | /inertiajs/inertia | Setup, page components, routing |
| Tailwind CSS | /tailwindlabs/tailwindcss | Configuration, utilities, customization |
| TypeScript | /microsoft/TypeScript | Config, type safety, best practices |
| Vite | /vitejs/vite | Build config, plugins, optimization |
| Laravel | /laravel/laravel | Blade templates, routing, Vite integration |

### Current Phase: Manual Testing

Since this is initial frontend setup, testing is primarily manual:

**Visual Testing**:
- Verify each page renders correctly
- Test responsive design on different screen sizes
- Verify theme switching works
- Check component styling and layout

**Navigation Testing**:
- Test all links navigate correctly
- Verify route paths are accessible
- Check header navigation
- Test user sidebar navigation

**Interaction Testing**:
- Test form inputs accept data
- Verify buttons trigger expected actions
- Test modal opening/closing
- Check search functionality

### Future Testing Implementation

When backend is added:

**Component Tests**:
- Jest + React Testing Library
- Unit tests for components
- Interaction testing
- Snapshot tests for UI

**Integration Tests**:
- Laravel feature tests
- Inertia page rendering tests
- Route accessibility tests
- Authentication flow tests

**E2E Tests**:
- Playwright or Cypress
- Full user flow testing
- Cross-browser testing

## Implementation Checklist

### Phase 1: Clean Existing Frontend

- [ ] Backup existing resources/js directory (optional)
- [ ] Delete all files in resources/js/
- [ ] Delete all files in resources/css/
- [ ] Keep resources/views/app.blade.php (may need updates)
- [ ] Remove existing routes from routes/web.php
- [ ] Remove routes/settings.php if exists
- [ ] Delete app/Http/Controllers (except auth-related if needed)
- [ ] Clean up unused PHP dependencies

### Phase 2: Copy Frontend Files

- [ ] Copy gcms-shop-cd/app/layout.tsx → resources/js/layouts/shop-layout.tsx
- [ ] Copy gcms-shop-cd/app/page.tsx → resources/js/pages/index.tsx
- [ ] Copy gcms-shop-cd/app/product/page.tsx → resources/js/pages/product.tsx
- [ ] Copy gcms-shop-cd/app/buys/page.tsx → resources/js/pages/buys.tsx
- [ ] Copy gcms-shop-cd/app/wallet/page.tsx → resources/js/pages/wallet.tsx
- [ ] Copy gcms-shop-cd/app/settings/page.tsx → resources/js/pages/settings.tsx
- [ ] Copy gcms-shop-cd/components/** → resources/js/components/**
- [ ] Copy gcms-shop-cd/lib/** → resources/js/lib/**
- [ ] Copy gcms-shop-cd/styles/globals.css → resources/css/app.css

### Phase 3: Adapt Code for Inertia

- [ ] Remove all "use client" directives from files
- [ ] Create resources/js/app.tsx (Inertia entry point)
- [ ] Update shop-layout.tsx (remove HTML/body tags, keep content wrapper)
- [ ] Replace next/link imports with anchor tags in ShopHeader
- [ ] Replace next/image imports with img tags (if any)
- [ ] Remove metadata export from layout
- [ ] Verify @/ imports work with tsconfig.json paths
- [ ] **Use MCP Context7 for validation**: Validate all adapted code against React and TypeScript best practices using MCP Context7 to ensure correctness before proceeding

### Phase 4: Configuration Files

- [ ] Update package.json with dependencies from gcms-shop-cd
- [ ] Update tailwind.config.js/ts to match gcms-shop-cd config
- [ ] Update tsconfig.json with correct path mappings
- [ ] Verify vite.config.ts has correct entry point
- [ ] Update postcss.config if needed
- [ ] Install npm dependencies (npm install)
- [ ] **Use MCP Context7 for configuration validation**: Verify all configuration files (tsconfig.json, tailwind.config, vite.config) against official documentation and best practices using MCP Context7

### Phase 5: Laravel Routes

- [ ] Clear routes/web.php (keep only necessary imports)
- [ ] Add route for / → Inertia::render('index')
- [ ] Add route for /product → Inertia::render('product')
- [ ] Add route for /buys → Inertia::render('buys')
- [ ] Add route for /wallet → Inertia::render('wallet')
- [ ] Add route for /settings → Inertia::render('settings')
- [ ] Add route names for easier reference

### Phase 6: Blade Template

- [ ] Update resources/views/app.blade.php for Inertia
- [ ] Ensure @vite directive points to app.tsx
- [ ] Add @inertia directive for mounting
- [ ] Include necessary meta tags
- [ ] Verify HTML structure matches expected layout
- [ ] **Use MCP Context7 for Laravel Blade validation**: Verify Blade template syntax and Inertia integration against Laravel and Inertia.js documentation using MCP Context7

### Phase 7: Build and Test

- [ ] Run npm run build to verify compilation
- [ ] Run npm run dev for development server
- [ ] Test homepage (/) loads correctly
- [ ] Test /product page loads
- [ ] Test /buys page loads
- [ ] Test /wallet page loads
- [ ] Test /settings page loads
- [ ] Verify theme switching works
- [ ] Test responsive design on mobile
- [ ] Check browser console for errors
- [ ] **Use MCP Context7 for final validation**: Review complete implementation against React, TypeScript, Tailwind CSS, and Inertia.js best practices using MCP Context7 before considering migration complete

### Phase 8: Cleanup

- [ ] Remove gcms-shop-cd directory (after verification)
- [ ] Remove app/layout.tsx if exists in root app/
- [ ] Remove app/page.tsx if exists in root app/
- [ ] Remove other Next.js artifacts
- [ ] Clean up unused dependencies
- [ ] Update .gitignore if needed

### Phase 9: Documentation

- [ ] Document new route structure
- [ ] Document component locations
- [ ] Add notes about mock data for future backend
- [ ] Update README if needed

## Success Criteria

The migration will be considered successful when:

1. **All Routes Accessible**:
   - / (homepage) loads correctly
   - /product page loads correctly
   - /buys page loads correctly
   - /wallet page loads correctly
   - /settings page loads correctly

2. **Visual Presentation**:
   - All pages render with correct styling
   - Tailwind CSS classes apply correctly
   - Layout matches gcms-shop-cd design
   - Components display properly
   - Theme colors apply correctly

3. **Theme System Works**:
   - Theme toggle switches between light/dark
   - Theme persists in local storage
   - CSS variables update on theme change
   - All components respect theme

4. **Navigation Functions**:
   - Header navigation links work
   - User sidebar links work
   - All internal links navigate correctly
   - Route names resolve properly

5. **Interactive Elements**:
   - Buttons are clickable
   - Forms accept input
   - Modals open and close
   - Dropdowns expand/collapse
   - Search input works

6. **Responsive Design**:
   - Pages work on desktop
   - Pages work on tablet
   - Pages work on mobile
   - Sidebar collapses on small screens
   - Layout adapts to screen size

7. **No Errors**:
   - No JavaScript console errors
   - No React warnings
   - No missing imports
   - No broken images (if using placeholders)
   - Build completes without errors

8. **Mock Data Displays**:
   - Products show on homepage
   - Product details show on product page
   - Purchases list shows on buys page
   - Wallet transactions show
   - Settings form shows user data

9. **Performance**:
   - Initial page load completes
   - Navigation between pages is smooth
   - No significant lag or freezing
   - Build size is reasonable

10. **Code Quality**:
    - No TypeScript errors
    - All imports resolve
    - Components are properly typed
    - No unused imports or variables
