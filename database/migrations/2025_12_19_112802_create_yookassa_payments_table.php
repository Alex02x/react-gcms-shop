<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('yookassa_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('yookassa_payment_id')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('RUB');
            $table->enum('status', ['pending', 'processing', 'succeeded', 'canceled', 'failed'])->default('pending');
            $table->string('payment_method_type')->nullable();
            $table->text('confirmation_url')->nullable();
            $table->text('return_url');
            $table->string('idempotency_key')->unique();
            $table->json('yookassa_response')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index('user_id');
            $table->index('yookassa_payment_id');
            $table->index('status');
            $table->index('created_at');
            $table->index('idempotency_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('yookassa_payments');
    }
};
