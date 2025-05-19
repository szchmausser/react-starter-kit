<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Searchable\Searchable;
use Spatie\Searchable\SearchResult;
use Spatie\ModelStatus\HasStatuses;

class LegalCase extends Model implements Searchable
{
    use HasFactory, SoftDeletes, HasStatuses;

    protected $fillable = [
        'code',
        'entry_date',
        'case_type_id',
        'sentence_date',
        'closing_date',
    ];

    protected $dates = [
        'entry_date',
        'sentence_date',
        'closing_date',
    ];

    public function getSearchResult(): SearchResult
    {
        // URL para ver el detalle del caso
        $url = route('legal-cases.show', $this->id);
        
        return new SearchResult(
            $this,
            "Expediente: {$this->code}",
            $url
        );
    }

    // Relaciones
    public function caseType()
    {
        return $this->belongsTo(CaseType::class);
    }

    public function individuals()
    {
        return $this->belongsToMany(Individual::class, 'case_individuals')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function legalEntities()
    {
        return $this->belongsToMany(LegalEntity::class, 'case_legal_entities')
                    ->withPivot('role')
                    ->withTimestamps();
    }
} 