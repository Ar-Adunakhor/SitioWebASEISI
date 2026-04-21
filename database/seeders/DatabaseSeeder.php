<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'admin',
            'full_name' => 'Administrador ASEISI',
            'email' => 'admin@ues.edu.sv',
            'password' => 'admin123',
            'role' => 'admin',
            'active' => true,
        ]);
    }
}
