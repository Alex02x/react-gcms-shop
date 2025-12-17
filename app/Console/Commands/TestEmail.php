<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'email:test {email}';
    protected $description = 'Send a test email';

    public function handle(): int
    {
        $email = $this->argument('email');

        try {
            Mail::raw('This is a test email from GameCMS.su', function ($message) use ($email) {
                $message->to($email)
                    ->subject('Test Email from GameCMS.su');
            });

            $this->info("Test email sent successfully to {$email}");
            $this->info('Check your inbox (and spam folder)');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to send email: ' . $e->getMessage());
            $this->error('Error details: ' . $e->getTraceAsString());

            return Command::FAILURE;
        }
    }
}
