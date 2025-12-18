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
        Schema::create('product_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('transaction_id')->nullable();
            $table->decimal('purchase_price', 10, 2);
            $table->timestamp('purchased_at');
            $table->timestamps();

            // Indexes for performance
            $table->index('user_id');
            $table->index('product_id');
            $table->index(['user_id', 'product_id', 'purchased_at']);

            // Foreign key for transaction
            $table->foreign('transaction_id')
                  ->references('id')
                  ->on('transactions')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_user');
    }
};
