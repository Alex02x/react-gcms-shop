<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemConfiguration;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminTelegramSettingsController extends Controller
{
    protected TelegramService $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    /**
     * Show Telegram settings page.
     */
    public function index(Request $request): Response
    {
        if (!$request->user()->hasPermissionTo('manage-wallets')) {
            abort(403, 'Unauthorized action.');
        }

        $settings = [
            'bot_token' => SystemConfiguration::getValue('telegram_bot_token') ? '••••••••••••' : '',
            'channel_id' => SystemConfiguration::getValue('telegram_channel_id', ''),
            'channel_link' => SystemConfiguration::getValue('telegram_channel_link', ''),
        ];

        return Inertia::render('admin/telegram-settings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update Telegram settings.
     */
    public function update(Request $request): JsonResponse
    {
        if (!$request->user()->hasPermissionTo('manage-wallets')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'bot_token' => 'nullable|string',
            'channel_id' => 'nullable|string',
            'channel_link' => 'nullable|url',
        ]);

        // Validate bot token if provided
        if (!empty($validated['bot_token']) && $validated['bot_token'] !== '••••••••••••') {
            $result = $this->telegramService->validateBotToken($validated['bot_token']);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid bot token: ' . $result['error'],
                ], 400);
            }

            // Save bot token (encrypted)
            SystemConfiguration::setValue('telegram_bot_token', $validated['bot_token'], true);
        }

        // Save other settings
        if (isset($validated['channel_id'])) {
            SystemConfiguration::setValue('telegram_channel_id', $validated['channel_id']);
        }

        if (isset($validated['channel_link'])) {
            SystemConfiguration::setValue('telegram_channel_link', $validated['channel_link']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Telegram settings saved successfully.',
        ]);
    }

    /**
     * Test Telegram bot connection.
     */
    public function testConnection(Request $request): JsonResponse
    {
        if (!$request->user()->hasPermissionTo('manage-wallets')) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'bot_token' => 'required|string',
        ]);

        $token = $request->bot_token === '••••••••••••'
            ? SystemConfiguration::getValue('telegram_bot_token')
            : $request->bot_token;

        if (!$token) {
            return response()->json([
                'success' => false,
                'error' => 'Bot token is required.',
            ], 400);
        }

        $result = $this->telegramService->validateBotToken($token);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Connection successful!',
                'bot' => $result['bot'],
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'],
        ], 400);
    }

    /**
     * Get current settings.
     */
    public function getSettings(Request $request): JsonResponse
    {
        if (!$request->user()->hasPermissionTo('manage-wallets')) {
            abort(403, 'Unauthorized action.');
        }

        return response()->json([
            'bot_token_set' => !empty(SystemConfiguration::getValue('telegram_bot_token')),
            'channel_id' => SystemConfiguration::getValue('telegram_channel_id', ''),
            'channel_link' => SystemConfiguration::getValue('telegram_channel_link', ''),
            'is_configured' => SystemConfiguration::isConfigured(),
        ]);
    }
}
