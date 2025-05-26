<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\TagList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TagListController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        
        $query = TagList::query()
            ->orderBy('name');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tagLists = $query->get();

        return Inertia::render('TagLists/Index', [
            'tagLists' => $tagLists,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('TagLists/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tag_lists,name',
            'description' => 'nullable|string|max:1000',
        ]);

        TagList::create($validated);

        return redirect()->route('tag-lists.index')
            ->with('success', 'Etiqueta creada exitosamente.');
    }

    public function edit(TagList $tagList): Response
    {
        return Inertia::render('TagLists/Edit', [
            'tagList' => $tagList
        ]);
    }

    public function update(Request $request, TagList $tagList)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tag_lists,name,' . $tagList->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $tagList->update($validated);

        return redirect()->route('tag-lists.index')
            ->with('success', 'Etiqueta actualizada exitosamente.');
    }

    public function destroy(TagList $tagList)
    {
        // Verificar si la etiqueta está siendo usada por Spatie Tags
        if ($tagList->tags()->exists()) {
            return redirect()->back()
                ->with('error', 'No se puede eliminar la etiqueta porque está siendo utilizada en uno o más casos legales.');
        }

        $tagList->delete();
        
        return redirect()->route('tag-lists.index')
            ->with('success', 'Etiqueta eliminada exitosamente.');
    }
    
    // API Methods for Tag Selection
    public function search(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'except' => 'nullable|array',
            'except.*' => 'integer|exists:tag_lists,id',
        ]);

        $query = TagList::query()
            ->select(['id', 'name', 'description'])
            ->when($request->search, function($q) use ($request) {
                $q->where(function($query) use ($request) {
                    $query->where('name', 'like', "%{$request->search}%")
                          ->orWhere('description', 'like', "%{$request->search}%");
                });
            })
            ->when($request->filled('except'), function($q) use ($request) {
                $q->whereNotIn('id', $request->except);
            })
            ->orderBy('name')
            ->limit(20);

        return response()->json([
            'data' => $query->get()
        ]);
    }
}
