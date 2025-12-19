<?php

namespace App\Services;

use App\Models\LoginToken;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationCodeMail;

class MagicLinkService
{
    /**
     * Token expiration time in minutes.
     */
    private const TOKEN_EXPIRATION_MINUTES = 10;

    /**
     * Generate a cryptographically secure 6-digit code.
     */
    private function generateSecureCode(): string
    {
        return str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Send verification code to user's email.
     */
    public function sendVerificationCode(string $email): array
    {
        // Normalize email
        $email = strtolower(trim($email));

        DB::beginTransaction();

        try {
            // Find or create user
            $isNewUser = !User::where('email', $email)->exists();

            $user = User::firstOrCreate(
                ['email' => $email],
                ['name' => explode('@', $email)[0]]
            );

            // Fire Registered event for new users
            if ($isNewUser) {
                event(new Registered($user));
            }

            // Invalidate any existing unused tokens for this user
            LoginToken::where('user_id', $user->id)
                ->whereNull('used_at')
                ->update(['used_at' => now()]);

            // Generate new token
            $code = $this->generateSecureCode();
            $expiresAt = now()->addMinutes(self::TOKEN_EXPIRATION_MINUTES);

            $token = LoginToken::create([
                'user_id' => $user->id,
                'token' => $code,
                'expires_at' => $expiresAt,
            ]);

            // Send email
            Mail::to($user->email)->queue(new VerificationCodeMail($code));

            DB::commit();

            return [
                'success' => true,
                'message' => 'Verification code sent successfully',
                'email' => $user->email,
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to send verification code', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Verify the code and authenticate the user.
     */
    public function verifyCode(string $email, string $code): ?User
    {
        // Normalize email
        $email = strtolower(trim($email));

        // Find user
        $user = User::where('email', $email)->first();

        if (!$user) {
            return null;
        }

        // Find valid token
        $token = LoginToken::where('user_id', $user->id)
            ->where('token', $code)
            ->valid()
            ->latest()
            ->first();

        if (!$token) {
            Log::warning('Invalid verification code attempt', [
                'email' => $email,
            ]);
            return null;
        }

        // Mark token as used
        $token->markAsUsed();

        // Update user's email verification status
        if (!$user->email_verified_at) {
            $user->update(['email_verified_at' => now()]);
        }

        return $user;
    }

    /**
     * Clean up expired and used tokens.
     */
    public function cleanupTokens(): int
    {
        return LoginToken::where(function ($query) {
            $query->where('expires_at', '<', now())
                ->orWhere('used_at', '<', now()->subHours(24));
        })->delete();
    }
}
