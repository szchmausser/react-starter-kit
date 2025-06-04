import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { formatDateSafe } from '@/lib/utils';
import { ArrowLeft, Download, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
    last_modified?: string;
    original_filename?: string;
}

interface LegalCase {
    id: number;
    code: string;
}

interface Props {
    mediaItem: MediaItem;
    legalCase: LegalCase;
}

export default function MediaShow({ mediaItem, legalCase }: Props) {
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
        {
            title: mediaItem.name,
            href: route('legal-cases.media.show', [legalCase.id, mediaItem.id]),
        },
    ];

    // Determinar el icono según el tipo MIME
    const getFileIcon = () => {
        if (mediaItem.mime_type.startsWith('image/')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-24 w-24 text-blue-500">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            );
        } else if (mediaItem.mime_type === 'application/pdf') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-24 w-24 text-red-500">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15v-1h6v1" />
                    <path d="M11 18v-6" />
                    <path d="M9 12v-1h6v1" />
                </svg>
            );
        } else if (mediaItem.mime_type.startsWith('video/')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-24 w-24 text-purple-500">
                    <path d="m10 7 5 3-5 3Z" />
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                </svg>
            );
        } else if (mediaItem.mime_type.includes('word') || mediaItem.mime_type.includes('document')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-24 w-24 text-blue-700">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mediaItem.mime_type.includes('excel') || mediaItem.mime_type.includes('spreadsheet')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-24 w-24 text-green-600">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else {
            return <FileText className="h-24 w-24 text-gray-500" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Archivo: ${mediaItem.name} - Expediente: ${legalCase.code}`} />
            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-xl font-bold">Archivo: {mediaItem.name}</h1>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => router.visit(route('legal-cases.show', legalCase.id))}
                                    variant="outline"
                                    size="sm"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al Expediente
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Columna de la izquierda: Vista previa del archivo */}
                            <div className="flex flex-col items-center space-y-4">
                                {mediaItem.mime_type.startsWith('image/') && mediaItem.file_url ? (
                                    <div className="w-full rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700">
                                        <img
                                            src={mediaItem.file_url}
                                            alt={mediaItem.name}
                                            className="w-full object-contain max-h-[300px]"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6">
                                        {getFileIcon()}
                                        <div className="mt-4 text-center">
                                            <p className="font-medium">{mediaItem.file_name}</p>
                                            <p className="mt-1 text-sm text-gray-500">{mediaItem.human_readable_size}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex space-x-2 w-full justify-center">
                                    <Button
                                        onClick={() => window.open(route('legal-cases.media.download', [legalCase.id, mediaItem.id]), '_blank')}
                                        variant="outline"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Descargar
                                    </Button>
                                    <Button
                                        onClick={() => router.visit(route('legal-cases.media.edit', [legalCase.id, mediaItem.id]))}
                                        variant="outline"
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (confirm('¿Está seguro que desea eliminar este archivo?')) {
                                                router.delete(route('legal-cases.media.destroy', [legalCase.id, mediaItem.id]), {
                                                    onSuccess: () => {
                                                        // El servidor ya se encarga de la redirección y los mensajes flash
                                                        // No necesitamos hacer nada más aquí
                                                    }
                                                });
                                            }
                                        }}
                                        variant="outline"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </Button>
                                </div>
                            </div>

                            {/* Columna de la derecha: Detalles del archivo */}
                            <div className="md:col-span-2">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 dark:bg-zinc-800 dark:border-gray-700">
                                        <h2 className="font-medium">Información del Archivo</h2>
                                    </div>
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        <div className="grid grid-cols-3 px-4 py-3">
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</div>
                                            <div className="col-span-2 font-medium">{mediaItem.name}</div>
                                        </div>
                                        <div className="grid grid-cols-3 px-4 py-3">
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre original</div>
                                            <div className="col-span-2">{mediaItem.original_filename || mediaItem.file_name}</div>
                                        </div>
                                        {mediaItem.description && (
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</div>
                                                <div className="col-span-2">{mediaItem.description}</div>
                                            </div>
                                        )}
                                        {mediaItem.category && (
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoría</div>
                                                <div className="col-span-2">{mediaItem.category}</div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-3 px-4 py-3">
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</div>
                                            <div className="col-span-2">
                                                {mediaItem.type_name || mediaItem.mime_type}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 px-4 py-3">
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Extensión</div>
                                            <div className="col-span-2 uppercase">{mediaItem.extension}</div>
                                        </div>
                                        <div className="grid grid-cols-3 px-4 py-3">
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Tamaño</div>
                                            <div className="col-span-2">{mediaItem.human_readable_size}</div>
                                        </div>
                                        <div className="grid grid-cols-3 px-4 py-3">
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de subida</div>
                                            <div className="col-span-2">{formatDateSafe(mediaItem.created_at)}</div>
                                        </div>
                                        <div className="grid grid-cols-3 px-4 py-3">
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Última modificación</div>
                                            <div className="col-span-2">{mediaItem.last_modified || formatDateSafe(mediaItem.updated_at)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 