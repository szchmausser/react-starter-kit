<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\CaseType;
use App\Models\LegalCase;
use App\Models\StatusList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

final class LegalCaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $page = (int) $request->input('page', 1);

        // Validamos que perPage tenga un valor razonable para evitar problemas de rendimiento
        $perPage = in_array($perPage, [5, 10, 20, 50, 100, 200, 500, 1000]) ? $perPage : 10;

        // Modificamos la query para incluir los estados del expediente
        $query = LegalCase::with([
            'caseType',
            'individuals',
            'legalEntities',
            'statuses' => function ($query) {
                // Ordenamos los estados por fecha de creación descendente
                $query->orderBy('created_at', 'desc');
            },
        ]);

        // Procesamos los filtros avanzados si existen
        if ($request->has('filter')) {
            $filters = $request->input('filter');

            foreach ($filters as $filter) {
                if (empty($filter['field']) || empty($filter['operator'])) {
                    continue;
                }

                $field = $filter['field'];
                $operator = $filter['operator'];
                $value = $filter['value'] ?? null;
                $type = $filter['type'] ?? 'string';

                // Aplicar filtros según el tipo de campo
                switch ($type) {
                    case 'string':
                        $this->applyStringFilter($query, $field, $operator, $value);
                        break;

                    case 'date':
                        $this->applyDateFilter($query, $field, $operator, $value);
                        break;

                    case 'select':
                        $this->applySelectFilter($query, $field, $operator, $value);
                        break;

                    case 'individual':
                        $this->applyIndividualFilter($query, $field, $operator, $value);
                        break;

                    case 'legal_entity':
                        $this->applyLegalEntityFilter($query, $field, $operator, $value);
                        break;
                }
            }
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
            'active' => false,
        ];

        // Agregar links para todas las páginas
        for ($i = 1; $i <= $legalCases->lastPage(); $i++) {
            $paginationLinks[] = [
                'url' => $legalCases->url($i),
                'label' => (string) $i,
                'active' => $i === $legalCases->currentPage(),
            ];
        }

        // Agregar link para página siguiente
        $paginationLinks[] = [
            'url' => $legalCases->currentPage() < $legalCases->lastPage() ? $legalCases->url($legalCases->currentPage() + 1) : null,
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        // Asignar los links generados manualmente a la respuesta JSON que irá al frontend
        $legalCasesResponse = $legalCases->toArray();

        // Procesar los datos para incluir el estado actual
        foreach ($legalCasesResponse['data'] as &$case) {
            // Si tiene estados, tomamos el primero (ya están ordenados por fecha descendente)
            if (! empty($case['statuses'])) {
                $case['currentStatus'] = [
                    'id' => $case['statuses'][0]['id'],
                    'name' => $case['statuses'][0]['name'],
                    'reason' => $case['statuses'][0]['reason'],
                    'created_at' => $case['statuses'][0]['created_at'],
                    'model_type' => $case['statuses'][0]['model_type'],
                    'model_id' => $case['statuses'][0]['model_id'],
                ];
            } else {
                $case['currentStatus'] = null;
            }
        }

        // Asegurarse de que la estructura meta exista
        if (! isset($legalCasesResponse['meta'])) {
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

        // Obtener todos los tipos de caso para el filtro
        $caseTypes = CaseType::orderBy('name')->get();

        return Inertia::render('LegalCases/Index', [
            'legalCases' => $legalCasesResponse,
            'filters' => [
                'per_page' => $perPage,
            ],
            'caseTypes' => $caseTypes,
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
        // Verificar si se está creando un nuevo tipo de caso
        // Esto ocurre cuando el campo new_case_type tiene valor
        $createNewCaseType = $request->filled('new_case_type') && trim($request->input('new_case_type')) !== '';

        // Validación condicional según lo que se esté creando
        if ($createNewCaseType) {
            $validated = $request->validate([
                'code' => 'required|string|max:255|unique:legal_cases',
                'entry_date' => 'required|date',
                'new_case_type' => 'required|string|max:255',
            ]);

            // Crear el nuevo tipo de caso
            $caseType = CaseType::create([
                'name' => $validated['new_case_type'],
            ]);

            // Crear el expediente con el nuevo tipo de caso
            $legalCase = LegalCase::create([
                'code' => $validated['code'],
                'entry_date' => $validated['entry_date'],
                'case_type_id' => $caseType->id,
            ]);
        } else {
            $validated = $request->validate([
                'code' => 'required|string|max:255|unique:legal_cases',
                'entry_date' => 'required|date',
                'case_type_id' => 'required|exists:case_types,id',
            ]);

            // Crear el expediente con el tipo de caso existente
            $legalCase = LegalCase::create([
                'code' => $validated['code'],
                'entry_date' => $validated['entry_date'],
                'case_type_id' => $validated['case_type_id'],
            ]);
        }

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

        // Obtener todos los archivos multimedia (sin filtrar por colección)
        $allMedia = $legalCase->getMedia('*');

        Log::debug('Todos los archivos multimedia encontrados:', [
            'legal_case_id' => $legalCase->id,
            'count' => $allMedia->count(),
            'collections' => $allMedia->pluck('collection_name')->unique()->toArray(),
        ]);

        // Obtener los 5 archivos multimedia más recientes para mostrar en la tarjeta
        $mediaItems = $allMedia->sortByDesc('created_at')->take(5)->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'mime_type' => $item->mime_type,
                'extension' => pathinfo($item->file_name, PATHINFO_EXTENSION),
                'human_readable_size' => $this->getHumanReadableSize($item->size),
                'created_at' => $item->created_at->toDateTimeString(),
            ];
        })->values();

        Log::debug('Archivos multimedia para mostrar:', [
            'legal_case_id' => $legalCase->id,
            'count' => $mediaItems->count(),
            'items' => $mediaItems->toArray(),
        ]);

        // Depurar los datos de roles
        Log::debug('Individuos con roles:', $legalCase->individuals->map(function ($individual) {
            return [
                'id' => $individual->id,
                'name' => $individual->first_name.' '.$individual->last_name,
                'role' => $individual->pivot->role ?? 'Sin rol definido',
            ];
        })->toArray());

        Log::debug('Entidades con roles:', $legalCase->legalEntities->map(function ($entity) {
            return [
                'id' => $entity->id,
                'name' => $entity->business_name,
                'role' => $entity->pivot->role ?? 'Sin rol definido',
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
            'mediaItems' => $mediaItems,
        ]);
    }

    /**
     * Calcula el tamaño legible para humanos
     */
    private function getHumanReadableSize(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        // Formato para español: separador decimal coma, miles con punto
        return number_format($bytes, $precision, ',', '.').' '.$units[$pow];
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
            'code' => 'required|string|max:255|unique:legal_cases,code,'.$id,
            'entry_date' => 'required|date',
            'case_type_id' => 'required|exists:case_types,id',
        ]);

        $legalCase->update($validated);

        return Redirect::route('legal-cases.index')
            ->with('success', 'Expediente actualizado exitosamente.');
    }

    /**
     * Actualiza la fecha de sentencia del expediente.
     */
    public function updateSentenceDate(Request $request, string $id)
    {
        $validated = $request->validate([
            'sentence_date' => 'required|date',
        ]);

        $legalCase = LegalCase::findOrFail($id);
        $legalCase->sentence_date = $validated['sentence_date'];
        $legalCase->save();

        return response()->json(['success' => true, 'sentence_date' => $legalCase->sentence_date]);
    }

    /**
     * Actualiza la fecha de cierre del expediente.
     */
    public function updateClosingDate(Request $request, string $id)
    {
        $validated = $request->validate([
            'closing_date' => 'required|date',
        ]);

        $legalCase = LegalCase::findOrFail($id);
        $legalCase->closing_date = $validated['closing_date'];
        $legalCase->save();

        return response()->json(['success' => true, 'closing_date' => $legalCase->closing_date]);
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

        $statusName = $request->input('status');
        $reason = $request->input('reason');

        // Verificar si el estado ya existe en la tabla status_lists
        $statusExists = StatusList::where('name', $statusName)->exists();

        // Si el estado no existe, crearlo en la tabla status_lists
        if (! $statusExists) {
            StatusList::create([
                'name' => $statusName,
                'description' => 'Creado automáticamente desde la interfaz de expedientes',
            ]);

            Log::info("Se ha creado un nuevo estado en status_lists: {$statusName}");
        }

        // Asignar el estado al expediente usando el paquete spatie/laravel-model-status
        $legalCase = LegalCase::findOrFail($id);
        $legalCase->setStatus($statusName, $reason);

        return response()->json(['success' => true]);
    }

    /**
     * Listar estatus disponibles (pueden venir de la base de datos o ser configurables).
     */
    public function availableStatuses()
    {
        // Obtener los nombres de los estatus desde la nueva tabla status_lists
        $statuses = StatusList::orderBy('name')->pluck('name');

        return response()->json($statuses);
    }

    /**
     * Obtener las etiquetas de un expediente legal.
     *
     * @param  string  $id  ID del expediente
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTags(string $id)
    {
        try {
            $legalCase = LegalCase::findOrFail($id);
            $tags = $legalCase->tags()->get()->map(function ($tag) {
                // Log para depuración
                \Log::debug('Tag obtenido del expediente:', [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'type' => $tag->type,
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
            \Log::error('Error al obtener etiquetas del expediente: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'expediente_id' => $id,
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

            \Log::debug('Etiquetas recuperadas de la BD:', [
                'count' => $tags->count(),
                'tags' => $tags->toArray(),
            ]);

            $formattedTags = $tags->map(function ($tag) {
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
                    'locale' => app()->getLocale(),
                ]);

                return [
                    'id' => $tag->id,
                    'name' => $name,
                    'type' => $tag->type,
                    'slug' => $slug,
                ];
            });

            \Log::debug('Enviando etiquetas formateadas:', [
                'count' => $formattedTags->count(),
                'tags' => $formattedTags->toArray(),
            ]);

            return response()->json($formattedTags);
        } catch (\Exception $e) {
            \Log::error('Error al obtener todas las etiquetas: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Error al obtener las etiquetas: '.$e->getMessage()], 500);
        }
    }

    /**
     * Agregar etiquetas a un expediente legal.
     * Permite crear etiquetas nuevas si no existen.
     *
     * @param  string  $id  ID del expediente
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

                if (! $existingTag && $createIfNotExists) {
                    // Crear la etiqueta si no existe y está habilitada la opción
                    \Spatie\Tags\Tag::findOrCreate($tag);
                    $created = true;
                    \Log::info("Se ha creado una nueva etiqueta: {$tag}");
                }

                $legalCase->attachTag($tag);
            }

            return response()->json([
                'success' => true,
                'created' => $created,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al agregar etiquetas: '.$e->getMessage(), [
                'exception' => $e,
                'tags' => $tags,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al agregar etiquetas: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar una etiqueta de un expediente legal.
     *
     * @param  string  $id  ID del expediente
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
     * @param  string  $id  ID del expediente
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

    /**
     * Aplica filtros de tipo texto a la consulta.
     */
    private function applyStringFilter($query, $field, $operator, $value)
    {
        if (empty($value)) {
            return;
        }

        switch ($operator) {
            case 'equals':
                $query->where($field, '=', $value);
                break;
            case 'contains':
                $query->where($field, 'like', '%'.$value.'%');
                break;
            case 'starts_with':
                $query->where($field, 'like', $value.'%');
                break;
            case 'ends_with':
                $query->where($field, 'like', '%'.$value);
                break;
            case 'not_contains':
                $query->where($field, 'not like', '%'.$value.'%');
                break;
        }
    }

    /**
     * Aplica filtros de tipo fecha a la consulta.
     */
    private function applyDateFilter($query, $field, $operator, $value)
    {
        switch ($operator) {
            case 'equals':
                $query->whereDate($field, '=', $value);
                break;
            case 'before':
                $query->whereDate($field, '<', $value);
                break;
            case 'after':
                $query->whereDate($field, '>', $value);
                break;
            case 'between':
                // Verificar si el valor es una cadena JSON y decodificarla
                if (is_string($value) && $this->isJson($value)) {
                    $dateRange = json_decode($value, true);
                    if (isset($dateRange['start']) && isset($dateRange['end'])) {
                        $query->whereDate($field, '>=', $dateRange['start'])
                            ->whereDate($field, '<=', $dateRange['end']);
                    }
                }
                // Mantener compatibilidad con el formato anterior (array directo)
                elseif (is_array($value) && isset($value['start']) && isset($value['end'])) {
                    $query->whereDate($field, '>=', $value['start'])
                        ->whereDate($field, '<=', $value['end']);
                }
                break;
            case 'is_null':
                $query->whereNull($field);
                break;
            case 'is_not_null':
                $query->whereNotNull($field);
                break;
        }
    }

    /**
     * Verifica si una cadena es JSON válido.
     */
    private function isJson($string)
    {
        if (! is_string($string)) {
            return false;
        }

        json_decode($string);

        return json_last_error() === JSON_ERROR_NONE;
    }

    /**
     * Aplica filtros de tipo selección a la consulta.
     */
    private function applySelectFilter($query, $field, $operator, $value)
    {
        if (empty($value)) {
            return;
        }

        switch ($operator) {
            case 'equals':
                $query->where($field, '=', $value);
                break;
            case 'not_equals':
                $query->where($field, '!=', $value);
                break;
        }
    }

    /**
     * Aplica filtros para buscar expedientes relacionados con individuos por su documento de identidad.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $field
     * @param  string  $operator
     * @param  string  $value
     * @return void
     */
    private function applyIndividualFilter($query, $field, $operator, $value)
    {
        if (empty($value)) {
            return;
        }

        // Solo procesamos el campo de documento de identidad
        if ($field !== 'individual_id_document') {
            return;
        }

        // Usamos whereHas para filtrar expedientes que tienen relación con individuos
        // que cumplen con el criterio de búsqueda
        $query->whereHas('individuals', function ($subQuery) use ($operator, $value) {
            // Buscamos en los campos national_id y passport que son los documentos de identidad
            switch ($operator) {
                case 'equals':
                    $subQuery->where(function ($q) use ($value) {
                        $q->where('national_id', '=', $value)
                            ->orWhere('passport', '=', $value);
                    });
                    break;
                case 'contains':
                    $subQuery->where(function ($q) use ($value) {
                        $q->where('national_id', 'like', '%'.$value.'%')
                            ->orWhere('passport', 'like', '%'.$value.'%');
                    });
                    break;
            }
        });
    }

    /**
     * Aplica filtros para buscar expedientes relacionados con entidades legales por su RIF o razón social.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $field
     * @param  string  $operator
     * @param  string  $value
     * @return void
     */
    private function applyLegalEntityFilter($query, $field, $operator, $value)
    {
        if (empty($value)) {
            return;
        }

        // Determinar qué campo de la entidad legal debemos buscar
        $entityField = null;
        $shouldSearchTradeNameToo = false;

        switch ($field) {
            case 'legal_entity_rif':
                $entityField = 'rif';
                break;
            case 'legal_entity_business_name':
                $entityField = 'business_name';
                $shouldSearchTradeNameToo = true; // Indicar que también debemos buscar en trade_name
                break;
            default:
                return; // Si no es un campo válido, no aplicamos filtro
        }

        // Usamos whereHas para filtrar expedientes que tienen relación con entidades legales
        // que cumplen con el criterio de búsqueda
        $query->whereHas('legalEntities', function ($subQuery) use ($operator, $value, $entityField, $shouldSearchTradeNameToo) {
            if ($shouldSearchTradeNameToo) {
                // Si es business_name, también buscamos en trade_name
                $subQuery->where(function ($q) use ($operator, $value, $entityField) {
                    // Aplicar el operador al campo business_name
                    switch ($operator) {
                        case 'equals':
                            $q->where($entityField, '=', $value);
                            break;
                        case 'contains':
                            $q->where($entityField, 'like', '%'.$value.'%');
                            break;
                        case 'starts_with':
                            $q->where($entityField, 'like', $value.'%');
                            break;
                    }

                    // Aplicar el mismo operador al campo trade_name
                    switch ($operator) {
                        case 'equals':
                            $q->orWhere('trade_name', '=', $value);
                            break;
                        case 'contains':
                            $q->orWhere('trade_name', 'like', '%'.$value.'%');
                            break;
                        case 'starts_with':
                            $q->orWhere('trade_name', 'like', $value.'%');
                            break;
                    }
                });
            } else {
                // Para otros campos (como RIF), solo buscamos en ese campo específico
                switch ($operator) {
                    case 'equals':
                        $subQuery->where($entityField, '=', $value);
                        break;
                    case 'contains':
                        $subQuery->where($entityField, 'like', '%'.$value.'%');
                        break;
                    case 'starts_with':
                        $subQuery->where($entityField, 'like', $value.'%');
                        break;
                }
            }
        });
    }
}
