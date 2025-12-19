<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    /**
     * Show wallet page with transaction history.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $user->load('wallet');

        $query = $user->transactions()->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $perPage = $request->get('per_page', 25);
        $transactions = $query->paginate($perPage)->withQueryString();

        // Calculate statistics
        $stats = [
            'total_deposits' => $user->transactions()->where('type', 'deposit')->sum('amount') / 100,
            'total_withdrawals' => abs($user->transactions()->where('type', 'withdraw')->sum('amount')) / 100,
            'transaction_count' => $user->transactions()->count(),
        ];

        return Inertia::render('wallet', [
            'auth' => [
                'user' => $user,
            ],
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => $request->only(['type', 'date_from', 'date_to', 'per_page']),
        ]);
    }
}
