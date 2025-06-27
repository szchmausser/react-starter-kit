export interface CaseDetail {
    id: number;
    case_number: string;
    created_at?: string;
    closing_date?: string;
}

export interface CasesSummaryData {
    registeredThisWeek: number;
    registeredLastWeek: number;
    closedThisWeek: number;
    closedLastWeek: number;
    active: number;
    // Detailed case lists
    registeredThisWeekCases: CaseDetail[];
    closedThisWeekCases: CaseDetail[];
    activeCases: CaseDetail[];
}

export interface DashboardProps {
    casesSummary: CasesSummaryData;
}

export interface DashboardPageProps {
    casesSummary: CasesSummaryData;
}
