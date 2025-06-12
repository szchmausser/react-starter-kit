<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\MediaOwner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaLibraryController extends Controller
{
    /**
     * Muestra el listado de archivos.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        try {
            $query = Media::query();

            // Filtrar solo los archivos asociados al modelo MediaOwner
            $query->where('model_type', MediaOwner::class);

            // Filtrar por colección si se proporciona y no es "_all"
            if ($request->filled('collection') && $request->input('collection') !== '_all') {
                $query->where('collection_name', $request->input('collection'));
            }

            // Filtrar por término de búsqueda si se proporciona
            if ($request->filled('search')) {
                $searchTerm = $request->input('search');
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('file_name', 'like', "%{$searchTerm}%")
                        ->orWhereRaw("JSON_EXTRACT(custom_properties, '$.description') LIKE ?", ["%{$searchTerm}%"]);
                });
            }

            // Filtrar por fecha de creación
            if ($request->filled('date_type') && $request->input('date_type') === 'created') {
                if ($request->filled('start_date')) {
                    $query->whereDate('created_at', '>=', $request->input('start_date'));
                }
                if ($request->filled('end_date')) {
                    $query->whereDate('created_at', '<=', $request->input('end_date'));
                }
            }

            // Filtrar por fecha de actualización
            if ($request->filled('date_type') && $request->input('date_type') === 'updated') {
                if ($request->filled('start_date')) {
                    $query->whereDate('updated_at', '>=', $request->input('start_date'));
                }
                if ($request->filled('end_date')) {
                    $query->whereDate('updated_at', '<=', $request->input('end_date'));
                }
            }

            // Obtener todos los registros para paginación del lado del cliente
            $media = $query->latest()->get();

            // Transformar los resultados para incluir información adicional
            $media = $media->map(function ($item) {
                $item->type_name = $this->getTypeNameForMimeType($item->mime_type);
                $item->type_icon = $this->getTypeIconForMimeType($item->mime_type);
                $item->extension = pathinfo($item->file_name, PATHINFO_EXTENSION);
                $item->description = $item->getCustomProperty('description');
                $item->category = $item->getCustomProperty('category');

                // Construir URLs correctas para los archivos
                $item->file_url = $this->getCorrectUrl($item);
                $item->preview_url = $item->hasGeneratedConversion('preview') ? $item->getUrl('preview') : null;
                $item->thumbnail = $item->hasGeneratedConversion('thumb') ? $item->getUrl('thumb') : null;

                // Para imágenes, si no hay miniaturas, usar la URL directa
                if (strpos($item->mime_type, 'image/') === 0 && ! $item->thumbnail) {
                    $item->thumbnail = $item->file_url;
                }

                // Calcular el tamaño legible para humanos
                $item->human_readable_size = $this->getHumanReadableSize($item->size);

                return $item;
            });

            return Inertia::render('MediaLibrary/Index', [
                'mediaItems' => $media,
                'filters' => $request->only(['search', 'collection', 'date_type', 'start_date', 'end_date']),
                'collections' => Media::select('collection_name')
                    ->where('model_type', MediaOwner::class)
                    ->distinct()
                    ->pluck('collection_name'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Error al cargar la biblioteca de archivos: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Muestra el formulario para subir un nuevo archivo.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('MediaLibrary/Create');
    }

    /**
     * Almacena un nuevo archivo en la base de datos.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'file' => 'required|file|max:10240', // máximo 10MB
        ]);

        try {
            \Log::info('Iniciando subida de archivo', [
                'file_name' => $request->file('file')->getClientOriginalName(),
                'mime_type' => $request->file('file')->getMimeType(),
                'size' => $request->file('file')->getSize(),
            ]);

            // Determinar la colección basada en el tipo MIME
            $mimeType = $request->file('file')->getMimeType();
            $collection = $this->getCollectionForMimeType($mimeType);

            \Log::info('Colección determinada: '.$collection);

            // En lugar de usar un modelo anónimo, vamos a usar un enfoque más directo
            // Crear un registro de Media manualmente
            $file = $request->file('file');
            $fileName = Str::random(40).'.'.$file->getClientOriginalExtension();

            // Guardar el archivo en el disco
            $path = Storage::disk('public')->putFileAs(
                'media/'.$collection,
                $file,
                $fileName
            );

            \Log::info('Archivo guardado en disco', ['path' => $path]);

            // Crear un registro de Media
            $media = new Media;
            $media->name = $validated['name'];
            $media->file_name = $fileName;
            $media->disk = 'public';
            $media->conversions_disk = 'public';
            $media->collection_name = $collection;
            $media->mime_type = $mimeType;
            $media->size = $file->getSize();
            $media->uuid = Str::uuid();
            $media->manipulations = [];
            $media->custom_properties = [
                'description' => $validated['description'] ?? null,
                'category' => $validated['category'] ?? null,
                'original_filename' => $file->getClientOriginalName(),
                'uploaded_by' => Auth::id() ?? 1,
            ];
            $media->responsive_images = [];
            $media->order_column = Media::max('order_column') + 1;
            $media->generated_conversions = [];

            // Obtener o crear la instancia de MediaOwner
            $mediaOwner = MediaOwner::instance();

            // Campos obligatorios: model_id y model_type
            $media->model_id = $mediaOwner->id;
            $media->model_type = MediaOwner::class;

            // Guardar el registro en la base de datos
            $media->save();

            \Log::info('Media guardado en base de datos', [
                'media_id' => $media->id,
                'file_name' => $media->file_name,
            ]);

            return redirect()->route('media-library.index')
                ->with('success', 'Archivo subido correctamente.');
        } catch (\Exception $e) {
            \Log::error('Error al subir archivo: '.$e->getMessage());
            \Log::error($e->getTraceAsString());

            return redirect()->back()->withErrors([
                'error' => 'Error al subir el archivo: '.$e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Muestra los detalles de un archivo específico.
     *
     * @return \Inertia\Response
     */
    public function show(Media $media)
    {
        // Verificar que el archivo pertenezca al modelo MediaOwner
        if ($media->model_type !== MediaOwner::class) {
            return redirect()->route('media-library.index')
                ->with('error', 'No tienes acceso a este archivo.');
        }

        // Añadir información adicional al objeto media
        $media->type_name = $this->getTypeNameForMimeType($media->mime_type);
        $media->type_icon = $this->getTypeIconForMimeType($media->mime_type);
        $media->extension = pathinfo($media->file_name, PATHINFO_EXTENSION);
        $media->description = $media->getCustomProperty('description');
        $media->category = $media->getCustomProperty('category');
        $media->original_filename = $media->getCustomProperty('original_filename');
        $media->uploaded_by = $media->getCustomProperty('uploaded_by');
        $media->preview_url = $media->hasGeneratedConversion('preview') ? $media->getUrl('preview') : null;
        $media->thumbnail = $media->hasGeneratedConversion('thumb') ? $media->getUrl('thumb') : null;
        $media->file_url = $this->getCorrectUrl($media);
        $media->last_modified = $media->updated_at->format('d/m/Y, H:i');

        // Calcular el tamaño legible para humanos
        $media->human_readable_size = $this->getHumanReadableSize($media->size);

        return Inertia::render('MediaLibrary/Show', [
            'mediaItem' => $media,
        ]);
    }

    /**
     * Muestra el formulario para editar un archivo existente.
     *
     * @return \Inertia\Response
     */
    public function edit(Media $media)
    {
        // Verificar que el archivo pertenezca al modelo MediaOwner
        if ($media->model_type !== MediaOwner::class) {
            return redirect()->route('media-library.index')
                ->with('error', 'No tienes acceso a este archivo.');
        }

        // Añadir propiedades personalizadas
        $media->description = $media->getCustomProperty('description');
        $media->category = $media->getCustomProperty('category');
        $media->thumbnail = $media->hasGeneratedConversion('thumb') ? $media->getUrl('thumb') : null;

        return Inertia::render('MediaLibrary/Edit', [
            'mediaItem' => $media,
        ]);
    }

    /**
     * Actualiza un archivo existente.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Media $media)
    {
        // Verificar que el archivo pertenezca al modelo MediaOwner
        if ($media->model_type !== MediaOwner::class) {
            return redirect()->route('media-library.index')
                ->with('error', 'No tienes acceso a este archivo.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'file' => 'nullable|file|max:10240', // máximo 10MB
        ]);

        try {
            // Depuración: Verificar si se recibió un archivo
            \Log::debug('Actualización de archivo iniciada', [
                'media_id' => $media->id,
                'has_file' => $request->hasFile('file'),
                'all_inputs' => $request->all(),
                'files' => $request->allFiles(),
            ]);

            // Actualizar nombre
            $media->name = $validated['name'];

            // Actualizar propiedades personalizadas
            $customProperties = $media->custom_properties;
            $customProperties['description'] = $validated['description'] ?? null;
            $customProperties['category'] = $validated['category'] ?? null;
            $customProperties['updated_by'] = Auth::id() ?? 1;
            $customProperties['updated_at'] = now()->toDateTimeString();
            $media->custom_properties = $customProperties;

            $media->save();

            \Log::info('Media actualizado', [
                'media_id' => $media->id,
                'name' => $media->name,
            ]);

            // Si se proporciona un nuevo archivo, reemplazarlo
            if ($request->hasFile('file')) {
                \Log::info('Reemplazando archivo', [
                    'media_id' => $media->id,
                    'old_file_name' => $media->file_name,
                    'new_file_name' => $request->file('file')->getClientOriginalName(),
                    'new_file_size' => $request->file('file')->getSize(),
                    'new_file_mime' => $request->file('file')->getMimeType(),
                ]);

                // Guardar información original
                $originalModelId = $media->model_id;
                $originalModelType = $media->model_type;
                $oldFileName = $media->file_name;
                $oldCollection = $media->collection_name;

                // Eliminar el archivo físico anterior
                $oldRelativePath = 'media/'.$oldCollection.'/'.$oldFileName;
                if (Storage::disk($media->disk)->exists($oldRelativePath)) {
                    Storage::disk($media->disk)->delete($oldRelativePath);
                    \Log::info('Archivo anterior eliminado: '.$oldRelativePath);
                }

                // Procesar el nuevo archivo
                $file = $request->file('file');
                $mimeType = $file->getMimeType();
                $collection = $this->getCollectionForMimeType($mimeType);
                $fileName = Str::random(40).'.'.$file->getClientOriginalExtension();

                try {
                    // Guardar el nuevo archivo
                    $path = Storage::disk('public')->putFileAs(
                        'media/'.$collection,
                        $file,
                        $fileName
                    );

                    \Log::info('Nuevo archivo guardado en disco', ['path' => $path]);

                    if (! Storage::disk('public')->exists('media/'.$collection.'/'.$fileName)) {
                        throw new \Exception('El archivo no se guardó correctamente en el disco');
                    }
                } catch (\Exception $e) {
                    \Log::error('Error al guardar el archivo en el disco: '.$e->getMessage());

                    return redirect()->back()->withErrors([
                        'error' => 'Error al guardar el archivo: '.$e->getMessage(),
                    ])->withInput();
                }

                // Actualizar el registro de Media
                $media->file_name = $fileName;
                $media->collection_name = $collection;
                $media->mime_type = $mimeType;
                $media->size = $file->getSize();
                $media->disk = 'public';
                $media->conversions_disk = 'public';

                // Asegurarnos de que los campos model_id y model_type se mantengan
                $media->model_id = $originalModelId;
                $media->model_type = $originalModelType;

                // Actualizar propiedades personalizadas
                $customProperties = $media->custom_properties;
                $customProperties['original_filename'] = $file->getClientOriginalName();
                $media->custom_properties = $customProperties;

                $media->save();

                \Log::info('Media actualizado con nuevo archivo', [
                    'media_id' => $media->id,
                    'file_name' => $media->file_name,
                ]);

                return redirect()->route('media-library.index')
                    ->with('success', 'Archivo actualizado correctamente.');
            }

            return redirect()->route('media-library.index')
                ->with('success', 'Información actualizada correctamente.');
        } catch (\Exception $e) {
            \Log::error('Error al actualizar archivo: '.$e->getMessage());
            \Log::error($e->getTraceAsString());

            return redirect()->back()->withErrors([
                'error' => 'Error al actualizar el archivo: '.$e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Elimina un archivo.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Media $media)
    {
        try {
            // Verificar que el archivo pertenezca al modelo MediaOwner
            if ($media->model_type !== MediaOwner::class) {
                return redirect()->route('media-library.index')
                    ->with('error', 'No tienes acceso a este archivo.');
            }

            // Obtener información del archivo antes de eliminarlo
            $diskName = $media->disk;
            $fileName = $media->file_name;
            $collection = $media->collection_name;
            $mediaId = $media->id;

            // Construir la ruta relativa del archivo
            $relativePath = 'media/'.$collection.'/'.$fileName;

            \Log::info('Eliminando archivo', [
                'media_id' => $mediaId,
                'file_name' => $fileName,
                'relative_path' => $relativePath,
                'disk' => $diskName,
            ]);

            // Eliminar el archivo físico del disco
            if (Storage::disk($diskName)->exists($relativePath)) {
                Storage::disk($diskName)->delete($relativePath);
                \Log::info('Archivo físico eliminado correctamente');
            } else {
                \Log::warning('No se encontró el archivo físico en la ruta: '.$relativePath);
            }

            // Eliminar el registro de la base de datos
            $media->delete();
            \Log::info('Registro de Media eliminado de la base de datos');

            return redirect()->route('media-library.index')
                ->with('success', 'Archivo eliminado correctamente.');
        } catch (\Exception $e) {
            \Log::error('Error al eliminar archivo: '.$e->getMessage());
            \Log::error($e->getTraceAsString());

            return redirect()->back()->withErrors([
                'error' => 'Error al eliminar el archivo: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Método de depuración para ver la información de un archivo.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function fileInfo(Media $media)
    {
        $diskPath = Storage::disk($media->disk)->path('');
        $filePath = $media->getPath();
        $fileExists = file_exists($filePath);

        // Buscar el archivo en diferentes ubicaciones posibles
        $possiblePaths = [
            $diskPath.'/'.$media->file_name,
            $diskPath.'/media/'.$media->collection_name.'/'.$media->file_name,
            $diskPath.'/'.$media->id.'/'.$media->file_name,
            $diskPath.'/'.$media->collection_name.'/'.$media->file_name,
        ];

        $foundPaths = [];
        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                $foundPaths[] = $path;
            }
        }

        return response()->json([
            'media' => $media,
            'disk_path' => $diskPath,
            'file_path' => $filePath,
            'file_exists' => $fileExists,
            'possible_paths' => $possiblePaths,
            'found_paths' => $foundPaths,
            'file_url' => $media->getUrl(),
            'custom_properties' => $media->custom_properties,
        ]);
    }

    /**
     * Descarga un archivo.
     *
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
     */
    public function download(Media $media)
    {
        // Verificar que el archivo pertenezca al modelo MediaOwner
        if ($media->model_type !== MediaOwner::class) {
            return redirect()->route('media-library.index')
                ->with('error', 'No tienes acceso a este archivo.');
        }

        // Registrar información de depuración
        \Log::info('Intento de descarga de archivo', [
            'media_id' => $media->id,
            'collection' => $media->collection_name,
            'filename' => $media->file_name,
            'path_from_getPath' => $media->getPath(),
            'disk' => $media->disk,
            'disk_path' => Storage::disk($media->disk)->path(''),
        ]);

        // Intentar diferentes rutas posibles
        $possiblePaths = [
            // Ruta que devuelve getPath()
            $media->getPath(),

            // Rutas basadas en la estructura de carpetas observada
            storage_path("app/public/media/{$media->collection_name}/{$media->file_name}"),
            storage_path("app/public/{$media->id}/{$media->file_name}"),
            storage_path("app/public/{$media->file_name}"),

            // Rutas basadas en el disco configurado
            Storage::disk($media->disk)->path("media/{$media->collection_name}/{$media->file_name}"),
            Storage::disk($media->disk)->path("{$media->id}/{$media->file_name}"),
            Storage::disk($media->disk)->path("{$media->file_name}"),

            // Rutas adicionales con variaciones
            public_path("storage/media/{$media->collection_name}/{$media->file_name}"),
            public_path("storage/{$media->id}/{$media->file_name}"),
            public_path("storage/{$media->file_name}"),
        ];

        // Buscar el archivo en las rutas posibles
        $filePath = null;
        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                $filePath = $path;
                \Log::info("Archivo encontrado en: {$path}");
                break;
            }
        }

        // Si no se encuentra el archivo, registrar error y devolver respuesta con información de depuración
        if (! $filePath) {
            \Log::error('Archivo no encontrado para descarga', [
                'media_id' => $media->id,
                'rutas_probadas' => $possiblePaths,
            ]);

            // En entorno de desarrollo, devolver información detallada
            if (app()->environment('local', 'development')) {
                return response()->json([
                    'error' => 'Archivo no encontrado',
                    'media' => $media->toArray(),
                    'rutas_probadas' => $possiblePaths,
                ], 404);
            }

            abort(404, 'Archivo no encontrado');
        }

        // Usar el nombre original del archivo para la descarga si está disponible
        $fileName = $media->getCustomProperty('original_filename') ?? $media->file_name;

        return response()->download($filePath, $fileName);
    }

    /**
     * Determina la colección adecuada basada en el tipo MIME.
     */
    private function getCollectionForMimeType(string $mimeType): string
    {
        if (strpos($mimeType, 'image/') === 0) {
            return 'images';
        } elseif (strpos($mimeType, 'video/') === 0) {
            return 'videos';
        } elseif (strpos($mimeType, 'audio/') === 0) {
            return 'audio';
        } elseif (
            in_array($mimeType, [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
            ])
        ) {
            return 'documents';
        } elseif (
            in_array($mimeType, [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])
        ) {
            return 'spreadsheets';
        } elseif (
            in_array($mimeType, [
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ])
        ) {
            return 'presentations';
        } elseif (
            in_array($mimeType, [
                'application/zip',
                'application/x-rar-compressed',
            ])
        ) {
            return 'compressed';
        }

        // Valor por defecto
        return 'documents';
    }

    /**
     * Obtiene un nombre descriptivo para el tipo de archivo según su MIME type.
     */
    private function getTypeNameForMimeType(string $mimeType): string
    {
        if (strpos($mimeType, 'image/') === 0) {
            $type = str_replace('image/', '', $mimeType);

            return 'Imagen '.strtoupper($type);
        } elseif ($mimeType === 'application/pdf') {
            return 'Documento PDF';
        } elseif ($mimeType === 'application/msword' || $mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return 'Documento Word';
        } elseif (strpos($mimeType, 'video/') === 0) {
            $type = str_replace('video/', '', $mimeType);

            return 'Video '.strtoupper($type);
        } elseif (strpos($mimeType, 'audio/') === 0) {
            $type = str_replace('audio/', '', $mimeType);

            return 'Audio '.strtoupper($type);
        } elseif ($mimeType === 'application/vnd.ms-excel' || $mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return 'Hoja de cálculo Excel';
        } elseif ($mimeType === 'application/vnd.ms-powerpoint' || $mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            return 'Presentación PowerPoint';
        } elseif ($mimeType === 'application/zip' || $mimeType === 'application/x-rar-compressed') {
            return 'Archivo comprimido';
        } elseif ($mimeType === 'text/plain') {
            return 'Archivo de texto';
        }

        return 'Archivo '.$mimeType;
    }

    /**
     * Obtiene un icono descriptivo para el tipo de archivo según su MIME type.
     */
    private function getTypeIconForMimeType(string $mimeType): string
    {
        if (strpos($mimeType, 'image/') === 0) {
            return 'image';
        } elseif ($mimeType === 'application/pdf') {
            return 'file-text';
        } elseif ($mimeType === 'application/msword' || $mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return 'file-text';
        } elseif (strpos($mimeType, 'video/') === 0) {
            return 'video';
        } elseif (strpos($mimeType, 'audio/') === 0) {
            return 'music';
        } elseif ($mimeType === 'application/vnd.ms-excel' || $mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return 'file-spreadsheet';
        } elseif ($mimeType === 'application/vnd.ms-powerpoint' || $mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            return 'file-presentation';
        } elseif ($mimeType === 'application/zip' || $mimeType === 'application/x-rar-compressed') {
            return 'file-archive';
        } elseif ($mimeType === 'text/plain') {
            return 'file-text';
        }

        return 'file';
    }

    /**
     * Limpia archivos huérfanos que puedan haber quedado en el sistema.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function cleanOrphanedFiles()
    {
        try {
            // Ejecutar el comando artisan
            $output = new \Symfony\Component\Console\Output\BufferedOutput;
            $exitCode = \Artisan::call('media:clean-orphaned', [], $output);

            $outputText = $output->fetch();
            \Log::info('Resultado de la limpieza de archivos huérfanos: '.$outputText);

            if ($exitCode === 0) {
                return redirect()->route('media-library.index')
                    ->with('success', 'Limpieza de archivos huérfanos completada con éxito.');
            } else {
                return redirect()->route('media-library.index')
                    ->with('warning', 'La limpieza de archivos huérfanos se completó con advertencias. Revise los logs para más detalles.');
            }
        } catch (\Exception $e) {
            \Log::error('Error al limpiar archivos huérfanos: '.$e->getMessage());
            \Log::error($e->getTraceAsString());

            return redirect()->back()->withErrors([
                'error' => 'Error al limpiar archivos huérfanos: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Convierte un tamaño en bytes a un formato legible para humanos.
     */
    private function getHumanReadableSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        // Formato para español: separador decimal coma, miles con punto
        return number_format($bytes, 2, ',', '.').' '.$units[$pow];
    }

    /**
     * Obtiene la URL correcta para un archivo de media.
     */
    private function getCorrectUrl(Media $media): string
    {
        // Usar directamente el método getUrl() del paquete Media Library
        // que genera la URL correcta según la configuración del disco y la estructura de carpetas
        return $media->getUrl();
    }
}
