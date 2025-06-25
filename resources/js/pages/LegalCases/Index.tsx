import AdvancedSearchContainer, { FilterCriterion } from '@/components/AdvancedSearch/AdvancedSearchContainer';
import LaravelPagination from '@/components/LaravelPagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDateSafe } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import type { CaseType, LegalCase } from '@/types/index';
import { PageProps } from '@inertiajs/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ColumnFiltersState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Eye,
    Filter,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Función para obtener clases de colores según el estado
const getStatusColor = (statusName: string): { bg: string; text: string; darkBg: string; darkText: string } => {
    // Si no hay nombre de estado, devolver color por defecto
    if (!statusName) {
        return { bg: 'bg-slate-100', text: 'text-slate-800', darkBg: 'dark:bg-slate-200/10', darkText: 'dark:text-slate-200' };
    }

    // Normalizar el nombre del estado (minúsculas, sin espacios ni acentos)
    const normalizedStatus = statusName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');

    // Mapeo de estados a colores - Mejorados para modo oscuro
    const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
        // Estados de tramitación
        enproceso: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-100/20', darkText: 'dark:text-blue-200' },
        tramite: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-100/20', darkText: 'dark:text-blue-200' },
        entramite: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-100/20', darkText: 'dark:text-blue-200' },

        // Estados de conclusión
        finalizado: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-100/20', darkText: 'dark:text-green-200' },
        completado: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-100/20', darkText: 'dark:text-green-200' },
        cerrado: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-100/20', darkText: 'dark:text-green-200' },

        // Estados de espera
        enespera: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-100/20', darkText: 'dark:text-yellow-200' },
        pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-100/20', darkText: 'dark:text-yellow-200' },
        espera: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-100/20', darkText: 'dark:text-yellow-200' },

        // Estados críticos
        urgente: { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'dark:bg-red-100/20', darkText: 'dark:text-red-200' },
        critico: { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'dark:bg-red-100/20', darkText: 'dark:text-red-200' },

        // Estados de pausa
        suspendido: { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-200/10', darkText: 'dark:text-gray-300' },
        cancelado: { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-200/10', darkText: 'dark:text-gray-300' },
        archivado: { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-200/10', darkText: 'dark:text-gray-300' },

        // Estados adicionales
        distribuidos: { bg: 'bg-indigo-100', text: 'text-indigo-800', darkBg: 'dark:bg-indigo-100/20', darkText: 'dark:text-indigo-200' },
        aceptar: { bg: 'bg-indigo-100', text: 'text-indigo-800', darkBg: 'dark:bg-indigo-100/20', darkText: 'dark:text-indigo-200' },
        expedientes: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-100/20', darkText: 'dark:text-purple-200' },
        provenientes: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-100/20', darkText: 'dark:text-purple-200' },
        archivo: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-100/20', darkText: 'dark:text-purple-200' },
        judicial: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-100/20', darkText: 'dark:text-purple-200' },
        paralizados: { bg: 'bg-orange-100', text: 'text-orange-800', darkBg: 'dark:bg-orange-100/20', darkText: 'dark:text-orange-200' },
        ejecucion: { bg: 'bg-orange-100', text: 'text-orange-800', darkBg: 'dark:bg-orange-100/20', darkText: 'dark:text-orange-200' },
        sentencia: { bg: 'bg-teal-100', text: 'text-teal-800', darkBg: 'dark:bg-teal-100/20', darkText: 'dark:text-teal-200' },
        fuera: { bg: 'bg-teal-100', text: 'text-teal-800', darkBg: 'dark:bg-teal-100/20', darkText: 'dark:text-teal-200' },
        lapso: { bg: 'bg-teal-100', text: 'text-teal-800', darkBg: 'dark:bg-teal-100/20', darkText: 'dark:text-teal-200' },
    };

    // Buscar coincidencia en el mapa de colores
    for (const [key, value] of Object.entries(colorMap)) {
        if (normalizedStatus.includes(key)) {
            return value;
        }
    }

    // Para estados desconocidos, generamos un color basado en el hash del nombre
    // Esto garantiza que el mismo estado siempre obtenga el mismo color
    const getHashCode = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    };

    // Paleta de colores para estados desconocidos
    const colorPalettes = [
        { bg: 'bg-sky-100', text: 'text-sky-800', darkBg: 'dark:bg-sky-100/20', darkText: 'dark:text-sky-200' },
        { bg: 'bg-emerald-100', text: 'text-emerald-800', darkBg: 'dark:bg-emerald-100/20', darkText: 'dark:text-emerald-200' },
        { bg: 'bg-amber-100', text: 'text-amber-800', darkBg: 'dark:bg-amber-100/20', darkText: 'dark:text-amber-200' },
        { bg: 'bg-rose-100', text: 'text-rose-800', darkBg: 'dark:bg-rose-100/20', darkText: 'dark:text-rose-200' },
        { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', darkBg: 'dark:bg-fuchsia-100/20', darkText: 'dark:text-fuchsia-200' },
        { bg: 'bg-lime-100', text: 'text-lime-800', darkBg: 'dark:bg-lime-100/20', darkText: 'dark:text-lime-200' },
        { bg: 'bg-cyan-100', text: 'text-cyan-800', darkBg: 'dark:bg-cyan-100/20', darkText: 'dark:text-cyan-200' },
        { bg: 'bg-violet-100', text: 'text-violet-800', darkBg: 'dark:bg-violet-100/20', darkText: 'dark:text-violet-200' },
    ];

    // Seleccionar un color basado en el hash del nombre del estado
    const hashCode = getHashCode(normalizedStatus);
    const colorIndex = Math.abs(hashCode) % colorPalettes.length;

    return colorPalettes[colorIndex];
};

interface Props extends PageProps {
    legalCases: {
        data: LegalCase[];
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            links: {
                url: string | null;
                label: string;
                active: boolean;
            }[];
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
    filters: {
        per_page: number;
    };
    caseTypes: CaseType[];
    debug?: {
        total_records: number;
        total_pages: number;
    };
}

export default function Index() {
    const { legalCases, filters, caseTypes, debug } = usePage<Props>().props;

    // Extraer valores de la URL para inicialización
    const urlParams = new URLSearchParams(window.location.search);
    const urlPage = parseInt(urlParams.get('page') || '1', 10);
    // Verificar si el panel de búsqueda debe estar abierto
    const shouldOpenSearch = urlParams.get('open_search') === 'true';

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState<LegalCase | null>(null);
    const [expandedTitles, setExpandedTitles] = useState<Record<number, boolean>>({});
    const [isAdvancedSearchVisible, setIsAdvancedSearchVisible] = useState(shouldOpenSearch);

    // Estados para TanStack Table
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    // Inicialización segura de la paginación
    const initialPage = useMemo(() => {
        // Primero intentamos obtener la página de la URL
        if (urlPage > 0) {
            return urlPage - 1; // Ajustar a base-0 para TanStack Table
        }
        // Luego de los metadatos del servidor
        if (legalCases?.meta?.current_page) {
            return legalCases.meta.current_page - 1;
        }
        // Por defecto, página 0
        return 0;
    }, [legalCases?.meta?.current_page, urlPage]);

    const initialPageSize = filters?.per_page || parseInt(urlParams.get('per_page') || '10', 10);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: initialPage,
        pageSize: initialPageSize,
    });

    // Actualizar el estado cuando cambian los props - optimizado para evitar rerenderizaciones innecesarias
    useEffect(() => {
        // Solo actualizar si realmente cambió
        const newPageIndex = legalCases?.meta?.current_page ? legalCases.meta.current_page - 1 : 0;
        const newPageSize = filters?.per_page || 10;

        // Batch updates para evitar múltiples renderizados
        let shouldUpdate = false;
        const newPagination = { ...pagination };

        if (newPageIndex !== pagination.pageIndex) {
            newPagination.pageIndex = newPageIndex;
            shouldUpdate = true;
        }

        if (newPageSize !== pagination.pageSize) {
            newPagination.pageSize = newPageSize;
            shouldUpdate = true;
        }

        // Solo actualizar el estado si algo cambió
        if (shouldUpdate) {
            setPagination(newPagination);
        }
    }, [legalCases?.meta?.current_page, filters?.per_page]);

    // Preferencias de paginación
    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value, 10);

        // Obtener todos los parámetros actuales de la URL para preservar los filtros
        const currentUrlParams = new URLSearchParams(window.location.search);
        const params: Record<string, string> = {};

        // Copiar todos los parámetros actuales excepto 'page' y 'per_page'
        currentUrlParams.forEach((value, key) => {
            // Excluimos 'page' porque queremos volver a la primera página
            if (key !== 'page') {
                params[key] = value;
            }
        });

        // Añadir/actualizar el parámetro per_page
        params.per_page = newPerPage.toString();
        params.page = '1'; // Volver a la primera página al cambiar la cantidad por página

        router.visit(route('legal-cases.index', params), {
            preserveState: true,
            replace: true,
            only: ['legalCases', 'filters', 'debug'],
        });
    };

    // Manejador para navegación de página
    const handlePageNavigation = (url: string | null) => {
        if (!url) return; // Si la URL es null, simplemente retornamos sin hacer nada

        try {
            // Parsear la URL proporcionada por Laravel para obtener la página
            const urlObj = new URL(url);
            const targetPage = urlObj.searchParams.get('page') || '1';

            // Obtener todos los parámetros actuales de la URL para preservar los filtros
            const currentUrlParams = new URLSearchParams(window.location.search);
            const params: Record<string, string> = {};

            // Copiar todos los parámetros actuales
            currentUrlParams.forEach((value, key) => {
                params[key] = value;
            });

            // Actualizar el parámetro de página
            params.page = targetPage;

            // Usar Inertia.js para navegar con todos los parámetros preservados
            router.visit(route('legal-cases.index', params), {
                preserveState: true,
                replace: true,
                only: ['legalCases', 'filters', 'debug'],
            });
        } catch (error) {
            // Si hay algún error al parsear la URL, usamos la URL original como fallback
            router.visit(url, {
                preserveState: true,
                replace: true,
                only: ['legalCases', 'filters', 'debug'],
            });
        }
    };

    // Extraer los criterios de búsqueda de la URL para inicializar la búsqueda avanzada
    const extractSearchCriteriaFromUrl = (): FilterCriterion[] => {
        const urlParams = new URLSearchParams(window.location.search);
        const criteria: FilterCriterion[] = [];

        // Buscar todos los parámetros filter[n][field]
        for (let i = 0; i < 100; i++) {
            // Límite arbitrario para evitar bucles infinitos
            const fieldParam = urlParams.get(`filter[${i}][field]`);
            if (!fieldParam) break;

            const operatorParam = urlParams.get(`filter[${i}][operator]`);
            const valueParam = urlParams.get(`filter[${i}][value]`);
            const typeParam = urlParams.get(`filter[${i}][type]`);

            if (fieldParam && operatorParam) {
                let value: any = valueParam || '';

                // Procesar valores especiales según el tipo
                if (typeParam === 'date' && operatorParam === 'between') {
                    try {
                        value = JSON.parse(valueParam || '{}');
                    } catch (e) {
                        value = { start: null, end: null };
                    }
                }

                criteria.push({
                    id: `criterion-${Date.now()}-${i}`,
                    field: fieldParam,
                    operator: operatorParam,
                    value: value,
                    type: (typeParam as FilterCriterion['type']) || 'string',
                    label: '',
                });
            }
        }

        return criteria;
    };

    // Inicializar criterios de búsqueda desde la URL
    const initialSearchCriteria = useMemo(() => extractSearchCriteriaFromUrl(), []);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inicio',
            href: route('search.index'),
        },
        {
            title: 'Expedientes Legales',
            href: route('legal-cases.index'),
        },
    ];

    const confirmDelete = (legalCase: LegalCase) => {
        setCaseToDelete(legalCase);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (caseToDelete) {
            router.delete(route('legal-cases.destroy', caseToDelete.id), {
                onSuccess: () => {
                    toast.success('Expediente eliminado exitosamente');
                },
                onError: () => {
                    toast.error('Error al eliminar el expediente');
                },
            });
        }
        setIsDeleteDialogOpen(false);
    };

    // Toggle para expandir o contraer títulos
    const toggleTitleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedTitles((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Datos principales de la tabla
    const data = useMemo(() => {
        // Si tenemos datos paginados del servidor, usamos esos
        if (legalCases?.data) {
            return legalCases.data;
        }
        // Si por alguna razón no tenemos la estructura esperada, aceptamos un array directo
        // (esto proporciona compatibilidad con versiones anteriores)
        return Array.isArray(legalCases) ? legalCases : [];
    }, [legalCases]);

    // Definir el helper de columna para LegalCase
    const columnHelper = createColumnHelper<LegalCase>();

    // Definición de columnas para TanStack Table
    const columns = useMemo(
        () => [
            // Columna de numeración global (continua a través de las páginas)
            columnHelper.display({
                id: 'numero',
                header: () => <div className="text-center font-medium">#</div>,
                cell: (info) => {
                    // Usar el from de Laravel para calcular el índice global
                    const baseIndex = legalCases?.meta?.from || 1; // Índice base de esta página
                    const rowIndex = info.row.index; // Índice local dentro de esta página
                    // El número global es el índice base más el índice dentro de la página actual
                    return <div className="text-center font-medium text-gray-500">{baseIndex + rowIndex}</div>;
                },
                enableSorting: false,
                enableColumnFilter: false,
            }),
            columnHelper.accessor('code', {
                header: 'Código',
                cell: (info) => <div className="font-bold">{info.getValue()}</div>,
                enableSorting: true,
                enableColumnFilter: true,
            }),
            columnHelper.accessor((row) => row.case_type?.name, {
                id: 'case_type',
                header: 'Tipo de Caso',
                cell: (info) => info.getValue() || 'Sin tipo definido',
                enableSorting: true,
                enableColumnFilter: true,
            }),
            columnHelper.accessor('entry_date', {
                header: 'Fecha de Entrada',
                cell: (info) => formatDateSafe(info.getValue()),
                enableSorting: true,
                enableColumnFilter: false,
            }),
            columnHelper.accessor('sentence_date', {
                header: 'Fecha de Sentencia',
                cell: (info) => formatDateSafe(info.getValue()) || <span className="text-gray-400">Pendiente</span>,
                enableSorting: true,
                enableColumnFilter: false,
            }),
            columnHelper.accessor('closing_date', {
                header: 'Fecha de Salida',
                cell: (info) => formatDateSafe(info.getValue()) || <span className="text-gray-400">Pendiente</span>,
                enableSorting: true,
                enableColumnFilter: false,
            }),
            columnHelper.accessor((row) => row.currentStatus?.name, {
                id: 'status',
                header: 'Estado',
                cell: (info) => {
                    const legalCase = info.row.original;

                    // Primero intentamos con currentStatus (nuestra relación)
                    let statusName = info.getValue();

                    // Si no hay currentStatus pero hay statuses[], usamos el último
                    if (!statusName && Array.isArray(legalCase.statuses) && legalCase.statuses.length > 0) {
                        statusName = legalCase.statuses[0].name;
                    }

                    if (!statusName) return <span className="text-gray-400">Sin estado</span>;

                    return <span>{statusName}</span>;
                },
                enableSorting: true,
                enableColumnFilter: true,
            }),
            columnHelper.display({
                id: 'actions',
                header: () => <div className="text-right">Acciones</div>,
                cell: (info) => {
                    const legalCase = info.row.original;
                    return (
                        <div className="flex justify-end gap-2">
                            <Link href={route('legal-cases.show', legalCase.id)}>
                                <Button variant="outline" size="icon">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href={route('legal-cases.edit', legalCase.id)}>
                                <Button variant="outline" size="icon">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button variant="destructive" size="icon" onClick={() => confirmDelete(legalCase)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
            }),
        ],
        [legalCases?.meta?.from],
    );

    // Configuración de TanStack Table
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // Activamos la paginación manual para indicar que la paginación se gestiona fuera de TanStack Table (en el servidor)
        manualPagination: true,
        // Indicamos a TanStack Table el número total de filas para cálculos de paginación
        pageCount: legalCases?.meta?.last_page || 1,
    });

    // Calculamos información de paginación para mostrar en la interfaz
    const { pageSize, pageIndex } = table.getState().pagination;

    // Métricas globales - Total de registros en la base de datos
    const totalItemsGlobal = useMemo(() => {
        // Preferimos usar el dato explícito del debug si está disponible
        if (debug?.total_records !== undefined) {
            return debug.total_records;
        }
        // Si tenemos meta información del servidor
        if (legalCases?.meta?.total) {
            return legalCases.meta.total;
        }
        // Si no, usamos la longitud de nuestros datos
        return data.length;
    }, [legalCases, data, debug]);

    // Número total de páginas - Calcular correctamente basado en el total de registros
    const lastPage = useMemo(() => {
        // Usar el valor explícito del debug si está disponible
        if (debug?.total_pages !== undefined) {
            return debug.total_pages;
        }
        // Si tenemos la información directamente del servidor, la usamos
        if (legalCases?.meta?.last_page) {
            return legalCases.meta.last_page;
        }

        // Si no, calculamos basado en el total de registros y los registros por página
        return Math.max(1, Math.ceil(totalItemsGlobal / pageSize));
    }, [legalCases?.meta?.last_page, totalItemsGlobal, pageSize, debug]);

    // Como estamos usando paginación manual, usamos directamente los datos que viene del servidor
    // sin necesidad de filtrado adicional en el cliente
    const tableRows = table.getRowModel().rows;

    // Flag para indicar si hay filtros activos
    const hasActiveFilters = useMemo(() => {
        return table.getState().columnFilters.length > 0 || sorting.length > 0 || globalFilter !== '';
    }, [table.getState().columnFilters, sorting, globalFilter]);

    // Resetear filtros
    const handleResetFilters = () => {
        setSorting([]);
        setColumnFilters([]);
        setGlobalFilter('');
        // No cerramos el panel de búsqueda avanzada
        // setIsAdvancedSearchVisible(false);

        // Reiniciar la búsqueda y volver a la primera página sin preservar el estado
        // Añadimos el parámetro open_search para mantener abierto el panel
        router.visit(
            route('legal-cases.index', {
                per_page: initialPageSize,
                page: 1,
                open_search: 'true',
            }),
            {
                preserveState: false,
                replace: true,
            },
        );
    };

    // Calcular elementos filtrados solo cuando cambie el estado de la tabla
    const filteredCount = useMemo(() => {
        return table.getFilteredRowModel().rows.length;
    }, [table.getFilteredRowModel().rows.length]);

    // Renderizado condicional optimizado para la tabla
    const renderTable = useMemo(
        () => (
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className={header.id === 'actions' ? 'text-right' : ''}>
                                    {header.isPlaceholder ? null : (
                                        <div>
                                            <div
                                                {...{
                                                    className: header.column.getCanSort()
                                                        ? 'cursor-pointer select-none flex items-center gap-1 hover:text-primary transition-colors group'
                                                        : '',
                                                    onClick: header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span className="text-muted-foreground ml-1 inline-flex">
                                                        {header.column.getIsSorted() === 'asc' ? (
                                                            <ArrowUp className="text-primary h-4 w-4" />
                                                        ) : header.column.getIsSorted() === 'desc' ? (
                                                            <ArrowDown className="text-primary h-4 w-4" />
                                                        ) : (
                                                            <div className="flex h-4 w-4 flex-col opacity-50 group-hover:opacity-100">
                                                                <ArrowUp className="h-2 w-4" />
                                                                <ArrowDown className="h-2 w-4" />
                                                            </div>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            {header.column.getCanFilter() && (
                                                <div className="mt-2">
                                                    <Input
                                                        value={(header.column.getFilterValue() as string) ?? ''}
                                                        onChange={(e) => header.column.setFilterValue(e.target.value)}
                                                        placeholder={`Filtrar ${header.column.columnDef.header as string}...`}
                                                        className="h-8 bg-white/80 text-xs focus:bg-white dark:bg-zinc-900/80 dark:focus:bg-zinc-900"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {tableRows.length > 0 ? (
                        tableRows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                No se encontraron registros.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        ),
        [tableRows, table.getHeaderGroups(), columns.length],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expedientes Legales" />

            <div className="relative p-4 sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-bold sm:text-2xl">
                        Gestión de Expedientes Legales
                        {hasActiveFilters && (
                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({filteredCount} de {totalItemsGlobal} resultados)
                            </span>
                        )}
                    </h1>
                    <div className="flex flex-1 items-center justify-end gap-2">
                        <Button
                            variant={isAdvancedSearchVisible ? 'secondary' : 'outline'}
                            onClick={() => setIsAdvancedSearchVisible(!isAdvancedSearchVisible)}
                            className="hidden items-center sm:flex"
                            title="Búsqueda avanzada"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Búsqueda Avanzada
                        </Button>
                        <Button
                            variant={isAdvancedSearchVisible ? 'secondary' : 'outline'}
                            onClick={() => setIsAdvancedSearchVisible(!isAdvancedSearchVisible)}
                            className="sm:hidden"
                            size="icon"
                            title="Búsqueda avanzada"
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="outline" size="icon" onClick={handleResetFilters} title="Limpiar filtros" className="shrink-0">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                        <Link href={route('legal-cases.create')}>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground hidden sm:inline-flex" title="Nuevo Expediente">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Expediente
                            </Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground sm:hidden" size="icon" title="Nuevo Expediente">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {isAdvancedSearchVisible && (
                    <div className="mb-4">
                        <AdvancedSearchContainer caseTypes={caseTypes} initialCriteria={initialSearchCriteria} />
                    </div>
                )}

                {/* Mostrar filtros activos */}
                {hasActiveFilters && (
                    <div className="mb-3 rounded bg-white p-2 shadow sm:p-3 dark:bg-zinc-900">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            {table.getState().columnFilters.map((filter) => {
                                const column = table.getColumn(filter.id);
                                return (
                                    <div
                                        key={filter.id}
                                        className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-zinc-800"
                                    >
                                        <span>
                                            {column?.columnDef?.header as string}: {filter.value as string}
                                        </span>
                                        <button
                                            onClick={() => column?.setFilterValue(undefined)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                );
                            })}
                            {sorting.map((sort) => {
                                const column = table.getColumn(sort.id);
                                return (
                                    <div
                                        key={sort.id}
                                        className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-zinc-800"
                                    >
                                        <span>
                                            {column?.columnDef?.header as string}: {sort.desc ? 'Descendente' : 'Ascendente'}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setSorting((prev) => prev.filter((s) => s.id !== sort.id));
                                            }}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Vista tipo card para móvil */}
                <div className="mb-16 block space-y-1 sm:mb-24 sm:hidden sm:space-y-2">
                    {/* Selector de filtros para móvil */}
                    <div className="mb-2 rounded bg-white p-2 shadow sm:p-3 dark:bg-zinc-900">
                        <div className="space-y-1 sm:space-y-2">
                            <h3 className="mb-1 text-sm font-semibold sm:mb-2">Filtros</h3>

                            {/* Filtros de columnas */}
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanFilter())
                                .map((column) => (
                                    <div key={column.id} className="space-y-1">
                                        <label htmlFor={`filter-${column.id}`} className="text-xs text-gray-500">
                                            {column.columnDef.header as string}
                                        </label>
                                        <Input
                                            id={`filter-${column.id}`}
                                            value={(column.getFilterValue() as string) ?? ''}
                                            onChange={(e) => column.setFilterValue(e.target.value)}
                                            placeholder={`Filtrar ${column.columnDef.header as string}...`}
                                            className="h-8 bg-white/80 text-xs focus:bg-white dark:bg-zinc-900/80 dark:focus:bg-zinc-900"
                                        />
                                    </div>
                                ))}

                            {/* Filtros activos */}
                            {(table.getState().columnFilters.length > 0 || sorting.length > 0) && (
                                <div className="mt-4">
                                    <h3 className="mb-2 text-xs font-semibold">Filtros activos:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {table.getState().columnFilters.map((filter) => {
                                            const column = table.getColumn(filter.id);
                                            return (
                                                <div
                                                    key={filter.id}
                                                    className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-zinc-800"
                                                >
                                                    <span>
                                                        {column?.columnDef?.header as string}: {filter.value as string}
                                                    </span>
                                                    <button
                                                        onClick={() => column?.setFilterValue(undefined)}
                                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {sorting.map((sort) => {
                                            const column = table.getColumn(sort.id);
                                            return (
                                                <div
                                                    key={sort.id}
                                                    className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-zinc-800"
                                                >
                                                    <span>
                                                        {column?.columnDef?.header as string}: {sort.desc ? 'Descendente' : 'Ascendente'}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setSorting((prev) => prev.filter((s) => s.id !== sort.id));
                                                        }}
                                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-1 h-7 text-xs">
                                            <RotateCcw className="mr-1 h-3 w-3" />
                                            Limpiar todo
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Selector de registros por página para móvil */}
                            <div className="mt-2 sm:mt-4">
                                <label htmlFor="mobile-per-page" className="mb-0.5 block text-xs text-gray-500 sm:mb-1">
                                    Registros por página
                                </label>
                                <Select value={pageSize.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="h-7 w-full sm:h-8">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 50, 100, 200, 500, 1000].map((size) => (
                                            <SelectItem key={size} value={size.toString()}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Cards de expedientes */}
                    {tableRows.length > 0 ? (
                        tableRows.map((row) => {
                            const legalCase = row.original;
                            return (
                                <div key={legalCase.id} className="flex flex-col gap-1 rounded bg-white p-2 shadow sm:gap-2 sm:p-3 dark:bg-zinc-900">
                                    <div
                                        className="-mx-1 flex cursor-pointer items-start rounded px-1 py-0.5 text-base font-bold transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        onClick={(e) => toggleTitleExpand(legalCase.id, e)}
                                        title="Clic para expandir/contraer el texto"
                                    >
                                        <span className="mt-0.5 mr-2 flex-shrink-0 text-gray-500">
                                            {/* Numeración global basada en from de Laravel */}#
                                            {(() => {
                                                const baseIndex = legalCases?.meta?.from || 1; // Índice base de esta página
                                                return baseIndex + row.index; // Índice global = base + índice local
                                            })()}
                                        </span>
                                        <span className={expandedTitles[legalCase.id] ? '' : 'truncate'}>{legalCase.code}</span>
                                    </div>
                                    <div
                                        className="-mx-1 cursor-pointer rounded px-1 py-0.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800"
                                        onClick={(e) => toggleTitleExpand(legalCase.id, e)}
                                    >
                                        <div className={expandedTitles[legalCase.id] ? '' : 'truncate'}>
                                            {legalCase.case_type?.name || 'Sin tipo definido'}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">Entrada: {formatDateSafe(legalCase.entry_date)}</div>
                                    {legalCase.sentence_date && (
                                        <div className="text-xs text-gray-400">Sentencia: {formatDateSafe(legalCase.sentence_date)}</div>
                                    )}
                                    {legalCase.closing_date && (
                                        <div className="text-xs text-gray-400">Salida: {formatDateSafe(legalCase.closing_date)}</div>
                                    )}
                                    {/* Verificar si hay estado en currentStatus o en el array statuses */}
                                    {(legalCase.currentStatus?.name || (Array.isArray(legalCase.statuses) && legalCase.statuses.length > 0)) && (
                                        <div className="mt-1 text-xs">
                                            {(() => {
                                                // Determinar el nombre del estado a mostrar
                                                const statusName =
                                                    legalCase.currentStatus?.name ||
                                                    (Array.isArray(legalCase.statuses) && legalCase.statuses.length > 0
                                                        ? legalCase.statuses[0].name
                                                        : '');

                                                return <span>{statusName}</span>;
                                            })()}
                                        </div>
                                    )}
                                    <div className="mt-1 flex justify-end gap-1 sm:mt-2 sm:gap-2">
                                        <Link href={route('legal-cases.show', legalCase.id)}>
                                            <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={route('legal-cases.edit', legalCase.id)}>
                                            <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-7 w-7 sm:h-8 sm:w-8"
                                            onClick={() => confirmDelete(legalCase)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-4 text-center text-gray-500 sm:py-8 dark:text-gray-400">No se encontraron registros.</div>
                    )}

                    {/* Paginación móvil */}
                    <div className="bg-sidebar fixed right-0 bottom-0 left-0 z-10 w-full rounded-t-lg border-t border-gray-200 p-3 shadow-md sm:hidden dark:border-zinc-800 dark:bg-zinc-800">
                        <div className="flex items-center justify-between">
                            <div className="text-xs whitespace-nowrap text-gray-500">
                                <span className="inline-flex items-center">
                                    <span className="xs:inline hidden">
                                        {legalCases?.meta?.from || 0}-{legalCases?.meta?.to || 0}
                                    </span>
                                    <span className="xs:hidden">{legalCases?.meta?.to - legalCases?.meta?.from + 1 || 0}</span>
                                    <span className="mx-1">/</span>
                                    <span>{totalItemsGlobal}</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Selector de registros por página */}
                                <Select value={pageSize.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="h-7 w-16 text-xs">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 50, 100, 200, 500, 1000].map((size) => (
                                            <SelectItem key={size} value={size.toString()}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Indicador de página en móvil */}
                                <div className="text-xs font-medium">
                                    Pág. {legalCases?.meta?.current_page || 1}/{legalCases?.meta?.last_page || 1}
                                </div>
                            </div>
                        </div>

                        {/* Paginación móvil usando botones más grandes (estilo cliente-side) */}
                        <div className="mt-2 flex justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => {
                                    const firstPageUrl = legalCases.meta?.links?.find((link) => link.label === '1')?.url;
                                    if (firstPageUrl) handlePageNavigation(firstPageUrl);
                                }}
                                disabled={!legalCases.meta?.links?.find((link) => link.label === '1')?.url || legalCases.meta?.current_page === 1}
                            >
                                <ChevronsLeft className="mr-1 h-4 w-4" />
                                Inicio
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => {
                                    const prevUrl = legalCases.meta?.links?.find((link) => link.label === '&laquo; Previous')?.url;
                                    if (prevUrl) handlePageNavigation(prevUrl);
                                }}
                                disabled={!legalCases.meta?.links?.find((link) => link.label === '&laquo; Previous')?.url}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Anterior
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => {
                                    const nextUrl = legalCases.meta?.links?.find((link) => link.label === 'Next &raquo;')?.url;
                                    if (nextUrl) handlePageNavigation(nextUrl);
                                }}
                                disabled={!legalCases.meta?.links?.find((link) => link.label === 'Next &raquo;')?.url}
                            >
                                Siguiente
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => {
                                    const lastPageNumber = legalCases.meta?.last_page;
                                    const lastPageUrl = legalCases.meta?.links?.find((link) => link.label === String(lastPageNumber))?.url;
                                    if (lastPageUrl) handlePageNavigation(lastPageUrl);
                                }}
                                disabled={!legalCases.meta?.last_page || legalCases.meta?.current_page === legalCases.meta?.last_page}
                            >
                                Final
                                <ChevronsRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Espacio para compensar la paginación fija en móvil */}
                    <div className="h-16 sm:hidden sm:h-20"></div>
                </div>

                {/* Tabla y paginación para escritorio/tablet */}
                <div className="hidden overflow-hidden shadow-sm sm:block">
                    {/* Tabla */}
                    <div className="overflow-hidden bg-white sm:rounded-t-lg dark:bg-zinc-900">
                        <div className="overflow-x-auto">{renderTable}</div>
                    </div>

                    {/* Paginación para escritorio */}
                    <div className="bg-sidebar flex flex-row-reverse items-center justify-between gap-4 border-t border-gray-200 px-4 py-4 sm:rounded-b-lg dark:border-zinc-800 dark:bg-zinc-800">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div>
                                    Mostrando{' '}
                                    {legalCases?.meta?.to && legalCases?.meta?.from
                                        ? legalCases.meta.to - legalCases.meta.from + 1
                                        : Math.min(pageSize, tableRows.length)}{' '}
                                    de {totalItemsGlobal} registros
                                </div>
                                <Select value={pageSize.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="h-8 w-24">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 50, 100, 200, 500, 1000].map((size) => (
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
                                Página <span className="font-semibold">{legalCases?.meta?.current_page || 1}</span> de{' '}
                                <span className="font-semibold">{legalCases?.meta?.last_page || 1}</span>
                            </div>

                            {/* Botones de navegación */}
                            {legalCases?.meta?.links && <LaravelPagination links={legalCases.meta.links} onPageChange={handlePageNavigation} />}
                        </div>
                    </div>
                </div>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro de eliminar este expediente?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el expediente <b>{caseToDelete?.code}</b> de la base
                                de datos.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
