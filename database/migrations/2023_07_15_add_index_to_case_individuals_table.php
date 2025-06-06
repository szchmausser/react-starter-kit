<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // No ejecutar esta migración si estamos usando SQLite
        if (DB::connection()->getDriverName() !== 'sqlite') {
            Schema::table('case_individuals', function (Blueprint $table) {
                // Añadir índices para mejorar el rendimiento de las búsquedas en la tabla pivote
                $table->index(['legal_case_id', 'individual_id']);
                $table->index(['individual_id', 'legal_case_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No ejecutar esta migración si estamos usando SQLite
        if (DB::connection()->getDriverName() !== 'sqlite') {
            Schema::table('case_individuals', function (Blueprint $table) {
                // Eliminar los índices
                $table->dropIndex(['legal_case_id', 'individual_id']);
                $table->dropIndex(['individual_id', 'legal_case_id']);
            });
        }
    }
};