<?php

return [
    // Profile Settings
    'section_title' => 'Аккаунт Telegram',
    'not_connected' => 'Не подключен',
    'connected' => 'Подключен',
    'link_button' => 'Привязать аккаунт Telegram',
    'unlink_button' => 'Отвязать аккаунт',
    'link_description' => 'Привяжите свой аккаунт Telegram для доступа к бесплатным продуктам, требующим подписки на канал',
    'link_modal_title' => 'Привязать аккаунт Telegram',
    'link_modal_instructions' => 'Отправьте следующий код нашему боту в Telegram',
    'verification_code_label' => 'Код подтверждения',
    'open_telegram_button' => 'Открыть Telegram',
    'copy_code_button' => 'Скопировать код',
    'time_remaining' => 'Осталось времени: :minutes::seconds',
    'unlink_confirm_title' => 'Отвязать аккаунт Telegram?',
    'unlink_confirm_message' => 'Вы можете потерять доступ к продуктам, требующим подписки на канал',

    // Product Download
    'account_required_title' => 'Требуется аккаунт Telegram',
    'account_required_message' => 'Этот продукт требует привязки вашего аккаунта Telegram и подписки на наш канал',
    'subscription_required_title' => 'Требуется подписка на канал',
    'subscription_required_message' => 'Пожалуйста, подпишитесь на наш канал в Telegram, чтобы скачать этот бесплатный продукт',
    'subscribe_button' => 'Подписаться на канал',
    'verify_button' => 'Проверить подписку',
    'verifying' => 'Проверка подписки...',
    'verification_success' => 'Подписка успешно подтверждена',

    // Admin Panel
    'admin' => [
        'section_title' => 'Настройки интеграции Telegram',
        'bot_token_label' => 'Токен бота Telegram',
        'channel_id_label' => 'ID или имя канала',
        'channel_link_label' => 'Публичная ссылка на канал',
        'test_connection' => 'Проверить подключение',
        'require_subscription_label' => 'Требовать подписку на канал Telegram',
        'require_subscription_help' => 'Пользователи должны быть подписаны на ваш настроенный канал Telegram для загрузки этого бесплатного продукта',
        'settings_saved' => 'Настройки Telegram успешно сохранены',
        'test_success' => 'Подключение к боту успешно',
        'test_failed' => 'Не удалось подключиться к Telegram: :error',
        'bot_token_placeholder' => 'Введите токен бота от @BotFather',
        'bot_token_help' => 'Создайте бота через @BotFather в Telegram и вставьте API токен здесь',
        'channel_id_placeholder' => '@channelname или -1001234567890',
        'channel_id_help' => 'Канал, на который должны подписаться пользователи. Используйте формат @username или числовой ID',
        'channel_link_placeholder' => 'https://t.me/yourchannel',
        'channel_link_help' => 'Ссылка, по которой пользователи будут переходить для вступления в канал',
    ],

    // Error Messages
    'error' => [
        'not_linked' => 'Пожалуйста, привяжите свой аккаунт Telegram для загрузки этого продукта',
        'not_subscribed' => 'Требуется подписка на наш канал в Telegram',
        'api_unavailable' => 'Не удалось проверить подписку в данный момент. Пожалуйста, попробуйте позже',
        'token_expired' => 'Код подтверждения истёк. Пожалуйста, сгенерируйте новый',
        'invalid_configuration' => 'Интеграция Telegram настроена неправильно. Пожалуйста, обратитесь в поддержку',
    ],
];
<?php

return [
    // Profile Settings
    'section_title' => 'Аккаунт Telegram',
    'not_connected' => 'Не подключен',
    'connected' => 'Подключен',
    'link_button' => 'Привязать аккаунт Telegram',
    'unlink_button' => 'Отвязать аккаунт',
    'link_description' => 'Привяжите свой аккаунт Telegram для доступа к бесплатным продуктам, требующим подписки на канал',
    'link_modal_title' => 'Привязать аккаунт Telegram',
    'link_modal_instructions' => 'Отправьте следующий код нашему боту в Telegram',
    'verification_code_label' => 'Код подтверждения',
    'open_telegram_button' => 'Открыть Telegram',
    'copy_code_button' => 'Скопировать код',
    'time_remaining' => 'Осталось времени: :minutes::seconds',
    'unlink_confirm_title' => 'Отвязать аккаунт Telegram?',
    'unlink_confirm_message' => 'Вы можете потерять доступ к продуктам, требующим подписки на канал',

    // Product Download
    'account_required_title' => 'Требуется аккаунт Telegram',
    'account_required_message' => 'Этот продукт требует привязки вашего аккаунта Telegram и подписки на наш канал',
    'subscription_required_title' => 'Требуется подписка на канал',
    'subscription_required_message' => 'Пожалуйста, подпишитесь на наш канал в Telegram, чтобы скачать этот бесплатный продукт',
    'subscribe_button' => 'Подписаться на канал',
    'verify_button' => 'Проверить подписку',
    'verifying' => 'Проверка подписки...',
    'verification_success' => 'Подписка успешно подтверждена',

    // Admin Panel
    'admin' => [
        'section_title' => 'Настройки интеграции Telegram',
        'bot_token_label' => 'Токен бота Telegram',
        'channel_id_label' => 'ID или имя канала',
        'channel_link_label' => 'Публичная ссылка на канал',
        'test_connection' => 'Проверить подключение',
        'require_subscription_label' => 'Требовать подписку на канал Telegram',
        'require_subscription_help' => 'Пользователи должны быть подписаны на ваш настроенный канал Telegram для загрузки этого бесплатного продукта',
        'settings_saved' => 'Настройки Telegram успешно сохранены',
        'test_success' => 'Подключение к боту успешно',
        'test_failed' => 'Не удалось подключиться к Telegram: :error',
        'bot_token_placeholder' => 'Введите токен бота от @BotFather',
        'bot_token_help' => 'Создайте бота через @BotFather в Telegram и вставьте API токен здесь',
        'channel_id_placeholder' => '@channelname или -1001234567890',
        'channel_id_help' => 'Канал, на который должны подписаться пользователи. Используйте формат @username или числовой ID',
        'channel_link_placeholder' => 'https://t.me/yourchannel',
        'channel_link_help' => 'Ссылка, по которой пользователи будут переходить для вступления в канал',
    ],

    // Error Messages
    'error' => [
        'not_linked' => 'Пожалуйста, привяжите свой аккаунт Telegram для загрузки этого продукта',
        'not_subscribed' => 'Требуется подписка на наш канал в Telegram',
        'api_unavailable' => 'Не удалось проверить подписку в данный момент. Пожалуйста, попробуйте позже',
        'token_expired' => 'Код подтверждения истёк. Пожалуйста, сгенерируйте новый',
        'invalid_configuration' => 'Интеграция Telegram настроена неправильно. Пожалуйста, обратитесь в поддержку',
    ],
];
