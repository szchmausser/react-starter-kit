<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LegalCaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $legalCase = \App\Models\LegalCase::with(['caseType', 'individuals', 'legalEntities'])->findOrFail($id);
        $events = $legalCase->events()->with('user')->orderByDesc('date')->get();

        // Obtener la próxima fecha importante directamente de la base de datos
        $nextImportantDate = $legalCase->importantDates()
            ->where('is_expired', false)
            ->whereDate('end_date', '>=', now()->toDateString())
            ->orderBy('end_date')
            ->first();
        
        // Depurar los datos de roles
        Log::debug('Individuos con roles:', $legalCase->individuals->map(function($individual) {
            return [
                'id' => $individual->id,
                'name' => $individual->first_name . ' ' . $individual->last_name,
                'role' => $individual->pivot->role ?? 'Sin rol definido'
            ];
        })->toArray());
        
        Log::debug('Entidades con roles:', $legalCase->legalEntities->map(function($entity) {
            return [
                'id' => $entity->id,
                'name' => $entity->business_name,
                'role' => $entity->pivot->role ?? 'Sin rol definido'
            ];
        })->toArray());
        
        return \Inertia\Inertia::render('LegalCases/Show', [
            'legalCase' => $legalCase,
            'events' => $events,
            'nextImportantDate' => $nextImportantDate ? [
                'id' => $nextImportantDate->id,
                'title' => $nextImportantDate->title,
                'end_date' => $nextImportantDate->end_date->toDateString(),
            ] : null,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Obtener historial de estatus del expediente.
     */
    public function statuses(string $id)
    {
        $legalCase = \App\Models\LegalCase::findOrFail($id);
        $statuses = $legalCase->statuses()->orderByDesc('created_at')->get();
        return response()->json($statuses);
    }

    /**
     * Cambiar el estatus del expediente.
     */
    public function setStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|string|max:255',
            'reason' => 'nullable|string|max:1000',
        ]);
        $legalCase = \App\Models\LegalCase::findOrFail($id);
        $legalCase->setStatus($request->input('status'), $request->input('reason'));
        return response()->json(['success' => true]);
    }

    /**
     * Listar estatus disponibles (pueden venir de la base de datos o ser configurables).
     */
    public function availableStatuses()
    {
        // Obtener los nombres de los estatus desde la nueva tabla status_lists
        $statuses = \App\Models\StatusList::orderBy('name')->pluck('name');
        return response()->json($statuses);
    }
}
