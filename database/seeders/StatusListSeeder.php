<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\StatusList;
use Illuminate\Database\Seeder;

final class StatusListSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            'En Tramite',
            'En Fase De Sustanciación',
            'En Fase De Sentencia Dentro Del Lapso',
            'En Fase De Sentencia Fuera Del Lapso',
            'En Fase De Notificación, Interposición De Recurso',
            'En Fase De Ejecución De Sentencia',
            'Distribuidos Sin Aceptar',
            'Distribuidos Y Aceptados Sin Auto De Admisión',
            'Expedientes Provenientes De Archivo Judicial',
            'Suspendidos',
            'Paralizados',
            'Paralizados En Ejecución De Sentencia',
            'Terminados',
            'Terminados Por Remitir Al Archivo Judicial',
        ];

        foreach ($statuses as $status) {
            StatusList::firstOrCreate([
                'name' => $status,
            ], [
                'description' => 'Estatus de ejemplo inicial',
            ]);
        }
    }
}
