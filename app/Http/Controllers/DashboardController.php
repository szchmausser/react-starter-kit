<?php

namespace App\Http\Controllers;

use App\Models\LegalCase;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $startOfWeek = $now->copy()->startOfWeek();
        $endOfWeek = $now->copy()->endOfWeek();
        $startOfLastWeek = $now->copy()->subWeek()->startOfWeek();
        $endOfLastWeek = $now->copy()->subWeek()->endOfWeek();

        $registeredThisWeek = LegalCase::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count();
        $registeredLastWeek = LegalCase::whereBetween('created_at', [$startOfLastWeek, $endOfLastWeek])->count();
        $closedThisWeek = LegalCase::whereNotNull('closing_date')->whereBetween('closing_date', [$startOfWeek, $endOfWeek])->count();
        $closedLastWeek = LegalCase::whereNotNull('closing_date')->whereBetween('closing_date', [$startOfLastWeek, $endOfLastWeek])->count();
        $active = LegalCase::whereNull('closing_date')->count();

        return Inertia::render('dashboard', [
            'casesSummary' => [
                'registeredThisWeek' => $registeredThisWeek,
                'registeredLastWeek' => $registeredLastWeek,
                'closedThisWeek' => $closedThisWeek,
                'closedLastWeek' => $closedLastWeek,
                'active' => $active,
            ],
        ]);
    }

    public function getUrgentDeadlines()
    {
        $localToday = Carbon::now()->setTimezone(config('app.local_timezone', 'America/Caracas'))->startOfDay();
        $endOfWeek = $localToday->copy()->endOfWeek();

        // Subconsulta para encontrar la próxima fecha importante no expirada para cada caso
        $subquery = fn ($q) => $q->where('is_expired', false)
            ->whereDate('end_date', '>=', $localToday->toDateString())
            ->orderBy('end_date', 'asc');

        // Obtener los casos que tienen fechas importantes próximas y no están cerrados
        $legalCases = LegalCase::whereNull('closing_date')
            ->whereHas('importantDates', $subquery)
            ->with(['importantDates' => $subquery])
            ->get();

        $urgentDeadlines = [
            'today' => [],
            'tomorrow' => [],
            'thisWeek' => [],
        ];

        foreach ($legalCases as $case) {
            // La primera fecha importante en la colección es la más cercana gracias al orderBy
            $nextDeadline = $case->importantDates->first();

            if (!$nextDeadline) continue;

            $deadlineDate = Carbon::parse($nextDeadline->end_date);

            $deadlineInfo = [
                'id' => $nextDeadline->id,
                'description' => $nextDeadline->title, // Usamos el título como descripción principal
                'date' => $deadlineDate->toDateString(),
                'legal_case' => [
                    'id' => $case->id,
                    'case_number' => $case->code, // Asumiendo que 'code' es el número de caso
                ],
            ];

            if ($deadlineDate->isToday()) {
                $urgentDeadlines['today'][] = $deadlineInfo;
            } elseif ($deadlineDate->isTomorrow()) {
                $urgentDeadlines['tomorrow'][] = $deadlineInfo;
            } elseif ($deadlineDate->isBetween($localToday, $endOfWeek)) {
                $urgentDeadlines['thisWeek'][] = $deadlineInfo;
            }
        }

        return response()->json($urgentDeadlines);
    }

    public function getPastDueDeadlines()
    {
        $localToday = Carbon::now()->setTimezone(config('app.local_timezone', 'America/Caracas'))->startOfDay();

        // Subconsulta para encontrar el vencimiento pasado más reciente no expirado
        $subquery = fn ($q) => $q->where('is_expired', false)
            ->whereDate('end_date', '<', $localToday->toDateString())
            ->orderBy('end_date', 'desc');

        // Obtener los casos con vencimientos pasados no atendidos
        $legalCases = LegalCase::whereNull('closing_date')
            ->whereHas('importantDates', $subquery)
            ->with(['importantDates' => $subquery])
            ->get();

        $pastDueDeadlines = $legalCases->map(function ($case) {
            $lastPastDueDeadline = $case->importantDates->first();

            if (!$lastPastDueDeadline) return null;

            return [
                'id' => $lastPastDueDeadline->id,
                'description' => $lastPastDueDeadline->title,
                'date' => Carbon::parse($lastPastDueDeadline->end_date)->toDateString(),
                'legal_case' => [
                    'id' => $case->id,
                    'case_number' => $case->code,
                ],
            ];
        })->filter()->values();

        return response()->json($pastDueDeadlines);
    }

    public function getCaseStatusDistribution()
    {
        // Obtener los IDs de los expedientes activos
        $activeCaseIds = DB::table('legal_cases')->whereNull('closing_date')->pluck('id');

        // Subconsulta para obtener el ID del estado más reciente de cada expediente activo
        $latestStatusIds = DB::table('statuses')
            ->select(DB::raw('MAX(id) as id'))
            ->where('model_type', 'App\Models\LegalCase')
            ->whereIn('model_id', $activeCaseIds)
            ->groupBy('model_id');

        // Obtener los estados más recientes
        $latestStatuses = DB::table('statuses')
            ->whereIn('id', $latestStatusIds);

        // Consulta principal para la distribución de estados
        $statusDistribution = DB::table('legal_cases')
            ->whereNull('legal_cases.closing_date')
            ->leftJoinSub($latestStatuses, 'latest_statuses', function ($join) {
                $join->on('legal_cases.id', '=', 'latest_statuses.model_id');
            })
            ->select(DB::raw('COALESCE(latest_statuses.name, \'Sin Estado\') as status'), DB::raw('COUNT(legal_cases.id) as count'))
            ->groupBy('status')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json($statusDistribution);
    }

    public function getCaseTypeDistribution()
    {
        $typeDistribution = LegalCase::whereNull('closing_date')
            ->join('case_types', 'legal_cases.case_type_id', '=', 'case_types.id')
            ->select('case_types.name as type', DB::raw('count(*) as count'))
            ->groupBy('case_types.name')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json($typeDistribution);
    }
}
