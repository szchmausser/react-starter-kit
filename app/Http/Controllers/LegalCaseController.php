<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\LegalCase;
use App\Models\CaseType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;

final class LegalCaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $perPage = (int) $request->input('per_page', 10);
        $page = (int) $request->input('page', 1);
        
        // Validamos que perPage tenga un valor razonable para evitar problemas de rendimiento
        $perPage = in_array($perPage, [5, 10, 20, 50, 100, 200, 500, 1000]) ? $perPage : 10;
        
        $query = LegalCase::with(['caseType', 'individuals', 'legalEntities']);
        
        if ($search) {
            $query->where('code', 'like', "%{$search}%");
        }
        
        // Contar el total de registros para depuración
        // Importante: Clonar la query para evitar que el count afecte a la paginación
        $totalRecords = (clone $query)->count();
        
        // Logs de depuración comentados para mejorar el rendimiento
        /*
        \Log::debug("Total de expedientes: {$totalRecords}");
        \Log::debug("Expedientes por página: {$perPage}");
        \Log::debug("Página actual: {$page}");
        \Log::debug("Total de páginas calculado: " . ceil($totalRecords / $perPage));
        */
        
        // Usamos paginación estándar de Laravel con límite de registros por rendimiento
        $legalCases = $query->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();
            
        // Verificar información de paginación - comentado para mejorar rendimiento
        /*
        \Log::debug("Meta de paginación:", [
            'total' => $legalCases->total(),
            'per_page' => $legalCases->perPage(),
            'current_page' => $legalCases->currentPage(),
            'last_page' => $legalCases->lastPage(),
            'has_pages' => $legalCases->hasPages(),
        ]);
        */
        
        // Obtener los links generados manualmente para el frontend
        $paginationLinks = [];
        
        // Agregar link para página anterior
        $paginationLinks[] = [
            'url' => $legalCases->currentPage() > 1 ? $legalCases->url($legalCases->currentPage() - 1) : null,
            'label' => '&laquo; Previous',
            'active' => false
        ];
        
        // Agregar links para todas las páginas
        for ($i = 1; $i <= $legalCases->lastPage(); $i++) {
            $paginationLinks[] = [
                'url' => $legalCases->url($i),
                'label' => (string)$i,
                'active' => $i === $legalCases->currentPage()
            ];
        }
        
        // Agregar link para página siguiente
        $paginationLinks[] = [
            'url' => $legalCases->currentPage() < $legalCases->lastPage() ? $legalCases->url($legalCases->currentPage() + 1) : null,
            'label' => 'Next &raquo;',
            'active' => false
        ];
        
        // Asignar los links generados manualmente a la respuesta JSON que irá al frontend
        $legalCasesResponse = $legalCases->toArray();
        
        // Asegurarse de que la estructura meta exista
        if (!isset($legalCasesResponse['meta'])) {
            $legalCasesResponse['meta'] = [];
        }
        
        // Asegurarse de que tengamos todos los metadatos necesarios
        $totalPages = ceil($totalRecords / $perPage);
        $from = ($page - 1) * $perPage + 1;
        $to = min($from + $perPage - 1, $totalRecords);
        
        // Rellenar/corregir los metadatos
        $legalCasesResponse['meta']['current_page'] = $page;
        $legalCasesResponse['meta']['last_page'] = $totalPages;
        $legalCasesResponse['meta']['from'] = $from;
        $legalCasesResponse['meta']['to'] = $to;
        $legalCasesResponse['meta']['total'] = $totalRecords;
        $legalCasesResponse['meta']['per_page'] = $perPage;
        $legalCasesResponse['meta']['links'] = $paginationLinks;
        
        // \Log::debug("Metadatos de paginación finales:", $legalCasesResponse['meta']);
        
        return Inertia::render('LegalCases/Index', [
            'legalCases' => $legalCasesResponse,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
            'debug' => [
                'total_records' => $totalRecords,
                'total_pages' => ceil($totalRecords / $perPage),
                'links_count' => count($paginationLinks),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $caseTypes = CaseType::orderBy('name')->get();
        return Inertia::render('LegalCases/Create', [
            'caseTypes' => $caseTypes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:legal_cases',
            'entry_date' => 'required|date',
            'case_type_id' => 'required|exists:case_types,id',
        ]);

        LegalCase::create($validated);

        return Redirect::route('legal-cases.index')
            ->with('success', 'Expediente creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $legalCase = LegalCase::with(['caseType', 'individuals', 'legalEntities'])->findOrFail($id);
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
        
        return Inertia::render('LegalCases/Show', [
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
        $legalCase = LegalCase::with(['caseType'])->findOrFail($id);
        $caseTypes = CaseType::orderBy('name')->get();

        return Inertia::render('LegalCases/Edit', [
            'legalCase' => $legalCase,
            'caseTypes' => $caseTypes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $legalCase = LegalCase::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:legal_cases,code,' . $id,
            'entry_date' => 'required|date',
            'case_type_id' => 'required|exists:case_types,id',
        ]);

        $legalCase->update($validated);

        return Redirect::route('legal-cases.index')
            ->with('success', 'Expediente actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $legalCase = LegalCase::findOrFail($id);
        $legalCase->delete();

        return Redirect::route('legal-cases.index')
            ->with('success', 'Expediente eliminado exitosamente.');
    }

    /**
     * Obtener historial de estatus del expediente.
     */
    public function statuses(string $id)
    {
        $legalCase = LegalCase::findOrFail($id);
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
        $legalCase = LegalCase::findOrFail($id);
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

    /**
     * Obtener las etiquetas de un expediente legal.
     *
     * @param string $id ID del expediente
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTags(string $id)
    {
        try {
            $legalCase = LegalCase::findOrFail($id);
            $tags = $legalCase->tags()->get()->map(function($tag) {
                // Log para depuración
                \Log::debug('Tag obtenido del expediente:', [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'type' => $tag->type
                ]);
                
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'type' => $tag->type,
                    'slug' => $tag->slug,
                ];
            });
            
            return response()->json($tags);
        } catch (\Exception $e) {
            \Log::error('Error al obtener etiquetas del expediente: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'expediente_id' => $id
            ]);
            return response()->json(['error' => 'Error al obtener las etiquetas del expediente'], 500);
        }
    }

    /**
     * Obtener todas las etiquetas disponibles para asignar.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllTags()
    {
        try {
            // Obtener el total de etiquetas para debugging
            $totalTags = \Spatie\Tags\Tag::count();
            \Log::debug("Total de etiquetas en la base de datos: {$totalTags}");
            
            $tags = \Spatie\Tags\Tag::orderBy('order_column')->get();
            
            \Log::debug("Etiquetas recuperadas de la BD:", [
                'count' => $tags->count(),
                'tags' => $tags->toArray()
            ]);
            
            $formattedTags = $tags->map(function($tag) {
                // Asegurarse de que el nombre se procese correctamente
                $name = $tag->name;
                // Asegurarse de que el slug se procese correctamente
                $slug = $tag->slug;
                
                // Para depuración
                \Log::debug('Tag encontrado:', [
                    'id' => $tag->id,
                    'name_raw' => $tag->getAttributes()['name'],
                    'name_processed' => $name,
                    'type' => $tag->type,
                    'locale' => app()->getLocale()
                ]);
                
                return [
                    'id' => $tag->id,
                    'name' => $name,
                    'type' => $tag->type,
                    'slug' => $slug,
                ];
            });
            
            \Log::debug("Enviando etiquetas formateadas:", [
                'count' => $formattedTags->count(),
                'tags' => $formattedTags->toArray()
            ]);
            
            return response()->json($formattedTags);
        } catch (\Exception $e) {
            \Log::error('Error al obtener todas las etiquetas: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Error al obtener las etiquetas: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Agregar etiquetas a un expediente legal.
     * Permite crear etiquetas nuevas si no existen.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $id ID del expediente
     * @return \Illuminate\Http\JsonResponse
     */
    public function attachTags(Request $request, string $id)
    {
        $request->validate([
            'tags' => 'required|array',
            'tags.*' => 'string',
            'create_if_not_exists' => 'sometimes|boolean',
        ]);

        $legalCase = LegalCase::findOrFail($id);
        $tags = $request->input('tags');
        $createIfNotExists = $request->input('create_if_not_exists', false);
        $created = false;
        
        try {
            foreach ($tags as $tag) {
                // Verificar si la etiqueta ya existe
                $existingTag = \Spatie\Tags\Tag::findFromString($tag);
                
                if (!$existingTag && $createIfNotExists) {
                    // Crear la etiqueta si no existe y está habilitada la opción
                    \Spatie\Tags\Tag::findOrCreate($tag);
                    $created = true;
                    \Log::info("Se ha creado una nueva etiqueta: {$tag}");
                }
                
                $legalCase->attachTag($tag);
            }
            
            return response()->json([
                'success' => true,
                'created' => $created
            ]);
        } catch (\Exception $e) {
            \Log::error("Error al agregar etiquetas: " . $e->getMessage(), [
                'exception' => $e,
                'tags' => $tags,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al agregar etiquetas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una etiqueta de un expediente legal.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $id ID del expediente
     * @return \Illuminate\Http\JsonResponse
     */
    public function detachTag(Request $request, string $id)
    {
        $request->validate([
            'tag' => 'required|string',
        ]);

        $legalCase = LegalCase::findOrFail($id);
        $tag = $request->input('tag');
        
        $legalCase->detachTag($tag);
        
        return response()->json(['success' => true]);
    }

    /**
     * Sincronizar las etiquetas de un expediente legal.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $id ID del expediente
     * @return \Illuminate\Http\JsonResponse
     */
    public function syncTags(Request $request, string $id)
    {
        $request->validate([
            'tags' => 'required|array',
            'tags.*' => 'string',
        ]);

        $legalCase = LegalCase::findOrFail($id);
        $tags = $request->input('tags');
        
        $legalCase->syncTags($tags);
        
        return response()->json(['success' => true]);
    }
}
