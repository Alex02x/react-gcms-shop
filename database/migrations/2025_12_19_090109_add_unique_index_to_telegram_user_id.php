<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, clear duplicate telegram_user_id entries
        // Keep only the most recently linked account for each telegram_user_id
        $duplicates = DB::table('users')
            ->select('telegram_user_id')
            ->whereNotNull('telegram_user_id')
            ->groupBy('telegram_user_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('telegram_user_id');

        foreach ($duplicates as $telegramUserId) {
            // Get all users with this telegram_user_id, ordered by most recent link
            $users = DB::table('users')
                ->where('telegram_user_id', $telegramUserId)
                ->orderBy('telegram_linked_at', 'desc')
                ->get();

            // Skip the first (most recent) and unlink the rest
            foreach ($users->skip(1) as $user) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update([
                        'telegram_user_id' => null,
                        'telegram_username' => null,
                        'telegram_linked_at' => null,
                    ]);
            }
        }

        // For SQLite, try to drop index if it exists
        try {
            DB::statement('DROP INDEX IF EXISTS users_telegram_user_id_index');
        } catch (\Exception $e) {
            // Index doesn't exist, that's fine
        }

        Schema::table('users', function (Blueprint $table) {
            // Add unique index
            $table->unique('telegram_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop unique index
            $table->dropUnique(['telegram_user_id']);

            // Restore regular index
            $table->index('telegram_user_id');
        });
    }
};
