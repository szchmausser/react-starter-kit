<?php

namespace Database\Seeders;

use App\Models\CaseType;
use Illuminate\Database\Seeder;

class CaseTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $caseTypes = [
            [
                'name' => 'Divorcio',
                'description' => 'Procedimiento legal para la disolución del vínculo matrimonial',
            ],
            [
                'name' => 'Manutención',
                'description' => 'Casos relacionados con obligaciones de manutención a menores o dependientes',
            ],
            [
                'name' => 'Título Supletorio',
                'description' => 'Procedimiento para obtener un título de propiedad cuando se carece del mismo',
            ],
            [
                'name' => 'Demanda por Daños y Perjuicios',
                'description' => 'Reclamación por daños materiales o morales causados por un tercero',
            ],
            [
                'name' => 'Partición de Herencia',
                'description' => 'Procedimiento para dividir los bienes dejados por una persona fallecida',
            ],
            [
                'name' => 'Accidente de Tránsito',
                'description' => 'Casos relacionados con accidentes de tránsito, responsabilidad civil y daños materiales',
            ],
            [
                'name' => 'Despido Laboral',
                'description' => 'Procedimiento para reclamar indemnizaciones por despido injustificado',
            ],
            [
                'name' => 'Negligencia Médica',
                'description' => 'Casos relacionados con errores médicos y responsabilidad profesional',
            ],
            [
                'name' => 'Infracción a la Propiedad Intelectual',
                'description' => 'Procedimiento para proteger la propiedad intelectual y reclamar daños',
            ],
            [
                'name' => 'Protección de Datos Personales',
                'description' => 'Casos relacionados con la protección de la privacidad y seguridad de los datos personales',
            ],
            [
                'name' => 'Contratos y Negocios',
                'description' => 'Procedimiento para resolver disputas contractuales y comerciales',
            ],
            [
                'name' => 'Expropiación',
                'description' => 'Procedimiento para la expropiación de propiedades por causa de utilidad pública',
            ],
        ];

        foreach ($caseTypes as $caseType) {
            CaseType::create($caseType);
        }
    }
}
