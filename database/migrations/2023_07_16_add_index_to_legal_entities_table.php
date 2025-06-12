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
            Schema::table('legal_entities', function (Blueprint $table) {
                // Añadir índices para mejorar el rendimiento de las búsquedas por RIF y razón social
                $table->index('rif');
                $table->index('business_name');
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
            Schema::table('legal_entities', function (Blueprint $table) {
                // Eliminar los índices
                $table->dropIndex(['rif']);
                $table->dropIndex(['business_name']);
            });
        }
    }
};
