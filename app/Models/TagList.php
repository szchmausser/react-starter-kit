<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Tags\Tag as SpatieTag;

class TagList extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    /**
     * Obtener las etiquetas de Spatie relacionadas con esta etiqueta de la lista.
     */
    public function tags()
    {
        return $this->hasMany(SpatieTag::class, 'name', 'name');
    }
    
    /**
     * Obtener el nombre de la etiqueta formateado.
     */
    public function getDisplayNameAttribute()
    {
        return $this->name;
    }
    
    /**
     * Obtener la URL para editar la etiqueta.
     */
    public function getEditUrlAttribute()
    {
        return route('tag-lists.edit', $this->id);
    }
    
    /**
     * Scope para buscar etiquetas por nombre.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%");
    }
}
