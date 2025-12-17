<?php

namespace App\Http\Controllers;

use App\Services\MagicLinkService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private MagicLinkService $magicLinkService
    ) {}

    /**
     * Send verification code to user's email.
     */
    public function sendCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = $request->input('email');
        $key = 'send-code:' . $email;

        // Rate limiting: 5 requests per minute per email
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'success' => false,
                'message' => 'Too many attempts. Please try again later.',
                'retry_after' => $seconds,
            ], 429);
        }

        RateLimiter::hit($key, 60);

        try {
            $result = $this->magicLinkService->sendVerificationCode($email);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code. Please try again later.',
            ], 500);
        }
    }

    /**
     * Verify code and authenticate user.
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'code' => 'required|string|size:6|regex:/^[0-9]{6}$/',
        ]);

        $email = $request->input('email');
        $code = $request->input('code');
        $key = 'verify-code:' . $email;

        // Rate limiting: 10 requests per minute per email
        if (RateLimiter::tooManyAttempts($key, 10)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'success' => false,
                'message' => 'Too many attempts. Please try again later.',
                'retry_after' => $seconds,
            ], 429);
        }

        RateLimiter::hit($key, 60);

        $user = $this->magicLinkService->verifyCode($email, $code);

        if (!$user) {
            // Track failed attempts for progressive lockout
            $failedKey = 'verify-failed:' . $email;
            RateLimiter::hit($failedKey, 900); // 15 minutes

            if (RateLimiter::tooManyAttempts($failedKey, 5)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many failed attempts. Please request a new code.',
                ], 401);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired code. Please request a new one.',
            ], 401);
        }

        // Clear failed attempts on success
        RateLimiter::clear('verify-failed:' . $email);

        // Authenticate user
        Auth::login($user, true);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    /**
     * Get currently authenticated user.
     */
    public function user(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'avatar' => $user->avatar,
            'email_verified_at' => $user->email_verified_at,
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }
}
