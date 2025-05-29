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
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        
        // Ejecutar los seeders en orden adecuado para mantener las relaciones
        $this->call([
            CaseTypeSeeder::class,
            IndividualSeeder::class,
            LegalEntitySeeder::class,
            StatusListSeeder::class,
            LegalCaseSeeder::class,
            CaseEventSeeder::class,
        ]);
    }
}
