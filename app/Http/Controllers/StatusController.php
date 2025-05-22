<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Status;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class StatusController extends Controller
{
    public function index(): Response
    {
        $statuses = Status::orderBy('name')->get();
        
        return Inertia::render('Statuses/Index', [
            'statuses' => $statuses
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Statuses/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:statuses,name',
            'reason' => 'nullable|string|max:1000',
        ]);

        Status::create($validated);

        return redirect()->route('statuses.index')
            ->with('success', 'Estatus creado exitosamente.');
    }

    public function edit(Status $status): Response
    {
        return Inertia::render('Statuses/Edit', [
            'status' => $status
        ]);
    }

    public function update(Request $request, Status $status)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:statuses,name,' . $status->id,
            'reason' => 'nullable|string|max:1000',
        ]);

        $status->update($validated);

        return redirect()->route('statuses.index')
            ->with('success', 'Estatus actualizado exitosamente.');
    }

    public function destroy(Status $status)
    {
        $status->delete();

        return redirect()->route('statuses.index')
            ->with('success', 'Estatus eliminado exitosamente.');
    }
} 