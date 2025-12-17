# Passwordless Authentication System Design

## Overview

This design outlines a passwordless authentication system that enables users to register and login using only their email address. The system follows a magic link approach where users receive a time-limited verification code via email, eliminating the need for password management while maintaining security.

## Business Requirements

### User Authentication Flow

1. Users access the authentication modal from the shop header
2. Users enter their email address in a single unified modal (handles both registration and login)
3. System sends a 6-digit verification code to the provided email
4. Users enter the received code to complete authentication
5. Upon successful verification, users gain access to protected features

### Authenticated User Features

When authenticated, the shop header must display:
- User email address
- User avatar (profile picture or generated avatar)
- "My Purchases" button with navigation to purchases page

### Security Requirements

- Verification codes must expire after a configurable time period (recommended: 10 minutes)
- Rate limiting must prevent abuse of code generation
- Each code can only be used once
- Codes must be cryptographically secure random values
- Invalid code attempts should be tracked and limited

## System Architecture

### High-Level Component Structure

```mermaid
flowchart TB
    subgraph Frontend["Frontend Layer (React + TypeScript)"]
        Header[Shop Header Component]
        AuthModal[Authentication Modal]
        EmailStep[Email Input Step]
        CodeStep[Code Verification Step]
    end
    
    subgraph Backend["Backend Layer (Laravel)"]
        AuthController[Authentication Controller]
        MagicLinkService[Magic Link Service]
        UserService[User Service]
        MailService[Email Service]
    end
    
    subgraph Storage["Data Storage"]
        UsersDB[(Users Table)]
        TokensDB[(Login Tokens Table)]
    end
    
    Header -->|Opens| AuthModal
    AuthModal -->|Step 1| EmailStep
    EmailStep -->|Submit Email| AuthController
    AuthController -->|Check/Create User| UserService
    UserService -->|Store| UsersDB
    AuthController -->|Generate Code| MagicLinkService
    MagicLinkService -->|Store Token| TokensDB
    MagicLinkService -->|Send Code| MailService
    MailService -->|Delivers| EmailStep
    EmailStep -->|User Enters Code| CodeStep
    CodeStep -->|Verify Code| AuthController
    AuthController -->|Validate| MagicLinkService
    MagicLinkService -->|Check| TokensDB
    AuthController -->|Create Session| UserService
    UserService -->|Update| UsersDB
</flow chart>

### Authentication Workflow

```mermaid
sequenceDiagram
    participant User
    participant Modal as Auth Modal
    participant API as Laravel API
    participant DB as Database
    participant Email as Email Service
    
    User->>Modal: Click "Login" Button
    Modal->>Modal: Display Email Input
    User->>Modal: Enter Email
    Modal->>API: POST /auth/send-code {email}
    API->>DB: Check if user exists
    
    alt User Not Found
        API->>DB: Create new user
    end
    
    API->>DB: Generate & store token
    API->>Email: Send verification code
    Email-->>User: Email with 6-digit code
    API-->>Modal: Success response
    Modal->>Modal: Switch to code input step
    
    User->>Modal: Enter verification code
    Modal->>API: POST /auth/verify-code {email, code}
    API->>DB: Validate token & expiration
    
    alt Valid Token
        API->>DB: Mark token as used
        API->>DB: Create user session
        API-->>Modal: Success + user data
        Modal->>Modal: Close modal
        Modal->>User: Redirect to dashboard/refresh
    else Invalid Token
        API-->>Modal: Error response
        Modal->>User: Display error message
    end
</sequenceDiagram>

## Data Model

### Users Table Schema

| Column Name | Type | Constraints | Purpose |
|------------|------|-------------|---------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| name | VARCHAR(255) | NULLABLE | User display name (optional) |
| avatar | VARCHAR(255) | NULLABLE | Profile picture URL or path |
| email_verified_at | TIMESTAMP | NULLABLE | Email verification timestamp |
| created_at | TIMESTAMP | NOT NULL | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Note**: The password field from the default Laravel users table will remain nullable and unused for this authentication method.

### Login Tokens Table Schema

| Column Name | Type | Constraints | Purpose |
|------------|------|-------------|---------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique token identifier |
| user_id | BIGINT | FOREIGN KEY (users.id), NOT NULL | Associated user |
| token | VARCHAR(6) | NOT NULL | 6-digit verification code |
| expires_at | TIMESTAMP | NOT NULL | Token expiration time |
| used_at | TIMESTAMP | NULLABLE | When token was consumed |
| created_at | TIMESTAMP | NOT NULL | Token generation time |

**Indexes**:
- Index on `user_id` for fast user lookup
- Index on `token` for verification queries
- Index on `expires_at` for cleanup operations

## API Specification

### Send Verification Code Endpoint

**Purpose**: Initiates authentication by generating and sending a verification code to the user's email.

| Property | Value |
|----------|-------|
| Method | POST |
| Path | /auth/send-code |
| Authentication | None (Public endpoint) |
| Rate Limit | 5 requests per minute per email |

**Request Body**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format, max 255 characters |

**Response - Success (200)**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always true |
| message | string | Confirmation message |
| email | string | Email address code was sent to |

**Response - Validation Error (422)**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always false |
| errors | object | Field-specific error messages |

**Response - Rate Limit Error (429)**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always false |
| message | string | Rate limit exceeded message |
| retry_after | integer | Seconds until next attempt allowed |

### Verify Code Endpoint

**Purpose**: Validates the verification code and establishes an authenticated session.

| Property | Value |
|----------|-------|
| Method | POST |
| Path | /auth/verify-code |
| Authentication | None (Public endpoint) |
| Rate Limit | 10 requests per minute per email |

**Request Body**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format, max 255 characters |
| code | string | Yes | Exactly 6 digits |

**Response - Success (200)**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always true |
| user | object | Authenticated user data |
| user.id | integer | User ID |
| user.email | string | User email |
| user.name | string/null | User name |
| user.avatar | string/null | Avatar URL |

**Response - Invalid Code (401)**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always false |
| message | string | Error description (code invalid/expired) |

**Response - Validation Error (422)**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always false |
| errors | object | Field-specific error messages |

### Get Current User Endpoint

**Purpose**: Retrieves authenticated user information for maintaining session state.

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /auth/user |
| Authentication | Required (Session-based) |
| Rate Limit | None |

**Response - Success (200)**:

| Field | Type | Description |
|-------|------|-------------|
| id | integer | User ID |
| email | string | User email |
| name | string/null | User name |
| avatar | string/null | Avatar URL |
| email_verified_at | string/null | Verification timestamp |

**Response - Unauthenticated (401)**:

| Field | Type | Description |
|-------|------|-------------|
| message | string | "Unauthenticated" |

### Logout Endpoint

**Purpose**: Terminates the current user session.

| Property | Value |
|----------|-------|
| Method | POST |
| Path | /auth/logout |
| Authentication | Required (Session-based) |
| Rate Limit | None |

**Response - Success (200)**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always true |
| message | string | Confirmation message |

## Backend Service Logic

### Magic Link Service Responsibilities

The Magic Link Service acts as the core authentication coordinator with the following responsibilities:

**Code Generation**:
- Generate cryptographically secure 6-digit numeric codes
- Ensure uniqueness within active time windows
- Configure expiration time (default: 10 minutes)

**Code Storage**:
- Store codes with associated user identifier
- Track creation timestamp for expiration calculation
- Maintain used/unused status

**Code Validation**:
- Verify code matches stored value
- Check expiration status
- Ensure code hasn't been previously used
- Mark valid codes as consumed after successful verification

**Token Cleanup**:
- Remove expired tokens to maintain database performance
- Schedule automatic cleanup via background jobs
- Clean up used tokens after grace period (24 hours recommended)

### User Service Responsibilities

**User Management**:
- Check if user exists by email address
- Create new user records for first-time authentication
- Generate default avatars for new users (using service like UI Avatars or Gravatar)
- Update user metadata (last login, email verification status)

**Session Management**:
- Create authenticated sessions upon successful verification
- Maintain session state using Laravel's session system
- Invalidate sessions on logout

### Email Service Responsibilities

**Email Delivery**:
- Send verification code emails using configured mail driver
- Use professional, branded email templates
- Support both HTML and plain text formats
- Handle email delivery failures gracefully

**Email Content**:
- Display verification code prominently
- Include code expiration information
- Provide help/support contact information
- Maintain consistent branding with application

**Email Configuration**:
- Support multiple mail drivers (SMTP, SendGrid, Mailgun, etc.)
- Configure sender address and name
- Set up email queue for asynchronous sending
- Implement retry logic for failed deliveries

## Frontend Component Specifications

### Shop Header Component Updates

**Unauthenticated State**:
- Display "Login" button with outlined variant
- Trigger authentication modal on click
- Show theme toggle
- Display site logo/name

**Authenticated State**:
- Display user email (truncated if necessary)
- Display user avatar with fallback to generated avatar
- Display "My Purchases" button linking to /buys route
- Show theme toggle
- Display site logo/name
- Optional: Add dropdown menu for user actions (logout, settings)

**Component State Management**:
- Track authentication status via Inertia shared props
- Access current user data from session
- Handle real-time authentication state changes
- Manage modal open/close state

### Authentication Modal Component

**Modal Behavior**:
- Two-step wizard interface (email → code)
- Prevent closing during API requests (loading states)
- Reset state on close
- Focus management for accessibility
- Keyboard navigation support (Tab, Enter, Escape)

**Email Input Step**:

| Element | Specification |
|---------|---------------|
| Title | "Account Login" or "Sign In" |
| Description | "Enter your email to receive verification code" |
| Input Field | Type: email, Autocomplete: email, Required validation |
| Submit Button | Label: "Send Code", Disabled during loading |
| Loading State | Show spinner and "Sending..." text |
| Error Display | Show validation errors below input |

**Code Input Step**:

| Element | Specification |
|---------|---------------|
| Title | "Verification" |
| Description | "We sent a verification code to {email}" |
| Input Field | Type: text, Maxlength: 6, Pattern: digits only, Auto-focus |
| Back Button | Return to email step, Outlined variant |
| Submit Button | Label: "Login", Primary variant, Disabled during loading |
| Loading State | Show spinner and "Verifying..." text |
| Error Display | Show validation errors below input |
| Resend Option | Link to resend code (with rate limiting) |

**API Integration**:
- Send POST request to /auth/send-code with email
- Send POST request to /auth/verify-code with email and code
- Handle success responses (proceed to next step or close modal)
- Handle error responses (display user-friendly messages)
- Implement loading states during API calls
- Handle network errors gracefully

**State Management**:

| State Variable | Type | Purpose |
|---------------|------|---------|
| currentStep | enum | Track which step is active (email/code) |
| email | string | Store entered email address |
| code | string | Store entered verification code |
| isLoading | boolean | Track API request status |
| error | string/null | Store error messages |

## Email Template Design

### Verification Code Email Structure

**Subject Line**: "Your GameCMS.su verification code"

**Email Body Content**:

| Section | Content |
|---------|---------|
| Header | Application logo and name |
| Greeting | "Hello!" or "Hi there!" |
| Main Message | "Your verification code is:" |
| Code Display | Large, bold, centered 6-digit code |
| Expiration Notice | "This code will expire in 10 minutes" |
| Help Text | "If you didn't request this code, you can safely ignore this email." |
| Footer | Support contact, unsubscribe link (if applicable) |

**Email Styling Guidelines**:
- Responsive design for mobile devices
- High contrast for accessibility
- Consistent with application branding
- Clean, minimal layout
- Verification code font size: 32px or larger
- Use system fonts for better compatibility

## Security Considerations

### Token Security

**Generation**:
- Use cryptographically secure random number generation
- Ensure sufficient entropy for 6-digit codes
- Avoid predictable patterns or sequences

**Storage**:
- Store tokens in dedicated table (not user table)
- Index appropriately for performance
- Implement cascade deletion when users are removed

**Validation**:
- Constant-time comparison to prevent timing attacks
- Check expiration before validation
- Single-use enforcement (mark as used)

### Rate Limiting Strategy

| Endpoint | Limit | Window | Identifier |
|----------|-------|--------|------------|
| /auth/send-code | 5 requests | 1 minute | Email address |
| /auth/verify-code | 10 requests | 1 minute | Email address |
| /auth/verify-code | 5 failed attempts | 15 minutes | Email address (progressive lockout) |

### Additional Security Measures

**CSRF Protection**:
- Enable CSRF middleware for all authentication endpoints
- Validate CSRF tokens on state-changing requests

**Session Security**:
- Use secure session cookies (HttpOnly, Secure, SameSite)
- Regenerate session ID on authentication
- Set appropriate session lifetime

**Email Security**:
- Validate email format on both client and server
- Normalize email addresses (lowercase, trim)
- Implement email verification status tracking

**Brute Force Protection**:
- Implement progressive delays after failed attempts
- Temporarily lock accounts after excessive failures
- Log suspicious authentication patterns

## Route Protection

### Protected Routes Configuration

Routes requiring authentication must be wrapped with authentication middleware:

| Route Path | Name | Middleware | Purpose |
|-----------|------|------------|---------|
| /buys | buys | auth | User purchases page |
| /wallet | wallet | auth | User wallet/balance |
| /settings | settings | auth | User account settings |

**Unauthenticated Behavior**:
- Detect unauthenticated access via Inertia middleware
- Pass authentication status to frontend via shared props
- Frontend redirects to home page and opens auth modal
- Store intended destination for post-login redirect

**Inertia Middleware Integration**:
- Share authenticated user data globally via HandleInertiaRequests middleware
- Provide user object in component props when authenticated
- Provide null user when unauthenticated
- Include flash messages for authentication errors

## Error Handling

### Client-Side Error Scenarios

| Error Type | User Message | Action |
|-----------|--------------|--------|
| Invalid Email Format | "Please enter a valid email address" | Highlight field, prevent submission |
| Network Error | "Connection failed. Please check your internet connection." | Show retry button |
| Rate Limit Exceeded | "Too many attempts. Please try again in {X} minutes." | Disable submit, show countdown |
| Invalid/Expired Code | "Invalid or expired code. Please request a new one." | Show resend button |
| Server Error | "Something went wrong. Please try again later." | Show retry button, log error |

### Server-Side Error Logging

**What to Log**:
- Failed authentication attempts with timestamp and email
- Token generation failures
- Email delivery failures
- Rate limit violations
- Unexpected exceptions during authentication flow

**What NOT to Log**:
- Verification codes (sensitive data)
- Complete email addresses in non-secure logs
- Session tokens or authentication credentials

**Log Levels**:
- INFO: Successful authentications, code generations
- WARNING: Rate limit hits, expired code attempts
- ERROR: Email delivery failures, database errors
- CRITICAL: Security-related failures, system-wide authentication issues

## Implementation Package Selection

### Recommended Package: Laravel Passwordless Authentication

**Package**: `parvezmia/laravel-passwordless-auth` or `ssbhattarai/magiclink`

**Selection Rationale**:
- Both packages provide complete magic link infrastructure
- Support for token generation, storage, and validation
- Built-in email queue integration
- Configurable expiration times
- Active maintenance and Laravel compatibility

**Configuration Parameters**:

| Parameter | Recommended Value | Purpose |
|-----------|------------------|---------|
| Token Length | 6 digits | User-friendly verification codes |
| Expiration Time | 600 seconds (10 min) | Balance security and usability |
| Token Cleanup | Daily via scheduler | Maintain database performance |
| Redirect After Login | /buys | User dashboard |
| Email Queue | Enabled | Asynchronous sending |

**Package Integration Steps**:
- Install package via Composer
- Publish configuration and migration files
- Run migrations to create login_tokens table
- Configure mail settings in environment
- Customize email templates
- Define authentication routes
- Integrate with frontend modal

## Testing Strategy

### Backend Testing Requirements

**Unit Tests**:
- Token generation produces valid 6-digit codes
- Token validation correctly identifies valid/invalid/expired codes
- User creation for new email addresses
- Email normalization (lowercase, trim)
- Rate limiting enforcement

**Integration Tests**:
- Complete authentication flow (send code → verify → session created)
- User registration via first authentication
- Token expiration enforcement
- Multiple failed verification attempts
- Email delivery integration
- Session creation and persistence

**Security Tests**:
- Rate limiting prevents abuse
- Expired tokens are rejected
- Used tokens cannot be reused
- CSRF protection is active
- Session security settings are correct

### Frontend Testing Requirements

**Component Tests**:
- Modal opens and closes correctly
- Step transitions work properly
- Form validation prevents invalid submissions
- Loading states display during API calls
- Error messages render correctly
- Successful authentication updates header state

**Integration Tests**:
- Complete user authentication flow
- API request/response handling
- Authentication state persistence
- Protected route access control
- Logout functionality

**User Acceptance Tests**:
- User can register with new email
- User can login with existing email
- User receives verification code via email
- User can successfully verify code
- User sees authenticated header state
- User can access protected routes
- User can logout successfully

## Deployment Considerations

### Environment Configuration

**Required Environment Variables**:

| Variable | Purpose | Example |
|----------|---------|---------|
| MAIL_MAILER | Email driver | smtp |
| MAIL_HOST | SMTP server | smtp.mailtrap.io |
| MAIL_PORT | SMTP port | 2525 |
| MAIL_USERNAME | SMTP username | user@example.com |
| MAIL_PASSWORD | SMTP password | secret |
| MAIL_FROM_ADDRESS | Sender email | noreply@gamecms.su |
| MAIL_FROM_NAME | Sender name | GameCMS.su |
| SESSION_DRIVER | Session storage | database |
| QUEUE_CONNECTION | Queue driver | database |

### Database Migrations

**Migration Execution Order**:
1. Run existing user table migrations
2. Run magic link package migrations (login_tokens table)
3. Verify foreign key constraints are established
4. Create necessary indexes

### Queue Worker Setup

**Purpose**: Process email sending asynchronously

**Configuration**:
- Configure queue driver (database, Redis, SQS, etc.)
- Start queue worker process on production
- Monitor queue health and failures
- Implement retry logic for failed jobs
- Set up supervisor or systemd for worker persistence

### Cache Configuration

**Session Storage**:
- Use database or Redis for session storage
- Configure session lifetime (120 minutes recommended)
- Enable session encryption

**Rate Limiting**:
- Use cache store for rate limit counters
- Clear rate limit cache on deployment if needed

## Performance Optimization

### Database Optimization

**Indexes**:
- Index on users.email for login lookups
- Composite index on login_tokens (user_id, expires_at) for validation queries
- Index on login_tokens.expires_at for cleanup jobs

**Query Optimization**:
- Use database transactions for token creation and email sending
- Implement eager loading for user relationships
- Use database-level constraints for data integrity

### Email Performance

**Queue Configuration**:
- Send all authentication emails via queue
- Set appropriate queue timeout
- Configure retry attempts for failed emails
- Monitor queue depth and processing time

**Email Provider**:
- Choose reliable email service (SendGrid, Mailgun, AWS SES)
- Implement webhook handling for delivery tracking
- Monitor email delivery rates and bounces

### Frontend Performance

**Code Splitting**:
- Lazy load authentication modal component
- Split vendor bundles appropriately

**API Optimization**:
- Implement request debouncing for form submissions
- Cache authenticated user data
- Use Inertia partial reloads for header updates

## Monitoring and Observability

### Metrics to Track

| Metric | Purpose | Alert Threshold |
|--------|---------|----------------|
| Authentication Success Rate | Track system reliability | < 95% |
| Average Code Delivery Time | Monitor email performance | > 30 seconds |
| Failed Authentication Attempts | Detect potential attacks | > 50 per hour |
| Token Expiration Rate | Optimize expiration window | > 30% |
| Email Bounce Rate | Monitor email deliverability | > 5% |

### Logging Requirements

**Authentication Events**:
- Code generation requests (email, timestamp)
- Successful authentications (user ID, timestamp)
- Failed verification attempts (email, reason)
- Rate limit violations (email, endpoint)

**System Events**:
- Email delivery failures (email, error message)
- Database errors during authentication
- Queue processing failures

## Future Enhancements

### Potential Improvements

**User Experience**:
- Remember device to skip verification on trusted devices
- Social authentication integration (Google, GitHub)
- Biometric authentication support
- SMS-based verification as alternative to email

**Security**:
- CAPTCHA integration for bot prevention
- Device fingerprinting for fraud detection
- Geolocation-based security alerts
- Multi-factor authentication options

**Administrative**:
- Admin dashboard for authentication analytics
- User account management interface
- Suspicious activity alerting
- Authentication audit logs

**Technical**:
- WebSocket integration for real-time code verification
- Progressive Web App (PWA) support
- Mobile app integration via API tokens
- OAuth 2.0 server functionality
