import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, X, RotateCcw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useState, useMemo, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    createColumnHelper,
    PaginationState,
    Row,
} from '@tanstack/react-table';

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
        // Usar el índice original de la fila en los datos filtrados
        return row.index + 1;
    };

    // Definición de columnas para TanStack Table
    const columns = useMemo(() => [
        // Columna de numeración
        columnHelper.display({
            id: 'numero',
            header: '#',
            cell: (info) => {
                const globalIndex = getGlobalIndex(info.row);
                return <div className="text-center font-medium text-gray-500">{globalIndex}</div>;
            },
            enableSorting: false,
            enableColumnFilter: false,
        }),
        columnHelper.accessor(
            (tag) => getTagName(tag),
            {
                id: 'name',
                header: 'Nombre',
                cell: ({ getValue }) => <div className="font-medium">{getValue()}</div>,
                enableSorting: true,
                enableColumnFilter: true,
            }
        ),
        columnHelper.accessor('type', {
            header: 'Tipo',
            cell: ({ row }) => {
                const type = row.original.type;
                return type !== null && type !== '' ? type : '-';
            },
            enableSorting: true,
            enableColumnFilter: true,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => {
                const tag = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Link href={route('tags.edit', tag.id)}>
                            <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => confirmDelete(tag)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
            enableColumnFilter: false,
        }),
    ], []);

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
        debugTable: true,
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
        return table.getState().columnFilters.length > 0 || 
              sorting.length > 0 || 
              globalFilter !== '';
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

    return (
        <AppSidebarLayout>
            <Head title="Tags" />
            <div className="p-4 sm:p-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <h1 className="text-2xl font-bold">
                        Gestión de Etiquetas
                        {hasActiveFilters && (
                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({filteredCount} de {totalItemsGlobal} resultados)
                            </span>
                        )}
                    </h1>
                    <div className="flex flex-1 gap-2 items-center justify-end">
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
                        <Link href={route('tags.create')}>
                            <Button className="hidden sm:inline-flex">
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Etiqueta
                            </Button>
                            <Button className="sm:hidden" size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="block sm:hidden space-y-2 mb-16">
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
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {tableRows.length > 0 ? (
                        tableRows.map((row) => {
                            const tag = row.original;
                            const tagName = getTagName(tag);
                            const rowNumber = (table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + row.index + 1;
                            return (
                                <div key={tag.id} className="bg-white dark:bg-zinc-900 rounded shadow p-3 flex flex-col gap-2">
                                    <div className="font-bold text-base flex items-start">
                                        <span className="mr-2 mt-0.5 flex-shrink-0 text-gray-500">
                                            #{rowNumber}
                                        </span>
                                        <span>{tagName}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {tag.type !== null && tag.type !== '' ? `Tipo: ${tag.type}` : 'Sin tipo'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Creado: {new Date(tag.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2 mt-2 justify-end">
                                        <Link href={route('tags.edit', tag.id)}>
                                            <Button variant="outline" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => confirmDelete(tag)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No se encontraron etiquetas.
                        </div>
                    )}
                </div>

                <div className="hidden sm:block bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="overflow-x-auto">
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
                                            No se encontraron etiquetas.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Paginación para móvil */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 shadow-md p-3 rounded-t-lg border-t border-gray-200 dark:border-zinc-800 z-10">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                            <span className="inline-flex items-center">
                                <span className="hidden xs:inline">{pagination.pageIndex * pagination.pageSize + 1}-{Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredCount)}</span>
                                <span className="xs:hidden">{Math.min(pagination.pageSize, tableRows.length)}</span>
                                <span className="mx-1">/</span>
                                <span>{filteredCount}</span>
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Selector de registros por página */}
                            <Select 
                                value={pagination.pageSize.toString()} 
                                onValueChange={handlePerPageChange}
                            >
                                <SelectTrigger className="h-7 w-16 text-xs">
                                    <SelectValue placeholder={pagination.pageSize.toString()} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[5, 10, 20, 50, 100].map(size => (
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
                    <div className="flex justify-between mt-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 text-xs"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4 mr-1" />
                            Inicio
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 text-xs"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
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
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                        
                                <Button
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 text-xs"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            Final
                            <ChevronsRight className="h-4 w-4 ml-1" />
                                </Button>
                    </div>
                </div>

                {/* Paginación para escritorio */}
                <div className="hidden sm:flex sm:flex-row-reverse sm:items-center sm:justify-between px-4 py-4 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                            <div>
                                Mostrando {Math.min(pagination.pageSize, tableRows.length)} de {filteredCount} registros
                            </div>
                            <Select 
                                value={pagination.pageSize.toString()} 
                                onValueChange={handlePerPageChange}
                            >
                                <SelectTrigger className="h-8 w-24">
                                    <SelectValue placeholder={pagination.pageSize.toString()} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[5, 10, 20, 50, 100].map(size => (
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
                            Página <span className="font-semibold">{currentPage}</span> de{" "}
                            <span className="font-semibold">{pageCount || 1}</span>
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
                                if (pageCount <= 5 || 
                                    i === 0 || 
                                    i === pageCount - 1 || 
                                    Math.abs(i - pagination.pageIndex) <= 1) {
                                    return (
                                        <Button
                                            key={i}
                                            variant={i === pagination.pageIndex ? "default" : "outline"}
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
                                if ((i === 1 && pagination.pageIndex > 2) || 
                                    (i === pageCount - 2 && pagination.pageIndex < pageCount - 3)) {
                                    return <span key={i} className="px-2 text-gray-500">...</span>;
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

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de eliminar esta etiqueta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente la etiqueta <b>{tagToDelete ? (typeof tagToDelete.name === 'string' ? tagToDelete.name : tagToDelete.name[Object.keys(tagToDelete.name)[0]]) : ''}</b> de la base de datos.
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
        </AppSidebarLayout>
    );
}
