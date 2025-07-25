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
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type CaseType } from '@/types';
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
    Row,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
    const columns = useMemo(
        () => [
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
                            <Button variant="destructive" size="icon" onClick={() => confirmDelete(caseType)}>
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
        return table.getState().columnFilters.length > 0 || sorting.length > 0 || globalFilter !== '';
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

            <div className="relative p-4 sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">
                        Gestión de Tipos de Casos
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
                        <Link href={route('case-types.create')}>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground hidden sm:inline-flex" title="Nuevo Tipo">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Tipo
                            </Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground sm:hidden" size="icon" title="Nuevo Tipo">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Vista tipo card para móvil */}
                <div className="mb-16 block space-y-2 sm:hidden">
                    {tableRows.length > 0 ? (
                        tableRows.map((row, index) => {
                            const caseType = row.original;
                            // Calcular el número directamente basado en la página actual
                            const rowNumber = pagination.pageIndex * pagination.pageSize + index + 1;
                            return (
                                <div key={caseType.id} className="flex flex-col gap-2 rounded bg-white p-3 shadow dark:bg-zinc-900">
                                    <div className="flex items-start text-base font-bold">
                                        <span className="mt-0.5 mr-2 flex-shrink-0 text-gray-500">#{rowNumber}</span>
                                        <span>{caseType.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{caseType.description || '-'}</div>
                                    <div className="mt-2 flex justify-end gap-2">
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
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">No se encontraron registros.</div>
                    )}
                </div>

                {/* Tabla y paginación para escritorio/tablet */}
                <div className="hidden overflow-hidden shadow-sm sm:block">
                    {/* Tabla */}
                    <div className="overflow-hidden bg-white sm:rounded-t-lg dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead
                                                    key={header.id}
                                                    className={cn(
                                                        header.id === 'numero' && 'w-12 text-center',
                                                        header.id === 'name' && 'w-[30%]',
                                                        header.id === 'description' && 'w-[50%]',
                                                        header.id === 'actions' && 'w-[120px] text-right',
                                                        'align-top',
                                                    )}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div className="space-y-2">
                                                            {/* Cabecera con título y controles de ordenación */}
                                                            <div
                                                                {...{
                                                                    className: cn(
                                                                        'flex items-center gap-1 whitespace-nowrap',
                                                                        header.column.getCanSort()
                                                                            ? 'hover:text-primary group cursor-pointer transition-colors select-none'
                                                                            : '',
                                                                        header.id === 'numero' && 'w-full justify-center',
                                                                        header.id === 'actions' && 'ml-auto justify-end',
                                                                    ),
                                                                    onClick: header.column.getToggleSortingHandler(),
                                                                }}
                                                            >
                                                                <span className="font-medium">
                                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                                </span>

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

                                                            {/* Filtro de columna debajo del título (no en línea) */}
                                                            {header.column.getCanFilter() && (
                                                                <div>
                                                                    <Input
                                                                        value={(header.column.getFilterValue() as string) ?? ''}
                                                                        onChange={(e) => header.column.setFilterValue(e.target.value)}
                                                                        placeholder={`Filtrar...`}
                                                                        className="h-7 w-full bg-white/80 text-xs focus:bg-white dark:bg-zinc-900/80 dark:focus:bg-zinc-900"
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
                                                            cell.column.id === 'numero' && 'text-muted-foreground text-center font-medium',
                                                            cell.column.id === 'actions' && 'text-right',
                                                        )}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
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
                        </div>
                    </div>
                </div>

                {/* Paginación móvil */}
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

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro de eliminar este tipo de caso?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de caso <b>{typeToDelete?.name}</b> de la
                                base de datos.
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
