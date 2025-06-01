<?php

return [
    /*
     * El disco en el que se guardarán los archivos
     */
    'disk_name' => env('MEDIA_DISK', 'media'),

    /*
     * El disco conversions en el que se guardarán las conversiones
     */
    'conversions_disk' => env('MEDIA_CONVERSIONS_DISK', 'media'),

    /*
     * El disco en el que se almacenarán las imágenes responsive
     */
    'responsive_images_disk' => env('MEDIA_RESPONSIVE_IMAGES_DISK', 'media'),

    /*
     * El dominio desde el que se servirán los archivos
     */
    'domain' => env('MEDIA_DOMAIN'),

    /*
     * El full URI path donde se servirán los medios desde el disco elegido
     */
    'full_url' => env('MEDIA_FULL_URL'),

    /*
     * El path donde se guardarán los archivos
     */
    'path_generator' => Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator::class,

    /*
     * El path donde se guardarán las URLs para las imágenes responsive
     */
    'url_generator' => Spatie\MediaLibrary\Support\UrlGenerator\DefaultUrlGenerator::class,

    /*
     * Modelo media a utilizar
     */
    'media_model' => Spatie\MediaLibrary\MediaCollections\Models\Media::class,

    /*
     * Las conversiones se guardarán en una tabla adicional
     */
    'generate_thumbnails_for_temporary_uploads' => true,

    /*
     * Tamaño de subida de archivos
     */
    'max_file_size' => 1024 * 1024 * 10, // 10MB

    /*
     * Esta clase es responsable de generar nombres de archivos temporales para las conversiones
     */
    'temporary_directory_path' => storage_path('app/media-library/temp'),

    /*
     * El trabajo fallará si cualquiera de las conversiones falla
     */
    'queue_conversions_by_default' => env('QUEUE_CONVERSIONS_BY_DEFAULT', false),

    /*
     * La clase de cola que se utilizará para generar conversiones
     */
    'job_queue' => env('MEDIA_QUEUE', null),

    /*
     * La clase para determinar la presencia de imágenes responsive
     */
    'image_driver' => env('IMAGE_DRIVER', 'gd'),

    /*
     * FFMPEG & FFProbe binarios que se usarán para generar conversiones de video
     */
    'ffmpeg_path' => env('FFMPEG_PATH', '/usr/bin/ffmpeg'),
    'ffprobe_path' => env('FFPROBE_PATH', '/usr/bin/ffprobe'),

    /*
     * El nombre de la cola en la que se procesarán las conversiones
     */
    'queue_name' => env('MEDIA_QUEUE_NAME', ''),

    /*
     * Registrar eventos de MediaLibrary
     */
    'register_media_collections_events' => true,

    /*
     * Manipulación de medios debe seguir reglas de sanitización
     */
    'sanitize_paths_on_save' => true,
    'sanitize_paths_on_url_generation' => true,
    'enable_vapor_uploads' => env('ENABLE_VAPOR_UPLOADS', false),

    /*
     * Conversiones de video
     */
    'video_driver' => env('VIDEO_DRIVER', 'ffmpeg'),

    /*
     * Los directorios temporales de carga estarán limpios después de días
     */
    'delete_temporary_directories_older_than_days' => 1,

    /*
     * Etiquetas para las conversiones generadas
     */
    'conversion_file_namer' => Spatie\MediaLibrary\Conversions\DefaultConversionFileNamer::class,
];