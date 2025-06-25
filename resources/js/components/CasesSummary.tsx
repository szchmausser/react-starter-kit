import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, FilePlus2, FolderOpen } from 'lucide-react';
import * as React from 'react';

interface CasesSummaryProps {
    casesSummary: {
        registeredThisWeek: number;
        registeredLastWeek: number;
        closedThisWeek: number;
        closedLastWeek: number;
        active: number;
    };
}

function getComparison(current: number, previous: number) {
    if (previous === 0) return { diff: 100, up: true };
    const diff = Math.round(((current - previous) / previous) * 100);
    return { diff: Math.abs(diff), up: current >= previous };
}

export const CasesSummary: React.FC<CasesSummaryProps> = ({ casesSummary }) => {
    const regComp = getComparison(casesSummary.registeredThisWeek, casesSummary.registeredLastWeek);
    const closedComp = getComparison(casesSummary.closedThisWeek, casesSummary.closedLastWeek);

    return (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Expedientes registrados esta semana */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <FilePlus2 className="text-primary h-5 w-5" /> Registrados esta semana
                    </CardTitle>
                    <span
                        className={`flex items-center text-xs font-semibold ${regComp.up ? 'text-green-600' : 'text-red-600'}`}
                        title="Comparado con la semana anterior"
                    >
                        {regComp.up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />} {regComp.diff}%
                    </span>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{casesSummary.registeredThisWeek}</div>
                    <div className="text-muted-foreground text-xs">Semana pasada: {casesSummary.registeredLastWeek}</div>
                </CardContent>
            </Card>

            {/* Expedientes cerrados esta semana */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="text-primary h-5 w-5" /> Cerrados esta semana
                    </CardTitle>
                    <span
                        className={`flex items-center text-xs font-semibold ${closedComp.up ? 'text-green-600' : 'text-red-600'}`}
                        title="Comparado con la semana anterior"
                    >
                        {closedComp.up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />} {closedComp.diff}%
                    </span>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{casesSummary.closedThisWeek}</div>
                    <div className="text-muted-foreground text-xs">Semana pasada: {casesSummary.closedLastWeek}</div>
                </CardContent>
            </Card>

            {/* Expedientes activos */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <FolderOpen className="text-primary h-5 w-5" /> Expedientes activos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{casesSummary.active}</div>
                    <div className="text-muted-foreground text-xs">Actualmente abiertos</div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CasesSummary;
