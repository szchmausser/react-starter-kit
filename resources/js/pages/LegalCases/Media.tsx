import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { formatDateSafe } from '@/lib/utils';
import { FileText, Download, Edit, Trash2, ArrowLeft, Grid, List, Upload, Eye } from 'lucide-react';

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
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            );
        } else if (mimeType === 'application/pdf') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-500">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15v-1h6v1" />
                    <path d="M11 18v-6" />
                    <path d="M9 12v-1h6v1" />
                </svg>
            );
        } else if (mimeType.startsWith('video/')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-500">
                    <path d="m10 7 5 3-5 3Z" />
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                </svg>
            );
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-700">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-600">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.startsWith('audio/') || mimeType.includes('audio')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-500">
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-blue-500">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            );
        } else if (mimeType === 'application/pdf') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-red-500">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15v-1h6v1" />
                    <path d="M11 18v-6" />
                    <path d="M9 12v-1h6v1" />
                </svg>
            );
        } else if (mimeType.startsWith('video/')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-purple-500">
                    <path d="m10 7 5 3-5 3Z" />
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                </svg>
            );
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-blue-700">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-green-600">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.startsWith('audio/') || mimeType.includes('audio')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-indigo-500">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            );
        } else {
            return <FileText className="h-16 w-16 text-gray-500" />;
        }
    };

    // Función para formatear la fecha
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Archivos Multimedia - Expediente: ${legalCase.code}`} />
            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <div className="mb-4 flex items-center justify-between">
                            <h1 className="text-lg sm:text-xl font-bold truncate pr-2">Archivos Multimedia - <span className="hidden sm:inline">Expediente:</span> {legalCase.code}</h1>
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
                                    <span className="hidden sm:inline ml-2">Volver al Expediente</span>
                                </Button>
                                <Button
                                    onClick={() => router.visit(route('legal-cases.media.create', legalCase.id))}
                                    variant="default"
                                    size="sm"
                                    className="flex items-center"
                                    title="Subir Nuevo Archivo"
                                >
                                    <Upload className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Subir</span>
                                </Button>
                            </div>
                        </div>

                        {!mediaItems || mediaItems.length === 0 ? (
                            <div className="rounded-md bg-gray-50 p-6 text-center dark:bg-zinc-800">
                                <p className="text-gray-500 dark:text-gray-400">No hay archivos multimedia asociados a este expediente.</p>
                                <Button
                                    onClick={() => router.visit(route('legal-cases.media.create', legalCase.id))}
                                    className="mt-4"
                                >
                                    Subir Archivo
                                </Button>
                            </div>
                        ) : viewMode === 'list' ? (
                            // Vista de lista
                            <div className="overflow-hidden rounded-md border dark:border-zinc-700">
                                {/* Encabezado de tabla - solo visible en pantallas medianas y grandes */}
                                <div className="bg-gray-50 px-4 py-3 font-medium hidden sm:block dark:bg-zinc-800">
                                    <div className="grid grid-cols-12 gap-2">
                                        <div className="col-span-4 text-sm text-gray-600 dark:text-gray-400">Nombre</div>
                                        <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">Tipo</div>
                                        <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">Tamaño</div>
                                        <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">Fecha</div>
                                        <div className="col-span-1 text-sm text-gray-600 dark:text-gray-400">Acciones</div>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-200 dark:divide-zinc-700 dark:bg-zinc-900">
                                    {mediaItems.map((mediaItem) => (
                                        <div key={mediaItem.id} className="px-4 py-3">
                                            {/* Vista para pantallas medianas y grandes */}
                                            <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-4 flex items-center">
                                                    <div className="mr-3 flex-shrink-0">
                                                        {getFileIcon(mediaItem.mime_type)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate" title={mediaItem.name}>{mediaItem.name}</p>
                                                        {mediaItem.description && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={mediaItem.description}>
                                                                {mediaItem.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-span-3">
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 truncate max-w-[calc(100%-10px)]" title={mediaItem.mime_type}>
                                                        {mediaItem.type_name || mediaItem.mime_type}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {mediaItem.human_readable_size}
                                                </div>
                                                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(mediaItem.created_at)}
                                                </div>
                                                <div className="col-span-1 flex justify-start space-x-1">
                                                    <Button
                                                        onClick={() => router.visit(route('legal-cases.media.show', [legalCase.id, mediaItem.id]))}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => window.open(route('legal-cases.media.download', [legalCase.id, mediaItem.id]), '_blank')}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        title="Descargar"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => router.visit(route('legal-cases.media.edit', [legalCase.id, mediaItem.id]))}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            if (confirm('¿Está seguro que desea eliminar este archivo?')) {
                                                                router.delete(route('legal-cases.media.destroy', [legalCase.id, mediaItem.id]));
                                                            }
                                                        }}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Vista para móviles - formato de tarjeta apilada */}
                                            <div
                                                className="sm:hidden flex flex-col cursor-pointer"
                                                onClick={() => router.visit(route('legal-cases.media.show', [legalCase.id, mediaItem.id]))}
                                            >
                                                <div className="flex items-center mb-2">
                                                    <div className="mr-3 flex-shrink-0">
                                                        {getFileIcon(mediaItem.mime_type)}
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <p className="font-medium truncate" title={mediaItem.name}>{mediaItem.name}</p>
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 truncate max-w-[calc(100%-10px)] mt-1" title={mediaItem.mime_type}>
                                                            {mediaItem.type_name || mediaItem.mime_type}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ml-10 mb-2">
                                                    <div>
                                                        <p>{mediaItem.human_readable_size}</p>
                                                        <p>{formatDate(mediaItem.created_at)}</p>
                                                        {mediaItem.description && (
                                                            <p className="truncate max-w-[180px]" title={mediaItem.description}>
                                                                {mediaItem.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.visit(route('legal-cases.media.show', [legalCase.id, mediaItem.id]));
                                                            }}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(route('legal-cases.media.download', [legalCase.id, mediaItem.id]), '_blank');
                                                            }}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            title="Descargar"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.visit(route('legal-cases.media.edit', [legalCase.id, mediaItem.id]));
                                                            }}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            title="Editar"
                                                        >
                                                            <Edit className="h-3 w-3" />
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
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
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
                                {mediaItems.map((mediaItem) => (
                                    <div
                                        key={mediaItem.id}
                                        className="flex flex-col items-center justify-between p-3 sm:p-4 border border-gray-100 dark:border-zinc-800 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer min-h-[200px] h-full"
                                        onClick={() => router.visit(route('legal-cases.media.show', [legalCase.id, mediaItem.id]))}
                                    >
                                        <div className="flex flex-col items-center w-full flex-grow">
                                            <div className="mb-2 sm:mb-3 flex items-center justify-center h-16 sm:h-24">
                                                {getLargeFileIcon(mediaItem.mime_type)}
                                            </div>
                                            <div className="text-center w-full">
                                                <div className="min-h-[3rem] sm:min-h-[3.5rem] max-h-[4rem] sm:max-h-[4.5rem] flex items-center justify-center overflow-hidden px-1">
                                                    <p className="font-medium text-xs sm:text-sm px-1 break-words text-center hyphens-auto line-clamp-3" style={{ wordBreak: 'break-word', wordWrap: 'break-word' }} title={mediaItem.name}>
                                                        {mediaItem.name}
                                                    </p>
                                                </div>
                                                <div className="mt-1 sm:mt-2 flex flex-col gap-0.5 sm:gap-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {mediaItem.human_readable_size}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(mediaItem.created_at)}
                                                    </p>
                                                    <div className="mt-1">
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 truncate max-w-[calc(100%-10px)]" title={mediaItem.mime_type}>
                                                            {mediaItem.type_name || mediaItem.mime_type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-center space-x-1 mt-2 sm:mt-4 w-full pt-1 sm:pt-2 border-t border-gray-100 dark:border-zinc-700">
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.visit(route('legal-cases.media.show', [legalCase.id, mediaItem.id]));
                                                }}
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 sm:h-8 sm:w-8"
                                                title="Ver detalles"
                                            >
                                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(route('legal-cases.media.download', [legalCase.id, mediaItem.id]), '_blank');
                                                }}
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 sm:h-8 sm:w-8"
                                                title="Descargar"
                                            >
                                                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.visit(route('legal-cases.media.edit', [legalCase.id, mediaItem.id]));
                                                }}
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 sm:h-8 sm:w-8"
                                                title="Editar"
                                            >
                                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
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
                                                className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 hover:text-red-700"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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