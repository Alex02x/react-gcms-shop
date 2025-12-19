<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class SystemConfiguration extends Model
{
    protected $fillable = [
        'key',
        'value',
        'encrypted',
    ];

    protected $casts = [
        'encrypted' => 'boolean',
    ];

    /**
     * Get configuration value by key.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $cacheKey = "telegram_config_{$key}";

        return Cache::remember($cacheKey, 3600, function () use ($key, $default) {
            $config = self::where('key', $key)->first();

            if (!$config) {
                return $default;
            }

            if ($config->encrypted) {
                try {
                    return Crypt::decryptString($config->value);
                } catch (\Exception $e) {
                    return $default;
                }
            }

            return $config->value;
        });
    }

    /**
     * Set configuration value.
     */
    public static function setValue(string $key, mixed $value, bool $encrypted = false): void
    {
        $valueToStore = $encrypted ? Crypt::encryptString($value) : $value;

        self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $valueToStore,
                'encrypted' => $encrypted,
            ]
        );

        // Clear cache
        Cache::forget("telegram_config_{$key}");
    }

    /**
     * Get bot token.
     */
    public static function getBotToken(): ?string
    {
        return self::getValue('telegram_bot_token');
    }

    /**
     * Get channel ID.
     */
    public static function getChannelId(): ?string
    {
        return self::getValue('telegram_channel_id');
    }

    /**
     * Get channel link.
     */
    public static function getChannelLink(): ?string
    {
        return self::getValue('telegram_channel_link');
    }

    /**
     * Check if Telegram is configured.
     */
    public static function isConfigured(): bool
    {
        return !empty(self::getBotToken()) && !empty(self::getChannelId());
    }
}
