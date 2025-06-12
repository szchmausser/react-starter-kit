<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\LegalCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

final class LegalCaseMediaController extends Controller
{
    /**
     * Muestra los archivos multimedia asociados a un caso legal.
     *
     * @return \Inertia\Response
     */
    public function index(LegalCase $legalCase)
    {
        try {
            // Obtener todos los archivos multimedia asociados al caso legal
            $mediaItems = $legalCase->getMedia('*');

            // Transformar los resultados para incluir información adicional
            $mediaItems = $mediaItems->map(function ($item) {
                $extension = pathinfo($item->file_name, PATHINFO_EXTENSION);

                // Intentar determinar el tipo por la extensión del archivo primero
                $typeByExtension = $this->getTypeNameFromExtension($extension);
                $item->type_name = $typeByExtension ?? $this->getTypeNameForMimeType($item->mime_type);

                $item->type_icon = $this->getTypeIconForMimeType($item->mime_type);
                $item->extension = $extension;
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

            // Renderizar vista Inertia siempre
            return Inertia::render('LegalCases/Media', [
                'mediaItems' => $mediaItems,
                'legalCase' => $legalCase->only(['id', 'code']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cargar archivos multimedia: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error al cargar archivos multimedia: '.$e->getMessage());
        }
    }

    /**
     * Almacena un nuevo archivo multimedia asociado a un caso legal.
     *
     * @return \Illuminate\Http\RedirectResponse|\Inertia\Response
     */
    public function store(Request $request, LegalCase $legalCase)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'file' => 'required|file|max:10240', // máximo 10MB
        ]);

        try {
            Log::info('Iniciando subida de archivo para caso legal', [
                'legal_case_id' => $legalCase->id,
                'legal_case_code' => $legalCase->code,
                'file_name' => $request->file('file')->getClientOriginalName(),
                'mime_type' => $request->file('file')->getMimeType(),
                'size' => $request->file('file')->getSize(),
            ]);

            // Determinar la colección basada en el tipo MIME
            $mimeType = $request->file('file')->getMimeType();
            $collection = $this->getCollectionForMimeType($mimeType);

            // Agregar el archivo al caso legal usando Media Library
            $media = $legalCase->addMedia($request->file('file'))
                ->withCustomProperties([
                    'description' => $validated['description'] ?? null,
                    'category' => $validated['category'] ?? null,
                    'original_filename' => $request->file('file')->getClientOriginalName(),
                    'uploaded_by' => Auth::id() ?? 1,
                ])
                ->usingName($validated['name'])
                ->toMediaCollection($collection);

            Log::info('Archivo subido correctamente', [
                'media_id' => $media->id,
                'file_name' => $media->file_name,
                'collection' => $media->collection_name,
            ]);

            // Flash del mensaje de éxito
            session()->flash('success', 'Archivo subido correctamente');

            // Redirigir usando Inertia::location para una navegación fluida
            return Inertia::location(route('legal-cases.media.index', $legalCase->id));
        } catch (\Exception $e) {
            Log::error('Error al subir archivo: '.$e->getMessage());
            Log::error($e->getTraceAsString());

            return redirect()->back()
                ->withErrors(['file' => 'Error al subir el archivo: '.$e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Muestra los detalles de un archivo multimedia específico.
     *
     * @return \Inertia\Response
     */
    public function show(LegalCase $legalCase, Media $media)
    {
        try {
            // Verificar que el archivo pertenece al caso legal
            if ($media->model_id != $legalCase->id || $media->model_type != get_class($legalCase)) {
                throw new \Exception('El archivo no pertenece a este caso legal');
            }

            // Añadir información adicional al objeto media
            $extension = pathinfo($media->file_name, PATHINFO_EXTENSION);

            // Intentar determinar el tipo por la extensión del archivo primero
            $typeByExtension = $this->getTypeNameFromExtension($extension);
            $media->type_name = $typeByExtension ?? $this->getTypeNameForMimeType($media->mime_type);

            $media->type_icon = $this->getTypeIconForMimeType($media->mime_type);
            $media->extension = $extension;
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

            // Renderizar vista Inertia siempre
            return Inertia::render('LegalCases/MediaShow', [
                'mediaItem' => $media,
                'legalCase' => $legalCase->only(['id', 'code']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error al mostrar archivo multimedia: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error al mostrar archivo multimedia: '.$e->getMessage());
        }
    }

    /**
     * Muestra el formulario para crear un nuevo archivo multimedia.
     *
     * @return \Inertia\Response
     */
    public function create(LegalCase $legalCase)
    {
        try {
            return Inertia::render('LegalCases/MediaCreate', [
                'legalCase' => $legalCase->only(['id', 'code']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error al mostrar formulario de subida de archivos: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error al mostrar formulario de subida de archivos: '.$e->getMessage());
        }
    }

    /**
     * Muestra el formulario para editar un archivo multimedia.
     *
     * @return \Inertia\Response|\Illuminate\Http\JsonResponse
     */
    public function edit(LegalCase $legalCase, Media $media)
    {
        try {
            // Verificar que el archivo pertenece al caso legal
            if ($media->model_id != $legalCase->id || $media->model_type != get_class($legalCase)) {
                throw new \Exception('El archivo no pertenece a este caso legal');
            }

            // Añadir propiedades personalizadas
            $extension = pathinfo($media->file_name, PATHINFO_EXTENSION);

            // Intentar determinar el tipo por la extensión del archivo primero
            $typeByExtension = $this->getTypeNameFromExtension($extension);
            $media->type_name = $typeByExtension ?? $this->getTypeNameForMimeType($media->mime_type);

            $media->type_icon = $this->getTypeIconForMimeType($media->mime_type);
            $media->extension = $extension;
            $media->description = $media->getCustomProperty('description');
            $media->category = $media->getCustomProperty('category');
            $media->thumbnail = $media->hasGeneratedConversion('thumb') ? $media->getUrl('thumb') : null;

            // Calcular el tamaño legible para humanos
            $media->human_readable_size = $this->getHumanReadableSize($media->size);

            return Inertia::render('LegalCases/MediaEdit', [
                'mediaItem' => $media,
                'legalCase' => $legalCase->only(['id', 'code']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error al editar archivo multimedia: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error al editar archivo multimedia: '.$e->getMessage());
        }
    }

    /**
     * Actualiza un archivo multimedia existente.
     *
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function update(Request $request, LegalCase $legalCase, Media $media)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'file' => 'nullable|file|max:10240', // máximo 10MB
        ]);

        try {
            // Verificar que el archivo pertenece al caso legal
            if ($media->model_id != $legalCase->id || $media->model_type != get_class($legalCase)) {
                throw new \Exception('El archivo no pertenece a este caso legal');
            }

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

            Log::info('Archivo multimedia actualizado', [
                'media_id' => $media->id,
                'name' => $media->name,
            ]);

            // Si se proporciona un nuevo archivo, reemplazarlo
            if ($request->hasFile('file')) {
                Log::info('Reemplazando archivo', [
                    'media_id' => $media->id,
                    'old_file_name' => $media->file_name,
                    'new_file_name' => $request->file('file')->getClientOriginalName(),
                ]);

                // Eliminar el archivo actual
                $media->delete();

                // Subir el nuevo archivo
                $newMedia = $legalCase->addMedia($request->file('file'))
                    ->withCustomProperties([
                        'description' => $validated['description'] ?? null,
                        'category' => $validated['category'] ?? null,
                        'original_filename' => $request->file('file')->getClientOriginalName(),
                        'uploaded_by' => Auth::id() ?? 1,
                        'updated_by' => Auth::id() ?? 1,
                        'updated_at' => now()->toDateTimeString(),
                    ])
                    ->usingName($validated['name'])
                    ->toMediaCollection($this->getCollectionForMimeType($request->file('file')->getMimeType()));

                Log::info('Nuevo archivo subido', [
                    'media_id' => $newMedia->id,
                    'file_name' => $newMedia->file_name,
                ]);

                // Flash del mensaje de éxito
                session()->flash('success', 'Archivo actualizado correctamente');

                // Redirigir usando Inertia::location para una navegación fluida
                return Inertia::location(route('legal-cases.media.index', $legalCase->id));
            }

            // Flash del mensaje de éxito
            session()->flash('success', 'Información actualizada correctamente');

            // Redirigir usando Inertia::location para una navegación fluida
            return Inertia::location(route('legal-cases.media.index', $legalCase->id));
        } catch (\Exception $e) {
            Log::error('Error al actualizar archivo multimedia: '.$e->getMessage());
            Log::error($e->getTraceAsString());

            return redirect()->back()
                ->withErrors(['error' => 'Error al actualizar el archivo: '.$e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Elimina un archivo multimedia.
     *
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function destroy(LegalCase $legalCase, Media $media, Request $request)
    {
        try {
            // Verificar que el archivo pertenece al caso legal
            if ($media->model_id != $legalCase->id || $media->model_type != get_class($legalCase)) {
                throw new \Exception('El archivo no pertenece a este caso legal');
            }

            // Obtener información del archivo antes de eliminarlo
            $mediaId = $media->id;
            $fileName = $media->file_name;

            Log::info('Eliminando archivo multimedia', [
                'media_id' => $mediaId,
                'file_name' => $fileName,
                'legal_case_id' => $legalCase->id,
            ]);

            // Eliminar el archivo
            $media->delete();

            Log::info('Archivo multimedia eliminado correctamente');

            // Flash del mensaje de éxito
            session()->flash('success', 'Archivo eliminado correctamente');

            // Redirigir usando Inertia::location para una navegación fluida
            return Inertia::location(route('legal-cases.media.index', $legalCase->id));
        } catch (\Exception $e) {
            Log::error('Error al eliminar archivo multimedia: '.$e->getMessage());
            Log::error($e->getTraceAsString());

            return redirect()->back()
                ->withErrors(['error' => 'Error al eliminar el archivo: '.$e->getMessage()]);
        }
    }

    /**
     * Descarga un archivo multimedia.
     *
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\RedirectResponse
     */
    public function download(LegalCase $legalCase, Media $media)
    {
        try {
            // Verificar que el archivo pertenece al caso legal
            if ($media->model_id != $legalCase->id || $media->model_type != get_class($legalCase)) {
                throw new \Exception('El archivo no pertenece a este caso legal');
            }

            // Registrar información de descarga
            Log::info('Descargando archivo multimedia', [
                'media_id' => $media->id,
                'file_name' => $media->file_name,
                'legal_case_id' => $legalCase->id,
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
                    Log::info("Archivo encontrado en: {$path}");
                    break;
                }
            }

            // Si no se encuentra el archivo, redireccionar con mensaje de error
            if (! $filePath) {
                Log::error('Archivo no encontrado para descarga', [
                    'media_id' => $media->id,
                    'rutas_probadas' => $possiblePaths,
                ]);

                return redirect()->back()->with('error', 'Archivo no encontrado');
            }

            // Usar el nombre original del archivo para la descarga si está disponible
            $fileName = $media->getCustomProperty('original_filename') ?? $media->file_name;

            return response()->download($filePath, $fileName);
        } catch (\Exception $e) {
            Log::error('Error al descargar archivo multimedia: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error al descargar el archivo: '.$e->getMessage());
        }
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
     * Obtiene un nombre descriptivo para el tipo de archivo según su extensión.
     */
    private function getTypeNameFromExtension(string $extension): ?string
    {
        $extension = strtolower(trim($extension));

        $extensionMap = [
            // Imágenes
            'png' => 'Imagen PNG',
            'jpg' => 'Imagen JPEG',
            'jpeg' => 'Imagen JPEG',
            'gif' => 'Imagen GIF',
            'bmp' => 'Imagen BMP',
            'svg' => 'Imagen SVG',
            'webp' => 'Imagen WEBP',
            'tiff' => 'Imagen TIFF',
            'tif' => 'Imagen TIFF',
            'ico' => 'Icono',

            // Documentos
            'pdf' => 'Documento PDF',
            'doc' => 'Documento Word',
            'docx' => 'Documento Word',
            'xls' => 'Hoja de cálculo Excel',
            'xlsx' => 'Hoja de cálculo Excel',
            'ppt' => 'Presentación PowerPoint',
            'pptx' => 'Presentación PowerPoint',
            'txt' => 'Archivo de texto',
            'rtf' => 'Documento RTF',
            'odt' => 'Documento OpenDocument',
            'ods' => 'Hoja de cálculo OpenDocument',
            'odp' => 'Presentación OpenDocument',

            // Audio
            'mp3' => 'Audio MP3',
            'wav' => 'Audio WAV',
            'ogg' => 'Audio OGG',
            'flac' => 'Audio FLAC',
            'aac' => 'Audio AAC',
            'm4a' => 'Audio M4A',

            // Video
            'mp4' => 'Video MP4',
            'avi' => 'Video AVI',
            'mov' => 'Video MOV',
            'wmv' => 'Video WMV',
            'mkv' => 'Video MKV',
            'flv' => 'Video FLV',
            'webm' => 'Video WEBM',

            // Comprimidos
            'zip' => 'Archivo ZIP',
            'rar' => 'Archivo RAR',
            'tar' => 'Archivo TAR',
            '7z' => 'Archivo 7Z',
            'gz' => 'Archivo GZIP',

            // Otros
            'html' => 'Documento HTML',
            'htm' => 'Documento HTML',
            'css' => 'Hoja de estilos CSS',
            'js' => 'Script JavaScript',
            'json' => 'Archivo JSON',
            'xml' => 'Archivo XML',
            'sql' => 'Script SQL',
            'csv' => 'Archivo CSV',
            'md' => 'Archivo Markdown',
        ];

        return $extensionMap[$extension] ?? null;
    }

    /**
     * Obtiene un nombre descriptivo para el tipo de archivo según su MIME type.
     */
    private function getTypeNameForMimeType(string $mimeType): string
    {
        // Si tenemos un MIME type vacío o inválido
        if (empty($mimeType) || $mimeType === 'application/octet-stream') {
            return 'Archivo Binario';
        }

        // Intentar determinar el tipo por extensión si está disponible en el MIME type
        if (strpos($mimeType, '/') !== false) {
            $parts = explode('/', $mimeType);
            $subtype = $parts[1];

            // Limpiar posibles parámetros adicionales
            if (strpos($subtype, ';') !== false) {
                $subtype = explode(';', $subtype)[0];
            }

            // Para casos como "image/jpeg" o "image/png" donde la extensión puede estar en el subtipo
            $typeByExtension = $this->getTypeNameFromExtension($subtype);
            if ($typeByExtension !== null) {
                return $typeByExtension;
            }
        }

        // Si no se pudo determinar por extensión, usar el MIME type
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
        } elseif ($mimeType === 'text/html' || $mimeType === 'application/xhtml+xml') {
            return 'Documento HTML';
        } elseif ($mimeType === 'text/css') {
            return 'Hoja de estilos CSS';
        } elseif ($mimeType === 'application/javascript' || $mimeType === 'text/javascript') {
            return 'Script JavaScript';
        } elseif ($mimeType === 'application/json') {
            return 'Archivo JSON';
        } elseif ($mimeType === 'application/xml' || $mimeType === 'text/xml') {
            return 'Archivo XML';
        } elseif ($mimeType === 'text/csv') {
            return 'Archivo CSV';
        }

        // Si no coincide con ninguna de las anteriores, devolver un nombre genérico con el MIME type
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
