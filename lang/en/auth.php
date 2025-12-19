<?php

return [
    // Login and authentication
    'login_success' => 'Successfully logged in',
    'logout_success' => 'Logged out successfully',
    'unauthenticated' => 'Unauthenticated',
    
    // Code verification
    'code_sent' => 'Verification code sent to your email',
    'code_sent_success' => 'Verification code has been sent successfully',
    'invalid_code' => 'Invalid or expired code. Please request a new one.',
    'invalid_expired_code' => 'Invalid or expired code',
    'code_verified' => 'Code verified successfully',
    
    // Rate limiting
    'too_many_attempts' => 'Too many attempts. Please try again later.',
    'too_many_failed_attempts' => 'Too many failed attempts. Please request a new code.',
    'retry_after' => 'Too many attempts. Please try again in :seconds seconds.',
    
    // Errors
    'failed_to_send_code' => 'Failed to send verification code. Please try again later.',
    'connection_error' => 'Connection error. Please check your internet connection.',
    'server_error' => 'Server error occurred. Please try again later.',
    
    // Email template
    'email' => [
        'greeting' => 'Hello!',
        'sign_in_request' => 'You have requested to sign in to your GameCMS.su account.',
        'verification_code' => 'Your verification code is:',
        'expiration' => 'This code will expire in <strong>:minutes minutes</strong>.',
        'ignore_message' => 'If you didn\'t request this code, you can safely ignore this email.',
        'security_notice' => 'For security reasons, this code will expire in :minutes minutes and can only be used once.',
        'automated_message' => 'This is an automated message from GameCMS.su - please do not reply to this email.',
        'copyright' => '&copy; :year GameCMS.su. All rights reserved.',
    ],
];
