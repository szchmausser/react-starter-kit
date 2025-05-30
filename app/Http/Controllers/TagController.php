<?php

namespace App\Http\Controllers;

use Spatie\Tags\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class TagController extends Controller
{
    public function index(Request $request): Response
    {
        $type = $request->input('type');

        $query = Tag::query()
            ->when($type, function ($q) use ($type) {
                $q->where('type', $type);
            })
            ->orderBy('order_column');

        $tags = $query->get()->map(function ($tag) {
            return [
                'id' => $tag->id,
                'name' => $tag->name,
                'type' => $tag->type,
                'created_at' => $tag->created_at->toDateTimeString(),
                'updated_at' => $tag->updated_at->toDateTimeString(),
            ];
        });

        return Inertia::render('Tags/Index', [
            'tags' => $tags,
            'filters' => [
                'type' => $type,
            ],
        ]);
    }

    public function create(): Response
    {
        // Obtener tipos únicos de etiquetas existentes
        $existingTypes = Tag::whereNotNull('type')
            ->distinct()
            ->pluck('type')
            ->filter()
            ->values();

        return Inertia::render('Tags/Create', [
            'existingTypes' => $existingTypes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
        ]);

        Tag::findOrCreate(
            [$validated['name']],
            $validated['type'] ?? null
        );

        return redirect()->route('tags.index')
            ->with('success', 'Etiqueta creada exitosamente');
    }

    public function edit(Tag $tag): Response
    {
        return Inertia::render('Tags/Edit', [
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'type' => $tag->type,
            ],
        ]);
    }

    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
        ]);

        $tag->name = [$request->input('locale', app()->getLocale()) => $validated['name']];
        $tag->type = $validated['type'] ?? null;
        $tag->save();

        return redirect()->route('tags.index')
            ->with('success', 'Etiqueta actualizada exitosamente');
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();

        return redirect()->route('tags.index')
            ->with('success', 'Etiqueta eliminada exitosamente');
    }

    /**
     * Obtiene las relaciones de una etiqueta específica
     * Si es una petición AJAX, devuelve JSON, si no, redirecciona a la vista principal
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function getRelations($id)
    {
        try {
            // Obtener la etiqueta
            $tag = Tag::findOrFail($id);
            Log::info("Buscando relaciones para la etiqueta: {$tag->name}");

            // Estructura para almacenar las relaciones por tipo de modelo
            $relations = [];

            // Modelos que pueden tener etiquetas
            $taggableModels = [
                \App\Models\LegalCase::class => 'Expedientes',
                \App\Models\Individual::class => 'Personas',
                \App\Models\LegalEntity::class => 'Entidades',
                // Añadir más modelos a medida que se implementen
            ];

            // Buscar modelos relacionados con esta etiqueta
            foreach ($taggableModels as $modelClass => $displayName) {
                Log::info("Verificando relaciones en modelo: {$modelClass}");

                if (class_exists($modelClass)) {
                    // Verificar si el modelo utiliza el trait HasTags
                    if ($this->modelUsesHasTags($modelClass)) {
                        // Obtener modelos que tienen esta etiqueta
                        $models = $modelClass::withAnyTags([$tag->name])->get();

                        Log::info("Encontrados {$models->count()} registros de {$displayName} con la etiqueta");

                        if ($models->count() > 0) {
                            // Transformar los modelos a un formato estándar para mostrar
                            $relatedItems = $this->transformModelsToArray($models);
                            $relations[$displayName] = $relatedItems;
                        }
                    } else {
                        Log::warning("El modelo {$modelClass} no utiliza el trait HasTags");
                    }
                } else {
                    Log::warning("El modelo {$modelClass} no existe");
                }
            }

            // Si es una petición AJAX, devolver JSON
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json($relations);
            }

            // Si no es AJAX, redireccionar a la vista principal con un mensaje
            return redirect()->route('tags.index')
                ->with('info', 'Esta operación solo está disponible mediante AJAX.');

        } catch (\Exception $e) {
            Log::error("Error al obtener relaciones para la etiqueta {$id}: " . $e->getMessage());
            Log::error($e->getTraceAsString());

            if (request()->ajax() || request()->wantsJson()) {
                return response()->json(
                    ['error' => 'Error al obtener las relaciones de la etiqueta'],
                    500
                );
            }

            return redirect()->route('tags.index')
                ->with('error', 'Error al obtener las relaciones de la etiqueta.');
        }
    }

    /**
     * Verifica si un modelo utiliza el trait HasTags
     *
     * @param string $modelClass
     * @return bool
     */
    private function modelUsesHasTags(string $modelClass): bool
    {
        $traits = class_uses_recursive($modelClass);
        return in_array(\Spatie\Tags\HasTags::class, $traits);
    }

    /**
     * Transforma una colección de modelos a un formato estándar para mostrar
     *
     * @param \Illuminate\Database\Eloquent\Collection $models
     * @return array
     */
    private function transformModelsToArray($models): array
    {
        $result = [];

        foreach ($models as $model) {
            $item = [
                'id' => $model->id,
                'created_at' => $model->created_at,
            ];

            // Incluir el código si existe (para expedientes legales, archivos, etc.)
            if (isset($model->code)) {
                $item['code'] = $model->code;
            }

            // Añadir título según el tipo de modelo
            if ($model instanceof \App\Models\LegalCase) {
                // Para expedientes legales
                $item['title'] = "Expediente " . ($model->code ? $model->code : "EXP-{$model->id}");

            } elseif ($model instanceof \App\Models\Individual) {
                // Para personas (individuos)
                $fullName = trim("{$model->first_name} {$model->middle_name} {$model->last_name} {$model->second_last_name}");
                $item['title'] = $fullName ?: "Persona #{$model->id}";

                // Añadir información adicional
                $info = [];
                if (!empty($model->national_id))
                    $info[] = "CI: {$model->national_id}";
                if (!empty($model->email_1))
                    $info[] = $model->email_1;
                if (!empty($model->phone_number_1))
                    $info[] = $model->phone_number_1;

                if (!empty($info)) {
                    $item['description'] = implode(' | ', $info);
                }

            } elseif ($model instanceof \App\Models\LegalEntity) {
                // Para entidades legales
                $item['title'] = $model->business_name ?: "Entidad #{$model->id}";
                if (!empty($model->trade_name)) {
                    $item['title'] .= " ({$model->trade_name})";
                }

                // Añadir información adicional
                $info = [];
                if (!empty($model->rif))
                    $info[] = "RIF: {$model->rif}";
                if (!empty($model->email_1))
                    $info[] = $model->email_1;
                if (!empty($model->phone_number_1))
                    $info[] = $model->phone_number_1;

                if (!empty($info)) {
                    $item['description'] = implode(' | ', $info);
                }

            } else {
                // Para otros modelos, intentar determinar un título adecuado
                if (method_exists($model, 'getDisplayTitle')) {
                    $item['title'] = $model->getDisplayTitle();
                } elseif (isset($model->title)) {
                    $item['title'] = $model->title;
                } elseif (isset($model->name)) {
                    $item['title'] = $model->name;
                } else {
                    $item['title'] = "ID: {$model->id}";
                }

                // Añadir descripción si existe
                if (isset($model->description)) {
                    $item['description'] = $model->description;
                } elseif (isset($model->content)) {
                    $item['description'] = $model->content;
                }
            }

            $result[] = $item;
        }

        return $result;
    }
}
