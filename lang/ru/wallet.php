<?php

return [
    // Wallet
    'balance' => 'Баланс',
    'wallet' => 'Кошелёк',
    'my_wallet' => 'Мой кошелёк',
    'current_balance' => 'Текущий баланс',

    // Transactions
    'transaction' => 'Транзакция',
    'transactions' => 'Транзакции',
    'transaction_history' => 'История транзакций',
    'transaction_type' => 'Тип транзакции',
    'transaction_date' => 'Дата транзакции',
    'transaction_amount' => 'Сумма',
    'transaction_description' => 'Описание',
    'no_transactions' => 'Транзакции не найдены',

    // Transaction types
    'deposit' => 'Пополнение',
    'withdraw' => 'Вывод',
    'withdrawal' => 'Вывод средств',
    'payment' => 'Платёж',
    'refund' => 'Возврат',
    'purchase' => 'Покупка',

    // Actions
    'add_funds' => 'Пополнить',
    'withdraw_funds' => 'Вывести средства',
    'top_up' => 'Пополнить баланс',

    // Messages
    'insufficient_balance' => 'Недостаточно средств',
    'insufficient_funds' => 'Недостаточно средств для совершения покупки',
    'deposit_success' => 'Пополнение выполнено успешно',
    'withdrawal_success' => 'Вывод выполнен успешно',
    'payment_success' => 'Платёж выполнен успешно',
    'payment_failed' => 'Платёж не выполнен',

    // Amounts
    'amount' => 'Сумма',
    'enter_amount' => 'Введите сумму',
    'minimum_amount' => 'Минимальная сумма',
    'maximum_amount' => 'Максимальная сумма',

    // Top-up success modal
    'top_up_success_title' => 'Пополнение начато',
    'top_up_success_description' => 'Вы будете перенаправлены на страницу оплаты для завершения пополнения на :amount ₽ через :method.',

    // YooKassa integration
    'yookassa' => [
        'title' => 'Пополнение через ЮКассу',
        'description' => 'Пополните баланс банковской картой, СБП или электронными кошельками',
        'min_amount' => 'Минимальная сумма пополнения: :amount ₽',
        'processing' => 'Обработка платежа...',
        'redirect' => 'Сейчас вы будете перенаправлены на страницу оплаты',
        'success' => 'Баланс успешно пополнен на :amount ₽',
        'pending' => 'Платеж ожидает подтверждения',
        'failed' => 'Не удалось выполнить платеж',
        'canceled' => 'Платеж был отменен',
        'not_configured' => 'Система оплаты временно недоступна',
    ],
];
