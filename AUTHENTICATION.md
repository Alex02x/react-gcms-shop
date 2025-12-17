# Passwordless Authentication System

This project implements a secure passwordless authentication system using email verification codes.

## Features

- **Passwordless Login**: Users authenticate using only their email address
- **Email Verification**: 6-digit verification codes sent via email
- **Auto-Registration**: New users are automatically created on first login
- **Rate Limiting**: Protection against abuse with configurable rate limits
- **Session Management**: Secure session-based authentication
- **Avatar Generation**: Automatic avatar generation using UI Avatars
- **Protected Routes**: Auth middleware for user-only pages

## Authentication Flow

1. User enters email address in authentication modal
2. System generates a secure 6-digit code and sends it via email
3. User enters the code from their email
4. System validates the code and creates an authenticated session
5. User gains access to protected features

## Backend Components

### Models

- **User** (`app/Models/User.php`): User model with avatar generation
- **LoginToken** (`app/Models/LoginToken.php`): Token management model

### Services

- **MagicLinkService** (`app/Services/MagicLinkService.php`): Core authentication logic
  - Generate secure 6-digit codes
  - Send verification emails
  - Validate codes
  - Clean up expired tokens

### Controllers

- **AuthController** (`app/Http/Controllers/AuthController.php`):
  - `POST /auth/send-code`: Send verification code
  - `POST /auth/verify-code`: Verify code and login
  - `GET /auth/user`: Get current user
  - `POST /auth/logout`: Logout user

### Email Templates

- HTML template: `resources/views/emails/verification-code.blade.php`
- Plain text template: `resources/views/emails/verification-code-text.blade.php`

## Frontend Components

### Components

- **AuthModal** (`resources/js/components/auth-modal.tsx`):
  - Two-step authentication flow
  - Email input step
  - Code verification step
  - Error handling
  - Resend code functionality

- **ShopHeader** (`resources/js/components/shop-header.tsx`):
  - Unauthenticated state: Login button
  - Authenticated state: User info, avatar, My Purchases button, logout

### Types

- `resources/js/types/auth.ts`: TypeScript interfaces for authentication

## Protected Routes

The following routes require authentication:
- `/buys` - User purchases page
- `/wallet` - User wallet page
- `/settings` - User settings page

Unauthenticated users attempting to access these routes will be redirected to home.

## Configuration

### Environment Variables

```env
# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=noreply@gamecms.su
MAIL_FROM_NAME=GameCMS.su

# Session Configuration
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Queue Configuration
QUEUE_CONNECTION=database
```

### Token Configuration

- **Expiration Time**: 10 minutes (configurable in `MagicLinkService`)
- **Code Length**: 6 digits
- **Rate Limits**:
  - Send code: 5 requests per minute per email
  - Verify code: 10 requests per minute per email
  - Failed attempts: 5 failed attempts per 15 minutes

## Setup Instructions

### 1. Run Migrations

```bash
php artisan migrate
```

This creates the `login_tokens` table.

### 2. Configure Email

Update your `.env` file with valid email credentials. For development, you can use [Mailtrap](https://mailtrap.io/) or set `MAIL_MAILER=log` to log emails instead of sending them.

### 3. Build Frontend Assets

```bash
npm install
npm run build
```

For development:

```bash
npm run dev
```

### 4. Start Queue Worker (Production)

```bash
php artisan queue:work
```

### 5. Schedule Token Cleanup (Optional)

Add to `routes/console.php`:

```php
Schedule::command('auth:cleanup-tokens')->daily();
```

Then run the scheduler:

```bash
php artisan schedule:work
```

## Testing Authentication

### Manual Testing

1. Start the development server:
   ```bash
   php artisan serve
   ```

2. Visit `http://localhost:8000`

3. Click "Login" button in header

4. Enter your email address

5. Check your email for the verification code (or check logs if using `MAIL_MAILER=log`)

6. Enter the code and login

### Artisan Commands

Clean up expired tokens manually:

```bash
php artisan auth:cleanup-tokens
```

## Security Features

- **CSRF Protection**: All authentication endpoints are CSRF protected
- **Rate Limiting**: Prevents brute force attacks
- **Token Expiration**: Codes expire after 10 minutes
- **Single-Use Tokens**: Each code can only be used once
- **Session Regeneration**: Session ID is regenerated on login
- **Secure Random**: Cryptographically secure random code generation
- **Progressive Lockout**: Account temporarily locked after 5 failed attempts

## API Endpoints

### Send Verification Code

```http
POST /auth/send-code
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "email": "user@example.com"
}
```

### Verify Code

```http
POST /auth/verify-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200)**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "user",
    "avatar": "https://ui-avatars.com/api/?name=user&background=random"
  }
}
```

### Get Current User

```http
GET /auth/user
```

**Response (200)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "user",
  "avatar": "https://ui-avatars.com/api/?name=user&background=random",
  "email_verified_at": "2025-12-16T05:55:17.000000Z"
}
```

### Logout

```http
POST /auth/logout
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Troubleshooting

### Emails Not Sending

1. Check your `.env` email configuration
2. Verify SMTP credentials are correct
3. Check Laravel logs: `storage/logs/laravel.log`
4. Try using `MAIL_MAILER=log` for development

### CSRF Token Mismatch

1. Ensure CSRF meta tag is in `app.blade.php`
2. Clear browser cookies
3. Check that CSRF token is included in requests

### Rate Limit Errors

Wait for the rate limit window to expire or clear cache:

```bash
php artisan cache:clear
```

## Database Schema

### users table

- `id`: Primary key
- `email`: Unique email address
- `name`: User display name
- `avatar`: Avatar URL
- `password`: Nullable (not used for passwordless auth)
- `email_verified_at`: Timestamp
- `created_at`: Timestamp
- `updated_at`: Timestamp

### login_tokens table

- `id`: Primary key
- `user_id`: Foreign key to users
- `token`: 6-digit code
- `expires_at`: Expiration timestamp
- `used_at`: When token was used (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## License

This project is part of the GameCMS.su shop application.
