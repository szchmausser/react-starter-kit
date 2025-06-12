<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CaseEvent;
use App\Models\LegalCase;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CaseEventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $legalCases = LegalCase::all();
        $user = User::first();

        if ($legalCases->isEmpty() || ! $user) {
            $this->command->warn('No hay casos legales o usuarios para asociar eventos.');

            return;
        }

        $events = [
            [
                'title' => 'Apertura del expediente',
                'description' => 'Se procede a la apertura formal del expediente legal.',
                'days_ago' => 10,
            ],
            [
                'title' => 'Asignación de juez',
                'description' => 'Se asigna el juez encargado del caso.',
                'days_ago' => 8,
            ],
            [
                'title' => 'Notificación a las partes',
                'description' => 'Se procede a notificar a todas las partes involucradas.',
                'days_ago' => 5,
            ],
            [
                'title' => 'Primera audiencia',
                'description' => 'Se celebra la primera audiencia del caso.',
                'days_ago' => 3,
            ],
            [
                'title' => 'Presentación de pruebas',
                'description' => 'Se presentan las pruebas documentales y testimoniales.',
                'days_ago' => 2,
            ],
        ];

        foreach ($legalCases as $case) {
            foreach ($events as $event) {
                CaseEvent::create([
                    'legal_case_id' => $case->id,
                    'user_id' => $user->id,
                    'title' => $event['title'],
                    'description' => $event['description'],
                    'date' => now()->subDays($event['days_ago']),
                ]);
            }
        }
    }
}
