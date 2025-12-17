<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

class AssignUserRole
{
    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        try {
            $user = $event->user;

            // Check if User role exists
            $userRole = Role::where('name', 'User')->first();

            if (!$userRole) {
                Log::warning('User role does not exist. Creating it now.');
                $userRole = Role::create(['name' => 'User', 'guard_name' => 'web']);
            }

            // Assign User role if not already assigned
            if (!$user->hasRole('User')) {
                $user->assignRole('User');
                Log::info("User role assigned to user {$user->id} ({$user->email})");
            }
        } catch (\Exception $e) {
            Log::error("Failed to assign User role to user {$event->user->id}: " . $e->getMessage());
            // Don't throw exception to prevent registration failure
        }
    }
}
