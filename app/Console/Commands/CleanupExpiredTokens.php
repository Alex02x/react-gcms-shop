<?php

namespace App\Console\Commands;

use App\Services\MagicLinkService;
use Illuminate\Console\Command;

class CleanupExpiredTokens extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auth:cleanup-tokens';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired and used authentication tokens';

    /**
     * Execute the console command.
     */
    public function handle(MagicLinkService $magicLinkService): int
    {
        $this->info('Cleaning up expired and used tokens...');

        $deleted = $magicLinkService->cleanupTokens();

        $this->info("Deleted {$deleted} expired/used tokens.");

        return Command::SUCCESS;
    }
}
