import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDateSafe } from '@/lib/utils';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface CaseType {
    id: number;
    name: string;
}

interface ImportantDate {
    id: number;
    title: string;
    end_date: string;
}

interface LegalCase {
    id: number;
    code: string;
    case_type: CaseType;
    next_important_date: ImportantDate | null;
}

interface Filters {
    start_date?: string;
    end_date?: string;
    case_type_id?: string;
    [key: string]: string | undefined;
}

interface Props extends PageProps {
    legalCases: {
        data: LegalCase[];
        links: any[];
        from: number;
        to: number;
        total: number;
    };
    caseTypes: CaseType[];
    filters: Filters;
}

export default function ImportantDatesIndex({ legalCases, caseTypes, filters }: Props) {
    const [filterData, setFilterData] = useState<Filters>({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        case_type_id: filters.case_type_id || 'all',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Lapsos procesales proximos a finalizar',
            href: route('legal-cases.important-dates.list'),
        },
    ];

    const handleSearch = () => {
        // Crear un objeto de filtros limpio para enviar
        const filtersToSend = {
            ...(filterData.start_date ? { start_date: filterData.start_date } : {}),
            ...(filterData.end_date ? { end_date: filterData.end_date } : {}),
            ...(filterData.case_type_id !== 'all' ? { case_type_id: filterData.case_type_id } : { case_type_id: 'all' }),
        };

        router.get(route('legal-cases.important-dates.list'), filtersToSend, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const newFilterData = {
            start_date: '',
            end_date: '',
            case_type_id: 'all',
        };

        setFilterData(newFilterData);
        router.get(
            route('legal-cases.important-dates.list'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lapsos procesales proximos a finalizar" />

            <div className="p-4 sm:p-6">
                <div className="mb-6 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <h1 className="mb-4 text-2xl font-bold">Lapsos procesales proximos a finalizar</h1>

                        {/* Filtros */}
                        <div className="mb-6 p-4">
                            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 md:grid-cols-4">
                                {/* Tipo de expediente */}
                                <div>
                                    <Label htmlFor="case_type_id">Ver por tipo de expediente</Label>
                                    <Select
                                        value={filterData.case_type_id || 'all'}
                                        onValueChange={(value) => setFilterData({ ...filterData, case_type_id: value === 'all' ? '' : value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos los tipos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los tipos</SelectItem>
                                            {caseTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Fecha de inicio */}
                                <div>
                                    <Label htmlFor="start_date">Fecha de inicio</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={filterData.start_date}
                                        onChange={(e) => setFilterData({ ...filterData, start_date: e.target.value })}
                                        className="w-full"
                                    />
                                </div>

                                {/* Fecha de fin */}
                                <div>
                                    <Label htmlFor="end_date">Fecha de fin</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={filterData.end_date}
                                        onChange={(e) => setFilterData({ ...filterData, end_date: e.target.value })}
                                        className="w-full"
                                    />
                                </div>

                                {/* Botones de acción */}
                                <div className="flex items-end gap-2 sm:pt-6">
                                    <Button onClick={resetFilters} variant="outline" className="flex-1">
                                        Limpiar
                                    </Button>
                                    <Button onClick={handleSearch} className="flex-1">
                                        Filtrar
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de expedientes con fechas importantes */}
                        <div className="overflow-x-auto rounded-lg">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-400">
                                        <th className="px-6 py-3">Código</th>
                                        <th className="px-6 py-3">Tipo de expediente</th>
                                        <th className="px-6 py-3">Fecha final del lapso procesal</th>
                                        <th className="px-6 py-3">Descripción del lapso procesal</th>
                                        <th className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
                                    {legalCases.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                No se encontraron expedientes con fechas importantes
                                            </td>
                                        </tr>
                                    ) : (
                                        legalCases.data.map((legalCase) => (
                                            <tr key={legalCase.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                                                <td className="px-6 py-4 font-medium whitespace-nowrap">
                                                    <Link
                                                        href={route('legal-cases.show', legalCase.id)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        {legalCase.code}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">{legalCase.case_type.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {legalCase.next_important_date ? (
                                                        formatDateSafe(legalCase.next_important_date.end_date)
                                                    ) : (
                                                        <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {legalCase.next_important_date ? (
                                                        legalCase.next_important_date.title
                                                    ) : (
                                                        <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        href={route('legal-cases.important-dates.index', legalCase.id)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        Ver detalles
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {legalCases.data.length > 0 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Mostrando {legalCases.from} a {legalCases.to} de {legalCases.total} resultados
                                </div>
                                <div className="flex space-x-2">
                                    {legalCases.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            className="h-8 w-8 p-0"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
