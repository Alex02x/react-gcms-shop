<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminWalletController extends Controller
{
    /**
     * Show wallet details and full transaction history.
     */
    public function show(Request $request, User $user)
    {
        $this->authorize('manageWallet', $user);

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

        // Filter by amount range
        if ($request->filled('min_amount')) {
            $query->where('amount', '>=', $request->min_amount * 100);
        }

        if ($request->filled('max_amount')) {
            $query->where('amount', '<=', $request->max_amount * 100);
        }

        $perPage = $request->get('per_page', 25);
        $transactions = $query->paginate($perPage)->withQueryString();

        // Calculate statistics
        $stats = [
            'total_deposits' => $user->transactions()->where('type', 'deposit')->sum('amount') / 100,
            'total_withdrawals' => $user->transactions()->where('type', 'withdraw')->sum('amount') / 100,
            'transaction_count' => $user->transactions()->count(),
        ];

        return Inertia::render('admin/users/wallet', [
            'user' => $user,
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => $request->only(['type', 'date_from', 'date_to', 'min_amount', 'max_amount', 'per_page']),
        ]);
    }

    /**
     * Get transaction history for user edit page.
     */
    public function transactions(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $query = $user->transactions()->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $perPage = $request->get('per_page', 10);
        $transactions = $query->paginate($perPage);

        return response()->json($transactions);
    }

    /**
     * Deposit funds to user wallet.
     */
    public function deposit(Request $request, User $user)
    {
        $this->authorize('manageWallet', $user);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        DB::beginTransaction();
        try {
            $wallet = $user->wallet;
            
            $user->deposit($validated['amount'], [
                'description' => $validated['description'] ?? 'Admin deposit',
                'admin_user_id' => Auth::id(),
                'admin_user_name' => Auth::user()->name,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Funds deposited successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->back()->withErrors([
                'amount' => 'Failed to deposit funds. Please try again.',
            ]);
        }
    }

    /**
     * Withdraw funds from user wallet.
     */
    public function withdraw(Request $request, User $user)
    {
        $this->authorize('manageWallet', $user);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:' . ($user->balance / 100)],
            'description' => ['required', 'string', 'min:10', 'max:500'],
        ]);

        DB::beginTransaction();
        try {
            $wallet = $user->wallet;
            
            // Check if sufficient balance
            if ($user->balance < $validated['amount'] * 100) {
                return redirect()->back()->withErrors([
                    'amount' => 'Insufficient balance. Current balance: ₽' . number_format($user->balance / 100, 2),
                ]);
            }

            $user->withdraw($validated['amount'], [
                'description' => $validated['description'],
                'admin_user_id' => Auth::id(),
                'admin_user_name' => Auth::user()->name,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Funds withdrawn successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->back()->withErrors([
                'amount' => 'Failed to withdraw funds. Please try again.',
            ]);
        }
    }

    /**
     * Export transaction history to CSV.
     */
    public function exportTransactions(Request $request, User $user)
    {
        $this->authorize('manageWallet', $user);

        $transactions = $user->transactions()->orderBy('created_at', 'desc')->get();

        $filename = "user_{$user->id}_transactions_" . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($transactions) {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, ['ID', 'UUID', 'Type', 'Amount (RUB)', 'Description', 'Confirmed', 'Created At']);

            // Add data
            foreach ($transactions as $transaction) {
                fputcsv($file, [
                    $transaction->id,
                    $transaction->uuid,
                    $transaction->type,
                    number_format($transaction->amount / 100, 2),
                    $transaction->meta['description'] ?? '',
                    $transaction->confirmed ? 'Yes' : 'No',
                    $transaction->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
