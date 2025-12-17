<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin role
        Role::create([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);

        // Create User role
        Role::create([
            'name' => 'User',
            'guard_name' => 'web',
        ]);
    }
}
