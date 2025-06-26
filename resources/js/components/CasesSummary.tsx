import { ArrowDown, ArrowUp, CheckCircle2, FilePlus2, FolderOpen, LucideIcon, BarChart3 } from 'lucide-react';
import * as React from 'react';

// --- Componente Individual de Tarjeta de Estadística Interna ---
interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    comparisonValue?: number;
    unit?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, comparisonValue, unit = '' }) => {
    const getComparison = () => {
        if (comparisonValue === undefined || comparisonValue === null) return null;
        if (comparisonValue === 0) {
            return { diff: value > 0 ? 100 : 0, isPositive: value > 0 };
        }
        const diff = Math.round(((value - comparisonValue) / comparisonValue) * 100);
        return { diff: Math.abs(diff), isPositive: diff >= 0 };
    };

    const comparison = getComparison();

    return (
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-zinc-800">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
                <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {value.toLocaleString()}
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
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Semana pasada: {comparisonValue.toLocaleString()}</p>
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
    };
}

export const CasesSummary: React.FC<CasesSummaryProps> = ({ casesSummary }) => {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
            <div className="flex items-center gap-3 mb-4">
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
                />
                <StatCard
                    title="Cerrados esta semana"
                    value={casesSummary.closedThisWeek}
                    icon={CheckCircle2}
                    comparisonValue={casesSummary.closedLastWeek}
                />
                <StatCard title="Expedientes Activos" value={casesSummary.active} icon={FolderOpen} />
            </div>
        </div>
    );
};

export default CasesSummary;
