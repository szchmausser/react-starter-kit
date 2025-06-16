import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDateSafe } from '@/lib/utils';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
    upcoming_start_date?: string;
    upcoming_end_date?: string;
    upcoming_case_type_id?: string;
    past_due_start_date?: string;
    past_due_end_date?: string;
    past_due_case_type_id?: string;
    [key: string]: string | undefined;
}

interface Props extends PageProps {
    legalCasesUpcoming: {
        data: LegalCase[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    legalCasesPastDue: {
        data: LegalCase[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    caseTypes: CaseType[];
    filters: Filters;
}

export default function ImportantDatesIndex({ legalCasesUpcoming, legalCasesPastDue, caseTypes, filters }: Props) {
    const [filterData, setFilterData] = useState<Filters>({
        upcoming_start_date: filters.upcoming_start_date || '',
        upcoming_end_date: filters.upcoming_end_date || '',
        upcoming_case_type_id: filters.upcoming_case_type_id || 'all',
        past_due_start_date: filters.past_due_start_date || '',
        past_due_end_date: filters.past_due_end_date || '',
        past_due_case_type_id: filters.past_due_case_type_id || 'all',
    });

    const [showPastDueSection, setShowPastDueSection] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Lapsos procesales',
            href: route('legal-cases.important-dates.list'),
        },
    ];

    const handleSearch = (pageName?: string) => {
        const filtersToSend: Filters = {};

        if (filterData.upcoming_start_date) {
            filtersToSend.upcoming_start_date = filterData.upcoming_start_date;
        }
        if (filterData.upcoming_end_date) {
            filtersToSend.upcoming_end_date = filterData.upcoming_end_date;
        }
        if (filterData.upcoming_case_type_id && filterData.upcoming_case_type_id !== 'all') {
            filtersToSend.upcoming_case_type_id = filterData.upcoming_case_type_id;
        }

        if (filterData.past_due_start_date) {
            filtersToSend.past_due_start_date = filterData.past_due_start_date;
        }
        if (filterData.past_due_end_date) {
            filtersToSend.past_due_end_date = filterData.past_due_end_date;
        }
        if (filterData.past_due_case_type_id && filterData.past_due_case_type_id !== 'all') {
            filtersToSend.past_due_case_type_id = filterData.past_due_case_type_id;
        }

        if (pageName === 'upcoming_page') {
            filtersToSend.upcoming_page = legalCasesUpcoming.current_page;
        }
        if (pageName === 'past_due_page') {
            filtersToSend.past_due_page = legalCasesPastDue.current_page;
        }

        router.get(route('legal-cases.important-dates.list'), filtersToSend, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = (section: 'upcoming' | 'past_due') => {
        const filtersToSend: Filters = {};

        // Mantener los filtros de la sección no afectada
        if (section === 'upcoming') {
            if (filterData.past_due_start_date) {
                filtersToSend.past_due_start_date = filterData.past_due_start_date;
            }
            if (filterData.past_due_end_date) {
                filtersToSend.past_due_end_date = filterData.past_due_end_date;
            }
            if (filterData.past_due_case_type_id && filterData.past_due_case_type_id !== 'all') {
                filtersToSend.past_due_case_type_id = filterData.past_due_case_type_id;
            }
            // También mantener la paginación de la sección no afectada
            if (legalCasesPastDue.current_page) {
                filtersToSend.past_due_page = legalCasesPastDue.current_page;
            }
        } else if (section === 'past_due') {
            if (filterData.upcoming_start_date) {
                filtersToSend.upcoming_start_date = filterData.upcoming_start_date;
            }
            if (filterData.upcoming_end_date) {
                filtersToSend.upcoming_end_date = filterData.upcoming_end_date;
            }
            if (filterData.upcoming_case_type_id && filterData.upcoming_case_type_id !== 'all') {
                filtersToSend.upcoming_case_type_id = filterData.upcoming_case_type_id;
            }
            // También mantener la paginación de la sección no afectada
            if (legalCasesUpcoming.current_page) {
                filtersToSend.upcoming_page = legalCasesUpcoming.current_page;
            }
        }

        // Actualizar el estado local de los filtros
        setFilterData({
            upcoming_start_date: section === 'upcoming' ? '' : filterData.upcoming_start_date,
            upcoming_end_date: section === 'upcoming' ? '' : filterData.upcoming_end_date,
            upcoming_case_type_id: section === 'upcoming' ? 'all' : filterData.upcoming_case_type_id,
            past_due_start_date: section === 'past_due' ? '' : filterData.past_due_start_date,
            past_due_end_date: section === 'past_due' ? '' : filterData.past_due_end_date,
            past_due_case_type_id: section === 'past_due' ? 'all' : filterData.past_due_case_type_id,
        });

        router.get(route('legal-cases.important-dates.list'), filtersToSend, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lapsos procesales" />

            <div className="p-4 sm:p-6">
                <div className="mb-6 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <div className="mb-4 flex items-center justify-between">
                            <h1 className="text-2xl font-bold">Lapsos procesales próximos a finalizar</h1>
                            <Button onClick={() => setShowPastDueSection(!showPastDueSection)} variant="outline" className="flex items-center gap-2">
                                {showPastDueSection ? (
                                    <>
                                        Ocultar Lapsos Pasados <ChevronUp className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        Mostrar Lapsos Pasados <ChevronDown className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Filtros para Lapsos Procesales Próximos a Finalizar */}
                        <div className="mb-6 rounded-lg border p-4 dark:border-zinc-700">
                            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 md:grid-cols-4">
                                {/* Tipo de expediente */}
                                <div>
                                    <Label htmlFor="upcoming_case_type_id">Ver por tipo de expediente</Label>
                                    <Select
                                        value={filterData.upcoming_case_type_id || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, upcoming_case_type_id: value === 'all' ? '' : value })
                                        }
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
                                    <Label htmlFor="upcoming_start_date">Fecha de inicio</Label>
                                    <Input
                                        id="upcoming_start_date"
                                        type="date"
                                        value={filterData.upcoming_start_date}
                                        onChange={(e) => setFilterData({ ...filterData, upcoming_start_date: e.target.value })}
                                        className="w-full"
                                    />
                                </div>

                                {/* Fecha de fin */}
                                <div>
                                    <Label htmlFor="upcoming_end_date">Fecha de fin</Label>
                                    <Input
                                        id="upcoming_end_date"
                                        type="date"
                                        value={filterData.upcoming_end_date}
                                        onChange={(e) => setFilterData({ ...filterData, upcoming_end_date: e.target.value })}
                                        className="w-full"
                                    />
                                </div>

                                {/* Botones de acción */}
                                <div className="flex items-end gap-2 sm:pt-6">
                                    <Button onClick={() => resetFilters('upcoming')} variant="outline" className="flex-1">
                                        Limpiar
                                    </Button>
                                    <Button onClick={() => handleSearch('upcoming_page')} className="flex-1">
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
                                    {legalCasesUpcoming.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                No se encontraron expedientes con fechas importantes
                                            </td>
                                        </tr>
                                    ) : (
                                        legalCasesUpcoming.data.map((legalCase) => (
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
                        {legalCasesUpcoming.data.length > 0 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Mostrando {legalCasesUpcoming.from} a {legalCasesUpcoming.to} de {legalCasesUpcoming.total} resultados
                                </div>
                                <div className="flex space-x-2">
                                    {legalCasesUpcoming.links.map((link, index) => (
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

                        {/* Sección para Lapsos Procesales Pasados */}
                        {showPastDueSection && (
                            <>
                                <h2 className="mt-8 mb-4 text-2xl font-bold">Lapsos procesales pasados</h2>

                                {/* Filtros para Lapsos Procesales Pasados */}
                                <div className="mb-6 rounded-lg border p-4 dark:border-zinc-700">
                                    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 md:grid-cols-4">
                                        {/* Tipo de expediente */}
                                        <div>
                                            <Label htmlFor="past_due_case_type_id">Ver por tipo de expediente</Label>
                                            <Select
                                                value={filterData.past_due_case_type_id || 'all'}
                                                onValueChange={(value) =>
                                                    setFilterData({ ...filterData, past_due_case_type_id: value === 'all' ? '' : value })
                                                }
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
                                            <Label htmlFor="past_due_start_date">Fecha de inicio</Label>
                                            <Input
                                                id="past_due_start_date"
                                                type="date"
                                                value={filterData.past_due_start_date}
                                                onChange={(e) => setFilterData({ ...filterData, past_due_start_date: e.target.value })}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Fecha de fin */}
                                        <div>
                                            <Label htmlFor="past_due_end_date">Fecha de fin</Label>
                                            <Input
                                                id="past_due_end_date"
                                                type="date"
                                                value={filterData.past_due_end_date}
                                                onChange={(e) => setFilterData({ ...filterData, past_due_end_date: e.target.value })}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex items-end gap-2 sm:pt-6">
                                            <Button onClick={() => resetFilters('past_due')} variant="outline" className="flex-1">
                                                Limpiar
                                            </Button>
                                            <Button onClick={() => handleSearch('past_due_page')} className="flex-1">
                                                Filtrar
                                            </Button>
                                        </div>
                                    </div>
                                </div>

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
                                            {legalCasesPastDue.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                        No se encontraron expedientes con lapsos procesales pasados
                                                    </td>
                                                </tr>
                                            ) : (
                                                legalCasesPastDue.data.map((legalCase) => (
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

                                {/* Paginación para Lapsos Procesales Pasados */}
                                {legalCasesPastDue.data.length > 0 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Mostrando {legalCasesPastDue.from} a {legalCasesPastDue.to} de {legalCasesPastDue.total} resultados
                                        </div>
                                        <div className="flex space-x-2">
                                            {legalCasesPastDue.links.map((link, index) => (
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
