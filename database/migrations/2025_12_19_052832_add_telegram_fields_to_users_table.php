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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('telegram_user_id')->nullable()->after('avatar');
            $table->string('telegram_username', 255)->nullable()->after('telegram_user_id');
            $table->timestamp('telegram_linked_at')->nullable()->after('telegram_username');
            
            $table->index('telegram_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['telegram_user_id']);
            $table->dropColumn(['telegram_user_id', 'telegram_username', 'telegram_linked_at']);
        });
    }
};
