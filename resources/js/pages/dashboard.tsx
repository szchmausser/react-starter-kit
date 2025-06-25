import CasesSummary from '@/components/CasesSummary';
import PastDueDeadlines from '@/components/PastDueDeadlines';
import UrgentDeadlines from '@/components/UrgentDeadlines';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { casesSummary } = usePage<{
        casesSummary: {
            registeredThisWeek: number;
            registeredLastWeek: number;
            closedThisWeek: number;
            closedLastWeek: number;
            active: number;
        };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <CasesSummary casesSummary={casesSummary} />
                <PastDueDeadlines />
                <UrgentDeadlines />
            </div>
        </AppLayout>
    );
}
