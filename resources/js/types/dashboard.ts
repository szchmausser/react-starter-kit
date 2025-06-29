import { type PageProps } from '@/types';

export interface CaseDetail {
    id: number;
    case_number: string;
    created_at?: string;
    entry_date?: string; // Added for registered cases
    closing_date?: string;
    updated_at?: string; // Added for active cases
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

export interface DashboardPageProps extends PageProps {
    casesSummary: CasesSummaryData;
}