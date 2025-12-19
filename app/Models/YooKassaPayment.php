<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class YooKassaPayment extends Model
{
    protected $fillable = [
        'user_id',
        'yookassa_payment_id',
        'amount',
        'currency',
        'status',
        'payment_method_type',
        'confirmation_url',
        'return_url',
        'idempotency_key',
        'yookassa_response',
        'metadata',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'yookassa_response' => 'array',
        'metadata' => 'array',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payment is processing.
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    /**
     * Check if payment succeeded.
     */
    public function isSucceeded(): bool
    {
        return $this->status === 'succeeded';
    }

    /**
     * Check if payment was canceled.
     */
    public function isCanceled(): bool
    {
        return $this->status === 'canceled';
    }

    /**
     * Check if payment failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if payment is in final state.
     */
    public function isFinal(): bool
    {
        return in_array($this->status, ['succeeded', 'canceled', 'failed']);
    }

    /**
     * Mark payment as processing.
     */
    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    /**
     * Mark payment as succeeded.
     */
    public function markAsSucceeded(array $data = []): void
    {
        $this->update(array_merge([
            'status' => 'succeeded',
            'paid_at' => now(),
        ], $data));
    }

    /**
     * Mark payment as canceled.
     */
    public function markAsCanceled(): void
    {
        $this->update(['status' => 'canceled']);
    }

    /**
     * Mark payment as failed.
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }
}
