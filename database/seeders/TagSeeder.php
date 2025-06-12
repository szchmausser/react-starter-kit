<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Tags\Tag;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            // Etiquetas por tipo de caso
            ['name' => 'Divorcio', 'type' => 'case_type'],
            ['name' => 'Manutención', 'type' => 'case_type'],
            ['name' => 'Título Supletorio', 'type' => 'case_type'],
            ['name' => 'Daños y Perjuicios', 'type' => 'case_type'],
            ['name' => 'Herencia', 'type' => 'case_type'],

            // Etiquetas por estado
            ['name' => 'Urgente', 'type' => 'priority'],
            ['name' => 'Prioridad Alta', 'type' => 'priority'],
            ['name' => 'Prioridad Media', 'type' => 'priority'],
            ['name' => 'Prioridad Baja', 'type' => 'priority'],
            ['name' => 'En Revisión', 'type' => 'status'],
            ['name' => 'Documentación Pendiente', 'type' => 'status'],
            ['name' => 'En Proceso', 'type' => 'status'],
            ['name' => 'En Juicio', 'type' => 'status'],
            ['name' => 'Apelación', 'type' => 'status'],
            ['name' => 'Sentenciado', 'type' => 'status'],
            ['name' => 'Cerrado', 'type' => 'status'],

            // Etiquetas por área de práctica
            ['name' => 'Derecho Familiar', 'type' => 'practice_area'],
            ['name' => 'Derecho Civil', 'type' => 'practice_area'],
            ['name' => 'Derecho Mercantil', 'type' => 'practice_area'],
            ['name' => 'Derecho Inmobiliario', 'type' => 'practice_area'],
            ['name' => 'Derecho Laboral', 'type' => 'practice_area'],
            ['name' => 'Derecho Penal', 'type' => 'practice_area'],
            ['name' => 'Derecho Tributario', 'type' => 'practice_area'],
            ['name' => 'Derecho Corporativo', 'type' => 'practice_area'],

            // Otras etiquetas útiles
            ['name' => 'Reunión Pendiente', 'type' => 'action_required'],
            ['name' => 'Documentos Faltantes', 'type' => 'action_required'],
            ['name' => 'Citación', 'type' => 'event'],
            ['name' => 'Audiencia', 'type' => 'event'],
            ['name' => 'Mediación', 'type' => 'process'],
            ['name' => 'Conciliación', 'type' => 'process'],
            ['name' => 'Pruebas', 'type' => 'process'],
            ['name' => 'Testigos', 'type' => 'process'],
            ['name' => 'Peritaje', 'type' => 'process'],
            ['name' => 'Recurso', 'type' => 'legal_procedure'],
            ['name' => 'Ejecución', 'type' => 'legal_procedure'],
        ];

        foreach ($tags as $tagData) {
            Tag::findOrCreate($tagData['name'], $tagData['type']);
        }
    }
}
