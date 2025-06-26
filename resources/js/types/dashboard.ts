export interface CasesSummaryData {
    registeredThisWeek: number;
    registeredLastWeek: number;
    closedThisWeek: number;
    closedLastWeek: number;
    active: number;
}

export interface DashboardProps {
    casesSummary: CasesSummaryData;
}

export interface DashboardPageProps {
    casesSummary: CasesSummaryData;
}
