import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArchiveIcon,
    ArrowDown,
    ArrowUp,
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    DownloadIcon,
    EyeIcon,
    FileIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    ImageIcon,
    MusicIcon,
    PencilIcon,
    PlusIcon,
    PresentationIcon,
    RotateCcw,
    Trash2,
    TrashIcon,
    VideoIcon,
    XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
    ColumnDef,
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

interface Media {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    human_readable_size: string;
    collection_name: string;
    disk: string;
    created_at: string;
    updated_at: string;
    uuid: string | null;
    file_url?: string;
    thumbnail?: string;
    preview_url?: string;
    extension?: string;
    description?: string | null;
    category?: string | null;
    type_name?: string;
    type_icon?: string;
    custom_properties?: any;
}

interface MediaLibraryIndexProps {
    mediaItems: Media[];
    filters: {
        collection?: string;
        date_type?: 'created' | 'updated';
        start_date?: string;
        end_date?: string;
    };
    collections: string[];
}

export default function MediaLibraryIndex({ mediaItems, filters, collections }: MediaLibraryIndexProps) {
    const [selectedCollection, setSelectedCollection] = useState(filters.collection || '');
    const [dateType, setDateType] = useState<'created' | 'updated'>(filters.date_type || 'created');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [localMediaItems, setLocalMediaItems] = useState<Media[]>(mediaItems);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isDateFilterVisible, setIsDateFilterVisible] = useState(!!filters.start_date || !!filters.end_date);

    // Estados para la tabla
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/' },
        { title: 'Biblioteca de Archivos', href: route('media-library.index') },
    ];

    const handleCollectionChange = (value: string) => {
        setSelectedCollection(value);

        // Definir el objeto params con el tipo correcto
        const params: {
            collection?: string;
            date_type?: 'created' | 'updated';
            start_date?: string;
            end_date?: string;
        } = {};

        // Añadir collection solo si no es '_all'
        if (value !== '_all') {
            params.collection = value;
        }

        // Mantener los filtros de fecha si están aplicados
        if (dateType) {
            params.date_type = dateType;
        }
        if (startDate) {
            params.start_date = startDate;
        }
        if (endDate) {
            params.end_date = endDate;
        }

        // Realizar la petición al servidor para obtener los datos filtrados
        router.get(route('media-library.index'), params, { preserveState: false, replace: true });
    };

    const handleDateFilterApply = () => {
        // Definir el objeto params con el tipo correcto
        const params: {
            collection?: string;
            date_type?: 'created' | 'updated';
            start_date?: string;
            end_date?: string;
        } = {};

        // Añadir collection solo si no es '_all'
        if (selectedCollection !== '_all') {
            params.collection = selectedCollection;
        }

        // Añadir filtros de fecha
        params.date_type = dateType;
        if (startDate) {
            params.start_date = startDate;
        }
        if (endDate) {
            params.end_date = endDate;
        }

        // Realizar la petición al servidor con preserveState en false para forzar una recarga completa
        router.get(route('media-library.index'), params, { preserveState: false, replace: true });
    };

    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');

        // Definir el objeto params con el tipo correcto
        const params: {
            collection?: string;
        } = {};

        // Añadir collection solo si no es '_all'
        if (selectedCollection !== '_all') {
            params.collection = selectedCollection;
        }

        // Realizar la petición al servidor con preserveState en false para forzar una recarga completa
        router.get(route('media-library.index'), params, { preserveState: false, replace: true });
    };

    const deleteMedia = (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
            router.delete(route('media-library.destroy', id), {
                onSuccess: (page) => {
                    const flash = (page?.props?.flash as { success?: string }) || {};
                    if (flash.success) {
                        toast.success(flash.success);
                    } else {
                        toast.success('Archivo eliminado correctamente');
                    }

                    // Actualizar la lista local eliminando el archivo
                    const updatedMedia = localMediaItems.filter((item) => item.id !== id);
                    setLocalMediaItems(updatedMedia);

                    // Forzar re-renderización
                    setRefreshKey((prev) => prev + 1);
                },
                onError: (errors) => {
                    if (errors?.error) {
                        toast.error(errors.error);
                    } else {
                        toast.error('Error al eliminar el archivo');
                    }
                },
            });
        }
    };

    const getFileIcon = (media: Media) => {
        if (!media.type_icon) return <FileIcon className="h-6 w-6 text-gray-400" />;

        switch (media.type_icon) {
            case 'image':
                return <ImageIcon className="h-6 w-6 text-blue-500" />;
            case 'file-text':
                return <FileTextIcon className="h-6 w-6 text-red-500" />;
            case 'video':
                return <VideoIcon className="h-6 w-6 text-purple-500" />;
            case 'music':
                return <MusicIcon className="h-6 w-6 text-pink-500" />;
            case 'file-spreadsheet':
                return <FileSpreadsheetIcon className="h-6 w-6 text-green-500" />;
            case 'file-presentation':
                return <PresentationIcon className="h-6 w-6 text-orange-500" />;
            case 'file-archive':
                return <ArchiveIcon className="h-6 w-6 text-yellow-500" />;
            default:
                return <FileIcon className="h-6 w-6 text-gray-500" />;
        }
    };

    // Función para obtener el índice global de una fila
    const getGlobalIndex = (row: Row<Media>) => {
        return pagination.pageIndex * pagination.pageSize + row.index + 1;
    };

    // Definir el helper de columna para Media
    const columnHelper = createColumnHelper<Media>();

    // Definición de columnas para TanStack Table
    const columns = useMemo<ColumnDef<Media, any>[]>(
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
            // Columna de archivo (miniatura/icono)
            columnHelper.display({
                id: 'archivo',
                header: 'Archivo',
                cell: ({ row }) => {
                    const media = row.original;
                    return (
                        <div className="relative h-10 w-10 overflow-hidden rounded-md">
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-zinc-800">{getFileIcon(media)}</div>
                        </div>
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
            }),
            // Columna de nombre
            columnHelper.accessor('name', {
                header: 'Nombre',
                cell: ({ row, table }) => {
                    const media = row.original;
                    const meta = table.options.meta as { refreshKey: number } | undefined;
                    const refreshKey = meta?.refreshKey || 0;

                    return (
                        <div key={`name-${media.id}-${refreshKey}`}>
                            <div className="font-medium">{media.name}</div>
                            {media.description && (
                                <div className="text-sm text-gray-500" title={media.description}>
                                    {media.description.length > 50 ? `${media.description.substring(0, 50)}...` : media.description}
                                </div>
                            )}
                        </div>
                    );
                },
                enableSorting: true,
                enableColumnFilter: true,
            }),
            // Columna de colección
            columnHelper.accessor('collection_name', {
                header: 'Colección',
                cell: ({ getValue }) => (
                    <Badge variant="outline" className="capitalize">
                        {getValue()}
                    </Badge>
                ),
                enableSorting: true,
                enableColumnFilter: false,
                meta: {
                    filterSelect: {
                        options: ['_all', ...collections],
                        labels: {
                            _all: 'Todas',
                            ...Object.fromEntries(collections.map((c) => [c, c.charAt(0).toUpperCase() + c.slice(1)])),
                        },
                        value: selectedCollection,
                        onChange: handleCollectionChange,
                        placeholder: 'Todas ',
                    },
                },
            }),
            // Columna de tipo
            columnHelper.accessor('type_name', {
                header: 'Tipo',
                cell: ({ row }) => <span className="text-sm">{row.original.type_name || row.original.mime_type}</span>,
                enableSorting: true,
                enableColumnFilter: true,
            }),
            // Columna de tamaño
            columnHelper.accessor('size', {
                header: 'Tamaño',
                cell: ({ row }) => <span className="text-sm">{row.original.human_readable_size}</span>,
                enableSorting: true,
                enableColumnFilter: false,
            }),
            // Columna de fecha de creación
            columnHelper.accessor('created_at', {
                header: 'Creado',
                cell: ({ getValue }) => (
                    <span className="cursor-help text-sm" title={new Date(getValue()).toLocaleString('es-ES')}>
                        {new Date(getValue()).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                    </span>
                ),
                enableSorting: true,
                enableColumnFilter: false,
            }),
            // Columna de fecha de actualización
            columnHelper.accessor('updated_at', {
                header: 'Actualizado',
                cell: ({ getValue }) => (
                    <span className="cursor-help text-sm" title={new Date(getValue()).toLocaleString('es-ES')}>
                        {new Date(getValue()).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                    </span>
                ),
                enableSorting: true,
                enableColumnFilter: false,
            }),
            // Columna de acciones
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => {
                    const media = row.original;
                    return (
                        <div className="flex items-center space-x-2">
                            <Link href={route('media-library.show', media.id)}>
                                <Button size="sm" variant="outline">
                                    <EyeIcon className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={() => window.open(route('media-library.download', media.id), '_blank')}>
                                <DownloadIcon className="h-4 w-4" />
                            </Button>
                            <Link href={route('media-library.edit', media.id)}>
                                <Button variant="outline" size="icon" className="h-8 w-8" title="Editar archivo">
                                    <PencilIcon className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button size="sm" variant="destructive" onClick={() => deleteMedia(media.id)}>
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
        data: localMediaItems,
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
        debugTable: false,
        meta: {
            refreshKey,
        },
    });

    // Efecto para actualizar la tabla cuando cambia localMediaItems o mediaItems
    useEffect(() => {
        // Actualizar los datos locales cuando cambian los datos del servidor
        setLocalMediaItems(mediaItems);

        // Forzar la actualización del modelo de datos de la tabla
        if (table) {
            table.resetRowSelection();

            // Resetear a la primera página cuando cambian los datos
            if (pagination.pageIndex !== 0 && mediaItems.length > 0) {
                setPagination((prev) => ({
                    ...prev,
                    pageIndex: 0,
                }));
            }

            // Forzar una actualización completa de la tabla
            const timer = setTimeout(() => {
                if (table) {
                    table.setColumnFilters([...columnFilters]);
                }
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [mediaItems, table]);

    // Efecto separado para actualizar la tabla cuando cambia localMediaItems
    useEffect(() => {
        if (table) {
            table.resetRowSelection();
        }
    }, [localMediaItems, refreshKey]);

    // Calcular elementos filtrados solo cuando cambie el estado de la tabla
    const filteredCount = useMemo(() => {
        return table.getFilteredRowModel().rows.length;
    }, [table.getFilteredRowModel().rows.length]);

    // Flag para indicar si hay filtros activos
    const hasActiveFilters = useMemo(() => {
        return table.getState().columnFilters.length > 0 || sorting.length > 0 || globalFilter !== '';
    }, [table.getState().columnFilters, sorting, globalFilter]);

    // Métricas globales - Total de registros
    const totalItemsGlobal = localMediaItems.length;

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
        // Limpiar filtros de tabla
        setSorting([]);
        setColumnFilters([]);
        setGlobalFilter('');
        table.resetColumnFilters();
        table.resetSorting();

        // Limpiar filtros de fecha
        setStartDate('');
        setEndDate('');
        setDateType('created');

        // Resetear también el selector de colección
        setSelectedCollection('_all');

        // Recargar la página sin filtros
        router.get(route('media-library.index'), {}, { preserveState: false, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Biblioteca de Archivos" />

            <div className="relative min-h-[calc(100vh-120px)] p-4 sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">
                        Biblioteca de Archivos
                        {hasActiveFilters && (
                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({filteredCount} de {totalItemsGlobal} resultados)
                            </span>
                        )}
                    </h1>
                    <div className="flex flex-1 items-center justify-end gap-2">
                        <Button
                            variant={isDateFilterVisible ? 'secondary' : 'outline'}
                            onClick={() => setIsDateFilterVisible(!isDateFilterVisible)}
                            className="hidden items-center sm:flex"
                            title="Filtrar por fechas"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Filtrar por Fechas
                            {(filters.start_date || filters.end_date) && (
                                <Badge variant="default" className="ml-2 h-5 px-1">
                                    <span className="text-xs">{filters.date_type === 'created' ? 'Creación' : 'Actualización'}</span>
                                </Badge>
                            )}
                        </Button>
                        <Button
                            variant={isDateFilterVisible ? 'secondary' : 'outline'}
                            onClick={() => setIsDateFilterVisible(!isDateFilterVisible)}
                            className="sm:hidden"
                            size="icon"
                            title="Filtrar por fechas"
                        >
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="outline" size="icon" onClick={handleResetFilters} title="Limpiar filtros" className="shrink-0">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                        <Link href={route('media-library.clean-orphaned-files')}>
                            <Button variant="outline" className="hidden sm:inline-flex" title="Limpiar Archivos Huérfanos">
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Limpiar Archivos Huérfanos
                            </Button>
                            <Button variant="outline" className="sm:hidden" size="icon" title="Limpiar Archivos Huérfanos">
                                <TrashIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={route('media-library.create')}>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground hidden sm:inline-flex" title="Nuevo Archivo">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Nuevo Archivo
                            </Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground sm:hidden" size="icon" title="Nuevo Archivo">
                                <PlusIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Panel de filtros por fecha */}
                {isDateFilterVisible && (
                    <Card className="mb-4 border border-gray-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/80">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center text-base">
                                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                    Filtrar por Fechas
                                </CardTitle>
                                {(filters.start_date || filters.end_date) && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <span>
                                            {filters.date_type === 'created' ? 'Creado' : 'Actualizado'}:
                                            {filters.start_date && ` desde ${filters.start_date}`}
                                            {filters.end_date && ` hasta ${filters.end_date}`}
                                        </span>
                                        <Button variant="ghost" size="icon" className="ml-1 h-4 w-4 p-0" onClick={clearDateFilter}>
                                            <XIcon className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pt-4 pb-4">
                            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
                                <div className="sm:col-span-3">
                                    <div className="rounded-md border border-gray-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                                        <h3 className="mb-2 text-sm font-medium">Tipo de fecha</h3>
                                        <RadioGroup
                                            value={dateType}
                                            onValueChange={(value: 'created' | 'updated') => setDateType(value)}
                                            className="flex flex-col space-y-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="created" id="created" />
                                                <Label htmlFor="created" className="text-sm">
                                                    Fecha de creación
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="updated" id="updated" />
                                                <Label htmlFor="updated" className="text-sm">
                                                    Fecha de actualización
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <Label htmlFor="start-date" className="text-sm font-medium">
                                        Fecha inicial
                                    </Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <Label htmlFor="end-date" className="text-sm font-medium">
                                        Fecha final
                                    </Label>
                                    <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2" />
                                </div>
                                <div className="sm:col-span-3">
                                    <Button onClick={handleDateFilterApply} disabled={!startDate && !endDate} className="w-full">
                                        Aplicar filtro
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Vista tipo card para móvil */}
                <div className="mb-24 block space-y-2 pb-4 sm:hidden">
                    {tableRows.length > 0 ? (
                        tableRows.map((row, index) => {
                            const media = row.original;
                            // Calcular el número directamente basado en la página actual
                            const rowNumber = pagination.pageIndex * pagination.pageSize + index + 1;
                            return (
                                <div key={media.id} className="flex flex-col gap-2 rounded bg-white p-3 shadow dark:bg-zinc-900">
                                    <div className="flex items-start">
                                        <div className="mr-3">
                                            <div className="relative h-12 w-12 overflow-hidden rounded-md">
                                                {media.mime_type && media.mime_type.startsWith('image/') ? (
                                                    <img
                                                        src={media.thumbnail || media.file_url}
                                                        alt={media.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-zinc-800">
                                                        {getFileIcon(media)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <div className="flex min-w-0 items-start text-base font-bold">
                                                <span className="mt-0.5 mr-2 flex-shrink-0 text-gray-500">#{rowNumber}</span>
                                                <span className="truncate">{media.name}</span>
                                            </div>
                                            <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                {media.description || 'Sin descripción'}
                                            </div>
                                            <div className="mt-1 flex items-center space-x-2">
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {media.collection_name}
                                                </Badge>
                                                <span className="text-xs text-gray-500">{media.human_readable_size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-end gap-2">
                                        <Link href={route('media-library.show', media.id)}>
                                            <Button variant="outline" size="icon" className="h-8 w-8">
                                                <EyeIcon className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => window.open(route('media-library.download', media.id), '_blank')}
                                        >
                                            <DownloadIcon className="h-4 w-4" />
                                        </Button>
                                        <Link href={route('media-library.edit', media.id)}>
                                            <Button variant="outline" size="icon" className="h-8 w-8" title="Editar archivo">
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => deleteMedia(media.id)}>
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">No se encontraron archivos</div>
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
                                                            {/* Añadir selector para columna de colección */}
                                                            {header.column.id === 'collection_name' && (
                                                                <div className="mt-2">
                                                                    <Select value={selectedCollection} onValueChange={handleCollectionChange}>
                                                                        <SelectTrigger className="h-8 bg-white/80 text-xs focus:bg-white dark:bg-zinc-900/80 dark:focus:bg-zinc-900">
                                                                            <SelectValue placeholder="Todas" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="_all">Todas</SelectItem>
                                                                            {collections.map((collection) => (
                                                                                <SelectItem key={collection} value={collection}>
                                                                                    {collection.charAt(0).toUpperCase() + collection.slice(1)}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
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
                                                No se encontraron archivos.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Paginación para escritorio */}
                    <div className="bg-sidebar flex flex-row-reverse items-center justify-between gap-4 border-t border-gray-200 px-4 py-4 sm:rounded-b-lg dark:border-zinc-800 dark:bg-zinc-800/70">
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
            </div>

            {/* Paginación para móvil */}
            <div className="bg-sidebar fixed right-0 bottom-0 left-0 z-10 rounded-t-lg border-t border-gray-200 p-3 shadow-md sm:hidden dark:border-zinc-800 dark:bg-zinc-800">
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
        </AppLayout>
    );
}
