<?php

return [
    // Login and authentication
    'login_success' => 'Успешный вход в систему',
    'logout_success' => 'Вы успешно вышли из системы',
    'unauthenticated' => 'Требуется аутентификация',
    
    // Code verification
    'code_sent' => 'Код подтверждения отправлен на ваш email',
    'code_sent_success' => 'Код подтверждения успешно отправлен',
    'invalid_code' => 'Неверный или истёкший код. Пожалуйста, запросите новый.',
    'invalid_expired_code' => 'Неверный или истёкший код',
    'code_verified' => 'Код успешно подтверждён',
    
    // Rate limiting
    'too_many_attempts' => 'Слишком много попыток. Попробуйте позже.',
    'too_many_failed_attempts' => 'Слишком много неудачных попыток. Пожалуйста, запросите новый код.',
    'retry_after' => 'Слишком много попыток. Попробуйте снова через :seconds секунд.',
    
    // Errors
    'failed_to_send_code' => 'Не удалось отправить код подтверждения. Попробуйте позже.',
    'connection_error' => 'Ошибка соединения. Проверьте подключение к интернету.',
    'server_error' => 'Произошла ошибка сервера. Попробуйте позже.',
    
    // Email template
    'email' => [
        'greeting' => 'Здравствуйте!',
        'sign_in_request' => 'Вы запросили вход в свой аккаунт на GameCMS.su.',
        'verification_code' => 'Ваш код подтверждения:',
        'expiration' => 'Этот код истечёт через <strong>:minutes минут</strong>.',
        'ignore_message' => 'Если вы не запрашивали этот код, можете спокойно проигнорировать это письмо.',
        'security_notice' => 'В целях безопасности этот код истечёт через :minutes минут и может быть использован только один раз.',
        'automated_message' => 'Это автоматическое сообщение от GameCMS.su - пожалуйста, не отвечайте на это письмо.',
        'copyright' => '&copy; :year GameCMS.su. Все права защищены.',
    ],
];
