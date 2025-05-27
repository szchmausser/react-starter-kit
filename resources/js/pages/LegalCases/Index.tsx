import { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { formatDateSafe } from '@/lib/utils';
import { PageProps } from '@inertiajs/core';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
    ArrowDown, 
    ArrowUp, 
    Briefcase, 
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Eye, 
    Pencil, 
    Plus, 
    RotateCcw, 
    Search, 
    Trash2, 
    X 
} from 'lucide-react';
import { toast } from 'sonner';
import type { LegalCase } from '@/types/index';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    SortingState,
    ColumnFiltersState,
    PaginationState
} from '@tanstack/react-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LaravelPagination from '@/components/LaravelPagination';

// Función para obtener clases de colores según el estado
const getStatusColor = (statusName: string): { bg: string, text: string, darkBg: string, darkText: string } => {
    // Normalizar el nombre del estado (minúsculas, sin espacios ni acentos)
    const normalizedStatus = statusName.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "");
    
    // Mapeo de estados a colores
    const colorMap: Record<string, { bg: string, text: string, darkBg: string, darkText: string }> = {
        // Estados de tramitación
        'enproceso': { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-900', darkText: 'dark:text-blue-300' },
        'tramite': { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-900', darkText: 'dark:text-blue-300' },
        'entramite': { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-900', darkText: 'dark:text-blue-300' },
        
        // Estados de conclusión
        'finalizado': { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900', darkText: 'dark:text-green-300' },
        'completado': { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900', darkText: 'dark:text-green-300' },
        'cerrado': { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900', darkText: 'dark:text-green-300' },
        
        // Estados de espera
        'enespera': { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-900', darkText: 'dark:text-yellow-300' },
        'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-900', darkText: 'dark:text-yellow-300' },
        'espera': { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-900', darkText: 'dark:text-yellow-300' },
        
        // Estados críticos
        'urgente': { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'dark:bg-red-900', darkText: 'dark:text-red-300' },
        'critico': { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'dark:bg-red-900', darkText: 'dark:text-red-300' },
        
        // Estados de pausa
        'suspendido': { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-300' },
        'cancelado': { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-300' },
        'archivado': { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-300' },
    };
    
    // Buscar coincidencia en el mapa de colores
    for (const [key, value] of Object.entries(colorMap)) {
        if (normalizedStatus.includes(key)) {
            return value;
        }
    }
    
    // Color por defecto
    return { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-900', darkText: 'dark:text-purple-300' };
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
        search: string;
        per_page: number;
    };
    debug?: {
        total_records: number;
        total_pages: number;
    };
}

export default function Index() {
    const { legalCases, filters, debug } = usePage<Props>().props;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState<LegalCase | null>(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [expandedTitles, setExpandedTitles] = useState<Record<number, boolean>>({});
    
    // Estados para TanStack Table
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    
    // Extraer valores de la URL para inicialización
    const urlParams = new URLSearchParams(window.location.search);
    const urlPage = parseInt(urlParams.get('page') || '1', 10);
    
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
        let newPagination = {...pagination};
        
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
        
        router.visit(route('legal-cases.index', { 
            search: filters?.search || '',
            per_page: newPerPage,
            page: 1, // Volver a la primera página al cambiar la cantidad por página
        }), { 
            preserveState: true,
            replace: true,
            only: ['legalCases', 'filters', 'debug'],
        });
    };

    // Manejador para navegación de página
    const handlePageNavigation = (url: string | null) => {
        if (!url) return; // Si la URL es null, simplemente retornamos sin hacer nada
        
        // Usar Inertia.js para navegar a la URL proporcionada por Laravel
        router.visit(url, {
            preserveState: true,
            replace: true,
            only: ['legalCases', 'filters', 'debug'],
        });
    };

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

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Siempre enviamos la búsqueda al servidor para filtrar datos desde la base de datos
        router.visit(route('legal-cases.index', { 
            search,
            per_page: filters?.per_page || 10,
            page: 1,
        }), { 
            preserveState: true,
            replace: true,
            only: ['legalCases', 'filters', 'debug'],
        });
    };

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
        setExpandedTitles(prev => ({
            ...prev,
            [id]: !prev[id]
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
    const columns = useMemo(() => [
        // Columna de numeración global (continua a través de las páginas)
        columnHelper.display({
            id: 'numero',
            header: '#',
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
            cell: (info) => (
                <div className="font-medium flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                    {info.getValue()}
                </div>
            ),
            enableSorting: true,
            enableColumnFilter: true,
        }),
        columnHelper.accessor(
            row => row.case_type?.name,
            {
                id: 'case_type',
                header: 'Tipo de Caso',
                cell: (info) => info.getValue() || 'Sin tipo definido',
                enableSorting: true,
                enableColumnFilter: true,
            }
        ),
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
        columnHelper.accessor(
            row => row.currentStatus?.name,
            {
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
                    
                    // Obtener clases de colores según el estado
                    const { bg, text, darkBg, darkText } = getStatusColor(statusName);
                    
                    return (
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text} dark:${darkBg} dark:${darkText}`}>
                            {statusName}
                        </div>
                    );
                },
                enableSorting: true,
                enableColumnFilter: true,
            }
        ),
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
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => confirmDelete(legalCase)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
            enableColumnFilter: false,
        }),
    ], [legalCases?.meta?.from]);

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
        return table.getState().columnFilters.length > 0 || 
               sorting.length > 0 || 
               globalFilter !== '';
    }, [table.getState().columnFilters, sorting, globalFilter]);
    
    // Resetear filtros
    const handleResetFilters = () => {
        setSorting([]);
        setColumnFilters([]);
        setGlobalFilter('');
        setSearch('');
        
        // Reiniciar la búsqueda y volver a la primera página
        router.visit(route('legal-cases.index', { 
            per_page: initialPageSize,
            page: 1
        }), { 
            preserveState: true,
            replace: true,
            only: ['legalCases', 'filters', 'debug'],
        });
    };

    // Calcular elementos filtrados solo cuando cambie el estado de la tabla
    const filteredCount = useMemo(() => {
        return table.getFilteredRowModel().rows.length;
    }, [table.getFilteredRowModel().rows.length]);
    
    // Renderizado condicional optimizado para la tabla
    const renderTable = useMemo(() => (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <TableHead key={header.id} className={header.id === 'actions' ? 'text-right' : ''}>
                                {header.isPlaceholder ? null : (
                                    <div>
                                        <div
                                            {...{
                                                className: header.column.getCanSort()
                                                    ? 'cursor-pointer select-none flex items-center gap-1 hover:text-primary transition-colors'
                                                    : '',
                                                onClick: header.column.getToggleSortingHandler(),
                                            }}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {header.column.getIsSorted() && (
                                                <span className="ml-1">
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <ArrowUp className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowDown className="h-4 w-4" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        {header.column.getCanFilter() && (
                                            <div className="mt-2">
                                                <Input
                                                    value={(header.column.getFilterValue() as string) ?? ''}
                                                    onChange={e => header.column.setFilterValue(e.target.value)}
                                                    placeholder={`Filtrar ${header.column.columnDef.header as string}...`}
                                                    className="h-8 text-xs"
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
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No se encontraron registros.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    ), [tableRows, table.getHeaderGroups(), columns.length]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expedientes Legales" />

            <div className="p-4 sm:p-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <h1 className="text-2xl font-bold">
                        Gestión de Expedientes Legales
                        {hasActiveFilters && (
                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({filteredCount} de {totalItemsGlobal} resultados)
                            </span>
                        )}
                    </h1>
                    <div className="flex flex-1 gap-2 items-center justify-end">
                        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full max-w-xs">
                            <Input
                                placeholder="Buscar por código..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                            <Button type="submit" variant="outline" className="shrink-0">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                        {hasActiveFilters && (
                            <Button 
                                variant="outline" 
                                size="icon"
                                onClick={handleResetFilters}
                                title="Limpiar filtros"
                                className="shrink-0"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                        <Link href={route('legal-cases.create')}>
                            <Button className="hidden sm:inline-flex">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Expediente
                            </Button>
                            <Button className="sm:hidden" size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mostrar filtros activos */}
                {hasActiveFilters && (
                    <div className="bg-white dark:bg-zinc-900 rounded shadow p-3 mb-4">
                        <div className="flex flex-wrap gap-2">
                            {table.getState().columnFilters.map(filter => {
                                const column = table.getColumn(filter.id);
                                return (
                                    <div key={filter.id} className="bg-gray-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-xs flex items-center gap-1">
                                        <span>{column?.columnDef?.header as string}: {filter.value as string}</span>
                                        <button
                                            onClick={() => column?.setFilterValue(undefined)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                );
                            })}
                            {sorting.map(sort => {
                                const column = table.getColumn(sort.id);
                                return (
                                    <div key={sort.id} className="bg-gray-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-xs flex items-center gap-1">
                                        <span>{column?.columnDef?.header as string}: {sort.desc ? 'Descendente' : 'Ascendente'}</span>
                                        <button
                                            onClick={() => {
                                                setSorting(prev => prev.filter(s => s.id !== sort.id));
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
                <div className="block sm:hidden space-y-2 mb-24">
                    {/* Selector de filtros para móvil */}
                    <div className="bg-white dark:bg-zinc-900 rounded shadow p-3 mb-2">
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold mb-2">Filtros</h3>
                            
                            {/* Filtros de columnas */}
                            {table.getAllColumns().filter(column => 
                                column.getCanFilter()
                            ).map(column => (
                                <div key={column.id} className="space-y-1">
                                    <label htmlFor={`filter-${column.id}`} className="text-xs text-gray-500">
                                        {column.columnDef.header as string}
                                    </label>
                                    <Input
                                        id={`filter-${column.id}`}
                                        value={(column.getFilterValue() as string) ?? ''}
                                        onChange={e => column.setFilterValue(e.target.value)}
                                        placeholder={`Filtrar ${column.columnDef.header as string}...`}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            ))}

                            {/* Filtros activos */}
                            {(table.getState().columnFilters.length > 0 || sorting.length > 0) && (
                                <div className="mt-4">
                                    <h3 className="text-xs font-semibold mb-2">Filtros activos:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {table.getState().columnFilters.map(filter => {
                                            const column = table.getColumn(filter.id);
                                            return (
                                                <div key={filter.id} className="bg-gray-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-xs flex items-center gap-1">
                                                    <span>{column?.columnDef?.header as string}: {filter.value as string}</span>
                                                    <button
                                                        onClick={() => column?.setFilterValue(undefined)}
                                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {sorting.map(sort => {
                                            const column = table.getColumn(sort.id);
                                            return (
                                                <div key={sort.id} className="bg-gray-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-xs flex items-center gap-1">
                                                    <span>{column?.columnDef?.header as string}: {sort.desc ? 'Descendente' : 'Ascendente'}</span>
                                                    <button
                                                        onClick={() => {
                                                            setSorting(prev => prev.filter(s => s.id !== sort.id));
                                                        }}
                                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleResetFilters}
                                            className="text-xs h-7 mt-1"
                                        >
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            Limpiar todo
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Selector de registros por página para móvil */}
                            <div className="mt-4">
                                <label htmlFor="mobile-per-page" className="text-xs text-gray-500 block mb-1">
                                    Registros por página
                                </label>
                                <Select 
                                    value={pageSize.toString()} 
                                    onValueChange={handlePerPageChange}
                                >
                                    <SelectTrigger className="h-8 w-full">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 50, 100, 200, 500, 1000].map(size => (
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
                                <div key={legalCase.id} className="bg-white dark:bg-zinc-900 rounded shadow p-3 flex flex-col gap-2">
                                    <div 
                                        className="font-bold text-base flex items-start cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 -mx-1 px-1 py-0.5 rounded transition-colors" 
                                        onClick={(e) => toggleTitleExpand(legalCase.id, e)}
                                        title="Clic para expandir/contraer el texto"
                                    >
                                        <span className="mr-2 mt-0.5 flex-shrink-0 text-gray-500">
                                            {/* Numeración global basada en from de Laravel */}
                                            #{(() => {
                                                const baseIndex = legalCases?.meta?.from || 1; // Índice base de esta página
                                                return baseIndex + row.index; // Índice global = base + índice local
                                            })()}
                                        </span>
                                        <span className="mr-2 mt-0.5 flex-shrink-0">
                                            <Briefcase className="h-4 w-4 text-gray-500" />
                                        </span>
                                        <span className={expandedTitles[legalCase.id] ? '' : 'truncate'}>
                                            {legalCase.code}
                                        </span>
                                    </div>
                                    <div 
                                        className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 -mx-1 px-1 py-0.5 rounded transition-colors" 
                                        onClick={(e) => toggleTitleExpand(legalCase.id, e)}
                                    >
                                        <div className={expandedTitles[legalCase.id] ? '' : 'truncate'}>
                                            {legalCase.case_type?.name || 'Sin tipo definido'}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Entrada: {formatDateSafe(legalCase.entry_date)}
                                    </div>
                                    {legalCase.sentence_date && (
                                        <div className="text-xs text-gray-400">
                                            Sentencia: {formatDateSafe(legalCase.sentence_date)}
                                        </div>
                                    )}
                                    {legalCase.closing_date && (
                                        <div className="text-xs text-gray-400">
                                            Salida: {formatDateSafe(legalCase.closing_date)}
                                        </div>
                                    )}
                                    {/* Verificar si hay estado en currentStatus o en el array statuses */}
                                    {(legalCase.currentStatus?.name || (Array.isArray(legalCase.statuses) && legalCase.statuses.length > 0)) && (
                                        <div className="text-xs mt-1">
                                            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                (() => {
                                                    // Determinar el nombre del estado a mostrar
                                                    const statusName = legalCase.currentStatus?.name || 
                                                                      (Array.isArray(legalCase.statuses) && legalCase.statuses.length > 0 ? 
                                                                       legalCase.statuses[0].name : '');
                                                    
                                                    const colors = getStatusColor(statusName);
                                                    return `${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`;
                                                })()
                                            }`}>
                                                {legalCase.currentStatus?.name || 
                                                 (Array.isArray(legalCase.statuses) && legalCase.statuses.length > 0 ? 
                                                  legalCase.statuses[0].name : 'Sin estado')}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-2 justify-end">
                                        <Link href={route('legal-cases.show', legalCase.id)}>
                                            <Button variant="outline" size="icon" className="h-8 w-8">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={route('legal-cases.edit', legalCase.id)}>
                                            <Button variant="outline" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => confirmDelete(legalCase)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No se encontraron registros.
                        </div>
                    )}
                    
                    {/* Paginación móvil */}
                    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 shadow-md p-3 rounded-t-lg border-t border-gray-200 dark:border-zinc-800 z-10">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                                <span className="inline-flex items-center">
                                    <span className="hidden xs:inline">{legalCases?.meta?.from || 0}-{legalCases?.meta?.to || 0}</span>
                                    <span className="xs:hidden">{legalCases?.meta?.to - legalCases?.meta?.from + 1 || 0}</span>
                                    <span className="mx-1">/</span>
                                    <span>{totalItemsGlobal}</span>
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Selector de registros por página */}
                                <Select 
                                    value={pageSize.toString()} 
                                    onValueChange={handlePerPageChange}
                                >
                                    <SelectTrigger className="h-7 w-16 text-xs">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 50, 100, 200, 500, 1000].map(size => (
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
                        
                        {/* Paginación móvil usando botones más grandes */}
                        {legalCases?.meta?.links && (
                            <div className="flex justify-center mt-3">
                                <div className="flex items-center gap-2">
                                    {/* Primera página */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const firstPageUrl = legalCases.meta.links.find(link => link.label === "1")?.url;
                                            if (firstPageUrl) handlePageNavigation(firstPageUrl);
                                        }}
                                        disabled={legalCases.meta.current_page === 1}
                                        className="h-10 w-10 flex items-center justify-center"
                                    >
                                        <ChevronsLeft className="h-5 w-5" />
                                    </Button>
                                    
                                    {/* Página anterior */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const prevUrl = legalCases.meta.links.find(link => link.label === "&laquo; Previous")?.url;
                                            if (prevUrl) handlePageNavigation(prevUrl);
                                        }}
                                        disabled={!legalCases.meta.links.find(link => link.label === "&laquo; Previous")?.url}
                                        className="h-10 w-10 flex items-center justify-center"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    
                                    {/* Página actual (como botón deshabilitado) */}
                                    <Button
                                        variant="default"
                                        size="sm"
                                        disabled
                                        className="h-10 w-10 flex items-center justify-center font-bold"
                                    >
                                        {legalCases.meta.current_page}
                                    </Button>
                                    
                                    {/* Página siguiente */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const nextUrl = legalCases.meta.links.find(link => link.label === "Next &raquo;")?.url;
                                            if (nextUrl) handlePageNavigation(nextUrl);
                                        }}
                                        disabled={!legalCases.meta.links.find(link => link.label === "Next &raquo;")?.url}
                                        className="h-10 w-10 flex items-center justify-center"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                    
                                    {/* Última página */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const lastPageNumber = legalCases.meta.last_page;
                                            const lastPageUrl = legalCases.meta.links.find(link => link.label === String(lastPageNumber))?.url;
                                            if (lastPageUrl) handlePageNavigation(lastPageUrl);
                                        }}
                                        disabled={legalCases.meta.current_page === legalCases.meta.last_page}
                                        className="h-10 w-10 flex items-center justify-center"
                                    >
                                        <ChevronsRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Espacio para compensar la paginación fija en móvil */}
                    <div className="sm:hidden h-20"></div>
                </div>

                {/* Tabla solo visible en escritorio/tablet */}
                <div className="hidden sm:block bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="overflow-x-auto">
                        {renderTable}
                    </div>
                </div>

                <div className="hidden sm:flex sm:flex-row-reverse sm:items-center sm:justify-between px-4 py-4 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                            <div>
                                Mostrando {legalCases?.meta?.to && legalCases?.meta?.from 
                                    ? legalCases.meta.to - legalCases.meta.from + 1 
                                    : Math.min(pageSize, tableRows.length)} de {totalItemsGlobal} registros
                            </div>
                            <Select value={pageSize.toString()} onValueChange={handlePerPageChange}>
                                <SelectTrigger className="h-8 w-24">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[5, 10, 20, 50, 100, 200, 500, 1000].map(size => (
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
                            Página <span className="font-semibold">{legalCases?.meta?.current_page || 1}</span> de{" "}
                            <span className="font-semibold">{legalCases?.meta?.last_page || 1}</span>
                        </div>
                        
                        {/* Botones de navegación */}
                        {legalCases?.meta?.links && (
                            <LaravelPagination 
                                links={legalCases.meta.links} 
                                onPageChange={handlePageNavigation}
                            />
                        )}
                    </div>
                </div>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro de eliminar este expediente?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el expediente <b>{caseToDelete?.code}</b> de la base de datos.
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