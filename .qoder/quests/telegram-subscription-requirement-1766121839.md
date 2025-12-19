# Telegram Channel Subscription Requirement for Free Products

## Overview

This design defines a feature that requires users to subscribe to a specified Telegram channel before downloading free products. The requirement is configurable per product through an admin panel setting. When enabled, the system verifies Telegram channel membership before allowing free product downloads.

## Business Goals

- Increase Telegram channel subscriber base through product distribution incentives
- Provide conditional access control for free products based on channel membership
- Enable flexible configuration to selectively apply subscription requirements to specific products
- Maintain seamless user experience while encouraging community engagement

## Feature Scope

### In Scope
- Telegram account linking in user profile settings
- Admin panel configuration for subscription requirement per product
- Telegram channel membership verification before free product download
- User notification system for subscription requirements
- Channel invite link display when user is not subscribed

### Out of Scope
- Telegram authentication as primary login method
- Automatic subscription through the application
- Multiple channel subscription requirements
- Paid product subscription requirements
- Telegram notification integrations

## System Components

### Data Model Updates

#### Users Table
Add columns to support Telegram integration:

| Column Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| telegram_user_id | bigInteger | Yes | Telegram user identifier from Telegram API |
| telegram_username | string(255) | Yes | Telegram username for display purposes |
| telegram_linked_at | timestamp | Yes | When the Telegram account was linked |

**Indexes:**
- Index on telegram_user_id for quick lookup during verification

#### Products Table
Add column to enable subscription requirement:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| require_telegram_subscription | boolean | No | false | Whether this product requires Telegram channel subscription |

#### System Configuration Table
Create new configuration storage for Telegram settings:

| Column Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| id | increments | No | Primary key |
| key | string(255) | No | Configuration key (e.g., 'telegram_bot_token', 'telegram_channel_id') |
| value | text | Yes | Configuration value |
| encrypted | boolean | No | Whether the value should be encrypted at rest |
| created_at | timestamp | Yes | Record creation timestamp |
| updated_at | timestamp | Yes | Record update timestamp |

**Unique Constraint:** key field must be unique

**Configuration Keys:**
- telegram_bot_token: Telegram Bot API token for verification
- telegram_channel_id: Target channel ID or username for subscription verification
- telegram_channel_link: Public invite link to display to users

## User Flows

### Flow 1: Telegram Account Linking

**Entry Point:** User navigates to Profile Settings

**Steps:**
1. User accesses profile settings page
2. System displays Telegram connection section with current status (Connected/Not Connected)
3. If not connected:
   - User clicks "Link Telegram Account" button
   - System generates unique verification token with 15-minute expiration
   - System displays token and instructions to message the bot
   - User opens Telegram and sends token to the configured bot
   - Bot receives message, validates token, extracts user information
   - Bot responds with confirmation message
   - System updates user record with Telegram user ID and username
   - Frontend refreshes to show connected status
4. If already connected:
   - User can view connected Telegram username
   - User can unlink account by clicking "Unlink" button
   - System confirms unlinking action
   - System removes Telegram data from user record

**Alternative Path:**
- Token expires before user completes verification
  - System displays error message
  - User must generate new token

### Flow 2: Free Product Download with Subscription Requirement

**Entry Point:** User attempts to download a free product (current_price = 0)

**Preconditions:**
- User is authenticated
- Product is free (current_price = 0)

**Steps:**
1. User clicks "Download Free" button on product page
2. System checks if product has require_telegram_subscription enabled
3. **If subscription NOT required:**
   - Proceed directly to download confirmation
   - Record purchase with price 0
   - Allow immediate download
4. **If subscription IS required:**
   - System checks if user has linked Telegram account
   - **If NOT linked:**
     - Display modal with two sections:
       - Message: "This product requires Telegram channel subscription and account linking"
       - Action buttons: "Link Telegram Account" and "Cancel"
     - If user clicks "Link Telegram Account", redirect to profile settings
   - **If linked:**
     - System calls Telegram Bot API getChatMember endpoint
     - Parameters: chat_id (configured channel), user_id (user's telegram_user_id)
     - API returns ChatMember object with status field
     - System evaluates membership status:
       - **Status "member", "creator", "administrator":** User is subscribed
         - Proceed to download confirmation
         - Record purchase with price 0
         - Allow immediate download
       - **Status "left", "kicked", or API error:** User is not subscribed
         - Display subscription requirement modal with:
           - Header: "Telegram Channel Subscription Required"
           - Message: "To download this free product, please subscribe to our Telegram channel"
           - Channel link button with configured telegram_channel_link
           - "Verify Subscription" button to recheck status
           - "Cancel" button
         - User clicks channel link, opens Telegram, subscribes
         - User returns, clicks "Verify Subscription"
         - System rechecks membership status
         - If now subscribed, proceed to download
         - If still not subscribed, display error message

**Edge Cases:**
- Telegram API is unavailable
  - Display user-friendly error message
  - Suggest trying again later
  - Log error for administrator review
- User's Telegram account was unlinked from Telegram's side
  - Treat as "not subscribed" status
  - Prompt user to re-link account

### Flow 3: Admin Product Configuration

**Entry Point:** Administrator edits product in admin panel

**Steps:**
1. Administrator navigates to Products section
2. Administrator opens product edit form
3. System displays product form with all existing fields
4. New section: "Telegram Subscription Settings"
   - Checkbox: "Require Telegram Channel Subscription" (unchecked by default)
   - Helper text: "When enabled, users must subscribe to the configured Telegram channel before downloading this free product"
   - Only visible when current_price is 0 (free product)
5. Administrator toggles checkbox as desired
6. Administrator saves product
7. System validates and updates product record
8. System displays success confirmation

**Validation Rules:**
- require_telegram_subscription can only be enabled if current_price equals 0
- If current_price changes from 0 to any positive value, automatically set require_telegram_subscription to false

### Flow 4: Admin Telegram Configuration

**Entry Point:** Administrator accesses system settings

**Steps:**
1. Administrator navigates to Settings or Configuration section
2. System displays new "Telegram Integration" settings tab
3. Form fields displayed:
   - Bot Token (password field, encrypted in database)
     - Label: "Telegram Bot Token"
     - Helper: "Create a bot via @BotFather and paste the token here"
   - Channel ID/Username (text field)
     - Label: "Channel ID or Username"
     - Helper: "Format: @channelname or numeric channel ID"
   - Channel Invite Link (URL field)
     - Label: "Public Channel Link"
     - Helper: "The link users will click to subscribe (e.g., https://t.me/yourchannel)"
4. Administrator enters configuration values
5. Administrator clicks "Test Connection" button (optional)
   - System validates bot token by calling Telegram API getMe endpoint
   - System displays success or error message
6. Administrator clicks "Save Settings"
7. System encrypts bot token
8. System stores configuration values
9. System displays success confirmation

**Validation Rules:**
- Bot token must be present if subscription features are to be used
- Channel ID must start with @ or be numeric
- Channel link must be valid URL format

## API Integration

### Telegram Bot API Integration

**Purpose:** Verify user membership in specified Telegram channel

**API Endpoint:** https://api.telegram.org/bot{token}/getChatMember

**Method:** POST

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | String or Integer | Yes | Channel ID or username (e.g., @channelname) |
| user_id | Integer | Yes | Telegram user ID to check |

**Response Structure:**

Successful response returns ChatMember object with status field:
- "creator": User created the channel (subscribed)
- "administrator": User is channel admin (subscribed)
- "member": User is regular member (subscribed)
- "restricted": User is restricted but still member (subscribed)
- "left": User left the channel (not subscribed)
- "kicked": User was banned (not subscribed)

**Error Handling:**

| Error Scenario | HTTP Code | Response | System Action |
|---------------|-----------|----------|---------------|
| Invalid bot token | 401 | Unauthorized | Log error, show user-friendly message, notify admin |
| User not found | 400 | Bad Request (user not found) | Treat as "not subscribed" |
| Channel not found | 400 | Bad Request (chat not found) | Log error, notify admin of configuration issue |
| Bot not member of channel | 400 | Bad Request (bot is not a member) | Log error, notify admin to add bot to channel |
| Network timeout | N/A | Connection error | Retry once, then show user-friendly error |

**Authentication:** Bot token included in URL path

**Rate Limiting:** Telegram Bot API has built-in rate limits (30 requests per second). Implement caching of verification results for 5 minutes to reduce API calls.

### Telegram Bot Webhook Endpoint

**Purpose:** Receive verification messages from users linking their accounts

**Endpoint:** POST /api/telegram/webhook

**Request Payload:** Standard Telegram Update object

**Processing Logic:**
1. Verify request authenticity (check bot token or use webhook secret)
2. Extract message text from update object
3. Check if message text matches verification token pattern
4. Validate token has not expired (15-minute TTL)
5. Extract user_id and username from message sender
6. Update corresponding user record with Telegram information
7. Send confirmation message back to user via sendMessage API
8. Mark token as used

## Security Considerations

### Data Protection
- Telegram bot token must be encrypted at rest in database
- Use Laravel's encryption helpers for sensitive configuration data
- Verification tokens must be single-use and time-limited (15 minutes)
- User Telegram IDs should not be exposed in frontend responses to other users

### API Security
- Validate Telegram webhook requests using secret token or IP whitelist
- Implement rate limiting on verification endpoint (5 requests per minute per user)
- Sanitize all data received from Telegram API before storage
- Validate Telegram user IDs match expected format (positive integers)

### Access Control
- Only authenticated users can link Telegram accounts
- Only users with edit-products permission can modify subscription requirements
- Only users with manage-settings permission can configure Telegram integration
- Telegram account unlinking requires user authentication

### Bot Security
- Bot must be added as administrator to the target channel to use getChatMember
- Bot should have minimal necessary permissions in channel (no posting rights needed)
- Monitor for unusual API usage patterns that might indicate abuse

## Frontend Components

### Profile Settings - Telegram Link Section

**Location:** Profile Settings page, new dedicated section

**Components:**

**When Not Linked:**
- Section Header: "Telegram Account"
- Status Badge: "Not Connected" (neutral color)
- Description Text: "Link your Telegram account to access free products that require channel subscription"
- Primary Button: "Link Telegram Account"

**During Linking Process:**
- Modal Dialog:
  - Title: "Link Telegram Account"
  - Instructions: "Send the following code to our bot on Telegram"
  - Bot Link: Clickable link to open bot in Telegram
  - Verification Code: Large, copyable text display
  - Countdown Timer: Shows remaining time (15 minutes)
  - Action Buttons:
    - "Open Telegram" (opens bot link)
    - "Copy Code" (copies verification code)
    - "Cancel" (closes modal)
  - Auto-refresh mechanism: Poll every 3 seconds to check if linking is complete

**When Linked:**
- Section Header: "Telegram Account"
- Status Badge: "Connected" (success color)
- Connected Account Display:
  - Telegram Username (with @ prefix)
  - Linked Date
- Secondary Button: "Unlink Account"
- Confirmation Dialog on Unlink:
  - Warning message about losing access to subscription-required products
  - "Confirm Unlink" and "Cancel" buttons

### Product Page - Download Button Logic

**Modification:** Conditional rendering based on product configuration

**States:**

**Free Product Without Subscription Requirement:**
- Button Label: "Download Free"
- Action: Opens standard download confirmation modal

**Free Product With Subscription Requirement (User Not Linked):**
- Button Label: "Download Free"
- Action: Opens modal requiring Telegram link
- Modal Content:
  - Icon: Telegram logo
  - Title: "Telegram Account Required"
  - Message: "This product requires linking your Telegram account and subscribing to our channel"
  - Primary Button: "Link Telegram Account" (redirects to profile settings)
  - Secondary Button: "Cancel"

**Free Product With Subscription Requirement (User Linked, Not Subscribed):**
- Button Label: "Download Free"
- Action: Opens subscription requirement modal
- Modal Content:
  - Icon: Telegram logo
  - Title: "Channel Subscription Required"
  - Message: "Please subscribe to our Telegram channel to download this free product"
  - Channel Preview (if available):
    - Channel name
    - Member count
  - Primary Button: "Subscribe to Channel" (opens telegram_channel_link)
  - Secondary Button: "Verify Subscription" (rechecks status)
  - Tertiary Link: "Cancel"

**Free Product With Subscription Requirement (User Linked, Subscribed):**
- Button Label: "Download Free"
- Action: Opens standard download confirmation modal
- Success message acknowledges subscription status

### Admin Panel - Product Form

**Location:** Product create/edit form

**New Section:** "Telegram Subscription Settings"

**Visibility Condition:** Only displayed when current_price is 0 (free product)

**Components:**
- Section Header: "Telegram Subscription Settings"
- Checkbox Input:
  - Label: "Require Telegram Channel Subscription"
  - Helper Text: "Users must be subscribed to your configured Telegram channel to download this free product"
  - Default State: Unchecked
- Conditional Alert (shown when checkbox is checked):
  - Type: Info
  - Message: "Ensure Telegram integration is configured in system settings"
  - Link: "Go to Telegram Settings"

### Admin Panel - Telegram Settings

**Location:** Settings section, new "Telegram Integration" tab

**Components:**

- Page Header: "Telegram Integration Settings"
- Description: "Configure Telegram bot for subscription verification and account linking"

**Configuration Form:**
- Field 1: Bot Token
  - Type: Password input
  - Label: "Telegram Bot Token"
  - Placeholder: "Enter bot token from @BotFather"
  - Help Text: "Create a bot via @BotFather on Telegram and paste the API token here"
  - Encrypted: Yes

- Field 2: Channel ID/Username
  - Type: Text input
  - Label: "Channel ID or Username"
  - Placeholder: "@channelname or -1001234567890"
  - Help Text: "The channel users must subscribe to. Use @username format or numeric ID"

- Field 3: Public Channel Link
  - Type: URL input
  - Label: "Public Channel Invite Link"
  - Placeholder: "https://t.me/yourchannel"
  - Help Text: "The link users will click to join your channel"

- Action Buttons:
  - "Test Connection" (validates bot token with Telegram API)
  - "Save Settings" (primary button)
  - "Cancel" (secondary button, discards changes)

**Feedback Elements:**
- Success Alert: "Settings saved successfully"
- Error Alert: "Configuration error: {error_message}"
- Test Success: "Bot connection successful"
- Test Failure: "Unable to connect: {error_details}"

## Backend Services

### TelegramService

**Responsibility:** Encapsulate all Telegram API interactions

**Methods:**

**verifyChannelMembership(telegramUserId, channelId)**
- Parameters:
  - telegramUserId: Integer - User's Telegram ID
  - channelId: String - Channel ID or username
- Returns: Boolean - True if user is subscribed
- Throws: TelegramApiException on API errors

**sendMessage(chatId, message)**
- Parameters:
  - chatId: Integer - Recipient's Telegram chat ID
  - message: String - Message text to send
- Returns: Boolean - True if message sent successfully
- Throws: TelegramApiException on API errors

**validateBotToken(token)**
- Parameters:
  - token: String - Bot API token to validate
- Returns: Object - Bot information from getMe endpoint
- Throws: TelegramApiException if token is invalid

**generateVerificationToken(userId)**
- Parameters:
  - userId: Integer - Application user ID
- Returns: String - Unique verification token
- Side Effects: Stores token in cache with 15-minute expiration

**processVerificationMessage(telegramUpdate)**
- Parameters:
  - telegramUpdate: Object - Telegram Update object from webhook
- Returns: Boolean - True if verification successful
- Side Effects: Updates user record with Telegram information

**Implementation Notes:**
- Use HTTP client with timeout configuration (10 seconds)
- Implement retry logic for transient network errors (1 retry with exponential backoff)
- Log all API interactions for debugging and monitoring
- Cache membership verification results for 5 minutes per user-channel pair

### ProductDownloadService

**Responsibility:** Manage product download authorization logic

**Methods:**

**canDownloadFreeProduct(user, product)**
- Parameters:
  - user: User model instance
  - product: Product model instance
- Returns: Object - { allowed: Boolean, reason: String|null }
- Logic:
  - Check if product is free (current_price = 0)
  - Check if product requires Telegram subscription
  - If required, verify user has linked Telegram
  - If linked, verify channel membership via TelegramService
  - Return result with appropriate reason if blocked

**processFreePurchase(user, product)**
- Parameters:
  - user: User model instance
  - product: Product model instance
- Returns: Purchase record
- Preconditions: canDownloadFreeProduct returned allowed = true
- Side Effects: Creates purchase record with price 0, associates user with product

## Configuration Management

### Environment Variables

Add to .env file:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=@yourchannel
TELEGRAM_CHANNEL_LINK=https://t.me/yourchannel
TELEGRAM_WEBHOOK_SECRET=random_secret_string
```

### System Configuration Storage

Store in system_configurations table (or equivalent):

| Key | Value | Encrypted |
|-----|-------|-----------|
| telegram_bot_token | {bot_token} | true |
| telegram_channel_id | @channelname | false |
| telegram_channel_link | https://t.me/channelname | false |
| telegram_webhook_secret | {secret} | true |

**Configuration Access Pattern:**
- Create configuration repository or helper class
- Implement caching layer (cache for 1 hour)
- Provide admin UI to update values
- Invalidate cache on configuration updates

## Testing Considerations

### Unit Testing

**TelegramService Tests:**
- Mock HTTP client responses for API calls
- Test successful membership verification
- Test handling of "left" and "kicked" statuses
- Test API error scenarios (401, 400, network timeout)
- Test token generation uniqueness
- Test verification token expiration

**ProductDownloadService Tests:**
- Test free product without subscription requirement
- Test free product with requirement but user not linked
- Test free product with requirement, linked, subscribed
- Test free product with requirement, linked, not subscribed
- Test paid product should never require subscription

### Integration Testing

**Telegram Linking Flow:**
- Generate verification token
- Simulate webhook callback with token
- Verify user record updated correctly
- Verify confirmation message sent

**Download Flow:**
- User downloads free product without requirement (success)
- User attempts download with requirement but not linked (blocked)
- User attempts download with requirement, linked, not subscribed (blocked)
- User attempts download with requirement, linked, subscribed (success)

### Manual Testing Checklist

- Create Telegram bot via @BotFather
- Configure bot token in admin panel
- Test "Test Connection" button functionality
- Create free product with subscription requirement enabled
- Link Telegram account from profile settings
- Verify token expires after 15 minutes
- Subscribe to channel via Telegram
- Download free product successfully
- Unsubscribe from channel
- Verify download is blocked
- Resubscribe and verify download allowed again
- Test unlinking Telegram account
- Test with invalid bot token (error handling)
- Test with bot not in channel (error handling)

## Error Handling

### User-Facing Error Messages

| Scenario | Message | Actions Available |
|----------|---------|-------------------|
| Telegram account not linked | "Please link your Telegram account to download this product" | "Link Account", "Cancel" |
| Not subscribed to channel | "Subscription to our Telegram channel is required. Please subscribe and try again" | "Subscribe", "Verify", "Cancel" |
| Telegram API unavailable | "Unable to verify subscription at this time. Please try again in a few moments" | "Retry", "Cancel" |
| Verification token expired | "Verification code has expired. Please generate a new one" | "Generate New Code", "Cancel" |
| Bot configuration invalid | "Telegram integration is not properly configured. Please contact support" | "Contact Support", "Cancel" |

### System Error Logging

**Log Levels and Events:**

**Error Level:**
- Telegram API returns 401 (invalid token)
- Bot not member of configured channel
- Unable to send verification message
- Database errors during Telegram data updates

**Warning Level:**
- Telegram API timeout
- User attempts verification with expired token
- getChatMember returns unexpected status

**Info Level:**
- User successfully links Telegram account
- User unlinks Telegram account
- Subscription verification successful
- Subscription verification failed (user not subscribed)

**Log Format:**
Include context: user_id, telegram_user_id, product_id, API endpoint, response status, error message

## Performance Considerations

### Caching Strategy

**Membership Verification Results:**
- Cache Key: telegram_membership_{user_id}_{channel_id}
- TTL: 5 minutes
- Rationale: Reduce API calls while keeping data relatively fresh

**Configuration Values:**
- Cache Key: telegram_config_{key}
- TTL: 1 hour
- Invalidation: Manual on configuration update

**Verification Tokens:**
- Cache Key: telegram_verification_{token}
- TTL: 15 minutes
- Storage: Redis or Laravel cache

### API Call Optimization

- Implement request queuing for webhook processing to handle bursts
- Use async job processing for non-critical verification confirmations
- Batch verification requests if multiple products require checking
- Implement circuit breaker pattern for repeated API failures

### Database Optimization

- Index on users.telegram_user_id for fast lookups
- Index on products.require_telegram_subscription for filtering
- Consider denormalizing subscription status if query patterns justify

## Localization

### Translation Keys Required

**Profile Settings:**
- telegram.section_title: "Telegram Account"
- telegram.not_connected: "Not Connected"
- telegram.connected: "Connected"
- telegram.link_button: "Link Telegram Account"
- telegram.unlink_button: "Unlink Account"
- telegram.link_description: "Link your Telegram account to access free products that require channel subscription"
- telegram.link_modal_title: "Link Telegram Account"
- telegram.link_modal_instructions: "Send the following code to our bot on Telegram"
- telegram.verification_code_label: "Verification Code"
- telegram.open_telegram_button: "Open Telegram"
- telegram.copy_code_button: "Copy Code"
- telegram.time_remaining: "Time remaining: {minutes}:{seconds}"
- telegram.unlink_confirm_title: "Unlink Telegram Account?"
- telegram.unlink_confirm_message: "You may lose access to products requiring channel subscription"

**Product Download:**
- telegram.account_required_title: "Telegram Account Required"
- telegram.account_required_message: "This product requires linking your Telegram account and subscribing to our channel"
- telegram.subscription_required_title: "Channel Subscription Required"
- telegram.subscription_required_message: "Please subscribe to our Telegram channel to download this free product"
- telegram.subscribe_button: "Subscribe to Channel"
- telegram.verify_button: "Verify Subscription"
- telegram.verifying: "Verifying subscription..."
- telegram.verification_success: "Subscription verified successfully"

**Admin Panel:**
- admin.telegram.section_title: "Telegram Integration Settings"
- admin.telegram.bot_token_label: "Telegram Bot Token"
- admin.telegram.channel_id_label: "Channel ID or Username"
- admin.telegram.channel_link_label: "Public Channel Invite Link"
- admin.telegram.test_connection: "Test Connection"
- admin.telegram.require_subscription_label: "Require Telegram Channel Subscription"
- admin.telegram.require_subscription_help: "Users must be subscribed to your configured Telegram channel to download this free product"
- admin.telegram.settings_saved: "Telegram settings saved successfully"
- admin.telegram.test_success: "Bot connection successful"
- admin.telegram.test_failed: "Unable to connect to Telegram: {error}"

**Error Messages:**
- telegram.error.not_linked: "Please link your Telegram account to download this product"
- telegram.error.not_subscribed: "Subscription to our Telegram channel is required"
- telegram.error.api_unavailable: "Unable to verify subscription at this time. Please try again later"
- telegram.error.token_expired: "Verification code has expired. Please generate a new one"
- telegram.error.invalid_configuration: "Telegram integration is not properly configured. Please contact support"

### Supported Languages

Provide translations for:
- English (en)
- Russian (ru) - based on user query language preference

## Migration Strategy

### Database Migrations

**Migration 1: Add Telegram fields to users table**
- Add telegram_user_id column (nullable bigInteger)
- Add telegram_username column (nullable string 255)
- Add telegram_linked_at column (nullable timestamp)
- Add index on telegram_user_id

**Migration 2: Add subscription requirement to products table**
- Add require_telegram_subscription column (boolean, default false)

**Migration 3: Create system_configurations table**
- Create table if not exists
- Define schema as specified in Data Model section
- Seed with default Telegram configuration keys

### Deployment Steps

1. Run database migrations
2. Deploy backend code changes (services, controllers)
3. Deploy frontend code changes (UI components)
4. Configure Telegram bot via @BotFather
5. Update system configuration with bot token and channel details
6. Set up webhook endpoint for Telegram bot
7. Add bot as administrator to target channel
8. Test end-to-end flow in staging environment
9. Monitor error logs after production deployment

### Rollback Plan

- Revert database migrations if needed (down methods)
- Toggle feature flag to disable Telegram verification (use configuration)
- Remove require_telegram_subscription from product validation if critical issues arise
- Fallback: Allow all free downloads without verification temporarily

## Success Metrics

### Feature Adoption
- Number of users linking Telegram accounts (target: 30% of active users in first month)
- Percentage of free products with subscription requirement enabled (track adoption by admins)
- Conversion rate: users who see subscription requirement → complete linking → subscribe

### Engagement
- Telegram channel subscriber growth rate before and after feature launch
- Average time from "link account" to successful download
- Repeat usage: users downloading multiple subscription-required products

### Technical Performance
- Telegram API response time (target: <2 seconds for 95th percentile)
- API error rate (target: <1%)
- Webhook processing latency (target: <500ms)
- Cache hit rate for membership verification (target: >70%)

### User Experience
- Support ticket volume related to Telegram linking/verification
- User feedback sentiment on subscription requirement
- Abandonment rate at subscription requirement modal

## Future Enhancements

### Potential Improvements
- Multiple channel subscription requirements per product
- Tiered access based on channel subscription duration
- Telegram authentication as alternative login method
- Automated channel join via bot (requires user interaction in Telegram)
- Channel statistics dashboard for admins (subscriber growth, download correlation)
- Webhook notifications for channel subscription events
- Grace period for recently unsubscribed users
- Telegram mini-app integration for in-chat product browsing
- Subscription reminder notifications via Telegram bot

### Extensibility Considerations
- Design services with interface abstractions to support other messaging platforms (Discord, WhatsApp)
- Configuration system should support multiple channels for future multi-channel requirements
- Database schema allows for additional OAuth provider integrations (twitter_user_id, discord_user_id, etc.)
