<?php

namespace App\Http\Controllers;

use App\Models\LegalEntity;
use App\Models\Individual;
use App\Http\Requests\LegalEntity\StoreLegalEntityRequest;
use App\Http\Requests\LegalEntity\UpdateLegalEntityRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class LegalEntityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = LegalEntity::query();
        
        // Filtrado global (búsqueda)
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('trade_name', 'like', "%{$search}%")
                  ->orWhere('rif', 'like', "%{$search}%");
            });
        }
        
        // Filtros de columnas individuales
        if ($request->has('rif') && !empty($request->rif)) {
            $query->where('rif', 'like', "%{$request->rif}%");
        }
        
        if ($request->has('business_name') && !empty($request->business_name)) {
            $query->where(function($q) use ($request) {
                $q->where('business_name', 'like', "%{$request->business_name}%")
                  ->orWhere('trade_name', 'like', "%{$request->business_name}%");
            });
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
        $validColumns = ['id', 'rif', 'business_name', 'trade_name', 'email_1', 'phone_number_1', 'created_at', 'updated_at'];
        
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
        
        $legalEntities = $query->paginate($perPage)
                              ->withQueryString();
        
        // Datos adicionales para depuración (si es necesario)
        $debug = [
            'total_records' => $legalEntities->total(),
            'total_pages' => $legalEntities->lastPage(),
        ];
        
        return Inertia::render('LegalEntities/Index', [
            'legalEntities' => [
                'data' => $legalEntities->items(),
                'links' => [
                    'first' => $legalEntities->url(1),
                    'last' => $legalEntities->url($legalEntities->lastPage()),
                    'prev' => $legalEntities->previousPageUrl(),
                    'next' => $legalEntities->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $legalEntities->currentPage(),
                    'from' => $legalEntities->firstItem(),
                    'last_page' => $legalEntities->lastPage(),
                    'links' => $legalEntities->linkCollection()->toArray(),
                    'path' => $legalEntities->path(),
                    'per_page' => $legalEntities->perPage(),
                    'to' => $legalEntities->lastItem(),
                    'total' => $legalEntities->total(),
                ],
            ],
            'filters' => $request->only([
                'search', 
                'rif', 
                'business_name', 
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
        // Obtener representantes legales potenciales
        $representatives = Individual::select('id', 'first_name', 'last_name', 'national_id')
                                    ->orderBy('last_name')
                                    ->get();
        
        return Inertia::render('LegalEntities/Create', [
            'representatives' => $representatives
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLegalEntityRequest $request)
    {
        LegalEntity::create($request->validated());
        
        return Redirect::route('legal-entities.index')->with('success', 'Entidad legal creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $legalEntity = LegalEntity::with(['legalCases.caseType', 'legalRepresentative'])->findOrFail($id);
        
        return Inertia::render('LegalEntities/Show', [
            'legalEntity' => $legalEntity
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $legalEntity = LegalEntity::findOrFail($id);
        
        // Obtener representantes legales potenciales
        $representatives = Individual::select('id', 'first_name', 'last_name', 'national_id')
                                    ->orderBy('last_name')
                                    ->get();
        
        return Inertia::render('LegalEntities/Edit', [
            'legalEntity' => $legalEntity,
            'representatives' => $representatives
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLegalEntityRequest $request, string $id)
    {
        $legalEntity = LegalEntity::findOrFail($id);
        $legalEntity->update($request->validated());
        
        return Redirect::route('legal-entities.index')->with('success', 'Entidad legal actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $legalEntity = LegalEntity::findOrFail($id);
        $legalEntity->delete();
        
        return Redirect::route('legal-entities.index')->with('success', 'Entidad legal eliminada exitosamente.');
    }
}
