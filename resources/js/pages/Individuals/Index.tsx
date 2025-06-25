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
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Definir la interfaz BreadcrumbItem
interface BreadcrumbItem {
    title: string;
    href: string;
}

// Definir la interfaz Individual
interface Individual {
    id: number;
    national_id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    second_last_name?: string;
    email_1?: string;
    phone_number_1?: string;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    individuals: {
        data: Individual[];
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
        per_page?: number;
        national_id?: string;
        first_name?: string;
        email?: string;
        phone?: string;
        order_by?: string;
        order_dir?: string;
    };
    debug?: {
        total_records: number;
        total_pages: number;
    };
}

export default function IndividualsIndex() {
    const { individuals, filters, debug } = usePage<Props>().props;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [individualToDelete, setIndividualToDelete] = useState<Individual | null>(null);
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
        if (individuals?.meta?.current_page) {
            return individuals.meta.current_page - 1;
        }
        // Por defecto, página 0
        return 0;
    }, [individuals?.meta?.current_page, urlPage]);

    const initialPageSize = filters?.per_page || parseInt(urlParams.get('per_page') || '10', 10);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: initialPage,
        pageSize: initialPageSize,
    });

    // Actualizar el estado cuando cambian los props
    useEffect(() => {
        // Solo actualizar si realmente cambió
        const newPageIndex = individuals?.meta?.current_page ? individuals.meta.current_page - 1 : 0;
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
    }, [individuals?.meta?.current_page, filters?.per_page]);

    // Preferencias de paginación
    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value, 10);

        router.visit(
            route('individuals.index', {
                per_page: newPerPage,
                page: 1, // Volver a la primera página al cambiar la cantidad por página
            }),
            {
                preserveState: true,
                replace: true,
                only: ['individuals', 'filters', 'debug'],
            },
        );
    };

    // Manejador para navegación de página
    const handlePageNavigation = (url: string | null) => {
        if (!url) return; // Si la URL es null, simplemente retornamos sin hacer nada

        // Usar Inertia.js para navegar a la URL proporcionada por Laravel
        router.visit(url, {
            preserveState: true,
            replace: true,
            only: ['individuals', 'filters', 'debug'],
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inicio',
            href: route('search.index'),
        },
        {
            title: 'Personas Naturales',
            href: route('individuals.index'),
        },
    ];

    const confirmDelete = (individual: Individual) => {
        setIndividualToDelete(individual);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (individualToDelete) {
            router.delete(route('individuals.destroy', individualToDelete.id), {
                onSuccess: () => {
                    toast.success('Persona eliminada exitosamente');
                },
                onError: () => {
                    toast.error('Error al eliminar la persona');
                },
            });
        }
        setIsDeleteDialogOpen(false);
    };

    // Toggle para expandir o contraer títulos (vista móvil)
    const toggleTitleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedTitles((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Resetear filtros
    const handleResetFilters = () => {
        setSorting([]);
        setColumnFilters([]);
        setGlobalFilter('');

        // Reiniciar la búsqueda y volver a la primera página
        router.visit(
            route('individuals.index', {
                per_page: initialPageSize,
                page: 1,
            }),
            {
                preserveState: true,
                replace: true,
                only: ['individuals', 'filters', 'debug'],
            },
        );
    };

    const getFullName = (individual: Individual): string => {
        return `${individual.first_name} ${individual.middle_name || ''} ${individual.last_name} ${individual.second_last_name || ''}`.trim();
    };

    // Datos principales de la tabla
    const data = useMemo(() => {
        // Si tenemos datos paginados del servidor, usamos esos
        if (individuals?.data) {
            return individuals.data;
        }
        // Si por alguna razón no tenemos la estructura esperada, aceptamos un array directo
        return Array.isArray(individuals) ? individuals : [];
    }, [individuals]);

    // Definir el helper de columna para Individual
    const columnHelper = createColumnHelper<Individual>();

    // Definición de columnas para TanStack Table
    const columns = useMemo(
        () => [
            // Columna de numeración global (continua a través de las páginas)
            columnHelper.display({
                id: 'numero',
                header: () => <div className="text-center font-medium">#</div>,
                cell: (info) => {
                    // Usar el from de Laravel para calcular el índice global
                    const baseIndex = individuals?.meta?.from || 1; // Índice base de esta página
                    const rowIndex = info.row.index; // Índice local dentro de esta página
                    // El número global es el índice base más el índice dentro de la página actual
                    return <div className="text-center font-medium text-gray-500">{baseIndex + rowIndex}</div>;
                },
                enableSorting: false,
                enableColumnFilter: false,
            }),
            columnHelper.accessor('national_id', {
                header: 'Cédula',
                cell: (info) => <div className="font-medium">{info.getValue()}</div>,
                enableSorting: true,
                enableColumnFilter: true,
            }),
            columnHelper.accessor((row) => `${row.first_name} ${row.middle_name || ''} ${row.last_name} ${row.second_last_name || ''}`.trim(), {
                id: 'full_name',
                header: 'Nombre',
                cell: (info) => info.getValue(),
                enableSorting: true,
                enableColumnFilter: true,
            }),
            columnHelper.accessor('email_1', {
                id: 'email',
                header: 'Correo',
                cell: (info) => info.getValue() || '-',
                enableSorting: true,
                enableColumnFilter: true,
            }),
            columnHelper.accessor('phone_number_1', {
                id: 'phone',
                header: 'Teléfono',
                cell: (info) => info.getValue() || '-',
                enableSorting: true,
                enableColumnFilter: true,
            }),
            columnHelper.display({
                id: 'actions',
                header: () => <div className="text-right">Acciones</div>,
                cell: (info) => {
                    const individual = info.row.original;
                    return (
                        <div className="flex justify-end gap-2">
                            <Link href={route('individuals.show', individual.id)}>
                                <Button variant="outline" size="icon">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href={route('individuals.edit', individual.id)}>
                                <Button variant="outline" size="icon">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button variant="destructive" size="icon" onClick={() => confirmDelete(individual)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
            }),
        ],
        [individuals?.meta?.from],
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
        pageCount: individuals?.meta?.last_page || 1,
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
        if (individuals?.meta?.total) {
            return individuals.meta.total;
        }
        // Si no, usamos la longitud de nuestros datos
        return data.length;
    }, [individuals, data, debug]);

    // Número total de páginas - Calcular correctamente basado en el total de registros
    const lastPage = useMemo(() => {
        // Usar el valor explícito del debug si está disponible
        if (debug?.total_pages !== undefined) {
            return debug.total_pages;
        }
        // Si tenemos la información directamente del servidor, la usamos
        if (individuals?.meta?.last_page) {
            return individuals.meta.last_page;
        }

        // Si no, calculamos basado en el total de registros y los registros por página
        return Math.max(1, Math.ceil(totalItemsGlobal / pageSize));
    }, [individuals?.meta?.last_page, totalItemsGlobal, pageSize, debug]);

    // Como estamos usando paginación manual, usamos directamente los datos que viene del servidor
    const tableRows = table.getRowModel().rows;

    // Flag para indicar si hay filtros activos
    const hasActiveFilters = useMemo(() => {
        return table.getState().columnFilters.length > 0 || sorting.length > 0 || globalFilter !== '';
    }, [table.getState().columnFilters, sorting, globalFilter]);

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
            <Head title="Personas Naturales" />

            <div className="relative p-4 sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-bold sm:text-2xl">
                        Gestión de Personas Naturales
                        {hasActiveFilters && (
                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({filteredCount} de {totalItemsGlobal} resultados)
                            </span>
                        )}
                    </h1>
                    <div className="flex flex-1 items-center justify-end gap-2">
                        {hasActiveFilters && (
                            <Button variant="outline" size="icon" onClick={handleResetFilters} title="Limpiar filtros" className="shrink-0">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                        <Link href={route('individuals.create')}>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground hidden sm:inline-flex" title="Nueva Persona">
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Persona
                            </Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground sm:hidden" size="icon" title="Nueva Persona">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

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
                                    <div key={column.id} className="space-y-0.5 sm:space-y-1">
                                        <label htmlFor={`filter-${column.id}`} className="text-xs text-gray-500">
                                            {column.columnDef.header as string}
                                        </label>
                                        <Input
                                            id={`filter-${column.id}`}
                                            value={(column.getFilterValue() as string) ?? ''}
                                            onChange={(e) => column.setFilterValue(e.target.value)}
                                            placeholder={`Filtrar ${column.columnDef.header as string}...`}
                                            className="h-7 bg-white/80 text-xs focus:bg-white sm:h-8 dark:bg-zinc-900/80 dark:focus:bg-zinc-900"
                                        />
                                    </div>
                                ))}

                            {/* Filtros activos */}
                            {(table.getState().columnFilters.length > 0 || sorting.length > 0) && (
                                <div className="mt-2 sm:mt-4">
                                    <h3 className="mb-1 text-xs font-semibold sm:mb-2">Filtros activos:</h3>
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

                                        <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-1 h-6 text-xs sm:h-7">
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

                    {/* Cards de personas */}
                    {tableRows.length > 0 ? (
                        tableRows.map((row) => {
                            const individual = row.original;
                            return (
                                <div key={individual.id} className="flex flex-col gap-1 rounded bg-white p-2 shadow sm:gap-2 sm:p-3 dark:bg-zinc-900">
                                    <div
                                        className="-mx-1 flex cursor-pointer items-start rounded px-1 py-0.5 text-base font-bold transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        onClick={(e) => toggleTitleExpand(individual.id, e)}
                                        title="Clic para expandir/contraer el texto"
                                    >
                                        <span className="mt-0.5 mr-2 flex-shrink-0 text-gray-500">
                                            {/* Numeración global basada en from de Laravel */}#
                                            {(() => {
                                                const baseIndex = individuals?.meta?.from || 1; // Índice base de esta página
                                                return baseIndex + row.index; // Índice global = base + índice local
                                            })()}
                                        </span>
                                        <span className={expandedTitles[individual.id] ? '' : 'truncate'}>{individual.national_id}</span>
                                    </div>
                                    <div
                                        className="-mx-1 cursor-pointer rounded px-1 py-0.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800"
                                        onClick={(e) => toggleTitleExpand(individual.id, e)}
                                    >
                                        <div className={expandedTitles[individual.id] ? '' : 'truncate'}>{getFullName(individual)}</div>
                                    </div>
                                    <div className="text-xs text-gray-400">Correo: {individual.email_1 || '-'}</div>
                                    <div className="text-xs text-gray-400">Teléfono: {individual.phone_number_1 || '-'}</div>
                                    <div className="mt-1 flex justify-end gap-1 sm:mt-2 sm:gap-2">
                                        <Link href={route('individuals.show', individual.id)}>
                                            <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={route('individuals.edit', individual.id)}>
                                            <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-7 w-7 sm:h-8 sm:w-8"
                                            onClick={() => confirmDelete(individual)}
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
                                        {individuals?.meta?.from || 0}-{individuals?.meta?.to || 0}
                                    </span>
                                    <span className="xs:hidden">{individuals?.meta?.to - individuals?.meta?.from + 1 || 0}</span>
                                    <span className="mx-1">/</span>
                                    <span>{totalItemsGlobal}</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Selector de registros por página */}
                                <Select value={pageSize.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="h-6 w-16 text-xs sm:h-7">
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
                                    Pág. {individuals?.meta?.current_page || 1}/{individuals?.meta?.last_page || 1}
                                </div>
                            </div>
                        </div>

                        {/* Paginación móvil usando botones más grandes (estilo cliente-side) */}
                        <div className="mt-1 flex justify-between sm:mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs sm:h-8"
                                onClick={() => {
                                    const firstPageUrl = individuals.meta?.links?.find((link) => link.label === '1')?.url;
                                    if (firstPageUrl) handlePageNavigation(firstPageUrl);
                                }}
                                disabled={!individuals.meta?.links?.find((link) => link.label === '1')?.url || individuals.meta?.current_page === 1}
                            >
                                <ChevronsLeft className="mr-1 h-4 w-4" />
                                Inicio
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs sm:h-8"
                                onClick={() => {
                                    const prevUrl = individuals.meta?.links?.find((link) => link.label === '&laquo; Previous')?.url;
                                    if (prevUrl) handlePageNavigation(prevUrl);
                                }}
                                disabled={!individuals.meta?.links?.find((link) => link.label === '&laquo; Previous')?.url}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Anterior
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs sm:h-8"
                                onClick={() => {
                                    const nextUrl = individuals.meta?.links?.find((link) => link.label === 'Next &raquo;')?.url;
                                    if (nextUrl) handlePageNavigation(nextUrl);
                                }}
                                disabled={!individuals.meta?.links?.find((link) => link.label === 'Next &raquo;')?.url}
                            >
                                Siguiente
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs sm:h-8"
                                onClick={() => {
                                    const lastPageNumber = individuals.meta?.last_page;
                                    const lastPageUrl = individuals.meta?.links?.find((link) => link.label === String(lastPageNumber))?.url;
                                    if (lastPageUrl) handlePageNavigation(lastPageUrl);
                                }}
                                disabled={!individuals.meta?.last_page || individuals.meta?.current_page === individuals.meta?.last_page}
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
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 text-sm text-gray-500 sm:gap-4 dark:text-gray-400">
                                <div>
                                    Mostrando{' '}
                                    {individuals?.meta?.to && individuals?.meta?.from
                                        ? individuals.meta.to - individuals.meta.from + 1
                                        : Math.min(pageSize, tableRows.length)}{' '}
                                    de {totalItemsGlobal} registros
                                </div>
                                <Select value={pageSize.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="h-7 w-20 sm:h-8 sm:w-24">
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
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Indicador de página actual */}
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Página <span className="font-semibold">{individuals?.meta?.current_page || 1}</span> de{' '}
                                <span className="font-semibold">{individuals?.meta?.last_page || 1}</span>
                            </div>

                            {/* Botones de navegación */}
                            {individuals?.meta?.links && <LaravelPagination links={individuals.meta.links} onPageChange={handlePageNavigation} />}
                        </div>
                    </div>
                </div>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro de eliminar esta persona?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente la persona{' '}
                                <b>{individualToDelete ? getFullName(individualToDelete) : ''}</b> de la base de datos.
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
