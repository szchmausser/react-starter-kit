<?php

namespace App\Http\Controllers;

use App\Models\CaseImportantDate;
use App\Models\CaseType;
use App\Models\LegalCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia; // Importar CaseType

class CaseImportantDateController extends Controller
{
    public function index(LegalCase $legalCase)
    {
        $importantDates = $legalCase->importantDates()
            ->with('creator')
            ->orderBy('end_date')
            ->get();

        $nextImportantDate = $legalCase->importantDates()
            ->where('is_expired', false)
            ->whereDate('end_date', '>=', now()->toDateString())
            ->orderBy('end_date')
            ->first();

        return Inertia::render('LegalCases/ImportantDates', [
            'legalCase' => $legalCase,
            'importantDates' => $importantDates->map(function ($date) {
                return [
                    'id' => $date->id,
                    'title' => $date->title,
                    'description' => $date->description,
                    'start_date' => $date->start_date?->toDateString(),
                    'end_date' => $date->end_date?->toDateString(),
                    'is_expired' => (bool) $date->is_expired,
                    'created_by' => $date->creator ? [
                        'id' => $date->creator->id,
                        'name' => $date->creator->name,
                    ] : null,
                ];
            }),
            'nextImportantDate' => $nextImportantDate,
        ]);
    }

    public function indexList(Request $request)
    {
        $caseTypes = CaseType::orderBy('name')->get(['id', 'name']);

        // Obtener filtros para la sección de próximos a finalizar
        $upcomingFilters = $request->only(['upcoming_start_date', 'upcoming_end_date', 'upcoming_case_type_id']);
        // Obtener filtros para la sección de lapsos pasados
        $pastDueFilters = $request->only(['past_due_start_date', 'past_due_end_date', 'past_due_case_type_id']);

        // Query para lapsos procesales próximos a finalizar
        $queryUpcoming = LegalCase::query();

        if ($request->has('upcoming_start_date') && $request->has('upcoming_end_date')) {
            $startDate = $request->input('upcoming_start_date');
            $endDate = $request->input('upcoming_end_date');

            $queryUpcoming->whereHas('importantDates', function ($q) use ($startDate, $endDate) {
                $q->where('is_expired', false)
                    ->whereDate('end_date', '>=', $startDate)
                    ->whereDate('end_date', '<=', $endDate);
            });
        } else {
            $queryUpcoming->whereHas('importantDates', function ($q) {
                $q->where('is_expired', false)
                    ->whereDate('end_date', '>=', now()->toDateString());
            });
        }

        if ($request->filled('upcoming_case_type_id') && $request->input('upcoming_case_type_id') !== 'all') {
            $queryUpcoming->where('case_type_id', $request->input('upcoming_case_type_id'));
        }

        $legalCasesUpcoming = $queryUpcoming->with([
            'caseType',
            'importantDates' => function ($q) {
                $q->where('is_expired', false)
                    ->whereDate('end_date', '>=', now()->toDateString())
                    ->orderBy('end_date')
                    ->limit(1);
            },
        ])
            ->whereHas('importantDates', function ($q) {
                $q->where('is_expired', false)
                    ->whereDate('end_date', '>=', now()->toDateString());
            })
            ->orderBy(
                CaseImportantDate::select('end_date')
                    ->whereColumn('legal_case_id', 'legal_cases.id')
                    ->where('is_expired', false)
                    ->whereDate('end_date', '>=', now()->toDateString())
                    ->orderBy('end_date')
                    ->limit(1)
            )
            ->paginate(10, ['*'], 'upcoming_page')
            ->through(function ($legalCase) {
                $nextImportantDate = $legalCase->importantDates->first();

                return [
                    'id' => $legalCase->id,
                    'code' => $legalCase->code,
                    'case_type' => [
                        'id' => $legalCase->caseType->id,
                        'name' => $legalCase->caseType->name,
                    ],
                    'next_important_date' => $nextImportantDate ? [
                        'id' => $nextImportantDate->id,
                        'title' => $nextImportantDate->title,
                        'end_date' => $nextImportantDate->end_date?->toDateString(),
                    ] : null,
                ];
            });

        // Query para lapsos procesales pasados
        $queryPastDue = LegalCase::query();

        if ($request->has('past_due_start_date') && $request->has('past_due_end_date')) {
            $startDate = $request->input('past_due_start_date');
            $endDate = $request->input('past_due_end_date');

            $queryPastDue->whereHas('importantDates', function ($q) use ($startDate, $endDate) {
                $q->where('is_expired', false)
                    ->whereDate('end_date', '<', $startDate)
                    ->whereDate('end_date', '>=', $endDate);
            });
        } else {
            $queryPastDue->whereHas('importantDates', function ($q) {
                $q->where('is_expired', false)
                    ->whereDate('end_date', '<', now()->toDateString());
            });
        }

        if ($request->filled('past_due_case_type_id') && $request->input('past_due_case_type_id') !== 'all') {
            $queryPastDue->where('case_type_id', $request->input('past_due_case_type_id'));
        }

        $legalCasesPastDue = $queryPastDue->with([
            'caseType',
            'importantDates' => function ($q) {
                $q->where('is_expired', false)
                    ->whereDate('end_date', '<', now()->toDateString())
                    ->orderByDesc('end_date')
                    ->limit(1);
            },
        ])
            ->whereHas('importantDates', function ($q) {
                $q->where('is_expired', false)
                    ->whereDate('end_date', '<', now()->toDateString());
            })
            ->orderByDesc(
                CaseImportantDate::select('end_date')
                    ->whereColumn('legal_case_id', 'legal_cases.id')
                    ->where('is_expired', false)
                    ->whereDate('end_date', '<', now()->toDateString())
                    ->orderByDesc('end_date')
                    ->limit(1)
            )
            ->paginate(10, ['*'], 'past_due_page')
            ->through(function ($legalCase) {
                $nextImportantDate = $legalCase->importantDates->first();

                return [
                    'id' => $legalCase->id,
                    'code' => $legalCase->code,
                    'case_type' => [
                        'id' => $legalCase->caseType->id,
                        'name' => $legalCase->caseType->name,
                    ],
                    'next_important_date' => $nextImportantDate ? [
                        'id' => $nextImportantDate->id,
                        'title' => $nextImportantDate->title,
                        'end_date' => $nextImportantDate->end_date?->toDateString(),
                    ] : null,
                ];
            });

        return Inertia::render('LegalCases/ImportantDatesIndex', [
            'legalCasesUpcoming' => $legalCasesUpcoming,
            'legalCasesPastDue' => $legalCasesPastDue,
            'caseTypes' => $caseTypes,
            'filters' => $request->only([
                'upcoming_start_date',
                'upcoming_end_date',
                'upcoming_case_type_id',
                'past_due_start_date',
                'past_due_end_date',
                'past_due_case_type_id',
            ]),
        ]);
    }

    public function store(Request $request, LegalCase $legalCase)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $importantDate = $legalCase->importantDates()->create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Fecha importante creada exitosamente');
    }

    public function update(Request $request, LegalCase $legalCase, CaseImportantDate $importantDate)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_expired' => 'required|boolean',
        ]);

        $importantDate->update($validated);

        return redirect()->back()->with('success', 'Fecha importante actualizada exitosamente');
    }

    public function destroy(LegalCase $legalCase, CaseImportantDate $importantDate)
    {
        $importantDate->delete();

        return redirect()->back()->with('success', 'Fecha importante eliminada exitosamente');
    }

    public function setExpired(Request $request, LegalCase $legalCase, CaseImportantDate $importantDate)
    {
        $request->validate([
            'is_expired' => 'required|boolean',
        ]);
        $importantDate->is_expired = $request->input('is_expired');
        $importantDate->save();

        return redirect()->back()->with('success', 'Estado de vencimiento actualizado');
    }
}
