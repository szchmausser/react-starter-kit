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
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ColumnFiltersState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    Row,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import {
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Network,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Importar el componente del modal de relaciones
import { TagRelationsModal } from '@/components/TagRelationsModal';

interface Tag {
    id: number;
    name: string | Record<string, string>;
    type: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    tags: Tag[];
    filters: {
        search?: string;
        type?: string;
    };
}

export default function Index({ tags: initialTags }: Props) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [uniqueTypes, setUniqueTypes] = useState<string[]>([]);

    // Estados para el modal de relaciones
    const [isRelationsModalOpen, setIsRelationsModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [tagRelations, setTagRelations] = useState<Record<string, any[]> | null>(null);
    const [isLoadingRelations, setIsLoadingRelations] = useState(false);

    // Definición de breadcrumbs para la navegación
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inicio',
            href: route('search.index'),
        },
        {
            title: 'Etiquetas',
            href: route('tags.index'),
        },
    ];

    // Manejar el estado de paginación directamente con useState
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // Función para obtener el nombre de la etiqueta en el idioma actual
    const getTagName = (tag: Tag) => {
        if (typeof tag.name === 'string') return tag.name;
        const locale = document.documentElement.lang || 'es';
        return tag.name[locale] || Object.values(tag.name)[0] || 'Sin nombre';
    };

    // Definir el helper de columna para Tag
    const columnHelper = createColumnHelper<Tag>();

    // Función para obtener el índice global de una fila
    const getGlobalIndex = (row: Row<Tag>) => {
        // Usar el índice original del modelo de paginación
        return pagination.pageIndex * pagination.pageSize + row.index + 1;
    };

    // Extraer valores únicos de tipo al cargar el componente
    useEffect(() => {
        // Filtrar valores nulos y duplicados
        const types = initialTags
            .map((tag) => tag.type)
            .filter((type, index, self) => type !== null && type !== '' && self.indexOf(type) === index) as string[];

        setUniqueTypes(types);
    }, [initialTags]);

    // Definición de columnas para TanStack Table
    const columns = useMemo(
        () => [
            // Columna de numeración
            columnHelper.display({
                id: 'numero',
                header: () => <div className="text-center font-medium">#</div>,
                cell: (info) => {
                    // Calcular el índice global considerando la paginación
                    const globalIndex = pagination.pageIndex * pagination.pageSize + info.row.index + 1;
                    return <div className="text-center font-medium text-gray-500">{globalIndex}</div>;
                },
                enableSorting: false,
                enableColumnFilter: false,
            }),
            columnHelper.accessor((tag) => getTagName(tag), {
                id: 'name',
                header: 'Nombre',
                cell: ({ getValue }) => <div className="font-medium">{getValue()}</div>,
                enableSorting: true,
                enableColumnFilter: true,
            }),
            columnHelper.accessor('type', {
                header: 'Tipo',
                cell: ({ row }) => {
                    const type = row.original.type;
                    return type !== null && type !== '' ? type : '-';
                },
                enableSorting: true,
                enableColumnFilter: true,
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue || filterValue === 'all') return true;
                    const rowValue = row.getValue(columnId);
                    return rowValue === filterValue;
                },
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => {
                    const tag = row.original;
                    return (
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" title="Ver relaciones" onClick={() => handleViewRelations(tag)}>
                                <Network className="h-4 w-4" />
                            </Button>
                            <Link href={route('tags.edit', tag.id)}>
                                <Button variant="outline" size="icon">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button variant="destructive" size="icon" onClick={() => confirmDelete(tag)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
            }),
        ],
        [],
    );

    // Configuración de TanStack Table
    const table = useReactTable({
        data: initialTags,
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
        // debugTable: true,
        meta: {
            getRowNumber: (index: number) => {
                return pagination.pageIndex * pagination.pageSize + index + 1;
            },
        },
    });

    // Calcular elementos filtrados solo cuando cambie el estado de la tabla
    const filteredCount = useMemo(() => {
        return table.getFilteredRowModel().rows.length;
    }, [table.getFilteredRowModel().rows.length]);

    // Flag para indicar si hay filtros activos
    const hasActiveFilters = useMemo(() => {
        return table.getState().columnFilters.length > 0 || sorting.length > 0 || globalFilter !== '';
    }, [table.getState().columnFilters, sorting, globalFilter]);

    // Métricas globales - Total de registros
    const totalItemsGlobal = initialTags.length;

    // Obtener filas para mostrar
    const tableRows = table.getRowModel().rows;

    // Página actual (1-indexed para mostrar al usuario)
    const currentPage = pagination.pageIndex + 1;

    // Número total de páginas
    const pageCount = table.getPageCount();

    const handlePerPageChange = (value: string) => {
        const newPageSize = parseInt(value);
        table.setPageSize(newPageSize);
    };

    const handleResetFilters = () => {
        setSorting([]);
        setColumnFilters([]);
        setGlobalFilter('');
        table.resetColumnFilters();
        table.resetSorting();
    };

    const confirmDelete = (tag: Tag) => {
        setIsDeleteDialogOpen(true);
        setTagToDelete(tag);
    };

    const handleDelete = () => {
        if (tagToDelete) {
            router.delete(route('tags.destroy', tagToDelete.id), {
                onSuccess: () => {
                    toast.success('Etiqueta eliminada exitosamente');
                },
                onError: () => {
                    toast.error('No se pudo eliminar la etiqueta');
                },
                preserveScroll: true,
            });
        }
        setIsDeleteDialogOpen(false);
    };

    // Función para manejar la visualización de relaciones
    const handleViewRelations = async (tag: Tag) => {
        setSelectedTag(tag);
        setIsLoadingRelations(true);
        setTagRelations(null); // Limpiar relaciones anteriores
        setIsRelationsModalOpen(true);

        try {
            const response = await axios.get<Record<string, any[]>>(route('tags.relations', tag.id), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest', // Indicar que es una petición AJAX
                },
            });

            if (response.data && Object.keys(response.data).length > 0) {
                setTagRelations(response.data);
            } else {
                setTagRelations({}); // Objeto vacío para indicar que no hay relaciones
            }
        } catch (error) {
            toast.error('No se pudieron cargar las relaciones');
            setTagRelations(null);
        } finally {
            setIsLoadingRelations(false);
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Tags" />
            <div className="relative p-4 sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">
                        Gestión de Etiquetas
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
                        <Link href={route('tags.create')}>
                            <Button className="hidden sm:inline-flex">
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Etiqueta
                            </Button>
                            <Button className="sm:hidden" size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mb-16 block space-y-2 sm:hidden">
                    {/* Selector de filtros para móvil */}
                    <div className="mb-2 rounded bg-white p-3 shadow dark:bg-zinc-900">
                        <div className="space-y-2">
                            <h3 className="mb-2 text-sm font-semibold">Filtros</h3>

                            {/* Filtros de columnas */}
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanFilter())
                                .map((column) => (
                                    <div key={column.id} className="space-y-1">
                                        <label htmlFor={`filter-${column.id}`} className="text-xs text-gray-500">
                                            {column.columnDef.header as string}
                                        </label>
                                        {column.id === 'type' ? (
                                            <Select
                                                value={(column.getFilterValue() as string) ?? ''}
                                                onValueChange={(value) => column.setFilterValue(value)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder={`Filtrar ${column.columnDef.header as string}...`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos</SelectItem>
                                                    {uniqueTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                id={`filter-${column.id}`}
                                                value={(column.getFilterValue() as string) ?? ''}
                                                onChange={(e) => column.setFilterValue(e.target.value)}
                                                placeholder={`Filtrar ${column.columnDef.header as string}...`}
                                                className="h-8 text-xs"
                                            />
                                        )}
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
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {tableRows.length > 0 ? (
                        tableRows.map((row, index) => {
                            const tag = row.original;
                            const tagName = getTagName(tag);
                            // Calcular el número directamente basado en la página actual
                            const rowNumber = pagination.pageIndex * pagination.pageSize + index + 1;
                            return (
                                <div key={tag.id} className="flex flex-col gap-2 rounded bg-white p-3 shadow dark:bg-zinc-900">
                                    <div className="flex items-start text-base font-bold">
                                        <span className="mt-0.5 mr-2 flex-shrink-0 text-gray-500">#{rowNumber}</span>
                                        <span>{tagName}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {tag.type !== null && tag.type !== '' ? `Tipo: ${tag.type}` : 'Sin tipo'}
                                    </div>
                                    <div className="text-xs text-gray-400">Creado: {new Date(tag.created_at).toLocaleDateString()}</div>
                                    <div className="mt-2 flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            title="Ver relaciones"
                                            onClick={() => handleViewRelations(tag)}
                                        >
                                            <Network className="h-4 w-4" />
                                        </Button>
                                        <Link href={route('tags.edit', tag.id)}>
                                            <Button variant="outline" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => confirmDelete(tag)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">No se encontraron etiquetas.</div>
                    )}
                </div>

                {/* Tabla solo visible en escritorio/tablet */}
                <div className="hidden overflow-hidden shadow-sm sm:block">
                    {/* Tabla */}
                    <div className="overflow-hidden bg-white sm:rounded-t-lg dark:bg-zinc-900">
                        <div className="overflow-x-auto">
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
                                                                    {header.column.id === 'type' ? (
                                                                        <Select
                                                                            value={(header.column.getFilterValue() as string) ?? ''}
                                                                            onValueChange={(value) => header.column.setFilterValue(value)}
                                                                        >
                                                                            <SelectTrigger className="h-8 bg-white/80 text-xs focus:bg-white dark:bg-zinc-900/80 dark:focus:bg-zinc-900">
                                                                                <SelectValue
                                                                                    placeholder={`Filtrar ${header.column.columnDef.header as string}...`}
                                                                                />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="all">Todos</SelectItem>
                                                                                {uniqueTypes.map((type) => (
                                                                                    <SelectItem key={type} value={type}>
                                                                                        {type}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    ) : (
                                                                        <Input
                                                                            value={(header.column.getFilterValue() as string) ?? ''}
                                                                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                                                                            placeholder={`Filtrar ${header.column.columnDef.header as string}...`}
                                                                            className="h-8 bg-white/80 text-xs focus:bg-white dark:bg-zinc-900/80 dark:focus:bg-zinc-900"
                                                                        />
                                                                    )}
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
                                                No se encontraron etiquetas.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Paginación para escritorio */}
                    <div className="bg-sidebar hidden gap-4 border-t border-gray-200 px-4 py-4 sm:flex sm:flex-row-reverse sm:items-center sm:justify-between sm:rounded-b-lg dark:border-zinc-800 dark:bg-zinc-800">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div>
                                    Mostrando {Math.min(pagination.pageSize, tableRows.length)} de {filteredCount} registros
                                </div>
                                <Select value={pagination.pageSize.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="h-8 w-24">
                                        <SelectValue placeholder={pagination.pageSize.toString()} />
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
                                Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{pageCount || 1}</span>
                            </div>

                            {/* Botones de navegación */}
                            <div className="flex items-center space-x-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="h-8 w-8"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="h-8 w-8"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {/* Números de página */}
                                {Array.from({ length: pageCount || 1 }, (_, i) => {
                                    // Solo mostrar 5 páginas como máximo
                                    if (pageCount <= 5 || i === 0 || i === pageCount - 1 || Math.abs(i - pagination.pageIndex) <= 1) {
                                        return (
                                            <Button
                                                key={i}
                                                variant={i === pagination.pageIndex ? 'default' : 'outline'}
                                                size="icon"
                                                onClick={() => table.setPageIndex(i)}
                                                disabled={i === pagination.pageIndex}
                                                className={`h-8 w-8 ${i === pagination.pageIndex ? 'font-bold' : ''}`}
                                            >
                                                {i + 1}
                                            </Button>
                                        );
                                    }
                                    // Agregar puntos suspensivos en el medio
                                    if ((i === 1 && pagination.pageIndex > 2) || (i === pageCount - 2 && pagination.pageIndex < pageCount - 3)) {
                                        return (
                                            <span key={i} className="px-2 text-gray-500">
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="h-8 w-8"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.setPageIndex(pageCount - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="h-8 w-8"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Paginación para móvil */}
                <div className="bg-sidebar fixed right-0 bottom-0 left-0 z-10 w-full rounded-t-lg border-t border-gray-200 p-3 shadow-md sm:hidden dark:border-zinc-800 dark:bg-zinc-800">
                    <div className="flex items-center justify-between">
                        <div className="text-xs whitespace-nowrap text-gray-500">
                            <span className="inline-flex items-center">
                                <span className="xs:inline hidden">
                                    {pagination.pageIndex * pagination.pageSize + 1}-
                                    {Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredCount)}
                                </span>
                                <span className="xs:hidden">{Math.min(pagination.pageSize, tableRows.length)}</span>
                                <span className="mx-1">/</span>
                                <span>{filteredCount}</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Selector de registros por página */}
                            <Select value={pagination.pageSize.toString()} onValueChange={handlePerPageChange}>
                                <SelectTrigger className="h-7 w-16 text-xs">
                                    <SelectValue placeholder={pagination.pageSize.toString()} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[5, 10, 20, 50, 100].map((size) => (
                                        <SelectItem key={size} value={size.toString()}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Indicador de página en móvil */}
                            <div className="text-xs font-medium">
                                Pág. {currentPage}/{pageCount || 1}
                            </div>
                        </div>
                    </div>

                    {/* Paginación móvil usando botones más grandes */}
                    <div className="mt-2 flex justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="mr-1 h-4 w-4" />
                            Inicio
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Anterior
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Siguiente
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            Final
                            <ChevronsRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de eliminar esta etiqueta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente la etiqueta{' '}
                                <b>
                                    {tagToDelete
                                        ? typeof tagToDelete.name === 'string'
                                            ? tagToDelete.name
                                            : tagToDelete.name[Object.keys(tagToDelete.name)[0]]
                                        : ''}
                                </b>{' '}
                                de la base de datos.
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

                {/* Modal de relaciones de etiquetas */}
                <TagRelationsModal
                    isOpen={isRelationsModalOpen}
                    onClose={() => setIsRelationsModalOpen(false)}
                    tag={selectedTag}
                    relations={tagRelations}
                    isLoading={isLoadingRelations}
                />
            </div>
        </AppSidebarLayout>
    );
}
