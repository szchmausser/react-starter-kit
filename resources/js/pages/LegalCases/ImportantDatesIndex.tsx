import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDateSafe } from '@/lib/utils';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Filter, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { useState } from 'react';
import LaravelPagination from '@/components/LaravelPagination';

interface CaseType {
    id: number;
    name: string;
}

interface ImportantDate {
    id: number;
    title: string;
    start_date: string;
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
    upcoming_page?: string;
    past_due_page?: string;
    per_page?: string;
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

    const [pageSize, setPageSize] = useState<number>(filters.per_page ? parseInt(filters.per_page, 10) : 10);
    const [showPastDueSection, setShowPastDueSection] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

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

    // Función para determinar el estado y estilo del badge basado en la fecha final
    const getStatusBadge = (end_date: string) => {
        // Parsear end_date como local (no UTC)
        let end;
        if (/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
            const [year, month, day] = end_date.split('-').map(Number);
            end = new Date(year, month - 1, day);
        } else {
            end = new Date(end_date);
        }

        const today = new Date();
        const todayYMD = [today.getFullYear(), today.getMonth(), today.getDate()];
        const endYMD = [end.getFullYear(), end.getMonth(), end.getDate()];

        const isEndBeforeToday =
            endYMD[0] < todayYMD[0] ||
            (endYMD[0] === todayYMD[0] && endYMD[1] < todayYMD[1]) ||
            (endYMD[0] === todayYMD[0] && endYMD[1] === todayYMD[1] && endYMD[2] < todayYMD[2]);

        if (isEndBeforeToday) {
            return {
                label: 'Transcurrido',
                color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            };
        }

        return {
            label: 'En curso',
            color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        };
    };

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
            filtersToSend.upcoming_page = legalCasesUpcoming.current_page.toString();
        }
        if (pageName === 'past_due_page') {
            filtersToSend.past_due_page = legalCasesPastDue.current_page.toString();
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
                filtersToSend.past_due_page = legalCasesPastDue.current_page.toString();
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
                filtersToSend.upcoming_page = legalCasesUpcoming.current_page.toString();
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

    // Función para manejar el cambio de tamaño de página
    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value, 10);
        setPageSize(newPerPage);

        // Obtener todos los parámetros actuales para preservar los filtros
        const params: Filters = {};

        if (filterData.upcoming_start_date) {
            params.upcoming_start_date = filterData.upcoming_start_date;
        }
        if (filterData.upcoming_end_date) {
            params.upcoming_end_date = filterData.upcoming_end_date;
        }
        if (filterData.upcoming_case_type_id && filterData.upcoming_case_type_id !== 'all') {
            params.upcoming_case_type_id = filterData.upcoming_case_type_id;
        }
        if (filterData.past_due_start_date) {
            params.past_due_start_date = filterData.past_due_start_date;
        }
        if (filterData.past_due_end_date) {
            params.past_due_end_date = filterData.past_due_end_date;
        }
        if (filterData.past_due_case_type_id && filterData.past_due_case_type_id !== 'all') {
            params.past_due_case_type_id = filterData.past_due_case_type_id;
        }

        // Añadir el parámetro per_page
        params.per_page = newPerPage.toString();

        router.get(route('legal-cases.important-dates.list'), params, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para manejar la navegación de página
    const handlePageNavigation = (url: string | null) => {
        if (!url) return;
        router.visit(url, {
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
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                                    </span>
                                </Button>
                                <Button
                                    onClick={() => setShowPastDueSection(!showPastDueSection)}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    {showPastDueSection ? (
                                        <>
                                            <ChevronUp className="h-4 w-4" />
                                            <span className="hidden sm:inline">Ocultar Lapsos Pasados</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4" />
                                            <span className="hidden sm:inline">Mostrar Lapsos Pasados</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Filtros para Lapsos Procesales Próximos a Finalizar */}
                        {showFilters && (
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

                                    {/* Fecha final del lapso procesal (desde) */}
                                    <div>
                                        <Label htmlFor="upcoming_start_date">Finalización del lapso (desde)</Label>
                                        <Input
                                            id="upcoming_start_date"
                                            type="date"
                                            value={filterData.upcoming_start_date}
                                            onChange={(e) => setFilterData({ ...filterData, upcoming_start_date: e.target.value })}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Fecha final del lapso procesal (hasta) */}
                                    <div>
                                        <Label htmlFor="upcoming_end_date">Finalización del lapso (hasta)</Label>
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
                        )}

                        {/* Lista de expedientes con fechas importantes */}
                        <div className="hidden md:block">
                            {' '}
                            {/* Tabla para pantallas grandes */}
                            <div className="overflow-hidden bg-white sm:rounded-t-lg dark:bg-zinc-900">
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50 text-left text-md font-medium text-muted-foreground dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                                                <th className="px-6 py-3">Código</th>
                                                <th className="px-6 py-3">Tipo de expediente</th>
                                                <th className="px-6 py-3">Fecha de inicio del lapso procesal</th>
                                                <th className="px-6 py-3">Fecha final del lapso procesal</th>
                                                <th className="px-6 py-3">Estado</th>
                                                <th className="px-6 py-3">Descripción del lapso procesal</th>
                                                <th className="px-6 py-3">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
                                            {legalCasesUpcoming.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                        No se encontraron expedientes con fechas importantes
                                                    </td>
                                                </tr>
                                            ) : (
                                                legalCasesUpcoming.data.map((legalCase) => {
                                                    // Si el caso no tiene una fecha importante definida, no lo mostramos
                                                    if (!legalCase.next_important_date) {
                                                        return null;
                                                    }

                                                    const statusBadge = getStatusBadge(legalCase.next_important_date.end_date);

                                                    return (
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
                                                                    formatDateSafe(legalCase.next_important_date.start_date)
                                                                ) : (
                                                                    <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {legalCase.next_important_date ? (
                                                                    formatDateSafe(legalCase.next_important_date.end_date)
                                                                ) : (
                                                                    <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {legalCase.next_important_date ? (
                                                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge.color}`}>
                                                                        {statusBadge.label}
                                                                    </span>
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
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Paginación para escritorio */}
                            {legalCasesUpcoming.data.length > 0 && (
                                <div className="bg-sidebar flex flex-row-reverse items-center justify-between gap-4 border-t border-gray-200 px-4 py-4 sm:rounded-b-lg dark:border-zinc-800 dark:bg-zinc-800">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div>
                                                Mostrando{' '}
                                                {legalCasesUpcoming.to - legalCasesUpcoming.from + 1}{' '}
                                                de {legalCasesUpcoming.total} registros
                                            </div>
                                            <Select value={pageSize.toString()} onValueChange={handlePerPageChange}>
                                                <SelectTrigger className="h-8 w-24">
                                                    <SelectValue placeholder="10" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[5, 10, 20, 50, 100].map((size) => (
                                                        <SelectItem key={size} value={size.toString()}>
                                                            {size}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Paginación mejorada */}
                                    <div className="flex items-center gap-4">
                                        {/* Indicador de página actual */}
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Página <span className="font-semibold">{legalCasesUpcoming.current_page}</span> de{' '}
                                            <span className="font-semibold">{legalCasesUpcoming.last_page}</span>
                                        </div>

                                        {/* Botones de navegación */}
                                        <LaravelPagination links={legalCasesUpcoming.links} onPageChange={handlePageNavigation} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="md:hidden">
                            {' '}
                            {/* Tarjetas para pantallas pequeñas */}
                            {legalCasesUpcoming.data.length === 0 ? (
                                <p className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No se encontraron expedientes con fechas importantes
                                </p>
                            ) : (
                                <div className="grid gap-4">
                                    {' '}
                                    {/* Contenedor para las tarjetas */}
                                    {legalCasesUpcoming.data.map((legalCase) => {
                                        if (!legalCase.next_important_date) {
                                            return null;
                                        }
                                        const statusBadge = getStatusBadge(legalCase.next_important_date.end_date);
                                        return (
                                            <div key={legalCase.id} className="rounded-lg border p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                        <Link href={route('legal-cases.show', legalCase.id)}>{legalCase.code}</Link>
                                                    </h3>
                                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge.color}`}>
                                                        {statusBadge.label}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    <p className="mb-1">
                                                        <span className="font-medium">Tipo de expediente:</span> {legalCase.case_type.name}
                                                    </p>
                                                    <p className="mb-1">
                                                        <span className="font-medium">Lapso Procesal:</span>{' '}
                                                        {legalCase.next_important_date ? (
                                                            `${formatDateSafe(legalCase.next_important_date.start_date)} - ${formatDateSafe(legalCase.next_important_date.end_date)}`
                                                        ) : (
                                                            <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                        )}
                                                    </p>
                                                    <p className="mb-2">
                                                        <span className="font-medium">Descripción:</span>{' '}
                                                        {legalCase.next_important_date ? (
                                                            legalCase.next_important_date.title
                                                        ) : (
                                                            <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                        )}
                                                    </p>
                                                    <Link
                                                        href={route('legal-cases.important-dates.index', legalCase.id)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        Ver detalles
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Paginación móvil para lapsos próximos */}
                            {legalCasesUpcoming.data.length > 0 && (
                                <div className="bg-sidebar mt-4 flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-zinc-800 dark:bg-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {/* Selector de registros por página */}
                                            <Select value={pageSize.toString()} onValueChange={handlePerPageChange}>
                                                <SelectTrigger className="h-7 w-14 text-xs">
                                                    <SelectValue placeholder="10" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[5, 10, 20, 50, 100].map((size) => (
                                                        <SelectItem key={size} value={size.toString()}>
                                                            {size}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-xs text-gray-500">/ pág</span>
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            {legalCasesUpcoming.from}-{legalCasesUpcoming.to} de {legalCasesUpcoming.total}
                                        </div>
                                    </div>

                                    {/* Botones de paginación */}
                                    <div className="flex justify-between">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => {
                                                const firstPageLink = legalCasesUpcoming.links.find(link => link.label === '1');
                                                if (firstPageLink?.url) handlePageNavigation(firstPageLink.url);
                                            }}
                                            disabled={legalCasesUpcoming.current_page === 1}
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => {
                                                const prevLink = legalCasesUpcoming.links.find(link => link.label === '&laquo; Previous');
                                                if (prevLink?.url) handlePageNavigation(prevLink.url);
                                            }}
                                            disabled={legalCasesUpcoming.current_page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        <div className="flex items-center text-xs">
                                            <span>Pág. {legalCasesUpcoming.current_page}/{legalCasesUpcoming.last_page}</span>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => {
                                                const nextLink = legalCasesUpcoming.links.find(link => link.label === 'Next &raquo;');
                                                if (nextLink?.url) handlePageNavigation(nextLink.url);
                                            }}
                                            disabled={legalCasesUpcoming.current_page === legalCasesUpcoming.last_page}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => {
                                                const lastPageLink = legalCasesUpcoming.links.find(link => link.label === legalCasesUpcoming.last_page.toString());
                                                if (lastPageLink?.url) handlePageNavigation(lastPageLink.url);
                                            }}
                                            disabled={legalCasesUpcoming.current_page === legalCasesUpcoming.last_page}
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sección para Lapsos Procesales Pasados */}
                        {showPastDueSection && (
                            <>
                                <h2 className="mt-8 mb-4 text-2xl font-bold">Lapsos procesales pasados</h2>

                                {/* Filtros para Lapsos Procesales Pasados */}
                                {showFilters && (
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

                                            {/* Fecha final del lapso procesal (desde) */}
                                            <div>
                                                <Label htmlFor="past_due_start_date">Finalización del lapso (desde)</Label>
                                                <Input
                                                    id="past_due_start_date"
                                                    type="date"
                                                    value={filterData.past_due_start_date}
                                                    onChange={(e) => setFilterData({ ...filterData, past_due_start_date: e.target.value })}
                                                    className="w-full"
                                                />
                                            </div>

                                            {/* Fecha final del lapso procesal (hasta) */}
                                            <div>
                                                <Label htmlFor="past_due_end_date">Finalización del lapso (hasta)</Label>
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
                                )}

                                <div className="hidden md:block">
                                    {' '}
                                    {/* Tabla para pantallas grandes */}
                                    <div className="overflow-hidden bg-white sm:rounded-t-lg dark:bg-zinc-900">
                                        <div className="overflow-x-auto">
                                            <table className="w-full table-auto border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-md font-medium text-muted-foreground dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                                                        <th className="px-6 py-3">Código</th>
                                                        <th className="px-6 py-3">Tipo de expediente</th>
                                                        <th className="px-6 py-3">Fecha de inicio del lapso procesal</th>
                                                        <th className="px-6 py-3">Fecha final del lapso procesal</th>
                                                        <th className="px-6 py-3">Estado</th>
                                                        <th className="px-6 py-3">Descripción del lapso procesal</th>
                                                        <th className="px-6 py-3">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
                                                    {legalCasesPastDue.data.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                                No se encontraron expedientes con lapsos procesales pasados
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        legalCasesPastDue.data.map((legalCase) => {
                                                            // Si el caso no tiene una fecha importante definida, no lo mostramos
                                                            if (!legalCase.next_important_date) {
                                                                return null;
                                                            }

                                                            // Para los lapsos pasados, siempre mostramos el badge "Transcurrido"
                                                            const statusBadge = {
                                                                label: 'Transcurrido',
                                                                color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
                                                            };

                                                            return (
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
                                                                            formatDateSafe(legalCase.next_important_date.start_date)
                                                                        ) : (
                                                                            <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {legalCase.next_important_date ? (
                                                                            formatDateSafe(legalCase.next_important_date.end_date)
                                                                        ) : (
                                                                            <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {legalCase.next_important_date ? (
                                                                            <span
                                                                                className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge.color}`}
                                                                            >
                                                                                {statusBadge.label}
                                                                            </span>
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
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Paginación para escritorio */}
                                    {legalCasesPastDue.data.length > 0 && (
                                        <div className="bg-sidebar flex flex-row-reverse items-center justify-between gap-4 border-t border-gray-200 px-4 py-4 sm:rounded-b-lg dark:border-zinc-800 dark:bg-zinc-800">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div>
                                                        Mostrando{' '}
                                                        {legalCasesPastDue.to - legalCasesPastDue.from + 1}{' '}
                                                        de {legalCasesPastDue.total} registros
                                                    </div>
                                                    <Select value={pageSize.toString()} onValueChange={handlePerPageChange}>
                                                        <SelectTrigger className="h-8 w-24">
                                                            <SelectValue placeholder="10" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[5, 10, 20, 50, 100].map((size) => (
                                                                <SelectItem key={size} value={size.toString()}>
                                                                    {size}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Paginación mejorada */}
                                            <div className="flex items-center gap-4">
                                                {/* Indicador de página actual */}
                                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                                    Página <span className="font-semibold">{legalCasesPastDue.current_page}</span> de{' '}
                                                    <span className="font-semibold">{legalCasesPastDue.last_page}</span>
                                                </div>

                                                {/* Botones de navegación */}
                                                <LaravelPagination links={legalCasesPastDue.links} onPageChange={handlePageNavigation} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="md:hidden">
                                    {' '}
                                    {/* Tarjetas para pantallas pequeñas */}
                                    {legalCasesPastDue.data.length === 0 ? (
                                        <p className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            No se encontraron expedientes con lapsos procesales pasados
                                        </p>
                                    ) : (
                                        <div className="grid gap-4">
                                            {' '}
                                            {/* Contenedor para las tarjetas */}
                                            {legalCasesPastDue.data.map((legalCase) => {
                                                if (!legalCase.next_important_date) {
                                                    return null;
                                                }
                                                const statusBadge = {
                                                    label: 'Transcurrido',
                                                    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
                                                };
                                                return (
                                                    <div
                                                        key={legalCase.id}
                                                        className="rounded-lg border p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                                                    >
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                                <Link href={route('legal-cases.show', legalCase.id)}>{legalCase.code}</Link>
                                                            </h3>
                                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge.color}`}>
                                                                {statusBadge.label}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                                            <p className="mb-1">
                                                                <span className="font-medium">Tipo de expediente:</span> {legalCase.case_type.name}
                                                            </p>
                                                            <p className="mb-1">
                                                                <span className="font-medium">Lapso Procesal:</span>{' '}
                                                                {legalCase.next_important_date ? (
                                                                    `${formatDateSafe(legalCase.next_important_date.start_date)} - ${formatDateSafe(legalCase.next_important_date.end_date)}`
                                                                ) : (
                                                                    <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                                )}
                                                            </p>
                                                            <p className="mb-2">
                                                                <span className="font-medium">Descripción:</span>{' '}
                                                                {legalCase.next_important_date ? (
                                                                    legalCase.next_important_date.title
                                                                ) : (
                                                                    <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                                )}
                                                            </p>
                                                            <Link
                                                                href={route('legal-cases.important-dates.index', legalCase.id)}
                                                                className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Ver detalles
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Paginación móvil para lapsos pasados */}
                                    {legalCasesPastDue.data.length > 0 && (
                                        <div className="bg-sidebar mt-4 flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-zinc-800 dark:bg-zinc-800">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {/* Selector de registros por página */}
                                                    <Select value={pageSize.toString()} onValueChange={handlePerPageChange}>
                                                        <SelectTrigger className="h-7 w-14 text-xs">
                                                            <SelectValue placeholder="10" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[5, 10, 20, 50, 100].map((size) => (
                                                                <SelectItem key={size} value={size.toString()}>
                                                                    {size}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <span className="text-xs text-gray-500">/ pág</span>
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    {legalCasesPastDue.from}-{legalCasesPastDue.to} de {legalCasesPastDue.total}
                                                </div>
                                            </div>

                                            {/* Botones de paginación */}
                                            <div className="flex justify-between">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => {
                                                        const firstPageLink = legalCasesPastDue.links.find(link => link.label === '1');
                                                        if (firstPageLink?.url) handlePageNavigation(firstPageLink.url);
                                                    }}
                                                    disabled={legalCasesPastDue.current_page === 1}
                                                >
                                                    <ChevronsLeft className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => {
                                                        const prevLink = legalCasesPastDue.links.find(link => link.label === '&laquo; Previous');
                                                        if (prevLink?.url) handlePageNavigation(prevLink.url);
                                                    }}
                                                    disabled={legalCasesPastDue.current_page === 1}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>

                                                <div className="flex items-center text-xs">
                                                    <span>Pág. {legalCasesPastDue.current_page}/{legalCasesPastDue.last_page}</span>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => {
                                                        const nextLink = legalCasesPastDue.links.find(link => link.label === 'Next &raquo;');
                                                        if (nextLink?.url) handlePageNavigation(nextLink.url);
                                                    }}
                                                    disabled={legalCasesPastDue.current_page === legalCasesPastDue.last_page}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => {
                                                        const lastPageLink = legalCasesPastDue.links.find(link => link.label === legalCasesPastDue.last_page.toString());
                                                        if (lastPageLink?.url) handlePageNavigation(lastPageLink.url);
                                                    }}
                                                    disabled={legalCasesPastDue.current_page === legalCasesPastDue.last_page}
                                                >
                                                    <ChevronsRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
