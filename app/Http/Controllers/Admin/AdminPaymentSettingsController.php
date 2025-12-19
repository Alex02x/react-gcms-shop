<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemConfiguration;
use App\Models\YooKassaPayment;
use App\Services\YooKassaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class AdminPaymentSettingsController extends Controller
{
    protected YooKassaService $yookassaService;

    public function __construct(YooKassaService $yookassaService)
    {
        $this->yookassaService = $yookassaService;
    }

    /**
     * Display payment settings page.
     */
    public function index(): Response
    {
        // Get current settings (mask secret key)
        $shopId = SystemConfiguration::getValue('yookassa_shop_id', '');
        $secretKey = SystemConfiguration::getValue('yookassa_secret_key');
        $enabled = SystemConfiguration::getValue('yookassa_enabled', false);
        $minAmount = SystemConfiguration::getValue('yookassa_min_amount', 100);
        $currency = SystemConfiguration::getValue('yookassa_currency', 'RUB');

        // Get recent payments
        $recentPayments = YooKassaPayment::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'user_name' => $payment->user->name,
                    'user_email' => $payment->user->email,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => $payment->status,
                    'payment_method_type' => $payment->payment_method_type,
                    'created_at' => $payment->created_at->format('d.m.Y H:i'),
                    'formatted_amount' => number_format($payment->amount, 2) . ' ₽',
                ];
            });

        $settings = [
            'shop_id' => $shopId,
            'secret_key' => $secretKey ? '••••••••••••' : '',
            'secret_key_set' => !empty($secretKey),
            'enabled' => $enabled,
            'min_amount' => $minAmount,
            'currency' => $currency,
            'is_configured' => $this->yookassaService->isConfigured(),
        ];

        return Inertia::render('admin/payment-settings', [
            'settings' => $settings,
            'recentPayments' => $recentPayments,
            'webhookUrl' => route('payment.webhook'),
        ]);
    }

    /**
     * Update payment settings.
     */
    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'shop_id' => 'required|string|min:5|max:20',
            'secret_key' => 'nullable|string|min:20',
            'enabled' => 'required|boolean',
            'min_amount' => 'required|numeric|min:1',
            'currency' => 'required|string|size:3',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Update Shop ID
            SystemConfiguration::setValue('yookassa_shop_id', $request->shop_id, true);

            // Update Secret Key if provided
            if ($request->filled('secret_key') && $request->secret_key !== '••••••••••••') {
                SystemConfiguration::setValue('yookassa_secret_key', $request->secret_key, true);
            }

            // Update other settings
            SystemConfiguration::setValue('yookassa_enabled', $request->enabled ? '1' : '0');
            SystemConfiguration::setValue('yookassa_min_amount', $request->min_amount);
            SystemConfiguration::setValue('yookassa_currency', $request->currency);

            return response()->json([
                'success' => true,
                'message' => 'Payment settings saved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to save settings: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test connection to YooKassa API.
     */
    public function testConnection(): JsonResponse
    {
        $result = $this->yookassaService->testConnection();

        return response()->json($result);
    }

    /**
     * Get all payments for admin view.
     */
    public function payments(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 25), 100);

        $query = YooKassaPayment::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $payments = $query->paginate($perPage);

        $data = $payments->map(function ($payment) {
            return [
                'id' => $payment->id,
                'user_id' => $payment->user_id,
                'user_name' => $payment->user->name,
                'user_email' => $payment->user->email,
                'yookassa_payment_id' => $payment->yookassa_payment_id,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status,
                'payment_method_type' => $payment->payment_method_type,
                'created_at' => $payment->created_at->toISOString(),
                'paid_at' => $payment->paid_at?->toISOString(),
                'formatted_amount' => number_format($payment->amount, 2) . ' ₽',
                'formatted_date' => $payment->created_at->format('d.m.Y H:i'),
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    /**
     * Get current settings (API endpoint).
     */
    public function getSettings(): JsonResponse
    {
        $settings = [
            'shop_id' => SystemConfiguration::getValue('yookassa_shop_id', ''),
            'secret_key_set' => !empty(SystemConfiguration::getValue('yookassa_secret_key')),
            'enabled' => SystemConfiguration::getValue('yookassa_enabled', false),
            'min_amount' => SystemConfiguration::getValue('yookassa_min_amount', 100),
            'currency' => SystemConfiguration::getValue('yookassa_currency', 'RUB'),
            'is_configured' => $this->yookassaService->isConfigured(),
        ];

        return response()->json($settings);
    }
}
