<?php

namespace App\Http\Controllers;

use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class TelegramController extends Controller
{
    protected TelegramService $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    /**
     * Generate verification token for linking Telegram account.
     */
    public function generateToken(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Rate limiting: 5 requests per minute per user
        $key = 'telegram-token-' . $user->id;
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            
            return response()->json([
                'success' => false,
                'error' => "Too many requests. Please try again in {$seconds} seconds.",
            ], 429);
        }

        RateLimiter::hit($key, 60);

        $token = $this->telegramService->generateVerificationToken($user->id);
        $botUsername = $this->telegramService->getBotUsername();

        return response()->json([
            'success' => true,
            'token' => $token,
            'bot_username' => $botUsername,
            'bot_link' => $botUsername ? "https://t.me/{$botUsername}" : null,
            'expires_in' => 900, // 15 minutes
        ]);
    }

    /**
     * Check if user's Telegram account is linked.
     */
    public function checkStatus(Request $request): JsonResponse
    {
        $user = Auth::user();

        return response()->json([
            'linked' => $user->hasTelegramLinked(),
            'telegram_username' => $user->telegram_username,
            'telegram_linked_at' => $user->telegram_linked_at?->toISOString(),
        ]);
    }

    /**
     * Unlink Telegram account.
     */
    public function unlink(Request $request): JsonResponse
    {
        $user = Auth::user();

        $user->update([
            'telegram_user_id' => null,
            'telegram_username' => null,
            'telegram_linked_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Telegram account unlinked successfully.',
        ]);
    }

    /**
     * Webhook endpoint to receive messages from Telegram bot.
     */
    public function webhook(Request $request): JsonResponse
    {
        // Get webhook data
        $update = $request->all();

        // Process verification message
        $this->telegramService->processVerificationMessage($update);

        // Always return 200 OK to Telegram
        return response()->json(['ok' => true]);
    }

    /**
     * Verify channel subscription for authenticated user.
     */
    public function verifySubscription(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user->hasTelegramLinked()) {
            return response()->json([
                'subscribed' => false,
                'reason' => 'not_linked',
                'message' => 'Please link your Telegram account first.',
            ]);
        }

        $isSubscribed = $this->telegramService->verifyChannelMembership($user->telegram_user_id);

        return response()->json([
            'subscribed' => $isSubscribed,
            'reason' => $isSubscribed ? null : 'not_subscribed',
            'message' => $isSubscribed 
                ? 'You are subscribed to the channel.' 
                : 'Please subscribe to the Telegram channel to continue.',
        ]);
    }
}
