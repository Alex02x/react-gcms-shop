<?php

namespace App\Http\Controllers;

use App\Models\YooKassaPayment;
use App\Services\YooKassaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    protected YooKassaService $yookassaService;

    public function __construct(YooKassaService $yookassaService)
    {
        $this->yookassaService = $yookassaService;
    }

    /**
     * Initiate top-up payment.
     */
    public function initiateTopUp(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Check if YooKassa is configured
        if (!$this->yookassaService->isConfigured()) {
            return response()->json([
                'success' => false,
                'error' => __('wallet.yookassa.not_configured', default: 'Payment system is temporarily unavailable'),
                'error_code' => 'yookassa_disabled',
            ], 503);
        }

        $minAmount = $this->yookassaService->getMinAmount();

        // Validate request
        $validator = Validator::make($request->all(), [
            'amount' => [
                'required',
                'numeric',
                'min:' . $minAmount,
                'max:1000000',
            ],
        ], [
            'amount.min' => __('wallet.yookassa.min_amount', ['amount' => $minAmount]),
            'amount.max' => 'Maximum top-up amount is 1,000,000 ₽',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
                'error_code' => 'validation_failed',
            ], 422);
        }

        $amount = (float) $request->input('amount');
        $returnUrl = route('wallet.top-up.callback');

        // Create payment
        $payment = $this->yookassaService->createPayment($user, $amount, $returnUrl);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'error' => 'Unable to create payment. Please try again.',
                'error_code' => 'payment_creation_failed',
            ], 500);
        }

        Log::info('Payment initiated', [
            'user_id' => $user->id,
            'payment_id' => $payment->id,
            'amount' => $amount,
        ]);

        return response()->json([
            'success' => true,
            'payment_id' => $payment->id,
            'confirmation_url' => $payment->confirmation_url,
            'message' => __('wallet.yookassa.redirect'),
        ]);
    }

    /**
     * Handle callback from YooKassa payment page.
     */
    public function callback(Request $request): Response
    {
        $user = Auth::user();

        // Get the most recent payment for this user
        $payment = YooKassaPayment::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->first();

        return Inertia::render('wallet', [
            'auth' => [
                'user' => $user->load('wallet'),
            ],
            'flash' => [
                'payment_return' => true,
                'payment_id' => $payment?->id,
            ],
        ]);
    }

    /**
     * Get user's payment history.
     */
    public function history(Request $request): JsonResponse
    {
        $user = Auth::user();

        $perPage = min($request->input('per_page', 15), 50);

        $query = YooKassaPayment::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->paginate($perPage);

        $data = $payments->map(function ($payment) {
            return [
                'id' => $payment->id,
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
     * Webhook endpoint for YooKassa notifications.
     */
    public function webhook(Request $request): JsonResponse
    {
        $requestBody = $request->getContent();

        Log::info('YooKassa webhook received', [
            'ip' => $request->ip(),
            'body_length' => strlen($requestBody),
        ]);

        // Validate webhook
        if (!$this->yookassaService->validateWebhook($requestBody)) {
            Log::warning('Invalid webhook received');
            return response()->json(['error' => 'Invalid webhook'], 400);
        }

        $data = json_decode($requestBody, true);

        // Process webhook
        $success = $this->yookassaService->processWebhook($data);

        if (!$success) {
            return response()->json(['error' => 'Processing failed'], 500);
        }

        return response()->json(['success' => true]);
    }
}
