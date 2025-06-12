<?php

namespace Database\Seeders;

use App\Models\MediaOwner;
use Illuminate\Database\Seeder;

class MediaOwnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Asegurarse de que exista al menos una instancia de MediaOwner
        if (! MediaOwner::count()) {
            MediaOwner::create([
                'name' => 'Shared files owner',
                'description' => 'Sample model to use as media owner',
            ]);

            $this->command->info('MediaOwner creado correctamente.');
        } else {
            $this->command->info('MediaOwner ya existe en la base de datos.');
        }
    }
}
