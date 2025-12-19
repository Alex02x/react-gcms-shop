<?php

namespace App\Services;

use App\Models\SystemConfiguration;
use App\Models\User;
use App\Models\YooKassaPayment;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class YooKassaService
{
    private const API_URL = 'https://api.yookassa.ru/v3';

    /**
     * Check if YooKassa is configured and enabled.
     */
    public function isConfigured(): bool
    {
        $shopId = SystemConfiguration::getValue('yookassa_shop_id');
        $secretKey = SystemConfiguration::getValue('yookassa_secret_key');
        $enabled = SystemConfiguration::getValue('yookassa_enabled', false);

        return !empty($shopId) && !empty($secretKey) && $enabled;
    }

    /**
     * Get minimum payment amount.
     */
    public function getMinAmount(): float
    {
        return (float) SystemConfiguration::getValue('yookassa_min_amount', 100);
    }

    /**
     * Get payment currency.
     */
    public function getCurrency(): string
    {
        return SystemConfiguration::getValue('yookassa_currency', 'RUB');
    }

    /**
     * Create a payment in YooKassa.
     */
    public function createPayment(User $user, float $amount, string $returnUrl): ?YooKassaPayment
    {
        if (!$this->isConfigured()) {
            Log::error('YooKassa is not configured');
            return null;
        }

        if ($amount < $this->getMinAmount()) {
            Log::error('Payment amount below minimum', ['amount' => $amount, 'min' => $this->getMinAmount()]);
            return null;
        }

        $idempotencyKey = Str::uuid()->toString();
        $currency = $this->getCurrency();

        try {
            // Create payment request to YooKassa
            $response = $this->makeApiRequest('POST', '/payments', [
                'amount' => [
                    'value' => number_format($amount, 2, '.', ''),
                    'currency' => $currency,
                ],
                'confirmation' => [
                    'type' => 'redirect',
                    'return_url' => $returnUrl,
                ],
                'capture' => true,
                'description' => "Пополнение баланса пользователем {$user->email}",
                'metadata' => [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                ],
            ], $idempotencyKey);

            if (!$response->successful()) {
                Log::error('YooKassa API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            $data = $response->json();

            // Create local payment record
            $payment = YooKassaPayment::create([
                'user_id' => $user->id,
                'yookassa_payment_id' => $data['id'],
                'amount' => $amount,
                'currency' => $currency,
                'status' => 'pending',
                'confirmation_url' => $data['confirmation']['confirmation_url'] ?? null,
                'return_url' => $returnUrl,
                'idempotency_key' => $idempotencyKey,
                'yookassa_response' => $data,
                'metadata' => [
                    'user_email' => $user->email,
                    'created_via' => 'web',
                ],
            ]);

            Log::info('YooKassa payment created', [
                'payment_id' => $payment->id,
                'yookassa_payment_id' => $data['id'],
                'user_id' => $user->id,
                'amount' => $amount,
            ]);

            return $payment;

        } catch (\Exception $e) {
            Log::error('Failed to create YooKassa payment', [
                'user_id' => $user->id,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get payment status from YooKassa API.
     */
    public function getPaymentStatus(string $yookassaPaymentId): ?array
    {
        try {
            $response = $this->makeApiRequest('GET', "/payments/{$yookassaPaymentId}");

            if (!$response->successful()) {
                Log::error('Failed to get payment status', [
                    'yookassa_payment_id' => $yookassaPaymentId,
                    'status' => $response->status(),
                ]);
                return null;
            }

            return $response->json();

        } catch (\Exception $e) {
            Log::error('Exception getting payment status', [
                'yookassa_payment_id' => $yookassaPaymentId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Validate webhook request from YooKassa.
     */
    public function validateWebhook(string $requestBody): bool
    {
        // Basic validation - check if it's valid JSON
        $data = json_decode($requestBody, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('Invalid webhook JSON', ['error' => json_last_error_msg()]);
            return false;
        }

        // Check if required fields are present
        if (!isset($data['event']) || !isset($data['object'])) {
            Log::warning('Missing required webhook fields');
            return false;
        }

        return true;
    }

    /**
     * Parse webhook payload and extract payment data.
     */
    public function parseWebhookPayload(array $data): ?array
    {
        if (!isset($data['object']) || !isset($data['object']['id'])) {
            return null;
        }

        $paymentData = $data['object'];

        return [
            'yookassa_payment_id' => $paymentData['id'],
            'status' => $paymentData['status'],
            'paid' => $paymentData['paid'] ?? false,
            'amount' => $paymentData['amount']['value'] ?? null,
            'currency' => $paymentData['amount']['currency'] ?? null,
            'payment_method_type' => $paymentData['payment_method']['type'] ?? null,
            'captured_at' => $paymentData['captured_at'] ?? null,
            'full_data' => $paymentData,
        ];
    }

    /**
     * Process webhook and update payment status.
     */
    public function processWebhook(array $webhookData): bool
    {
        $parsedData = $this->parseWebhookPayload($webhookData);

        if (!$parsedData) {
            Log::warning('Failed to parse webhook payload');
            return false;
        }

        $payment = YooKassaPayment::where('yookassa_payment_id', $parsedData['yookassa_payment_id'])->first();

        if (!$payment) {
            Log::warning('Payment not found for webhook', [
                'yookassa_payment_id' => $parsedData['yookassa_payment_id'],
            ]);
            // Return true to prevent YooKassa from retrying
            return true;
        }

        // Skip if payment is already in final state
        if ($payment->isFinal()) {
            Log::info('Payment already in final state', [
                'payment_id' => $payment->id,
                'status' => $payment->status,
            ]);
            return true;
        }

        try {
            \DB::beginTransaction();

            $status = $parsedData['status'];

            // Update payment status
            $updateData = [
                'status' => $status,
                'payment_method_type' => $parsedData['payment_method_type'],
                'yookassa_response' => $parsedData['full_data'],
            ];

            if ($status === 'succeeded' && $parsedData['paid']) {
                $updateData['paid_at'] = now();

                // Credit user wallet
                $user = $payment->user;
                $amountInCents = (int) ($payment->amount * 100);

                $transaction = $user->deposit($amountInCents, [
                    'source' => 'yookassa',
                    'yookassa_payment_id' => $payment->yookassa_payment_id,
                    'payment_method' => $parsedData['payment_method_type'],
                    'description' => 'Пополнение баланса через ЮКассу',
                ]);

                Log::info('Wallet credited via YooKassa', [
                    'payment_id' => $payment->id,
                    'user_id' => $user->id,
                    'amount' => $payment->amount,
                    'transaction_id' => $transaction->id,
                ]);
            }

            $payment->update($updateData);

            \DB::commit();

            Log::info('Webhook processed successfully', [
                'payment_id' => $payment->id,
                'status' => $status,
            ]);

            return true;

        } catch (\Exception $e) {
            \DB::rollBack();

            Log::error('Failed to process webhook', [
                'payment_id' => $payment->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Return false to trigger YooKassa retry
            return false;
        }
    }

    /**
     * Test connection to YooKassa API.
     */
    public function testConnection(): array
    {
        try {
            // Try to get a non-existent payment to test authentication
            $response = $this->makeApiRequest('GET', '/payments/test-connection-check');

            // Even a 404 means authentication worked
            if ($response->status() === 404) {
                return [
                    'success' => true,
                    'message' => 'Connection successful. Credentials are valid.',
                ];
            }

            if ($response->status() === 401) {
                return [
                    'success' => false,
                    'message' => 'Authentication failed. Please check your Shop ID and Secret Key.',
                ];
            }

            return [
                'success' => true,
                'message' => 'Connection successful.',
            ];

        } catch (\Exception $e) {
            Log::error('YooKassa connection test failed', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Make an API request to YooKassa.
     */
    private function makeApiRequest(string $method, string $endpoint, array $data = [], ?string $idempotencyKey = null): Response
    {
        $shopId = SystemConfiguration::getValue('yookassa_shop_id');
        $secretKey = SystemConfiguration::getValue('yookassa_secret_key');

        $url = self::API_URL . $endpoint;

        $headers = [
            'Content-Type' => 'application/json',
        ];

        if ($idempotencyKey) {
            $headers['Idempotence-Key'] = $idempotencyKey;
        }

        $request = Http::withBasicAuth($shopId, $secretKey)
            ->withHeaders($headers)
            ->timeout(30);

        return match (strtoupper($method)) {
            'GET' => $request->get($url),
            'POST' => $request->post($url, $data),
            default => throw new \InvalidArgumentException("Unsupported HTTP method: {$method}"),
        };
    }
}
