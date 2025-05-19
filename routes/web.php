<?php

use App\Http\Controllers\IndividualController;
use App\Http\Controllers\LegalCaseController;
use App\Http\Controllers\LegalEntityController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CaseParticipantController;
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
Route::get('/search', [SearchController::class, 'index'])->name('search.index');
Route::get('/search/results', [SearchController::class, 'search'])->name('search.results');

// Detalle de usuario
Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');

// CRUD Individuos (Personas Naturales)
Route::resource('individuals', IndividualController::class);

// CRUD Entidades Legales
Route::resource('legal-entities', LegalEntityController::class);

// Detalle de caso legal
Route::get('/legal-cases/{legalCase}', [LegalCaseController::class, 'show'])->name('legal-cases.show');

// Rutas para gestionar participantes en expedientes
Route::get('/legal-cases/{case}/participants/add', [CaseParticipantController::class, 'addForm'])->name('case-participants.add-form');
Route::post('/legal-cases/{case}/participants/search', [CaseParticipantController::class, 'search'])->name('case-participants.search');
Route::post('/legal-cases/{case}/participants', [CaseParticipantController::class, 'associate'])->name('case-participants.associate');
Route::delete('/legal-cases/{case}/participants', [CaseParticipantController::class, 'remove'])->name('case-participants.remove');

// Gestión de estatus de expedientes
Route::get('/legal-cases/{legalCase}/statuses', [LegalCaseController::class, 'statuses'])->name('legal-cases.statuses');
Route::post('/legal-cases/{legalCase}/status', [LegalCaseController::class, 'setStatus'])->name('legal-cases.set-status');
Route::get('/legal-cases/statuses/available', [LegalCaseController::class, 'availableStatuses'])->name('legal-cases.available-statuses');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
