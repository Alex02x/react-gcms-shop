<?php

namespace App\Console\Commands;

use App\Models\SystemConfiguration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SetTelegramWebhook extends Command
{
    protected $signature = 'telegram:set-webhook {url?}';
    protected $description = 'Set the webhook URL for Telegram bot';

    public function handle()
    {
        $botToken = SystemConfiguration::getBotToken();

        if (!$botToken) {
            $this->error('Telegram bot token is not configured.');
            $this->info('Please configure it in /admin/telegram/settings');
            return 1;
        }

        $webhookUrl = $this->argument('url') ?? url('/api/telegram/webhook');

        $this->info("Setting webhook to: {$webhookUrl}");

        try {
            $response = Http::timeout(10)->post(
                "https://api.telegram.org/bot{$botToken}/setWebhook",
                [
                    'url' => $webhookUrl,
                    'drop_pending_updates' => true,
                ]
            );

            $data = $response->json();

            if ($data['ok'] ?? false) {
                $this->info('✅ Webhook set successfully!');
                $this->line('');
                $this->line('Webhook URL: ' . $webhookUrl);
                
                $infoResponse = Http::timeout(10)->get(
                    "https://api.telegram.org/bot{$botToken}/getWebhookInfo"
                );
                
                $webhookInfo = $infoResponse->json()['result'] ?? [];
                
                if (!empty($webhookInfo)) {
                    $this->line('');
                    $this->info('Current webhook status:');
                    $this->table(
                        ['Property', 'Value'],
                        [
                            ['URL', $webhookInfo['url'] ?? 'N/A'],
                            ['Pending Updates', $webhookInfo['pending_update_count'] ?? 0],
                            ['Last Error', $webhookInfo['last_error_message'] ?? 'None'],
                        ]
                    );
                }
                
                return 0;
            } else {
                $this->error('Failed to set webhook: ' . ($data['description'] ?? 'Unknown error'));
                return 1;
            }

        } catch (\Exception $e) {
            $this->error('Error setting webhook: ' . $e->getMessage());
            return 1;
        }
    }
}
