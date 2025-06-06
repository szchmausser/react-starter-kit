<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // No ejecutar esta migración si estamos usando SQLite
        if (DB::connection()->getDriverName() !== 'sqlite') {
            Schema::table('individuals', function (Blueprint $table) {
                // Añadir índices para mejorar el rendimiento de las búsquedas por documento de identidad
                $table->index('national_id');
                $table->index('passport');
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
            Schema::table('individuals', function (Blueprint $table) {
                // Eliminar los índices
                $table->dropIndex(['national_id']);
                $table->dropIndex(['passport']);
            });
        }
    }
};