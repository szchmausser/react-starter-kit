import { type CaseDetail } from '@/types/dashboard';
import { ArrowDown, ArrowUp, BarChart3, CheckCircle2, ExternalLink, FilePlus2, FolderOpen, LucideIcon } from 'lucide-react';
import * as React from 'react';

// --- Componente Individual de Tarjeta de Estadística Interna ---
interface StatCardProps {
    title: string;
    value: number | undefined | null;
    icon: LucideIcon;
    comparisonValue?: number | undefined | null;
    unit?: string;
    cases?: CaseDetail[];
    dateField?: 'created_at' | 'closing_date' | 'entry_date' | 'updated_at';
    dateLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    comparisonValue,
    unit = '',
    cases = [],
    dateField = 'created_at',
    dateLabel = 'Fecha',
}) => {
    const safeValue = value ?? 0;
    const safeComparisonValue = comparisonValue ?? 0;
    const hasCases = cases && cases.length > 0;

    const getComparison = () => {
        if (comparisonValue === undefined || comparisonValue === null) return null;
        if (safeComparisonValue === 0) {
            return { diff: safeValue > 0 ? 100 : 0, isPositive: safeValue > 0 };
        }
        const diff = Math.round(((safeValue - safeComparisonValue) / safeComparisonValue) * 100);
        return { diff: Math.abs(diff), isPositive: diff >= 0 };
    };

    const comparison = getComparison();

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }

        const displayDay = String(date.getUTCDate()).padStart(2, '0');
        const displayMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
        const displayYear = date.getUTCFullYear();

        return `${displayDay}/${displayMonth}/${displayYear}`;
    };

    return (
        <div className="overflow-hidden rounded-lg bg-gray-50 dark:bg-zinc-800">
            <div className="p-4 pb-0">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
                    <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {safeValue.toLocaleString()}
                        {unit && <span className="text-lg">{unit}</span>}
                    </p>
                    {comparison && (
                        <div
                            className={`flex items-center text-xs font-semibold ${comparison.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                        >
                            {comparison.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {comparison.diff}%
                        </div>
                    )}
                </div>
                {comparisonValue !== undefined && (
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Semana pasada: {safeComparisonValue.toLocaleString()}</p>
                )}
            </div>

            {hasCases && (
                <div className="p-4 pt-3">
                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        <h5>Expediente</h5>
                        <h5>{dateLabel}</h5>
                    </div>
                    <div className="max-h-32 overflow-y-auto pr-2 -mr-2">
                        <ul className="space-y-1">
                            {cases.slice(0, 10).map((caseItem) => (
                                <li key={caseItem.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1">
                                        <a
                                            href={`/legal-cases/${caseItem.id}`}
                                            className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1"
                                        >
                                            {caseItem.case_number}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                    {(() => {
                                        const displayDate = caseItem[dateField] || caseItem.created_at;
                                        return displayDate ? (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(displayDate)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                N/A
                                            </span>
                                        );
                                    })()}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {cases.length > 10 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Mostrando los primeros 10 de {cases.length} expedientes
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Componente Contenedor de Resumen de Casos (Ahora un Widget completo) ---
interface CasesSummaryProps {
    casesSummary: {
        registeredThisWeek: number;
        registeredLastWeek: number;
        closedThisWeek: number;
        closedLastWeek: number;
        active: number;
        registeredThisWeekCases: CaseDetail[];
        closedThisWeekCases: CaseDetail[];
        activeCases: CaseDetail[];
    };
}

export const CasesSummary: React.FC<CasesSummaryProps> = ({ casesSummary }) => {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Indicadores de Expedientes</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Registrados esta semana"
                    value={casesSummary.registeredThisWeek}
                    icon={FilePlus2}
                    comparisonValue={casesSummary.registeredLastWeek}
                    cases={casesSummary.registeredThisWeekCases}
                    dateField="entry_date"
                    dateLabel="Creado:"
                />
                <StatCard
                    title="Cerrados esta semana"
                    value={casesSummary.closedThisWeek}
                    icon={CheckCircle2}
                    comparisonValue={casesSummary.closedLastWeek}
                    cases={casesSummary.closedThisWeekCases}
                    dateField="closing_date"
                    dateLabel="Cerrado:"
                />
                <StatCard
                    title="Expedientes Activos"
                    value={casesSummary.active}
                    icon={FolderOpen}
                    cases={casesSummary.activeCases}
                    dateField="updated_at"
                    dateLabel="Actualizado:"
                />
            </div>
        </div>
    );
};

export default CasesSummary;
