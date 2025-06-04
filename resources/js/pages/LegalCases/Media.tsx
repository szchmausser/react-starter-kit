import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { formatDateSafe } from '@/lib/utils';
import { FileText, Download, Edit, Trash2, ArrowLeft } from 'lucide-react';

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
        } else {
            return <FileText className="h-6 w-6 text-gray-500" />;
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
                            <h1 className="text-xl font-bold">Archivos Multimedia - Expediente: {legalCase.code}</h1>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => router.visit(route('legal-cases.show', legalCase.id))}
                                    variant="outline"
                                    size="sm"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al Expediente
                                </Button>
                                <Button
                                    onClick={() => router.visit(route('legal-cases.media.create', legalCase.id))}
                                    variant="default"
                                    size="sm"
                                >
                                    Subir Nuevo Archivo
                                </Button>
                            </div>
                        </div>

                        {mediaItems.length === 0 ? (
                            <div className="rounded-md bg-gray-50 p-6 text-center dark:bg-zinc-800">
                                <p className="text-gray-500 dark:text-gray-400">No hay archivos multimedia asociados a este expediente.</p>
                                <Button
                                    onClick={() => router.visit(route('legal-cases.media.create', legalCase.id))}
                                    className="mt-4"
                                >
                                    Subir Archivo
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-md border dark:border-zinc-700">
                                <div className="bg-gray-50 px-4 py-3 font-medium dark:bg-zinc-800">
                                    <div className="grid grid-cols-12 gap-2">
                                        <div className="col-span-5 text-sm text-gray-600 dark:text-gray-400">Nombre</div>
                                        <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">Tipo</div>
                                        <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">Tamaño</div>
                                        <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">Fecha</div>
                                        <div className="col-span-1 text-sm text-gray-600 dark:text-gray-400">Acciones</div>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-200 dark:divide-zinc-700 dark:bg-zinc-900">
                                    {mediaItems.map((mediaItem) => (
                                        <div key={mediaItem.id} className="px-4 py-3">
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-5 flex items-center">
                                                    <div className="mr-3 flex-shrink-0">
                                                        {getFileIcon(mediaItem.mime_type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{mediaItem.name}</p>
                                                        {mediaItem.description && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {mediaItem.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {mediaItem.mime_type.split('/')[1]?.toUpperCase() || mediaItem.mime_type}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {mediaItem.human_readable_size}
                                                </div>
                                                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(mediaItem.created_at)}
                                                </div>
                                                <div className="col-span-1 flex justify-end space-x-1">
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 