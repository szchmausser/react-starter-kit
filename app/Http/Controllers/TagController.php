<?php

namespace App\Http\Controllers;

use Spatie\Tags\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function index(Request $request): Response
    {
        $type = $request->input('type');

        $query = Tag::query()
            ->when($type, function($q) use ($type) {
                $q->where('type', $type);
            })
            ->orderBy('order_column');

        $tags = $query->get()->map(function($tag) {
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
}
