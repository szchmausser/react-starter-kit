<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Modelo para gestionar los archivos compartidos de la biblioteca multimedia.
 * 
 * Este modelo actúa como propietario de los archivos compartidos que no pertenecen
 * a ningún usuario específico, permitiendo una gestión centralizada de los mismos.
 */
class MediaOwner extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Método estático para obtener o crear la instancia principal de MediaOwner.
     * 
     * @return \App\Models\MediaOwner
     */
    public static function instance(): self
    {
        $instance = static::first();

        if (!$instance) {
            $instance = static::create([
                'name' => 'Shared files owner',
                'description' => 'Sample model to use as media owner'
            ]);
        }

        return $instance;
    }

    /**
     * Registra las conversiones de medios.
     *
     * @param \Spatie\MediaLibrary\MediaCollections\Models\Media|null $media
     * @return void
     */
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(200)
            ->height(200)
            ->sharpen(10)
            ->nonQueued();

        $this->addMediaConversion('preview')
            ->width(800)
            ->height(800)
            ->nonQueued();
    }

    /**
     * Registra todas las conversiones de medios.
     * Este método es necesario para el reemplazo de archivos.
     *
     * @return void
     */
    public function registerAllMediaConversions(): void
    {
        $this->addMediaConversion('thumb')
            ->width(200)
            ->height(200)
            ->sharpen(10)
            ->nonQueued();

        $this->addMediaConversion('preview')
            ->width(800)
            ->height(800)
            ->nonQueued();
    }
}
