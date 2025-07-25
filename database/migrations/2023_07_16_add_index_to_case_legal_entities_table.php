<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // No ejecutar esta migración si estamos usando SQLite
        if (DB::connection()->getDriverName() !== 'sqlite') {
            Schema::table('case_legal_entities', function (Blueprint $table) {
                // Añadir índices para mejorar el rendimiento de las búsquedas en la tabla pivote
                $table->index(['legal_case_id', 'legal_entity_id']);
                $table->index(['legal_entity_id', 'legal_case_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {        // No ejecutar esta migración si estamos usando SQLite
        if (DB::connection()->getDriverName() !== 'sqlite') {
            Schema::table('case_legal_entities', function (Blueprint $table) {
                // Eliminar los índices
                $table->dropIndex(['legal_case_id', 'legal_entity_id']);
                $table->dropIndex(['legal_entity_id', 'legal_case_id']);
            });
        }
    }
};
