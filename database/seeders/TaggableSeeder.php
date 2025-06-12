<?php

namespace Database\Seeders;

use App\Models\Individual;
use App\Models\LegalCase;
use App\Models\LegalEntity;
use Illuminate\Database\Seeder;
use Spatie\Tags\Tag;

class TaggableSeeder extends Seeder
{
    /**
     * Ejecuta el seeder para asignar etiquetas aleatorias a los modelos.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('Asignando etiquetas a modelos...');

        // Obtener todas las etiquetas existentes
        $allTags = Tag::all();

        if ($allTags->isEmpty()) {
            $this->command->error('No hay etiquetas disponibles. Ejecute primero el TagSeeder.');

            return;
        }

        // Separar etiquetas por tipo
        $tagsByType = [
            'priority' => $allTags->where('type', 'priority')->values(),
            'status' => $allTags->where('type', 'status')->values(),
            'case_type' => $allTags->where('type', 'case_type')->values(),
            // Etiquetas sin tipo
            'general' => $allTags->whereNull('type')->values(),
        ];

        // 1. Asignar etiquetas a expedientes legales (LegalCase)
        $this->assignTagsToLegalCases($tagsByType);

        // 2. Asignar etiquetas a individuos (Individual)
        $this->assignTagsToIndividuals($tagsByType);

        // 3. Asignar etiquetas a entidades legales (LegalEntity)
        $this->assignTagsToLegalEntities($tagsByType);

        $this->command->info('Etiquetas asignadas correctamente.');
    }

    /**
     * Asigna etiquetas aleatorias a los expedientes legales.
     *
     * @param  array  $tagsByType
     * @return void
     */
    private function assignTagsToLegalCases($tagsByType)
    {
        // Obtener todos los expedientes legales
        $legalCases = LegalCase::all();

        if ($legalCases->isEmpty()) {
            $this->command->warn('No hay expedientes legales para asignar etiquetas.');

            return;
        }

        $this->command->info("Asignando etiquetas a {$legalCases->count()} expedientes legales...");

        foreach ($legalCases as $legalCase) {
            // Cantidad aleatoria de etiquetas a asignar (0-3)
            $tagsCount = rand(0, 3);

            if ($tagsCount === 0) {
                continue; // Este expediente no tendrá etiquetas
            }

            $selectedTags = [];

            // Intentar asignar una etiqueta de prioridad (si existen)
            if ($tagsByType['priority']->isNotEmpty() && rand(0, 1) === 1) {
                $priorityTag = $tagsByType['priority']->random();
                $selectedTags[] = $priorityTag->name;
                $tagsCount--;
            }

            // Intentar asignar una etiqueta de estado (si existen)
            if ($tagsCount > 0 && $tagsByType['status']->isNotEmpty() && rand(0, 1) === 1) {
                $statusTag = $tagsByType['status']->random();
                $selectedTags[] = $statusTag->name;
                $tagsCount--;
            }

            // Completar con etiquetas generales si aún necesitamos más
            if ($tagsCount > 0 && $tagsByType['general']->isNotEmpty()) {
                // Tomar etiquetas aleatorias sin repetir
                $additionalTags = $tagsByType['general']->random(min($tagsCount, $tagsByType['general']->count()));
                foreach ($additionalTags as $tag) {
                    $selectedTags[] = $tag->name;
                }
            }

            // Asignar etiquetas al expediente
            if (! empty($selectedTags)) {
                $legalCase->syncTagsWithType($selectedTags);
                $this->command->line("  Expediente #{$legalCase->id}: ".implode(', ', $selectedTags));
            }
        }
    }

    /**
     * Asigna etiquetas aleatorias a individuos.
     *
     * @param  array  $tagsByType
     * @return void
     */
    private function assignTagsToIndividuals($tagsByType)
    {
        // Obtener todos los individuos
        $individuals = Individual::all();

        if ($individuals->isEmpty()) {
            $this->command->warn('No hay individuos para asignar etiquetas.');

            return;
        }

        $this->command->info("Asignando etiquetas a {$individuals->count()} individuos...");

        // Asignar etiquetas solo al 30% de los individuos
        $individualsToTag = $individuals->random($individuals->count() * 0.3);

        foreach ($individualsToTag as $individual) {
            // Cantidad aleatoria de etiquetas a asignar (1-2)
            $tagsCount = rand(1, 2);

            $availableTags = $tagsByType['general']->merge($tagsByType['status']);

            if ($availableTags->isNotEmpty()) {
                // Tomar etiquetas aleatorias sin repetir
                $selectedTags = $availableTags->random(min($tagsCount, $availableTags->count()));
                $tagNames = $selectedTags->pluck('name')->toArray();

                $individual->syncTagsWithType($tagNames);
                $this->command->line("  Individuo #{$individual->id}: ".implode(', ', $tagNames));
            }
        }
    }

    /**
     * Asigna etiquetas aleatorias a entidades legales.
     *
     * @param  array  $tagsByType
     * @return void
     */
    private function assignTagsToLegalEntities($tagsByType)
    {
        // Obtener todas las entidades legales
        $legalEntities = LegalEntity::all();

        if ($legalEntities->isEmpty()) {
            $this->command->warn('No hay entidades legales para asignar etiquetas.');

            return;
        }

        $this->command->info("Asignando etiquetas a {$legalEntities->count()} entidades legales...");

        // Asignar etiquetas solo al 40% de las entidades legales
        $entitiesToTag = $legalEntities->random($legalEntities->count() * 0.4);

        foreach ($entitiesToTag as $entity) {
            // Cantidad aleatoria de etiquetas a asignar (1-2)
            $tagsCount = rand(1, 2);

            $availableTags = $tagsByType['general'];

            if ($availableTags->isNotEmpty()) {
                // Tomar etiquetas aleatorias sin repetir
                $selectedTags = $availableTags->random(min($tagsCount, $availableTags->count()));
                $tagNames = $selectedTags->pluck('name')->toArray();

                $entity->syncTagsWithType($tagNames);
                $this->command->line("  Entidad legal #{$entity->id}: ".implode(', ', $tagNames));
            }
        }
    }
}
