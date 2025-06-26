import CasesSummary from '@/components/CasesSummary';
import CaseStatusChart from '@/components/CaseStatusChart';
import CaseTypeChart from '@/components/CaseTypeChart';
import PastDueDeadlines from '@/components/PastDueDeadlines';
import UrgentDeadlines from '@/components/UrgentDeadlines';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type DashboardPageProps } from '@/types/dashboard';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { casesSummary } = usePage<DashboardPageProps>().props;

    // Validación de datos
    if (!casesSummary) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="h-full flex-1 bg-gray-100 p-4 dark:bg-zinc-950 md:p-6">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500 dark:text-gray-400">Error loading dashboard data</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <main className="h-full flex-1 bg-gray-100 p-4 dark:bg-zinc-950 md:p-6" role="main">
                {/* Alertas críticas con prioridad */}
                <section aria-label="Critical alerts" className="mb-6 space-y-4">
                    <PastDueDeadlines />
                    <UrgentDeadlines />
                </section>

                {/* Métricas del dashboard */}
                <section aria-label="Dashboard metrics" className="space-y-6">
                    <CasesSummary casesSummary={casesSummary} />
                    
                    {/* Grid responsive para gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
                            <CaseStatusChart />
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
                            <CaseTypeChart />
                        </div>
                    </div>
                </section>
            </main>
        </AppLayout>
    );
}
