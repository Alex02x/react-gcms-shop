<?php

namespace App\Console\Commands;

use App\Models\SystemConfiguration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class TelegramDebug extends Command
{
    protected $signature = 'telegram:debug {user_id?}';
    protected $description = 'Debug Telegram subscription status';

    public function handle()
    {
        $botToken = SystemConfiguration::getBotToken();
        $channelId = SystemConfiguration::getChannelId();

        if (!$botToken) {
            $this->error('Bot token not configured');
            return 1;
        }

        if (!$channelId) {
            $this->error('Channel ID not configured');
            return 1;
        }

        $this->info('=== Telegram Configuration ===');
        $this->line("Channel ID: {$channelId}");
        $this->line('');

        // Test bot connection
        $this->info('Testing bot connection...');
        try {
            $response = Http::get("https://api.telegram.org/bot{$botToken}/getMe");
            $data = $response->json();
            
            if ($data['ok'] ?? false) {
                $bot = $data['result'];
                $this->info("✅ Bot connected: @{$bot['username']}");
            } else {
                $this->error('❌ Bot connection failed');
                return 1;
            }
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }

        // Check if user provided
        $userId = $this->argument('user_id');
        if (!$userId) {
            $this->warn('No user ID provided. Provide user ID to check subscription.');
            $this->info('Usage: php artisan telegram:debug <user_id>');
            return 0;
        }

        $user = \App\Models\User::find($userId);
        if (!$user) {
            $this->error("User {$userId} not found");
            return 1;
        }

        $this->line('');
        $this->info('=== User Information ===');
        $this->line("User ID: {$user->id}");
        $this->line("Email: {$user->email}");
        $this->line("Telegram ID: " . ($user->telegram_user_id ?? 'NOT LINKED'));
        $this->line("Telegram Username: " . ($user->telegram_username ?? 'N/A'));
        $this->line('');

        if (!$user->telegram_user_id) {
            $this->warn('User has not linked Telegram account');
            return 0;
        }

        // Clear cache
        $cacheKey = "telegram_membership_{$user->telegram_user_id}_{$channelId}";
        Cache::forget($cacheKey);
        $this->info('Cache cleared');
        $this->line('');

        // Check channel membership
        $this->info('Checking channel membership...');
        try {
            $response = Http::post(
                "https://api.telegram.org/bot{$botToken}/getChatMember",
                [
                    'chat_id' => $channelId,
                    'user_id' => $user->telegram_user_id,
                ]
            );

            $data = $response->json();

            $this->line('');
            $this->info('=== API Response ===');
            $this->line(json_encode($data, JSON_PRETTY_PRINT));
            $this->line('');

            if ($data['ok'] ?? false) {
                $status = $data['result']['status'] ?? 'unknown';
                $this->info("Status: {$status}");
                
                $validStatuses = ['creator', 'administrator', 'member', 'restricted'];
                if (in_array($status, $validStatuses)) {
                    $this->info('✅ User IS subscribed to the channel');
                } else {
                    $this->warn("❌ User is NOT subscribed (status: {$status})");
                }
            } else {
                $this->error('❌ API Error: ' . ($data['description'] ?? 'Unknown error'));
                $this->line('');
                $this->warn('Common issues:');
                $this->line('1. Bot is not an administrator in the channel');
                $this->line('2. Channel ID is incorrect');
                $this->line('3. Channel is private and bot cannot access it');
            }

        } catch (\Exception $e) {
            $this->error('Exception: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
