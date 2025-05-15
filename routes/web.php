<?php

use App\Http\Controllers\IndividualController;
use App\Http\Controllers\LegalCaseController;
use App\Http\Controllers\LegalEntityController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Búsqueda pública
Route::get('/search', [SearchController::class, 'index'])->name('search.index'); // Original
Route::get('/search/results', [SearchController::class, 'search'])->name('search.results');

// Detalle de usuario
Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');

// Detalle de individuo
Route::get('/individuals/{individual}', [IndividualController::class, 'show'])->name('individuals.show');

// Detalle de entidad legal
Route::get('/legal-entities/{legalEntity}', [LegalEntityController::class, 'show'])->name('legal-entities.show');

// Detalle de caso legal
Route::get('/legal-cases/{legalCase}', [LegalCaseController::class, 'show'])->name('legal-cases.show');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
