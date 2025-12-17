# Role System Implementation Design

## Overview

This design document outlines the implementation of a comprehensive role-based access control (RBAC) system integrated with wallet functionality for the Laravel React e-commerce application. The system will utilize Spatie Laravel Permission for role management and Bavix Laravel Wallet for user balance operations with Russian Ruble (RUB) currency support.

## Objectives

- Implement role-based access control with predefined Admin and User roles supporting multiple roles per user
- Integrate wallet system with Russian Ruble (RUB) currency support without payment gateway integration
- Create admin interface for user management with advanced search and filtering capabilities
- Provide role and permission management interface for administrators
- Enable wallet operations (deposit/withdraw) through admin panel with both integrated and dedicated views
- Display comprehensive user transaction history in admin interface
- Automatically assign default "User" role to all newly registered users

## System Architecture

### Technology Stack

**Backend**:
- Laravel Framework (existing)
- Spatie Laravel Permission for RBAC
- Bavix Laravel Wallet for virtual wallet management
- Inertia.js for SSR integration

**Frontend**:
- React 19 with TypeScript 5
- Vite 7 for build tooling
- Radix UI for accessible primitives
- Headless UI for interactive components
- Lucide React for icons
- shadcn and vaul for UI components
- Tailwind CSS with clsx and class-variance-authority

### Package Dependencies

| Package | Purpose | Installation Command |
|---------|---------|---------------------|
| spatie/laravel-permission | Role and permission management | composer require spatie/laravel-permission |
| bavix/laravel-wallet | Virtual wallet functionality | composer require bavix/laravel-wallet |

## Data Model Design

### Roles and Permissions Structure

#### Predefined Roles

| Role Name | Slug | Description | Auto-Assigned |
|-----------|------|-------------|---------------|
| Admin | admin | Full system access with administrative privileges | No |
| User | user | Standard customer with limited access | Yes (on registration) |

#### Predefined Permissions (Fixed)

**Admin Permissions**:

| Permission Name | Slug | Description |
|----------------|------|-------------|
| Manage Users | manage-users | Create, edit, delete, and view all users |
| Manage Roles | manage-roles | Create, edit, delete roles and assign permissions |
| Edit Products | edit-products | Create, update, delete product listings |
| Edit Categories | edit-categories | Create, update, delete product categories |
| Grant Items to Users | grant-items | Assign purchased items directly to user accounts |
| Manage Wallets | manage-wallets | Add or deduct funds from user wallets |

**User Permissions**:

| Permission Name | Slug | Description |
|----------------|------|-------------|
| View Products and Categories | view-products-categories | Browse product catalog and category listings |
| Purchase Products | purchase-products | Execute purchase transactions |

### User-Role Relationship

**Model**: Many-to-Many
- Single user can have multiple roles simultaneously
- Role assignment managed through pivot table (model_has_roles)
- Permission resolution aggregates all permissions from all assigned roles
- Default "User" role automatically assigned during registration

### Database Schema Extensions

#### User Model Extensions

The existing User model will be extended with:
- HasRoles trait from Spatie Permission
- HasWallet trait from Bavix Wallet

**New Model Methods**:
- getAllPermissions(): Returns collection of all permissions from all roles
- hasAnyRole(): Checks if user has any of specified roles
- hasAllRoles(): Checks if user has all specified roles
- assignRole(): Assigns one or more roles to user
- removeRole(): Removes role from user
- syncRoles(): Replaces all user roles with specified roles

#### Wallet Configuration

**Currency Settings**:
- Primary Currency: Russian Ruble (RUB)
- Currency Symbol: ₽
- Decimal Places: 2
- Storage Format: Integer (kopecks)
- Display Format: Decimal (rubles)
- Wallet Slug: default
- Single wallet per user

**Wallet Model Attributes**:
- holder_type: User model class name
- holder_id: User ID
- name: Wallet name (default)
- slug: Unique identifier (default)
- balance: Integer value in kopecks
- decimal_places: 2

#### Database Tables

**Spatie Permission Tables** (created via migration):

```
roles
- id: bigint primary key
- name: string
- guard_name: string
- created_at: timestamp
- updated_at: timestamp

permissions
- id: bigint primary key
- name: string
- guard_name: string
- created_at: timestamp
- updated_at: timestamp

model_has_roles (pivot)
- role_id: bigint
- model_type: string
- model_id: bigint
- primary key: (role_id, model_id, model_type)

model_has_permissions (pivot)
- permission_id: bigint
- model_type: string
- model_id: bigint
- primary key: (permission_id, model_id, model_type)

role_has_permissions (pivot)
- permission_id: bigint
- role_id: bigint
- primary key: (permission_id, role_id)
```

**Bavix Wallet Tables** (created via migration):

```
wallets
- id: bigint primary key
- holder_type: string
- holder_id: bigint
- name: string
- slug: string (unique)
- balance: bigint (default 0)
- decimal_places: smallint (default 2)
- created_at: timestamp
- updated_at: timestamp

transactions
- id: bigint primary key
- payable_type: string
- payable_id: bigint
- wallet_id: bigint (nullable)
- type: enum (deposit, withdraw)
- amount: bigint
- confirmed: boolean (default 1)
- meta: json (nullable)
- uuid: uuid (unique)
- created_at: timestamp
- updated_at: timestamp

transfers
- id: bigint primary key
- from_type: string
- from_id: bigint
- to_type: string
- to_id: bigint
- status: enum
- status_last: enum (nullable)
- deposit_id: bigint
- withdraw_id: bigint
- discount: bigint (default 0)
- fee: bigint (default 0)
- uuid: uuid (unique)
- created_at: timestamp
- updated_at: timestamp
```

## Functional Requirements

### Initial Setup and Configuration

#### Package Installation Sequence

1. Install Spatie Permission package
2. Publish Spatie Permission configuration and migrations
3. Install Bavix Wallet package
4. Publish Bavix Wallet configuration and migrations
5. Execute all pending migrations
6. Configure wallet currency in published config file
7. Clear application cache

#### Database Seeding Strategy

**Seeder Execution Order**:

1. **PermissionsSeeder**: Create all predefined permissions
2. **RolesSeeder**: Create Admin and User roles
3. **RolePermissionsSeeder**: Assign permissions to roles
4. **DefaultAdminSeeder**: Create initial admin user with Admin role

**Permission Creation**:
- All permissions created with guard_name 'web'
- Permission names stored in configuration file for consistency
- Cache reset after permission creation

**Role Creation**:
- Admin role assigned all six admin permissions
- User role assigned two user permissions
- Roles created with guard_name 'web'

**Default Admin User**:
- Email and password defined in seeder or environment variable
- Automatically assigned Admin role
- Wallet created automatically via HasWallet trait
- Initial balance set to zero

#### Model Configuration

**User Model Modifications**:
- Add HasRoles trait import and usage
- Add HasWallet trait import and usage
- Configure guard_name property (default: web)
- Add wallet relationship accessor methods

**Configuration File Updates**:

Wallet configuration (config/wallet.php):
- Set default currency to RUB
- Configure decimal places to 2
- Set default wallet name
- Configure transaction auto-confirm to true

Permission configuration (config/permission.php):
- Verify table names match migration
- Set cache expiration time
- Configure cache key prefix

### User Management Interface

#### User List Page

**Route**: /admin/users
**Permission Required**: manage-users
**Component**: AdminUsersIndex

**Display Table Columns**:

| Column | Data Source | Display Format |
|--------|-------------|----------------|
| ID | users.id | Numeric |
| Avatar | users.avatar | Thumbnail image (40x40px) |
| Name | users.name | Text with link to edit |
| Email | users.email | Text |
| Roles | model_has_roles relationship | Colored badges |
| Balance | wallets.balance | ₽ formatted (rubles) |
| Registered | users.created_at | Date (relative time) |
| Status | Derived | Active/Inactive badge |
| Actions | - | Edit, View Transactions buttons |

**Advanced Search and Filter Features**:

Search Input:
- Real-time search across name and email fields
- Debounced input (300ms delay)
- Clear button when search active
- Search query persists in URL parameters

Role Filter:
- Multi-select dropdown with all available roles
- "All Roles" option to clear filter
- Shows count of users per role
- Selected roles displayed as removable tags

Balance Range Filter:
- Minimum balance input (RUB)
- Maximum balance input (RUB)
- "Any Balance" option to clear
- Validation for min <= max

Registration Date Filter:
- Date range picker component
- Preset ranges (Last 7 days, Last 30 days, Last year)
- Custom date range selection
- Clear filter button

Status Filter:
- Dropdown with Active/Inactive options
- All/Active/Inactive toggle

**Sorting Functionality**:
- Clickable column headers
- Sort by: ID, Name, Email, Balance, Registration Date
- Ascending/Descending indicator (arrow icon)
- Default sort: Registration Date descending

**Pagination**:
- Items per page selector (10, 25, 50, 100)
- Page number navigation
- Total results count display
- First/Previous/Next/Last page buttons

**Bulk Actions**:
- Select all checkbox in table header
- Individual row checkboxes
- Bulk assign role action
- Bulk export to CSV action
- Selection count indicator

**Empty States**:
- No users found message
- Clear filters suggestion
- Create first user prompt (if no users exist)

#### User Edit Page

**Route**: /admin/users/{id}/edit
**Permission Required**: manage-users
**Component**: AdminUserEdit

**Page Layout Sections**:

1. User Information Card
2. Role Assignment Card
3. Wallet Management Card (integrated)
4. Transaction History Card

**User Information Form**:

| Field | Input Type | Validation Rules | Notes |
|-------|-----------|------------------|-------|
| Name | Text input | Required, min:3, max:255 | Username display |
| Email | Email input | Required, email, unique:users,email,{id} | Authentication identifier |
| Password | Password input | Nullable, min:8, confirmed | Only update if filled |
| Password Confirmation | Password input | Required if password filled | Match password field |
| Avatar | File upload or URL | Nullable, image, max:2MB or valid URL | Preview shown |

Form Actions:
- Save Changes button (primary)
- Cancel button (returns to list)
- Delete User button (danger, with confirmation)

**Role Assignment Interface**:

Display Format:
- List of all available roles as checkboxes
- Currently assigned roles pre-checked
- Role name and description shown
- Permission count badge per role
- "Select All" / "Deselect All" buttons

Validation:
- At least one role must be selected
- Cannot remove all roles from user
- Success message after role update

**Wallet Management Panel** (integrated in edit page):

Balance Display:
- Large prominent balance value in RUB
- Formatted with ₽ symbol
- Color-coded (green if positive, red if zero)
- Last transaction timestamp

Action Buttons:
- Add Funds button (opens modal)
- Deduct Funds button (opens modal)
- View Full Transaction History button (links to dedicated page)

Quick Transaction Summary:
- Total deposits count and sum
- Total withdrawals count and sum
- Last transaction date and amount

#### Wallet Operations Modals

**Add Funds Modal**:

**Component**: WalletDepositModal

Form Fields:
- Amount input (numeric, decimal, min: 0.01)
- Currency display (₽ RUB, read-only)
- Description textarea (optional, max: 500 chars)
- New balance preview (calculated real-time)

Buttons:
- Confirm Deposit (primary)
- Cancel (secondary)

Validation:
- Amount must be positive
- Amount must be valid decimal (2 places)
- Description length limit

Success Behavior:
- Close modal
- Show success notification
- Refresh user data and balance
- Add transaction to history

**Deduct Funds Modal**:

**Component**: WalletWithdrawModal

Form Fields:
- Amount input (numeric, decimal, min: 0.01)
- Currency display (₽ RUB, read-only)
- Description textarea (required, max: 500 chars)
- Current balance display
- New balance preview (calculated real-time)
- Warning if new balance would be zero

Buttons:
- Confirm Withdrawal (danger)
- Cancel (secondary)

Validation:
- Amount must be positive
- Amount cannot exceed current balance
- Description required for administrative withdrawals
- Amount must be valid decimal (2 places)

Error Handling:
- Insufficient balance: Clear error message with current balance
- Invalid amount: Format requirements explained
- Transaction failure: Generic error with support contact

Success Behavior:
- Close modal
- Show success notification
- Refresh user data and balance
- Add transaction to history

#### Transaction History Table (in Edit Page)

**Displayed in User Edit Page**:

Table Columns:

| Column | Data | Format | Sortable |
|--------|------|--------|----------|
| ID | transactions.id | Monospaced text | Yes |
| Type | transactions.type | Badge (Deposit=green, Withdraw=red) | Yes |
| Amount | transactions.amount | +₽ or -₽ prefix | Yes |
| Balance After | Calculated | ₽ format | No |
| Description | transactions.meta.description | Text, truncated | No |
| Status | transactions.confirmed | Confirmed/Pending badge | Yes |
| Date | transactions.created_at | DateTime with relative | Yes |

**Pagination**:
- 10 transactions per page (embedded view)
- Link to full transaction history page

**Filters** (minimal):
- Filter by type (All, Deposits, Withdrawals)
- Date range (Last 7 days, Last 30 days, All time)

### Dedicated Wallet Management Page

**Route**: /admin/users/{id}/wallet
**Permission Required**: manage-wallets
**Component**: AdminUserWallet

**Page Header**:
- User name and avatar
- Breadcrumb navigation
- Back to user edit link

**Wallet Summary Card**:
- Current balance (large display)
- Total deposits (lifetime)
- Total withdrawals (lifetime)
- Transaction count
- Wallet created date
- Last transaction date

**Action Panel**:
- Add Funds button (same modal as edit page)
- Deduct Funds button (same modal as edit page)
- Export Transactions button (CSV download)

**Full Transaction History Table**:

Table Columns (extended):

| Column | Data | Format |
|--------|------|--------|
| Transaction ID | transactions.uuid | Copyable UUID |
| Type | transactions.type | Icon + Badge |
| Amount | transactions.amount | Color-coded with +/- |
| Balance Before | Calculated | ₽ format |
| Balance After | Calculated | ₽ format |
| Description | transactions.meta.description | Full text |
| Admin User | Via meta | Name of admin who performed |
| Confirmed | transactions.confirmed | Boolean indicator |
| Created At | transactions.created_at | Full datetime |

**Advanced Filters**:
- Transaction type (Deposit/Withdrawal)
- Date range picker
- Amount range (min/max)
- Confirmation status
- Admin user (who performed action)
- Search by description

**Pagination**:
- 25 transactions per page
- Page size selector (25, 50, 100)

**Export Functionality**:
- Export current filtered results to CSV
- Export all transactions to CSV
- Include all columns
- Filename: user_{id}_transactions_{date}.csv

**Summary Statistics**:
- Total deposits in date range
- Total withdrawals in date range
- Net change in date range
- Transaction count by type

### Role Management Interface

#### Role List Page

**Route**: /admin/roles
**Permission Required**: manage-roles
**Component**: AdminRolesIndex

**Table Structure**:

| Column | Data | Format |
|--------|------|--------|
| Role Name | roles.name | Text with edit link |
| Description | roles.description | Text (if exists) |
| Permissions | Count from role_has_permissions | Badge with number |
| Users | Count from model_has_roles | Badge with number |
| Guard | roles.guard_name | Small text |
| Created | roles.created_at | Relative time |
| Actions | - | Edit, Delete buttons |

**Page Actions**:
- Create New Role button (top right)
- Search roles by name (text input)
- Refresh button

**Delete Confirmation**:
- Modal dialog for confirmation
- Warning if role has assigned users
- Show count of users who will be affected
- Require checkbox confirmation for roles with users
- Cancel and Confirm Delete buttons

**System Role Protection**:
- Admin and User roles cannot be deleted
- Edit restrictions on system roles (cannot rename)
- Visual indicator for system roles (lock icon)

#### Role Create/Edit Form

**Route**: /admin/roles/create or /admin/roles/{id}/edit
**Permission Required**: manage-roles
**Component**: AdminRoleForm

**Form Layout**:

Section 1: Basic Information
- Role Name input (required, unique, max:255)
- Description textarea (optional, max:500)
- Guard name display (read-only: web)

Section 2: Permission Assignment
- Grouped permission checkboxes by category
- Permission count display
- Select all / Deselect all toggle per category

**Permission Display Categories**:

1. User Management
   - Manage Users

2. Role Management
   - Manage Roles

3. Product Management
   - Edit Products
   - Edit Categories

4. Item Distribution
   - Grant Items to Users

5. Wallet Operations
   - Manage Wallets

6. Customer Capabilities
   - View Products and Categories
   - Purchase Products

**Permission Selection Interface**:

For each category:
- Category header with count
- Expand/collapse toggle
- "Select All in Category" checkbox
- Individual permission checkboxes with:
  - Permission name (human-readable)
  - Permission slug (small text)
  - Description tooltip on hover

Global Actions:
- "Select All Permissions" button
- "Clear All Permissions" button
- Selected count indicator (e.g., "5 of 8 permissions selected")

**Validation**:
- Role name required and unique
- At least one permission must be selected (warning, not blocking)
- Duplicate role name error

**Form Actions**:
- Save Role button (primary)
- Save and Continue Editing button
- Cancel button (returns to list)
- Delete Role button (only on edit, with confirmation)

**Success Behavior**:
- Show success notification
- Redirect to role list or stay on form
- Clear form if creating new role
- Update permission cache

### Registration Integration

#### Auto-Role Assignment

**Hook Point**: User creation event or Fortify registration action

**Implementation Approach**:
- Listen to user registered event
- Automatically assign "User" role to new user
- Create wallet for new user (via HasWallet trait)
- Set initial balance to zero
- Log role assignment

**Fallback Mechanism**:
- If role assignment fails, log error
- User can still authenticate
- Admin notified of failed role assignment
- Manual role assignment required

**Validation**:
- Verify "User" role exists before assignment
- Handle missing role gracefully
- Create role if missing (with warning)

## Backend API Endpoints

### User Management Endpoints

| Method | Route | Controller Action | Permission | Description |
|--------|-------|-------------------|------------|-------------|
| GET | /admin/users | AdminUserController@index | manage-users | List users with filters and pagination |
| GET | /admin/users/create | AdminUserController@create | manage-users | Show create user form |
| POST | /admin/users | AdminUserController@store | manage-users | Create new user |
| GET | /admin/users/{id} | AdminUserController@show | manage-users | Show user details |
| GET | /admin/users/{id}/edit | AdminUserController@edit | manage-users | Show edit user form |
| PUT | /admin/users/{id} | AdminUserController@update | manage-users | Update user details |
| DELETE | /admin/users/{id} | AdminUserController@destroy | manage-users | Delete user |
| POST | /admin/users/{id}/roles | AdminUserController@syncRoles | manage-users | Update user roles |

### Wallet Operation Endpoints

| Method | Route | Controller Action | Permission | Description |
|--------|-------|-------------------|------------|-------------|
| GET | /admin/users/{id}/wallet | AdminWalletController@show | manage-wallets | Show wallet details page |
| POST | /admin/users/{id}/wallet/deposit | AdminWalletController@deposit | manage-wallets | Add funds to wallet |
| POST | /admin/users/{id}/wallet/withdraw | AdminWalletController@withdraw | manage-wallets | Deduct funds from wallet |
| GET | /admin/users/{id}/transactions | AdminWalletController@transactions | manage-users | Get transaction history |
| GET | /admin/users/{id}/transactions/export | AdminWalletController@exportTransactions | manage-wallets | Export transactions CSV |

### Role Management Endpoints

| Method | Route | Controller Action | Permission | Description |
|--------|-------|-------------------|------------|-------------|
| GET | /admin/roles | AdminRoleController@index | manage-roles | List all roles |
| GET | /admin/roles/create | AdminRoleController@create | manage-roles | Show create role form |
| POST | /admin/roles | AdminRoleController@store | manage-roles | Create new role |
| GET | /admin/roles/{id}/edit | AdminRoleController@edit | manage-roles | Show edit role form |
| PUT | /admin/roles/{id} | AdminRoleController@update | manage-roles | Update role |
| DELETE | /admin/roles/{id} | AdminRoleController@destroy | manage-roles | Delete role |

### Permission Listing Endpoints

| Method | Route | Controller Action | Permission | Description |
|--------|-------|-------------------|------------|-------------|
| GET | /admin/permissions | AdminPermissionController@index | manage-roles | List all permissions (read-only) |

## Frontend Component Specifications

### Admin Layout Component

**Component Name**: AdminLayout
**File Path**: resources/js/layouts/admin-layout.tsx

**Props**:
- children: React.ReactNode
- title: string (page title)
- user: User object with permissions

**Layout Structure**:
- Header with admin branding
- Navigation sidebar with permission-based menu items
- Main content area
- Breadcrumb navigation
- User menu dropdown

**Navigation Menu Items**:

| Label | Route | Icon | Permission Required |
|-------|-------|------|---------------------|
| Dashboard | /admin | LayoutDashboard | Any admin permission |
| Users | /admin/users | Users | manage-users |
| Roles | /admin/roles | Shield | manage-roles |
| Products | /admin/products | Package | edit-products |
| Categories | /admin/categories | Folder | edit-categories |

**Permission-Based Rendering**:
- Menu items hidden if user lacks permission
- Redirect to first available page if accessing unauthorized section
- Show permission denied message for unauthorized routes

### User Management Components

**Component Name**: AdminUsersIndex
**File Path**: resources/js/pages/admin/users/index.tsx

**Props from Inertia**:
- users: Paginated collection
- roles: All available roles
- filters: Current filter values
- stats: User statistics (total count, active count)

**Component Structure**:
- Page header with title and "Create User" button
- Filters section (search, role, balance, date, status)
- Active filters display (removable tags)
- Users table
- Pagination controls

**State Management**:
- Search query state (debounced)
- Filter states (role, balance range, date range, status)
- Sort column and direction state
- Selected users for bulk actions state

**User Table Row Component**:
- Avatar image with fallback
- User name (clickable to edit)
- Email address
- Role badges (colored, multiple)
- Balance formatted in RUB
- Registration date (relative time with tooltip)
- Action buttons (Edit, View Wallet)

**Component Name**: AdminUserEdit
**File Path**: resources/js/pages/admin/users/edit.tsx

**Props from Inertia**:
- user: User object with roles, wallet, recent transactions
- roles: All available roles
- permissions: User's aggregated permissions (for display)

**Form State**:
- name, email, password, password_confirmation, avatar
- selectedRoles: Array of role IDs
- Form errors object
- Submission loading state

**Validation**:
- Client-side validation with immediate feedback
- Server-side validation errors displayed per field
- Unsaved changes warning on navigation

**Sub-Components**:
- UserInfoForm: Personal information fields
- UserRoleSelector: Multi-select role assignment
- UserWalletPanel: Balance and transaction operations
- UserRecentTransactions: Last 10 transactions table

### Wallet Management Components

**Component Name**: WalletDepositModal
**File Path**: resources/js/components/admin/wallet-deposit-modal.tsx

**Props**:
- isOpen: boolean
- onClose: function
- user: User object with wallet
- onSuccess: function (callback after successful deposit)

**Form State**:
- amount: decimal string
- description: string
- isSubmitting: boolean
- errors: object

**Computed Values**:
- currentBalance: From user.wallet.balance
- newBalance: currentBalance + parseFloat(amount)
- isValid: amount > 0 and valid decimal

**Component Name**: WalletWithdrawModal
**File Path**: resources/js/components/admin/wallet-withdraw-modal.tsx

**Props**:
- isOpen: boolean
- onClose: function
- user: User object with wallet
- onSuccess: function

**Form State**:
- amount: decimal string
- description: string (required)
- isSubmitting: boolean
- errors: object

**Computed Values**:
- currentBalance: From user.wallet.balance
- newBalance: currentBalance - parseFloat(amount)
- isValid: amount > 0 and amount <= currentBalance and description length > 0
- showWarning: newBalance < currentBalance * 0.1 (low balance warning)

**Component Name**: AdminUserWallet
**File Path**: resources/js/pages/admin/users/wallet.tsx

**Props from Inertia**:
- user: User with wallet
- transactions: Paginated transactions
- filters: Active transaction filters
- stats: Wallet statistics (total deposits, withdrawals, count)

**Component Structure**:
- Page header with user info and back button
- Wallet summary cards (balance, deposits, withdrawals)
- Action buttons (Add Funds, Deduct Funds, Export)
- Filter controls (type, date range, amount range)
- Transaction table (full details)
- Pagination

**Transaction Table Features**:
- Sortable columns
- Expandable rows for full description
- Copy transaction UUID button
- Color-coded amounts
- Status badges
- Admin user attribution

### Role Management Components

**Component Name**: AdminRolesIndex
**File Path**: resources/js/pages/admin/roles/index.tsx

**Props from Inertia**:
- roles: Collection of roles with counts
- permissions: All permissions grouped by category

**Component Structure**:
- Page header with "Create Role" button
- Search input for role name
- Roles table
- System role indicators

**Role Table Row**:
- Role name (bold, clickable)
- Description (truncated)
- Permission count badge
- User count badge
- Edit button
- Delete button (disabled for system roles)

**Component Name**: AdminRoleForm
**File Path**: resources/js/pages/admin/roles/form.tsx

**Props from Inertia**:
- role: Role object (null for create)
- permissions: All permissions grouped by category
- categories: Permission category definitions

**Form State**:
- name: string
- description: string
- selectedPermissions: Array of permission IDs
- errors: object
- isSubmitting: boolean

**Permission Selector Structure**:
- Category accordion (expand/collapse)
- Category select all checkbox
- Individual permission checkboxes
- Permission count per category
- Global select all/clear all buttons

**Category Component**:
- Category header with name and count
- Expand/collapse icon
- Select all checkbox for category
- Permission list with checkboxes
- Permission descriptions as tooltips

## Security and Authorization

### Route Protection

**Middleware Stack**:
- auth: Verify authenticated user
- permission:{permission}: Check specific permission
- role:{role}: Check specific role (for role-specific pages)

**Route Group Structure**:

```
Admin Routes (prefix: /admin)
├── Middleware: auth, permission:manage-users|manage-roles|manage-wallets
├── Users Routes
│   ├── Middleware: permission:manage-users
│   └── Wallet Routes
│       └── Middleware: permission:manage-wallets
└── Roles Routes
    └── Middleware: permission:manage-roles
```

### Authorization Policies

**UserPolicy**:
- viewAny: Check manage-users permission
- view: Check manage-users permission
- create: Check manage-users permission
- update: Check manage-users permission
- delete: Check manage-users permission, prevent self-deletion
- manageWallet: Check manage-wallets permission
- assignRoles: Check manage-users permission

**RolePolicy**:
- viewAny: Check manage-roles permission
- view: Check manage-roles permission
- create: Check manage-roles permission
- update: Check manage-roles permission, prevent system role name changes
- delete: Check manage-roles permission, prevent system role deletion

### Permission Sharing

**Inertia Shared Data**:
- auth.user: Current user object
- auth.permissions: Array of permission slugs
- auth.roles: Array of role slugs
- can: Helper object with permission checks

**Frontend Permission Checks**:
- Conditional rendering based on auth.permissions
- Route guards in frontend routing
- Disabled state for unauthorized actions
- Hidden menu items for lacking permissions

### Data Validation

**User Management Validation Rules**:

Create User:
- name: required, string, min:3, max:255
- email: required, email, unique:users
- password: required, string, min:8, confirmed
- roles: required, array, exists:roles,id

Update User:
- name: required, string, min:3, max:255
- email: required, email, unique:users,email,{id}
- password: nullable, string, min:8, confirmed
- avatar: nullable, image or url
- roles: required, array, exists:roles,id

**Wallet Operation Validation**:

Deposit:
- amount: required, numeric, min:0.01, decimal:0,2
- description: nullable, string, max:500

Withdrawal:
- amount: required, numeric, min:0.01, decimal:0,2, max:{current_balance}
- description: required, string, min:10, max:500

**Role Management Validation**:

Create/Update Role:
- name: required, string, max:255, unique:roles,name,{id}
- description: nullable, string, max:500
- permissions: array, exists:permissions,id
- Cannot modify system role names (admin, user)
- Cannot delete system roles

## Integration Points

### Authentication System Integration

**Registration Flow Extension**:
- After successful user creation (via existing magic link flow)
- Event listener on Registered event
- Automatically assign "User" role
- Create default wallet via HasWallet trait
- Log role assignment
- No changes to frontend registration UI

**User Model Extension Location**:
- File: app/Models/User.php
- Add HasRoles trait use statement
- Add HasWallet trait use statement
- Add guard_name property

**Middleware Integration**:
- Existing auth middleware unchanged
- Add Spatie Permission middleware to route groups
- Combine with existing Inertia middleware
- Maintain existing session handling

### Frontend Navigation Integration

**Shop Header Component Update**:
- Add admin panel link for users with any admin permission
- Show link in user dropdown menu
- Icon: Settings or Shield
- Label: "Admin Panel"
- Route: /admin

**User Sidebar Component Update**:
- Display user roles as badges
- Display wallet balance
- Link to wallet page: /wallet (user-facing view)
- Show role-based features (if admin, show admin link)

### Existing Page Integration

**Wallet Page** (user-facing):
- Route: /wallet (existing protected route)
- Display current balance
- Transaction history (user's own)
- Deposit options (future: payment gateway)
- Current purchases from wallet

**Settings Page Extension**:
- Add roles display section (read-only for users)
- Show assigned permissions (read-only)
- No role editing capability for non-admins

### Purchase Flow Integration

**Purchase Process Update**:
- Check user wallet balance before purchase
- If insufficient balance: Show error message
- If sufficient balance:
  - Deduct purchase amount from wallet
  - Create withdrawal transaction
  - Record purchase
  - Assign purchased item to user
  - Show success message with new balance

**Transaction Meta Data**:
- Store product ID in transaction meta
- Store purchase reference
- Store admin user ID if manual transaction

## Error Handling and Edge Cases

### User Management Errors

**Self-Modification Protection**:
- Admin cannot delete own account
- Admin cannot remove all own admin roles
- Warning when modifying own roles
- Require different admin to perform critical operations

**Orphaned Users**:
- Prevent deletion of users with active purchases
- Option to transfer purchases to another user
- Soft delete option for data retention

**Concurrent Modifications**:
- Optimistic locking on user updates
- Version checking before save
- Conflict resolution UI
- Last-write-wins with warning

### Wallet Operation Errors

**Insufficient Balance**:
- Clear error message: "Insufficient balance. Current: {balance}, Required: {amount}"
- Suggest adding funds
- Show current balance prominently

**Negative Balance Prevention**:
- Validation prevents negative balance
- Double-check before processing withdrawal
- Lock wallet during transaction processing

**Transaction Failures**:
- Database transaction rollback on error
- Clear error logging
- User-friendly error message
- Retry option for network failures

**Race Conditions**:
- Database row locking during balance updates
- Transaction isolation level: READ COMMITTED
- Retry logic for deadlocks
- Queue-based transaction processing for high volume

### Role Management Errors

**System Role Protection**:
- Prevent deletion of Admin and User roles
- Prevent renaming of system roles
- Allow permission modification on system roles
- Clear error messages for protected operations

**Role Deletion with Assigned Users**:
- Check user count before deletion
- Require confirmation if users assigned
- Option to reassign users to different role
- Option to proceed with role removal (users lose role)

**Permission Cache Issues**:
- Automatic cache clearing after role/permission changes
- Manual cache reset option in admin panel
- Log cache operations
- Fallback to database if cache fails

### Data Validation Errors

**Form Validation Display**:
- Field-level error messages below input
- Error summary at top of form
- Highlight invalid fields with red border
- Prevent submission until errors resolved

**Unique Constraint Violations**:
- Email already exists: "This email is already registered"
- Role name exists: "A role with this name already exists"
- Suggest alternatives or modifications

**Type Coercion Errors**:
- Amount input: Accept both comma and period as decimal separator
- Automatically format to standard decimal
- Validate format before submission

## Performance Optimization

### Database Query Optimization

**Eager Loading Strategy**:
- User list: Load roles and wallet in single query
- User edit: Load roles, permissions, wallet, recent transactions
- Role list: Load permission count and user count
- Transaction list: Paginate and limit joins

**Indexing Strategy**:
- Index on users.email and users.name
- Index on model_has_roles pivot columns
- Index on role_has_permissions pivot columns
- Index on wallets.holder_id and wallets.slug
- Index on transactions.payable_id, transactions.type, transactions.created_at
- Composite index on transactions (payable_id, created_at) for history queries

**Query Caching**:
- Cache role list (expires on role modification)
- Cache permission list (expires on permission modification)
- Cache user permission aggregation (expires on role assignment change)
- Cache key pattern: "user:{id}:permissions", "roles:all", "permissions:all"

### Frontend Performance

**Data Pagination**:
- User list: 25 users per page (configurable)
- Transaction history: 10 on edit page, 25 on dedicated page
- Role list: 50 roles per page
- Lazy load transaction details on expand

**Search Debouncing**:
- Delay search execution by 300ms
- Cancel pending requests on new input
- Show loading indicator during search

**Optimistic Updates**:
- Update UI immediately after action
- Revert on server error
- Show success/error toast notifications

**Component Code Splitting**:
- Lazy load admin pages
- Lazy load modal components
- Separate bundle for admin section

### Caching Strategy

**Permission Cache**:
- Spatie Permission built-in cache
- Cache all user permissions on login
- Invalidate on role assignment change
- Expiration: 24 hours or manual clear

**Application Cache**:
- Cache role list in memory
- Cache permission list in memory
- Use Redis for distributed deployments
- Cache key versioning for easy invalidation

## Testing Considerations

### Unit Testing Focus Areas

**User Management**:
- User creation with auto role assignment
- User update with role synchronization
- User deletion protection (self-deletion)
- Validation rules enforcement

**Wallet Operations**:
- Deposit transaction creation
- Withdrawal with balance check
- Negative balance prevention
- Transaction history retrieval

**Role Management**:
- Role creation with permissions
- Permission assignment and removal
- System role protection
- Role deletion with user check

**Authorization**:
- Permission checking logic
- Policy authorization rules
- Middleware permission verification

### Integration Testing Scenarios

**Complete Workflows**:
- Admin creates user, assigns roles, adds funds
- User registers, auto-assigned role, wallet created
- Admin modifies user roles, permissions update
- Admin performs wallet operation, transaction recorded

**Edge Cases**:
- Multiple role assignment and permission aggregation
- Concurrent wallet operations
- Role modification while users assigned
- Permission cache invalidation

### Manual Testing Checklist

**User Management**:
- Create user with multiple roles
- Edit user and change roles
- Search and filter users
- Export user list
- Delete user (with confirmations)

**Wallet Operations**:
- Add funds via integrated panel
- Add funds via dedicated wallet page
- Deduct funds with balance validation
- View transaction history with filters
- Export transactions

**Role Management**:
- Create role with permissions
- Edit role permissions
- Delete role (with and without users)
- Verify system role protection
- Assign role to multiple users

**Authorization**:
- Access admin panel with admin role
- Access denied for user role
- Permission-based menu visibility
- Permission-based action availability

## Deployment Strategy

### Pre-Deployment Preparation

**Package Installation**:
- Add packages to composer.json
- Run composer install in development
- Test package compatibility
- Verify no version conflicts

**Migration Preparation**:
- Review migration files
- Test migrations on development database
- Prepare rollback plan
- Backup production database

**Seeder Preparation**:
- Create all seeder classes
- Test seeders in development
- Prepare production seeder data
- Document seeder execution order

### Deployment Steps

**Step 1: Code Deployment**:
- Deploy code to production server
- Install Composer dependencies
- Clear application cache
- Clear config cache

**Step 2: Database Migration**:
- Backup production database
- Run migrations: php artisan migrate
- Verify tables created correctly
- Check migration status

**Step 3: Seeder Execution**:
- Run PermissionsSeeder
- Run RolesSeeder
- Run RolePermissionsSeeder
- Run DefaultAdminSeeder (if needed)
- Verify data created

**Step 4: Cache Configuration**:
- Clear all caches: php artisan cache:clear
- Clear config cache: php artisan config:clear
- Clear route cache: php artisan route:clear
- Rebuild caches: php artisan config:cache, php artisan route:cache

**Step 5: Permission Cache**:
- Clear permission cache: php artisan permission:cache-reset
- Verify permission cache working

**Step 6: Frontend Build**:
- Build frontend assets: npm run build
- Verify assets compiled
- Clear browser cache

**Step 7: Verification**:
- Test admin user login
- Verify admin panel access
- Test user management functions
- Test wallet operations
- Test role management

### Rollback Plan

**Database Rollback**:
- Restore database backup
- Rollback migrations if needed: php artisan migrate:rollback --step=X
- Verify application still functional

**Code Rollback**:
- Revert to previous code version
- Re-run composer install
- Rebuild frontend assets
- Clear caches

**Partial Rollback**:
- Disable admin routes via configuration
- Maintain database changes for future retry
- Communicate downtime to admins

## Future Enhancement Opportunities

### Advanced Permission Features

**Permission Groups**:
- Organize permissions into logical groups
- Assign entire groups to roles
- Hierarchical permission structure

**Conditional Permissions**:
- Time-based permission grants (expire after X days)
- Location-based permissions
- Context-aware permissions (e.g., own data vs all data)

**Permission Templates**:
- Pre-configured permission sets for common roles
- Quick role setup from templates
- Custom template creation

### Wallet Enhancements

**Payment Gateway Integration**:
- Connect external payment processors
- User self-deposit capability
- Automated refunds
- Payment history reconciliation

**Multi-Currency Wallets**:
- Support multiple currencies per user
- Currency conversion
- Exchange rate management
- Currency preference settings

**Wallet Features**:
- Scheduled/recurring transactions
- Wallet-to-wallet transfers between users
- Transaction notes and attachments
- Refund and reversal functionality
- Wallet freeze/unfreeze capability

### Audit and Compliance

**Comprehensive Audit Trail**:
- Log all administrative actions
- Track who modified what and when
- Before/after values for changes
- Audit log search and filter
- Export audit logs

**Compliance Reports**:
- User activity reports
- Financial transaction reports
- Role assignment history
- Permission usage analytics

**Data Retention Policies**:
- Automated data archival
- Transaction history retention limits
- User data export (GDPR compliance)
- Data anonymization for deleted users

### User Experience Improvements

**Bulk Operations**:
- Bulk role assignment
- Bulk wallet operations
- Bulk user import from CSV
- Bulk user export with filters

**Dashboard and Analytics**:
- User growth statistics by role
- Wallet transaction volume charts
- Permission usage heatmaps
- Active users by role dashboard

**Notifications**:
- Email notifications for wallet operations
- Admin notifications for low balances
- Notification for role changes
- Customizable notification preferences

### Advanced Search and Filtering

**Saved Filters**:
- Save common filter combinations
- Named filter presets
- Share filters with other admins

**Advanced Query Builder**:
- Complex filter logic (AND/OR combinations)
- Custom field filters
- Relationship filters (e.g., users with specific purchase)

**Full-Text Search**:
- Search across all user fields
- Search transaction descriptions
- Search role and permission descriptions

## Acceptance Criteria

### User Management Acceptance Criteria

- Admin can view paginated list of all users with role, balance, and registration date
- Admin can search users by name or email with real-time results
- Admin can filter users by assigned roles (multi-select)
- Admin can filter users by balance range (min and max)
- Admin can filter users by registration date range
- Admin can filter users by active/inactive status
- Admin can sort user list by any column (ID, name, email, balance, registration date)
- Admin can select multiple users and perform bulk operations
- Admin can create new user with name, email, password, and role assignment
- Admin can edit existing user's name, email, and avatar
- Admin can change user's password
- Admin can assign multiple roles to a single user
- Admin can remove roles from user
- Admin can view user's current wallet balance
- Admin can add funds to user's wallet via modal on edit page
- Admin can deduct funds from user's wallet via modal on edit page
- Admin can view user's transaction history on edit page (last 10 transactions)
- Admin can access dedicated wallet management page for user
- Admin can delete user with confirmation dialog
- All user operations require manage-users permission
- Admin cannot delete own account

### Wallet Management Acceptance Criteria

- Admin can add funds to user wallet with amount and optional description
- Admin can deduct funds from user wallet with amount and required description
- Admin cannot deduct more than current balance
- System prevents negative wallet balance
- Wallet operations create transaction records
- Transaction records include type (deposit/withdrawal), amount, description, and timestamp
- Admin can view full transaction history on dedicated wallet page
- Transaction history displays: ID, type, amount, balance before, balance after, description, admin user, confirmed status, date
- Admin can filter transactions by type (deposit/withdrawal)
- Admin can filter transactions by date range
- Admin can filter transactions by amount range
- Admin can sort transactions by any column
- Transactions are paginated (10 per page on edit page, 25 on dedicated page)
- Admin can export transaction history to CSV
- All wallet operations require manage-wallets permission
- Wallet balance displayed in Russian Rubles (₽) with 2 decimal places
- Balance stored as integer (kopecks) in database
- Transaction operations wrapped in database transactions for consistency

### Role Management Acceptance Criteria

- Admin can view list of all roles with permission count and user count
- Admin can search roles by name
- Admin can create new role with name, description, and permissions
- Admin can edit existing role's name, description, and permissions
- Admin can assign multiple permissions to a role
- Admin can remove permissions from a role
- Permissions are organized by categories (User Management, Role Management, Product Management, etc.)
- Permission selector has "Select All" and "Clear All" functionality per category
- Permission selector shows count of selected permissions
- Admin cannot delete system roles (Admin, User)
- Admin cannot rename system roles (Admin, User)
- Admin can delete custom roles with confirmation
- System warns if deleting role that has users assigned
- Admin can view list of all permissions (read-only)
- Permissions are fixed and cannot be created or deleted via interface
- All role operations require manage-roles permission
- Permission cache cleared automatically after role changes

### Registration Integration Acceptance Criteria

- New users automatically assigned "User" role upon registration
- User role assignment happens transparently without user interaction
- Wallet automatically created for new users
- Initial wallet balance set to zero
- Registration flow unchanged from user perspective
- Role assignment failure logged but doesn't block registration
- Admin notified of any role assignment failures

### Authorization and Security Acceptance Criteria

- All admin routes protected by authentication middleware
- Admin panel accessible only to users with at least one admin permission
- User management pages require manage-users permission
- Wallet operation endpoints require manage-wallets permission
- Role management pages require manage-roles permission
- Permission checks enforced on both frontend (UI hiding) and backend (route protection)
- Unauthorized access attempts redirect to appropriate page with error message
- Users can have multiple roles simultaneously
- Permissions aggregated from all assigned roles
- User with both Admin and User roles has all permissions from both
- Frontend menu items and actions hidden based on user permissions
- API endpoints return 403 Forbidden for unauthorized requests

### Data Validation Acceptance Criteria

- User email must be unique and valid format
- User name must be at least 3 characters
- Password must be at least 8 characters when set
- At least one role must be assigned to each user
- Wallet deposit amount must be positive decimal
- Wallet withdrawal amount must be positive and not exceed balance
- Withdrawal requires description of at least 10 characters
- Role name must be unique
- Validation errors displayed clearly on forms
- Server-side validation matches client-side validation
- Invalid data rejected with appropriate error messages

### Performance Acceptance Criteria

- User list loads in under 2 seconds with 1000+ users
- Search results appear within 500ms of last keystroke
- Wallet operations complete in under 1 second
- Transaction history loads within 2 seconds
- Permission checks use cached data when available
- Database queries use eager loading to prevent N+1 problems
- Pagination limits database query size
- Admin interface responsive on mobile devices

### User Experience Acceptance Criteria

- All forms have clear labels and placeholders
- Validation errors appear inline below fields
- Success messages shown after successful operations
- Confirmation dialogs for destructive actions (delete user, delete role, deduct funds)
- Loading indicators shown during asynchronous operations
- Empty states provide clear guidance when no data exists
- Breadcrumb navigation shows current location
- Action buttons have appropriate colors (danger for delete, primary for save)
- Filters can be cleared individually or all at once
- Active filters displayed as removable tags
- Responsive design works on tablet and mobile
- Accessible UI with proper ARIA labels and keyboard navigation- Responsive design works on tablet and mobile
