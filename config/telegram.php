<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Telegram Bot Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Telegram Bot API integration. These settings are used
    | for verifying channel subscriptions and linking user accounts.
    |
    */

    'bot_token' => env('TELEGRAM_BOT_TOKEN'),

    'channel_id' => env('TELEGRAM_CHANNEL_ID'),

    'channel_link' => env('TELEGRAM_CHANNEL_LINK'),

    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    |
    | Cache duration for various Telegram-related data.
    |
    */

    'cache' => [
        'membership_ttl' => 300, // 5 minutes
        'config_ttl' => 3600, // 1 hour
        'bot_info_ttl' => 3600, // 1 hour
    ],

    /*
    |--------------------------------------------------------------------------
    | API Settings
    |--------------------------------------------------------------------------
    |
    | Settings for Telegram Bot API requests.
    |
    */

    'api' => [
        'url' => 'https://api.telegram.org/bot',
        'timeout' => 10, // seconds
        'retry_attempts' => 1,
        'retry_delay' => 100, // milliseconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Verification Token Settings
    |--------------------------------------------------------------------------
    |
    | Settings for account linking verification tokens.
    |
    */

    'verification' => [
        'token_ttl' => 900, // 15 minutes
        'rate_limit' => 5, // requests per minute
    ],

];
