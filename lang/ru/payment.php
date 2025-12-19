<?php

return [
    'title' => 'Настройки оплаты',
    'yookassa_settings' => 'Настройки ЮКассы',
    'shop_id' => 'Идентификатор магазина',
    'shop_id_placeholder' => 'Например: 123456',
    'secret_key' => 'Секретный ключ',
    'secret_key_placeholder' => 'Введите секретный ключ',
    'enabled' => 'Включить ЮКассу',
    'min_amount' => 'Минимальная сумма',
    'min_amount_placeholder' => '100',
    'currency' => 'Валюта',
    'test_connection' => 'Проверить подключение',
    'connection_success' => 'Подключение успешно',
    'connection_failed' => 'Ошибка подключения',
    'testing_connection' => 'Проверка подключения...',
    'save_settings' => 'Сохранить настройки',
    'saving' => 'Сохранение...',
    'settings_saved' => 'Настройки сохранены успешно',
    'settings_save_failed' => 'Не удалось сохранить настройки',
    
    // Webhook section
    'webhook_configuration' => 'Настройка вебхука',
    'webhook_url' => 'URL вебхука',
    'webhook_url_description' => 'Скопируйте этот URL и добавьте его в настройках магазина ЮКассы',
    'webhook_instructions' => 'Инструкции по настройке',
    'webhook_instruction_1' => 'Войдите в личный кабинет ЮКассы',
    'webhook_instruction_2' => 'Перейдите в настройки магазина',
    'webhook_instruction_3' => 'Добавьте URL вебхука в поле "HTTP-уведомления"',
    'webhook_instruction_4' => 'Выберите события: payment.succeeded, payment.canceled',
    'webhook_instruction_5' => 'Сохраните настройки',
    
    // Recent payments section
    'recent_payments' => 'Последние платежи',
    'view_all_payments' => 'Все платежи',
    'no_payments_yet' => 'Платежей пока нет',
    'user' => 'Пользователь',
    'amount' => 'Сумма',
    'status' => 'Статус',
    'payment_method' => 'Способ оплаты',
    'date' => 'Дата',
    
    // Payment statuses
    'status_pending' => 'Ожидание',
    'status_processing' => 'Обработка',
    'status_succeeded' => 'Выполнен',
    'status_canceled' => 'Отменен',
    'status_failed' => 'Ошибка',
    
    // Validation messages
    'shop_id_required' => 'Идентификатор магазина обязателен',
    'shop_id_invalid' => 'Неверный формат идентификатора магазина',
    'secret_key_required' => 'Секретный ключ обязателен',
    'secret_key_too_short' => 'Секретный ключ должен содержать минимум 20 символов',
    'min_amount_required' => 'Минимальная сумма обязательна',
    'min_amount_invalid' => 'Минимальная сумма должна быть больше 0',
    
    // Setup instructions
    'setup_instructions' => 'Инструкция по настройке',
    'setup_step_1' => 'Зарегистрируйте аккаунт на yookassa.ru',
    'setup_step_2' => 'Пройдите процесс верификации бизнеса',
    'setup_step_3' => 'Получите идентификатор магазина и секретный ключ',
    'setup_step_4' => 'Введите данные в форме выше',
    'setup_step_5' => 'Нажмите "Проверить подключение"',
    'setup_step_6' => 'Настройте вебхук в личном кабинете ЮКассы',
    'setup_step_7' => 'Включите интеграцию и сохраните настройки',
];
<?php

return [
    'title' => 'Настройки оплаты',
    'yookassa_settings' => 'Настройки ЮКассы',
    'shop_id' => 'Идентификатор магазина',
    'shop_id_placeholder' => 'Например: 123456',
    'secret_key' => 'Секретный ключ',
    'secret_key_placeholder' => 'Введите секретный ключ',
    'enabled' => 'Включить ЮКассу',
    'min_amount' => 'Минимальная сумма',
    'min_amount_placeholder' => '100',
    'currency' => 'Валюта',
    'test_connection' => 'Проверить подключение',
    'connection_success' => 'Подключение успешно',
    'connection_failed' => 'Ошибка подключения',
    'testing_connection' => 'Проверка подключения...',
    'save_settings' => 'Сохранить настройки',
    'saving' => 'Сохранение...',
    'settings_saved' => 'Настройки сохранены успешно',
    'settings_save_failed' => 'Не удалось сохранить настройки',
    
    // Webhook section
    'webhook_configuration' => 'Настройка вебхука',
    'webhook_url' => 'URL вебхука',
    'webhook_url_description' => 'Скопируйте этот URL и добавьте его в настройках магазина ЮКассы',
    'webhook_instructions' => 'Инструкции по настройке',
    'webhook_instruction_1' => 'Войдите в личный кабинет ЮКассы',
    'webhook_instruction_2' => 'Перейдите в настройки магазина',
    'webhook_instruction_3' => 'Добавьте URL вебхука в поле "HTTP-уведомления"',
    'webhook_instruction_4' => 'Выберите события: payment.succeeded, payment.canceled',
    'webhook_instruction_5' => 'Сохраните настройки',
    
    // Recent payments section
    'recent_payments' => 'Последние платежи',
    'view_all_payments' => 'Все платежи',
    'no_payments_yet' => 'Платежей пока нет',
    'user' => 'Пользователь',
    'amount' => 'Сумма',
    'status' => 'Статус',
    'payment_method' => 'Способ оплаты',
    'date' => 'Дата',
    
    // Payment statuses
    'status_pending' => 'Ожидание',
    'status_processing' => 'Обработка',
    'status_succeeded' => 'Выполнен',
    'status_canceled' => 'Отменен',
    'status_failed' => 'Ошибка',
    
    // Validation messages
    'shop_id_required' => 'Идентификатор магазина обязателен',
    'shop_id_invalid' => 'Неверный формат идентификатора магазина',
    'secret_key_required' => 'Секретный ключ обязателен',
    'secret_key_too_short' => 'Секретный ключ должен содержать минимум 20 символов',
    'min_amount_required' => 'Минимальная сумма обязательна',
    'min_amount_invalid' => 'Минимальная сумма должна быть больше 0',
    
    // Setup instructions
    'setup_instructions' => 'Инструкция по настройке',
    'setup_step_1' => 'Зарегистрируйте аккаунт на yookassa.ru',
    'setup_step_2' => 'Пройдите процесс верификации бизнеса',
    'setup_step_3' => 'Получите идентификатор магазина и секретный ключ',
    'setup_step_4' => 'Введите данные в форме выше',
    'setup_step_5' => 'Нажмите "Проверить подключение"',
    'setup_step_6' => 'Настройте вебхук в личном кабинете ЮКассы',
    'setup_step_7' => 'Включите интеграцию и сохраните настройки',
];
