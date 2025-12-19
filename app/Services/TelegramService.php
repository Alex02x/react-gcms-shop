<?php

namespace App\Services;

use App\Models\SystemConfiguration;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TelegramService
{
    protected string $apiUrl = 'https://api.telegram.org/bot';

    /**
     * Verify if user is a member of the configured channel.
     */
    public function verifyChannelMembership(int $telegramUserId): bool
    {
        $channelId = SystemConfiguration::getChannelId();
        $botToken = SystemConfiguration::getBotToken();

        if (!$botToken || !$channelId) {
            Log::error('Telegram: Configuration missing', [
                'bot_token_exists' => !empty($botToken),
                'channel_id_exists' => !empty($channelId),
            ]);
            return false;
        }

        // Check cache first
        $cacheKey = "telegram_membership_{$telegramUserId}_{$channelId}";
        $cached = Cache::get($cacheKey);

        if ($cached !== null) {
            return $cached;
        }

        try {
            $response = Http::timeout(10)
                ->retry(1, 100)
                ->post("{$this->apiUrl}{$botToken}/getChatMember", [
                    'chat_id' => $channelId,
                    'user_id' => $telegramUserId,
                ]);

            if (!$response->successful()) {
                Log::warning('Telegram API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'telegram_user_id' => $telegramUserId,
                ]);
                return false;
            }

            $data = $response->json();

            if (!isset($data['ok']) || !$data['ok']) {
                Log::warning('Telegram API returned not ok', [
                    'data' => $data,
                    'telegram_user_id' => $telegramUserId,
                ]);
                return false;
            }

            $status = $data['result']['status'] ?? 'left';
            $isSubscribed = in_array($status, ['creator', 'administrator', 'member', 'restricted']);

            // Cache result for 5 minutes
            Cache::put($cacheKey, $isSubscribed, 300);

            Log::info('Telegram subscription verified', [
                'telegram_user_id' => $telegramUserId,
                'status' => $status,
                'is_subscribed' => $isSubscribed,
            ]);

            return $isSubscribed;

        } catch (\Exception $e) {
            Log::error('Telegram API exception', [
                'error' => $e->getMessage(),
                'telegram_user_id' => $telegramUserId,
            ]);
            return false;
        }
    }

    /**
     * Send message to a Telegram user.
     */
    public function sendMessage(int $chatId, string $message): bool
    {
        $botToken = SystemConfiguration::getBotToken();

        if (!$botToken) {
            Log::error('Telegram: Bot token missing');
            return false;
        }

        try {
            $response = Http::timeout(10)
                ->post("{$this->apiUrl}{$botToken}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => $message,
                    'parse_mode' => 'HTML',
                ]);

            return $response->successful();

        } catch (\Exception $e) {
            Log::error('Telegram sendMessage exception', [
                'error' => $e->getMessage(),
                'chat_id' => $chatId,
            ]);
            return false;
        }
    }

    /**
     * Validate bot token by calling getMe endpoint.
     */
    public function validateBotToken(string $token): array
    {
        try {
            $response = Http::timeout(10)
                ->get("{$this->apiUrl}{$token}/getMe");

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'error' => 'Invalid bot token or API error',
                ];
            }

            $data = $response->json();

            if (!isset($data['ok']) || !$data['ok']) {
                return [
                    'success' => false,
                    'error' => 'Bot token validation failed',
                ];
            }

            return [
                'success' => true,
                'bot' => $data['result'],
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate a unique verification token for user.
     */
    public function generateVerificationToken(int $userId): string
    {
        $token = Str::random(12) . '-' . $userId;
        $cacheKey = "telegram_verification_{$token}";

        // Store token with 15-minute expiration
        Cache::put($cacheKey, [
            'user_id' => $userId,
            'created_at' => now(),
        ], 900); // 15 minutes

        return $token;
    }

    /**
     * Process verification message from Telegram webhook.
     */
    public function processVerificationMessage(array $telegramUpdate): bool
    {
        try {
            // Extract message data
            $message = $telegramUpdate['message'] ?? null;

            if (!$message) {
                return false;
            }

            $text = $message['text'] ?? '';
            $from = $message['from'] ?? null;

            if (!$from) {
                return false;
            }

            $telegramUserId = $from['id'];
            $telegramUsername = $from['username'] ?? null;

            // Check if text is a verification token
            if (!Str::contains($text, '-')) {
                return false;
            }

            $cacheKey = "telegram_verification_{$text}";
            $tokenData = Cache::get($cacheKey);

            if (!$tokenData) {
                // Token not found or expired
                $this->sendMessage($telegramUserId, '❌ Неверный код.');
                return false;
            }

            // Extract user ID from token
            $userId = $tokenData['user_id'];

            // Find user and update Telegram info
            $user = User::find($userId);

            if (!$user) {
                $this->sendMessage($telegramUserId, '❌ Пользователь не найден. Попробуйте снова.');
                return false;
            }

            // Check if this Telegram account is already linked to another user
            $existingUser = User::where('telegram_user_id', $telegramUserId)
                ->where('id', '!=', $userId)
                ->first();

            if ($existingUser) {
                $this->sendMessage(
                    $telegramUserId,
                    "❌ Этот телеграм уже подключен к другому аккаунту.\n\n"
                    . "Пожалуйста отвяжите его перед тем как подключать снова."
                );
                return false;
            }

            // Update user with Telegram information
            $user->update([
                'telegram_user_id' => $telegramUserId,
                'telegram_username' => $telegramUsername,
                'telegram_linked_at' => now(),
            ]);

            // Delete token from cache
            Cache::forget($cacheKey);

            // Send confirmation message
            $confirmationMessage = "✅ Ваш аккаунт успешно подключен!\n\n";
            $confirmationMessage .= "Username: " . ($telegramUsername ? "@{$telegramUsername}" : "N/A") . "\n";
            $confirmationMessage .= "Теперь вы можете скачивать бесплатные товары.";

            $this->sendMessage($telegramUserId, $confirmationMessage);

            Log::info('Telegram account linked', [
                'user_id' => $userId,
                'telegram_user_id' => $telegramUserId,
                'telegram_username' => $telegramUsername,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Telegram verification processing failed', [
                'error' => $e->getMessage(),
                'update' => $telegramUpdate,
            ]);
            return false;
        }
    }

    /**
     * Get bot username for display purposes.
     */
    public function getBotUsername(): ?string
    {
        $botToken = SystemConfiguration::getBotToken();

        if (!$botToken) {
            return null;
        }

        $cacheKey = 'telegram_bot_username';

        return Cache::remember($cacheKey, 3600, function () use ($botToken) {
            $result = $this->validateBotToken($botToken);

            if ($result['success']) {
                return $result['bot']['username'] ?? null;
            }

            return null;
        });
    }
}
