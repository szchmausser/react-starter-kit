import { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type CaseType, type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pencil, Plus, Search, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { PageProps } from '@inertiajs/core';
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
import { cn } from '@/lib/utils';

interface Props extends PageProps {
    caseTypes: CaseType[];
}

export default function Index() {
    const { caseTypes } = usePage<Props>().props;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<CaseType | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    // Manejar el estado de paginación directamente con useState
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inicio',
            href: route('search.index'),
        },
        {
            title: 'Tipos de Casos',
            href: route('case-types.index'),
        },
    ];

    // Definir el helper de columna para CaseType
    const columnHelper = createColumnHelper<CaseType>();

    // Función para obtener el índice global de una fila
    const getGlobalIndex = (row: Row<CaseType>) => {
        // Calcular el índice considerando la paginación
        return pagination.pageIndex * pagination.pageSize + row.index + 1;
    };

    // Definición de columnas para TanStack Table
    const columns = useMemo(() => [
        // Columna de numeración
        columnHelper.display({
            id: 'numero',
            header: () => <div className="text-center font-medium">#</div>,
            cell: (info) => {
                const globalIndex = getGlobalIndex(info.row);
                return <div className="text-center font-medium text-gray-500">{globalIndex}</div>;
            },
            enableSorting: false,
            enableColumnFilter: false,
        }),
        columnHelper.accessor('name', {
            header: 'Nombre',
            cell: ({ getValue }) => <div className="font-medium">{getValue()}</div>,
            enableSorting: true,
            enableColumnFilter: true,
        }),
        columnHelper.accessor('description', {
            header: 'Descripción',
            cell: ({ getValue }) => getValue() || '-',
            enableSorting: true,
            enableColumnFilter: true,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => {
                const caseType = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Link href={route('case-types.edit', caseType.id)}>
                            <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => confirmDelete(caseType)}
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
        data: caseTypes,
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
    const totalItemsGlobal = caseTypes.length;

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

    const confirmDelete = (caseType: CaseType) => {
        setTypeToDelete(caseType);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (typeToDelete) {
            router.delete(route('case-types.destroy', typeToDelete.id), {
                onSuccess: () => {
                    toast.success('Tipo de caso eliminado exitosamente');
                },
                onError: () => {
                    toast.error('Error al eliminar el tipo de caso');
                },
            });
        }
        setIsDeleteDialogOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de Casos" />

            <div className="p-4 sm:p-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <h1 className="text-2xl font-bold">
                        Gestión de Tipos de Casos
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
                        <Link href={route('case-types.create')}>
                            <Button className="hidden sm:inline-flex">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Tipo
                            </Button>
                            <Button className="sm:hidden" size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Vista tipo card para móvil */}
                <div className="block sm:hidden space-y-2 mb-16">
                    {tableRows.length > 0 ? (
                        tableRows.map((row, index) => {
                            const caseType = row.original;
                            // Calcular el número directamente basado en la página actual
                            const rowNumber = pagination.pageIndex * pagination.pageSize + index + 1;
                            return (
                                <div key={caseType.id} className="bg-white dark:bg-zinc-900 rounded shadow p-3 flex flex-col gap-2">
                                    <div className="font-bold text-base flex items-start">
                                        <span className="mr-2 mt-0.5 flex-shrink-0 text-gray-500">
                                            #{rowNumber}
                                        </span>
                                        <span>{caseType.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{caseType.description || '-'}</div>
                                    <div className="flex gap-2 mt-2 justify-end">
                                        <Link href={route('case-types.edit', caseType.id)}>
                                            <Button variant="outline" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => confirmDelete(caseType)}>
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
                </div>

                {/* Tabla y paginación para escritorio/tablet */}
                <div className="hidden sm:block overflow-hidden shadow-sm">
                    {/* Tabla */}
                    <div className="bg-white dark:bg-zinc-900 overflow-hidden sm:rounded-t-lg">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <TableHead
                                                    key={header.id}
                                                    className={cn(
                                                        header.id === 'numero' && "w-12 text-center",
                                                        header.id === 'name' && "w-[30%]",
                                                        header.id === 'description' && "w-[50%]",
                                                        header.id === 'actions' && "text-right w-[120px]",
                                                        "align-top"
                                                    )}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div className="space-y-2">
                                                            {/* Cabecera con título y controles de ordenación */}
                                                            <div
                                                                {...{
                                                                    className: cn(
                                                                        "flex items-center gap-1 whitespace-nowrap",
                                                                        header.column.getCanSort()
                                                                            ? "cursor-pointer select-none hover:text-primary transition-colors group"
                                                                            : "",
                                                                        header.id === 'numero' && "justify-center w-full",
                                                                        header.id === 'actions' && "justify-end ml-auto"
                                                                    ),
                                                                    onClick: header.column.getToggleSortingHandler(),
                                                                }}
                                                            >
                                                                <span className="font-medium">{flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}</span>

                                                                {header.column.getCanSort() && (
                                                                    <span className="inline-flex ml-1 text-muted-foreground">
                                                                        {header.column.getIsSorted() === 'asc' ? (
                                                                            <ArrowUp className="h-4 w-4 text-primary" />
                                                                        ) : header.column.getIsSorted() === 'desc' ? (
                                                                            <ArrowDown className="h-4 w-4 text-primary" />
                                                                        ) : (
                                                                            <div className="h-4 w-4 flex flex-col opacity-50 group-hover:opacity-100">
                                                                                <ArrowUp className="h-2 w-4" />
                                                                                <ArrowDown className="h-2 w-4" />
                                                                            </div>
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Filtro de columna debajo del título (no en línea) */}
                                                            {header.column.getCanFilter() && (
                                                                <div>
                                                                    <Input
                                                                        value={(header.column.getFilterValue() as string) ?? ''}
                                                                        onChange={e => header.column.setFilterValue(e.target.value)}
                                                                        placeholder={`Filtrar...`}
                                                                        className="h-7 text-xs w-full bg-white/80 dark:bg-zinc-900/80 focus:bg-white dark:focus:bg-zinc-900"
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
                                            <TableRow key={row.id} className="hover:bg-muted/30">
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        className={cn(
                                                            cell.column.id === 'numero' && "text-center font-medium text-muted-foreground",
                                                            cell.column.id === 'actions' && "text-right"
                                                        )}
                                                    >
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
                        </div>
                    </div>
                </div>

                {/* Paginación móvil */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 w-full bg-sidebar dark:bg-zinc-800 shadow-md p-3 rounded-t-lg border-t border-gray-200 dark:border-zinc-800 z-10">
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
                <div className="hidden sm:flex sm:flex-row-reverse sm:items-center sm:justify-between px-4 py-4 gap-4 bg-sidebar dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-800 sm:rounded-b-lg">
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
                            <AlertDialogTitle>¿Está seguro de eliminar este tipo de caso?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de caso <b>{typeToDelete?.name}</b> de la base de datos.
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