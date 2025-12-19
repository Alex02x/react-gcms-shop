<?php

return [
    // Wallet
    'balance' => 'Balance',
    'wallet' => 'Wallet',
    'my_wallet' => 'My Wallet',
    'current_balance' => 'Current Balance',

    // Transactions
    'transaction' => 'Transaction',
    'transactions' => 'Transactions',
    'transaction_history' => 'Transaction History',
    'transaction_type' => 'Transaction Type',
    'transaction_date' => 'Transaction Date',
    'transaction_amount' => 'Amount',
    'transaction_description' => 'Description',
    'no_transactions' => 'No transactions found',

    // Transaction types
    'deposit' => 'Deposit',
    'withdraw' => 'Withdraw',
    'withdrawal' => 'Withdrawal',
    'payment' => 'Payment',
    'refund' => 'Refund',
    'purchase' => 'Purchase',

    // Actions
    'add_funds' => 'Add Funds',
    'withdraw_funds' => 'Withdraw Funds',
    'top_up' => 'Top Up',

    // Messages
    'insufficient_balance' => 'Insufficient balance',
    'insufficient_funds' => 'Insufficient funds to complete this purchase',
    'deposit_success' => 'Deposit successful',
    'withdrawal_success' => 'Withdrawal successful',
    'payment_success' => 'Payment successful',
    'payment_failed' => 'Payment failed',

    // Amounts
    'amount' => 'Amount',
    'enter_amount' => 'Enter amount',
    'minimum_amount' => 'Minimum amount',
    'maximum_amount' => 'Maximum amount',

    // Top-up success modal
    'top_up_success_title' => 'Top-Up Initiated',
    'top_up_success_description' => 'You will be redirected to the payment page to complete your :amount ₽ top-up via :method.',

    // YooKassa integration
    'yookassa' => [
        'title' => 'Top Up via YooKassa',
        'description' => 'Top up your balance using bank cards, SBP, or e-wallets',
        'min_amount' => 'Minimum top-up amount: :amount ₽',
        'processing' => 'Processing payment...',
        'redirect' => 'You will be redirected to the payment page',
        'success' => 'Balance topped up by :amount ₽',
        'pending' => 'Payment is pending confirmation',
        'failed' => 'Payment could not be processed',
        'canceled' => 'Payment was canceled',
        'not_configured' => 'Payment system is temporarily unavailable',
    ],
];
