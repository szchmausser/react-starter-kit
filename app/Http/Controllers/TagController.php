<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TagController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Tag::query();

        $search = $request->input('search');
        // No aplicar búsqueda aquí, será en el frontend

        $tags = $query->orderBy('name')->get();

        return Inertia::render('Tags/Index', [
            'tags' => $tags,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Tags/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
            'description' => 'nullable|string|max:1000',
        ]);
        Tag::create($validated);
        return redirect()->route('tags.index')
            ->with('success', 'Tag creado exitosamente.');
    }

    public function edit(Tag $tag): Response
    {
        return Inertia::render('Tags/Edit', [
            'tag' => $tag
        ]);
    }

    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name,' . $tag->id,
            'description' => 'nullable|string|max:1000',
        ]);
        $tag->update($validated);
        return redirect()->route('tags.index')
            ->with('success', 'Tag actualizado exitosamente.');
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();
        return redirect()->route('tags.index')
            ->with('success', 'Tag eliminado exitosamente.');
    }
}
