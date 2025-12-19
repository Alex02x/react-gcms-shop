<?php

namespace App\Console\Commands;

use App\Models\SystemConfiguration;
use App\Services\TelegramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TelegramBotPolling extends Command
{
    protected $signature = 'telegram:polling';
    protected $description = 'Start polling for Telegram bot updates (for local development)';

    protected TelegramService $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        parent::__construct();
        $this->telegramService = $telegramService;
    }

    public function handle()
    {
        $botToken = SystemConfiguration::getBotToken();

        if (!$botToken) {
            $this->error('Telegram bot token is not configured.');
            $this->info('Please configure it in /admin/telegram/settings');
            return 1;
        }

        $this->info('Starting Telegram bot polling...');
        $this->info('Press Ctrl+C to stop');
        $this->line('');

        try {
            Http::timeout(10)->post(
                "https://api.telegram.org/bot{$botToken}/deleteWebhook",
                ['drop_pending_updates' => true]
            );
            $this->info('Webhook removed, polling mode enabled.');
        } catch (\Exception $e) {
            $this->warn('Could not remove webhook: ' . $e->getMessage());
        }

        $offset = 0;
        $errorCount = 0;

        while (true) {
            try {
                $response = Http::timeout(30)->get(
                    "https://api.telegram.org/bot{$botToken}/getUpdates",
                    [
                        'offset' => $offset,
                        'timeout' => 10,
                        'allowed_updates' => ['message'],
                    ]
                );

                $data = $response->json();

                if (!($data['ok'] ?? false)) {
                    $this->error('API error: ' . ($data['description'] ?? 'Unknown'));
                    sleep(5);
                    continue;
                }

                $updates = $data['result'] ?? [];

                foreach ($updates as $update) {
                    $updateId = $update['update_id'] ?? 0;
                    $offset = max($offset, $updateId + 1);

                    $message = $update['message'] ?? null;
                    
                    if (!$message) {
                        continue;
                    }

                    $text = $message['text'] ?? '';
                    $from = $message['from'] ?? [];
                    $username = $from['username'] ?? 'Unknown';
                    $userId = $from['id'] ?? 'Unknown';

                    $this->line("[{$username} ({$userId})] {$text}");

                    $result = $this->telegramService->processVerificationMessage($update);
                    
                    if ($result) {
                        $this->info('✅ Account linked successfully!');
                    }
                }

                $errorCount = 0;
                usleep(100000);

            } catch (\Exception $e) {
                $errorCount++;
                $this->error("Error: {$e->getMessage()}");
                
                if ($errorCount > 5) {
                    $this->error('Too many consecutive errors. Stopping.');
                    return 1;
                }
                
                sleep(5);
            }
        }

        return 0;
    }
}
