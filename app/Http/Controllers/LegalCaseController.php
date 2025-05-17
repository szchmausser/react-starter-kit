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
            'legalCase' => $legalCase
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
}
