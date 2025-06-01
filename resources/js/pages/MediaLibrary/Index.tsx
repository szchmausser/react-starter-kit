import { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    FileIcon,
    PlusIcon,
    SearchIcon,
    FilterIcon,
    DownloadIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ImageIcon,
    FileTextIcon,
    VideoIcon,
    MusicIcon,
    ArchiveIcon,
    PresentationIcon,
    FileSpreadsheetIcon,
    CalendarIcon,
    XIcon,
    ArrowUp,
    ArrowDown,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronDown,
    ChevronUp,
    Filter
} from 'lucide-react';

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

    // Estados para el diálogo de edición
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [mediaToEdit, setMediaToEdit] = useState<Media | null>(null);
    const [editDescription, setEditDescription] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/' },
        { title: 'Biblioteca de Archivos', href: route('media-library.index') }
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
        router.get(
            route('media-library.index'),
            params,
            { preserveState: false, replace: true }
        );
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
        router.get(
            route('media-library.index'),
            params,
            { preserveState: false, replace: true }
        );
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
        router.get(
            route('media-library.index'),
            params,
            { preserveState: false, replace: true }
        );
    };

    const deleteMedia = (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
            router.delete(route('media-library.destroy', id), {
                onSuccess: (page) => {
                    const flash = page?.props?.flash as { success?: string } || {};
                    if (flash.success) {
                        toast.success(flash.success);
                    } else {
                        toast.success('Archivo eliminado correctamente');
                    }

                    // Actualizar la lista local eliminando el archivo
                    const updatedMedia = localMediaItems.filter(item => item.id !== id);
                    setLocalMediaItems(updatedMedia);

                    // Forzar re-renderización
                    setRefreshKey(prev => prev + 1);
                },
                onError: (errors) => {
                    if (errors?.error) {
                        toast.error(errors.error);
                    } else {
                        toast.error('Error al eliminar el archivo');
                    }
                }
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

    // Función para abrir el diálogo de edición
    const openEditDialog = (media: Media) => {
        setMediaToEdit(media);
        setEditDescription(media.description || '');
        setIsEditDialogOpen(true);
    };

    // Función para guardar la descripción editada
    const saveDescription = () => {
        if (!mediaToEdit) return;

        // Cerrar el diálogo inmediatamente para mejorar la experiencia del usuario
        setIsEditDialogOpen(false);

        // Crear una copia profunda de los datos actuales para asegurar una actualización completa
        const updatedMedia = JSON.parse(JSON.stringify(localMediaItems)) as Media[];

        // Actualizar la descripción en la copia local
        const mediaIndex = updatedMedia.findIndex(item => item.id === mediaToEdit.id);
        if (mediaIndex !== -1) {
            updatedMedia[mediaIndex].description = editDescription;
        }

        // Actualizar el estado local con la copia actualizada
        setLocalMediaItems(updatedMedia);

        // Forzar re-renderización incrementando refreshKey
        setRefreshKey(prev => prev + 1);

        // Enviar la actualización al servidor
        router.patch(route('media-library.update-description', mediaToEdit.id), {
            description: editDescription
        }, {
            preserveState: true,
            onSuccess: (page) => {
                // Verificar si hay un mensaje de éxito en la respuesta
                const flash = page?.props?.flash as { success?: string } || {};
                if (flash.success) {
                    toast.success(flash.success);

                    // Forzar re-renderización nuevamente después de la respuesta exitosa
                    setRefreshKey(prev => prev + 1);
                }
            },
            onError: (errors) => {
                // Reabrir el diálogo en caso de error
                setIsEditDialogOpen(true);

                // Revertir el cambio local en caso de error
                const originalMedia = JSON.parse(JSON.stringify(localMediaItems)) as Media[];
                const originalIndex = originalMedia.findIndex(item => item.id === mediaToEdit.id);
                if (originalIndex !== -1) {
                    originalMedia[originalIndex].description = mediaToEdit.description;
                }
                setLocalMediaItems(originalMedia);

                // Forzar re-renderización después de revertir
                setRefreshKey(prev => prev + 1);

                if (errors?.error) {
                    toast.error(errors.error);
                } else {
                    toast.error('Error al actualizar la descripción');
                }
            }
        });
    };

    // Función para obtener el índice global de una fila
    const getGlobalIndex = (row: Row<Media>) => {
        return pagination.pageIndex * pagination.pageSize + row.index + 1;
    };

    // Definir el helper de columna para Media
    const columnHelper = createColumnHelper<Media>();

    // Definición de columnas para TanStack Table
    const columns = useMemo<ColumnDef<Media, any>[]>(() => [
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
                                {media.description.length > 50
                                    ? `${media.description.substring(0, 50)}...`
                                    : media.description}
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
                        '_all': 'Todas',
                        ...Object.fromEntries(collections.map(c => [c, c.charAt(0).toUpperCase() + c.slice(1)]))
                    },
                    value: selectedCollection,
                    onChange: handleCollectionChange,
                    placeholder: 'Todas '
                }
            }
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
                <span
                    className="text-sm cursor-help"
                    title={new Date(getValue()).toLocaleString('es-ES')}
                >
                    {new Date(getValue()).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
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
                <span
                    className="text-sm cursor-help"
                    title={new Date(getValue()).toLocaleString('es-ES')}
                >
                    {new Date(getValue()).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
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
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(route('media-library.download', media.id), '_blank')}
                        >
                            <DownloadIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(media)}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500"
                            onClick={() => deleteMedia(media.id)}
                        >
                            <TrashIcon className="h-4 w-4" />
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
            refreshKey
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
                setPagination(prev => ({
                    ...prev,
                    pageIndex: 0
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
        return table.getState().columnFilters.length > 0 ||
            sorting.length > 0 ||
            globalFilter !== '';
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
        router.get(
            route('media-library.index'),
            {},
            { preserveState: false, replace: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Biblioteca de Archivos" />

            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <h1 className="text-2xl font-semibold">
                        Biblioteca de Archivos
                        {hasActiveFilters && (
                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({filteredCount} de {totalItemsGlobal} resultados)
                            </span>
                        )}
                    </h1>
                    <div className="flex flex-1 gap-2 items-center justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setIsDateFilterVisible(!isDateFilterVisible)}
                            className="flex items-center"
                            title="Filtrar por fechas"
                        >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Filtrar por Fechas
                            {(filters.start_date || filters.end_date) && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1">
                                    <span className="text-xs">
                                        {filters.date_type === 'created' ? 'Creación' : 'Actualización'}
                                    </span>
                                </Badge>
                            )}
                        </Button>
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
                        <Link href={route('media-library.clean-orphaned-files')}>
                            <Button variant="outline" className="hidden sm:inline-flex">
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Limpiar Archivos Huérfanos
                            </Button>
                            <Button variant="outline" className="sm:hidden" size="icon">
                                <TrashIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={route('media-library.create')}>
                            <Button className="hidden sm:inline-flex">
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Nuevo Archivo
                            </Button>
                            <Button className="sm:hidden" size="icon">
                                <PlusIcon className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Panel de filtros por fecha */}
                {isDateFilterVisible && (
                    <Card className="mb-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-gray-200 dark:border-zinc-800">
                        <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/80">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                                    Filtrar por Fechas
                                </CardTitle>
                                {(filters.start_date || filters.end_date) && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <span>
                                            {filters.date_type === 'created' ? 'Creado' : 'Actualizado'}:
                                            {filters.start_date && ` desde ${filters.start_date}`}
                                            {filters.end_date && ` hasta ${filters.end_date}`}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 p-0 ml-1"
                                            onClick={clearDateFilter}
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 pb-4 px-4">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                                <div className="sm:col-span-3">
                                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-md border border-gray-200 dark:border-zinc-800">
                                        <h3 className="text-sm font-medium mb-2">Tipo de fecha</h3>
                                        <RadioGroup
                                            value={dateType}
                                            onValueChange={(value: 'created' | 'updated') => setDateType(value)}
                                            className="flex flex-col space-y-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="created" id="created" />
                                                <Label htmlFor="created" className="text-sm">Fecha de creación</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="updated" id="updated" />
                                                <Label htmlFor="updated" className="text-sm">Fecha de actualización</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <Label htmlFor="start-date" className="text-sm font-medium">Fecha inicial</Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <Label htmlFor="end-date" className="text-sm font-medium">Fecha final</Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <Button
                                        onClick={handleDateFilterApply}
                                        disabled={!startDate && !endDate}
                                        className="w-full"
                                    >
                                        Aplicar filtro
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Vista tipo card para móvil */}
                <div className="block sm:hidden space-y-2 mb-16">
                    {tableRows.length > 0 ? (
                        tableRows.map((row, index) => {
                            const media = row.original;
                            // Calcular el número directamente basado en la página actual
                            const rowNumber = pagination.pageIndex * pagination.pageSize + index + 1;
                            return (
                                <div key={media.id} className="bg-white dark:bg-zinc-900 rounded shadow p-3 flex flex-col gap-2">
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
                                        <div className="flex-1">
                                            <div className="font-bold text-base flex items-start">
                                                <span className="mr-2 mt-0.5 flex-shrink-0 text-gray-500">
                                                    #{rowNumber}
                                                </span>
                                                <span>{media.name}</span>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {media.description || 'Sin descripción'}
                                            </div>
                                            <div className="flex items-center mt-1 space-x-2">
                                                <Badge variant="outline" className="capitalize text-xs">
                                                    {media.collection_name}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {media.human_readable_size}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2 justify-end">
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
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => openEditDialog(media)}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => deleteMedia(media.id)}
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No se encontraron archivos
                        </div>
                    )}
                </div>

                {/* Tabla solo visible en escritorio/tablet */}
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
                                                                    ? 'cursor-pointer select-none flex items-center gap-1 hover:text-primary transition-colors group'
                                                                    : '',
                                                                onClick: header.column.getToggleSortingHandler(),
                                                            }}
                                                        >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
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
                                                        {header.column.getCanFilter() && (
                                                            <div className="mt-2">
                                                                <Input
                                                                    value={(header.column.getFilterValue() as string) ?? ''}
                                                                    onChange={e => header.column.setFilterValue(e.target.value)}
                                                                    placeholder={`Filtrar ${header.column.columnDef.header as string}...`}
                                                                    className="h-8 text-xs bg-white/80 dark:bg-zinc-900/80 focus:bg-white dark:focus:bg-zinc-900"
                                                                />
                                                            </div>
                                                        )}
                                                        {/* Añadir selector para columna de colección */}
                                                        {header.column.id === 'collection_name' && (
                                                            <div className="mt-2">
                                                                <Select
                                                                    value={selectedCollection}
                                                                    onValueChange={handleCollectionChange}
                                                                >
                                                                    <SelectTrigger className="h-8 text-xs bg-white/80 dark:bg-zinc-900/80 focus:bg-white dark:focus:bg-zinc-900">
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
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No se encontraron archivos.
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
                            Anterior
                            <ChevronLeft className="h-4 w-4 mr-1" />
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
                <div className="hidden sm:flex sm:flex-row-reverse sm:items-center sm:justify-between px-4 py-4 gap-4 bg-white dark:bg-zinc-900 rounded-b-lg">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                            <div>
                                Mostrando {pagination.pageIndex * pagination.pageSize + 1} a {Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredCount)} de {filteredCount} registros
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

                {/* Diálogo para editar descripción */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Descripción</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Descripción</Label>
                                <Textarea
                                    id="edit-description"
                                    placeholder="Añade una descripción para este archivo..."
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={saveDescription}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
} 