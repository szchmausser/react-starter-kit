import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AppLayout from '@/layouts/app-layout';
import { formatDateSafe } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, Edit, FileText, Filter, Grid, List, Search, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MediaItem {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    human_readable_size: string;
    type_name: string;
    type_icon: string;
    extension: string;
    description?: string;
    category?: string;
    file_url: string;
    preview_url?: string;
    thumbnail?: string;
    created_at: string;
    updated_at: string;
}

interface LegalCase {
    id: number;
    code: string;
}

interface Props {
    mediaItems: MediaItem[];
    legalCase: LegalCase;
}

export default function LegalCaseMedia({ mediaItems, legalCase }: Props) {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilterType, setDateFilterType] = useState<'created' | 'updated'>('created');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredItems, setFilteredItems] = useState<MediaItem[]>(mediaItems);

    // Aplicar filtros cuando cambien los criterios
    useEffect(() => {
        applyFilters();
    }, [searchTerm, dateFilterType, startDate, endDate]);

    // Función para aplicar todos los filtros
    const applyFilters = () => {
        let filtered = [...mediaItems];

        // Filtrar por término de búsqueda (nombre o descripción)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (item) => item.name.toLowerCase().includes(term) || (item.description && item.description.toLowerCase().includes(term)),
            );
        }

        // Filtrar por fechas
        if (startDate || endDate) {
            filtered = filtered.filter((item) => {
                // Asegurarse de que las fechas se interpretan correctamente
                const dateField = dateFilterType === 'created' ? item.created_at : item.updated_at;
                if (!dateField) return true;

                // Extraer la fecha en formato YYYY-MM-DD sin ajustes de zona horaria
                const itemDateStr = dateField.substring(0, 10);

                if (startDate && endDate) {
                    // Comparación directa de cadenas en formato YYYY-MM-DD
                    return itemDateStr >= startDate && itemDateStr <= endDate;
                } else if (startDate) {
                    return itemDateStr >= startDate;
                } else if (endDate) {
                    return itemDateStr <= endDate;
                }
                return true;
            });
        }

        setFilteredItems(filtered);
    };

    // Función para limpiar todos los filtros
    const clearFilters = () => {
        setSearchTerm('');
        setDateFilterType('created');
        setStartDate('');
        setEndDate('');
    };

    // Función para formatear la fecha en formato YYYY-MM-DD para inputs de tipo date
    const formatDateForInput = (dateString: string) => {
        try {
            // Extraer directamente los componentes de la fecha de la cadena
            if (dateString.includes('-') && dateString.length >= 10) {
                return dateString.substring(0, 10); // Devuelve YYYY-MM-DD sin procesar
            }

            // Si no tiene el formato esperado, intentar con Date
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            return '';
        } catch (error) {
            console.error('Error al formatear fecha para input:', error);
            return '';
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Búsqueda',
            href: route('search.index'),
        },
        {
            title: 'Resultados',
            href: route('search.results'),
        },
        {
            title: `Expediente: ${legalCase.code}`,
            href: route('legal-cases.show', legalCase.id),
        },
        {
            title: 'Archivos Multimedia',
            href: route('legal-cases.media.index', legalCase.id),
        },
    ];

    // Función para obtener el icono según el tipo de archivo
    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-blue-500"
                >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            );
        } else if (mimeType === 'application/pdf') {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-red-500"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15v-1h6v1" />
                    <path d="M11 18v-6" />
                    <path d="M9 12v-1h6v1" />
                </svg>
            );
        } else if (mimeType.startsWith('video/')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-purple-500"
                >
                    <path d="m10 7 5 3-5 3Z" />
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                </svg>
            );
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-blue-700"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-green-600"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.startsWith('audio/') || mimeType.includes('audio')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-indigo-500"
                >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            );
        } else {
            return <FileText className="h-6 w-6 text-gray-500" />;
        }
    };

    // Función para obtener un icono más grande para la vista de cuadrícula
    const getLargeFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-28 w-28 text-blue-500"
                >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            );
        } else if (mimeType === 'application/pdf') {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-28 w-28 text-red-500"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15v-1h6v1" />
                    <path d="M11 18v-6" />
                    <path d="M9 12v-1h6v1" />
                </svg>
            );
        } else if (mimeType.startsWith('video/')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-28 w-28 text-purple-500"
                >
                    <path d="m10 7 5 3-5 3Z" />
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                </svg>
            );
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-28 w-28 text-blue-700"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-28 w-28 text-green-600"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.startsWith('audio/') || mimeType.includes('audio')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-28 w-28 text-indigo-500"
                >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            );
        } else {
            return <FileText className="h-28 w-28 text-gray-500" />;
        }
    };

    // Función para formatear la fecha
    const formatDate = (dateString: string) => {
        return formatDateSafe(dateString);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Archivos Multimedia - Expediente: ${legalCase.code}`} />
            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="truncate pr-2 text-lg font-bold sm:text-xl">
                                Archivos Multimedia - <span className="hidden sm:inline">Expediente:</span> {legalCase.code}
                            </h1>
                            <div className="flex flex-wrap justify-between gap-2 sm:justify-end">
                                <div className="flex gap-2">
                                    <div className="relative w-full sm:w-auto">
                                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Buscar archivos..."
                                            className="h-9 w-full pl-9 text-sm sm:w-[200px]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        onClick={() => setShowFilters(!showFilters)}
                                        variant="outline"
                                        size="sm"
                                        className={`flex items-center gap-1 ${showFilters ? 'bg-gray-100 dark:bg-zinc-800' : ''}`}
                                        title="Filtrar por fechas"
                                    >
                                        <Filter className="h-4 w-4" />
                                        <span className="hidden sm:inline">Filtros</span>
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 sm:gap-2"
                                        title={viewMode === 'list' ? 'Ver como iconos' : 'Ver como lista'}
                                    >
                                        {viewMode === 'list' ? (
                                            <>
                                                <Grid className="h-4 w-4" />
                                                <span className="hidden sm:inline">Ver como iconos</span>
                                            </>
                                        ) : (
                                            <>
                                                <List className="h-4 w-4" />
                                                <span className="hidden sm:inline">Ver como lista</span>
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => router.visit(route('legal-cases.show', legalCase.id))}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center"
                                        title="Volver al Expediente"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span className="ml-2 hidden sm:inline">Volver al Expediente</span>
                                    </Button>
                                    <Button
                                        onClick={() => router.visit(route('legal-cases.media.create', legalCase.id))}
                                        variant="default"
                                        size="sm"
                                        className="flex items-center"
                                        title="Subir Nuevo Archivo"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <span className="ml-2 hidden sm:inline">Subir</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Panel de filtros */}
                        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                            <CollapsibleContent>
                                <div className="mb-6 rounded-md border bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 font-medium">
                                            <Filter className="h-4 w-4" />
                                            Filtrar por Fechas
                                        </h3>
                                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                                            <X className="mr-1 h-3 w-3" />
                                            Limpiar filtros
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <div className="mb-2 text-sm font-medium">Tipo de fecha</div>
                                            <RadioGroup
                                                value={dateFilterType}
                                                onValueChange={(value) => setDateFilterType(value as 'created' | 'updated')}
                                                className="flex flex-col space-y-1"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="created" id="created" />
                                                    <Label htmlFor="created">Fecha de creación</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="updated" id="updated" />
                                                    <Label htmlFor="updated">Fecha de actualización</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div>
                                            <div className="mb-2 text-sm font-medium">Fecha inicial</div>
                                            <div className="relative">
                                                <Calendar className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <Input
                                                    type="date"
                                                    className="pl-9"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="mb-2 text-sm font-medium">Fecha final</div>
                                            <div className="relative">
                                                <Calendar className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <Input type="date" className="pl-9" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {!filteredItems || filteredItems.length === 0 ? (
                            <div className="rounded-md bg-gray-50 p-6 text-center dark:bg-zinc-800">
                                {mediaItems.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400">No hay archivos multimedia asociados a este expediente.</p>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No se encontraron archivos que coincidan con los criterios de búsqueda.
                                    </p>
                                )}
                                <Button onClick={() => router.visit(route('legal-cases.media.create', legalCase.id))} className="mt-4">
                                    Subir Archivo
                                </Button>
                            </div>
                        ) : viewMode === 'list' ? (
                            // Vista de lista
                            <div className="overflow-hidden rounded-md border dark:border-zinc-700">
                                {/* Encabezado de tabla - solo visible en pantallas medianas y grandes */}
                                <div className="hidden grid-cols-12 items-center gap-4 rounded-t-md bg-gray-50 px-4 py-2 lg:grid dark:bg-zinc-800">
                                    <div className="col-span-5 text-sm text-gray-600 dark:text-gray-400">Nombre</div>
                                    <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">Tipo</div>
                                    <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">Tamaño</div>
                                    <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">Fecha</div>
                                </div>
                                <div className="divide-y divide-gray-200 dark:divide-zinc-700 dark:bg-zinc-900">
                                    {filteredItems.map((mediaItem) => (
                                        <div key={mediaItem.id} className="px-4 py-3">
                                            {/* Vista para pantallas grandes */}
                                            <div className="hidden grid-cols-12 items-center gap-4 lg:grid">
                                                <div className="col-span-5">
                                                    <div className="flex items-center">
                                                        <div className="mr-3 flex-shrink-0">{getFileIcon(mediaItem.mime_type)}</div>
                                                        <div className="min-w-0 flex-grow">
                                                            <p className="line-clamp-1 truncate font-medium break-all" title={mediaItem.name}>
                                                                {mediaItem.name}
                                                            </p>
                                                            <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                                                                {mediaItem.description || mediaItem.file_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <span
                                                        className="inline-flex max-w-[calc(100%-10px)] items-center truncate rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                        title={mediaItem.mime_type}
                                                    >
                                                        {mediaItem.type_name || mediaItem.mime_type}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {mediaItem.human_readable_size}
                                                </div>
                                                <div className="col-span-3 text-sm">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                            <span className="mr-1 text-xs font-medium">Creado:</span>
                                                            <span>{formatDate(mediaItem.created_at)}</span>
                                                        </div>
                                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                                            <span className="mr-1 font-medium">Actualizado:</span>
                                                            <span>{formatDate(mediaItem.updated_at || mediaItem.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Vista para móviles y pantallas pequeñas */}
                                            <div
                                                className="flex cursor-pointer flex-col lg:hidden"
                                                onClick={() => router.visit(route('legal-cases.media.show', [legalCase.id, mediaItem.id]))}
                                            >
                                                <div className="flex items-center">
                                                    <div className="mr-3 flex-shrink-0">{getFileIcon(mediaItem.mime_type)}</div>
                                                    <div className="min-w-0 flex-grow">
                                                        <p className="line-clamp-1 truncate font-medium break-all" title={mediaItem.name}>
                                                            {mediaItem.name}
                                                        </p>
                                                        <div className="mt-1 flex flex-col">
                                                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                                <span className="mr-1 font-medium">Creado:</span>
                                                                <span>{formatDate(mediaItem.created_at)}</span>
                                                            </div>
                                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                                                <span className="mr-1 font-medium">Act:</span>
                                                                <span>{formatDate(mediaItem.updated_at || mediaItem.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-zinc-700">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{mediaItem.human_readable_size}</div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.visit(route('legal-cases.media.edit', [legalCase.id, mediaItem.id]));
                                                            }}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(
                                                                    route('legal-cases.media.download', [legalCase.id, mediaItem.id]),
                                                                    '_blank',
                                                                );
                                                            }}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm('¿Está seguro que desea eliminar este archivo?')) {
                                                                    router.delete(route('legal-cases.media.destroy', [legalCase.id, mediaItem.id]));
                                                                }
                                                            }}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Vista de iconos
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {filteredItems.map((mediaItem) => (
                                    <div
                                        key={mediaItem.id}
                                        className="flex h-full min-h-[220px] cursor-pointer flex-col items-center justify-between rounded-md border border-gray-100 p-3 transition-colors hover:bg-gray-50 sm:p-4 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                                        onClick={() => router.visit(route('legal-cases.media.show', [legalCase.id, mediaItem.id]))}
                                    >
                                        <div className="flex w-full flex-grow flex-col items-center">
                                            <div className="mb-0.5 flex h-32 items-center justify-center sm:mb-2 sm:h-40">
                                                {getLargeFileIcon(mediaItem.mime_type)}
                                            </div>
                                            <h3 className="mb-1 line-clamp-2 max-h-10 w-full overflow-hidden px-1 text-center text-sm font-medium">
                                                <span className="line-clamp-2 break-all" title={mediaItem.name}>
                                                    {mediaItem.name}
                                                </span>
                                            </h3>
                                            <div className="mt-0.5 flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{mediaItem.human_readable_size}</p>
                                            </div>
                                            <div className="mt-1 flex w-full flex-col items-center text-center">
                                                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                    <span className="mr-1 font-medium">Creado:</span>
                                                    <span>{formatDate(mediaItem.created_at)}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                                    <span className="mr-1 font-medium">Act:</span>
                                                    <span>{formatDate(mediaItem.updated_at || mediaItem.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex w-full justify-center gap-1 border-t pt-2 dark:border-zinc-700">
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.visit(route('legal-cases.media.edit', [legalCase.id, mediaItem.id]));
                                                }}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 sm:h-9 sm:w-9"
                                            >
                                                <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </Button>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(route('legal-cases.media.download', [legalCase.id, mediaItem.id]), '_blank');
                                                }}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 sm:h-9 sm:w-9"
                                            >
                                                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </Button>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('¿Está seguro que desea eliminar este archivo?')) {
                                                        router.delete(route('legal-cases.media.destroy', [legalCase.id, mediaItem.id]));
                                                    }
                                                }}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 sm:h-9 sm:w-9"
                                            >
                                                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
