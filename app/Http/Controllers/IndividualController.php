<?php

namespace App\Http\Controllers;

use App\Models\Individual;
use App\Http\Requests\Individual\StoreIndividualRequest;
use App\Http\Requests\Individual\UpdateIndividualRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class IndividualController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Individual::query();
        
        // Filtros de columnas individuales
        if ($request->has('national_id') && !empty($request->national_id)) {
            $query->where('national_id', 'like', "%{$request->national_id}%");
        }
        
        if ($request->has('first_name') && !empty($request->first_name)) {
            $query->where('first_name', 'like', "%{$request->first_name}%");
        }
        
        if ($request->has('email') && !empty($request->email)) {
            $query->where('email_1', 'like', "%{$request->email}%");
        }
        
        if ($request->has('phone') && !empty($request->phone)) {
            $query->where('phone_number_1', 'like', "%{$request->phone}%");
        }
        
        // Ordenamiento
        $orderBy = $request->order_by ?? 'id';
        $orderDir = $request->order_dir ?? 'desc';
        
        // Validar que la columna de ordenamiento sea válida
        $validColumns = ['id', 'national_id', 'first_name', 'last_name', 'email_1', 'phone_number_1', 'created_at', 'updated_at'];
        
        if (in_array($orderBy, $validColumns)) {
            $query->orderBy($orderBy, $orderDir);
        } else {
            $query->orderBy('id', 'desc');
        }
        
        // Paginación configurable
        $perPage = $request->input('per_page', 10);
        
        // Validar que per_page sea un número válido
        $validPerPageValues = [5, 10, 20, 50, 100, 200, 500, 1000];
        if (!in_array($perPage, $validPerPageValues)) {
            $perPage = 10; // Valor por defecto
        }
        
        $individuals = $query->paginate($perPage)
                            ->withQueryString();
        
        // Datos adicionales para depuración (si es necesario)
        $debug = [
            'total_records' => $individuals->total(),
            'total_pages' => $individuals->lastPage(),
        ];
        
        return Inertia::render('Individuals/Index', [
            'individuals' => [
                'data' => $individuals->items(),
                'links' => [
                    'first' => $individuals->url(1),
                    'last' => $individuals->url($individuals->lastPage()),
                    'prev' => $individuals->previousPageUrl(),
                    'next' => $individuals->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $individuals->currentPage(),
                    'from' => $individuals->firstItem(),
                    'last_page' => $individuals->lastPage(),
                    'links' => $individuals->linkCollection()->toArray(),
                    'path' => $individuals->path(),
                    'per_page' => $individuals->perPage(),
                    'to' => $individuals->lastItem(),
                    'total' => $individuals->total(),
                ],
            ],
            'filters' => $request->only([
                'national_id', 
                'first_name', 
                'email', 
                'phone', 
                'order_by', 
                'order_dir', 
                'per_page'
            ]),
            'debug' => $debug,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Individuals/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreIndividualRequest $request)
    {
        Individual::create($request->validated());
        
        return Redirect::route('individuals.index')->with('success', 'Individuo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $individual = Individual::with(['legalCases.caseType'])->findOrFail($id);
        
        return Inertia::render('Individuals/Show', [
            'individual' => $individual
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $individual = Individual::findOrFail($id);
        
        return Inertia::render('Individuals/Edit', [
            'individual' => $individual
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateIndividualRequest $request, string $id)
    {
        $individual = Individual::findOrFail($id);
        $individual->update($request->validated());
        
        return Redirect::route('individuals.index')->with('success', 'Individuo actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $individual = Individual::findOrFail($id);
        $individual->delete();
        
        return Redirect::route('individuals.index')->with('success', 'Individuo eliminado exitosamente.');
    }
}
