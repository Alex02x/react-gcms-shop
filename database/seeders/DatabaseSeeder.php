<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create permissions
        $this->call(PermissionsSeeder::class);

        // Create roles
        $this->call(RolesSeeder::class);

        // Assign permissions to roles
        $this->call(RolePermissionsSeeder::class);

        // Create test user with User role
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
        
        // Assign User role if not already assigned
        if (!$user->hasRole('User')) {
            $user->assignRole('User');
        }

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'cooplodoop6@gmail.com'],
            [
                'name' => 'cooplodoop6',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
        
        // Assign Admin role if not already assigned
        if (!$admin->hasRole('Admin')) {
            $admin->assignRole('Admin');
        }
    }
}
