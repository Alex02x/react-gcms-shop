<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ValidateYooKassaWebhook
{
    /**
     * YooKassa webhook IP ranges.
     * 
     * These are the official IP addresses from which YooKassa sends webhooks.
     * Source: https://yookassa.ru/developers/using-api/webhooks
     */
    private const ALLOWED_IP_RANGES = [
        '185.71.76.0/27',
        '185.71.77.0/27',
        '77.75.153.0/25',
        '77.75.156.11',
        '77.75.156.35',
        '77.75.154.128/25',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if IP validation is enabled
        $ipCheckEnabled = env('YOOKASSA_WEBHOOK_IP_CHECK', true);

        if (!$ipCheckEnabled) {
            Log::warning('YooKassa webhook IP check is disabled');
            return $next($request);
        }

        $requestIp = $request->ip();

        // Check if request IP is in allowed ranges
        if (!$this->isIpAllowed($requestIp)) {
            Log::warning('YooKassa webhook from unauthorized IP', [
                'ip' => $requestIp,
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'error' => 'Unauthorized',
            ], 403);
        }

        return $next($request);
    }

    /**
     * Check if IP is in allowed ranges.
     */
    private function isIpAllowed(string $ip): bool
    {
        foreach (self::ALLOWED_IP_RANGES as $range) {
            if ($this->ipInRange($ip, $range)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if IP is in CIDR range.
     */
    private function ipInRange(string $ip, string $range): bool
    {
        // If range doesn't contain /, it's a single IP
        if (strpos($range, '/') === false) {
            return $ip === $range;
        }

        [$subnet, $mask] = explode('/', $range);
        
        $ipLong = ip2long($ip);
        $subnetLong = ip2long($subnet);
        $maskLong = -1 << (32 - (int)$mask);
        
        return ($ipLong & $maskLong) === ($subnetLong & $maskLong);
    }
}
