import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChevronLeftIcon, DownloadIcon, PencilIcon, TrashIcon, FileIcon, ImageIcon, FileTextIcon, VideoIcon, MusicIcon, ArchiveIcon, PresentationIcon, FileSpreadsheetIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    original_filename?: string;
    uploaded_by?: number;
    last_modified?: string;
}

interface MediaShowProps {
    mediaItem: Media;
}

export default function MediaShow({ mediaItem }: MediaShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/' },
        { title: 'Biblioteca de Archivos', href: route('media-library.index') },
        { title: mediaItem.name, href: route('media-library.show', mediaItem.id) },
    ];

    const deleteMedia = () => {
        if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
            router.delete(route('media-library.destroy', mediaItem.id));
        }
    };

    const getTypeIcon = () => {
        if (!mediaItem.type_icon) return <FileIcon className="h-6 w-6" />;

        switch (mediaItem.type_icon) {
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

    const renderPreview = () => {
        if (!mediaItem.mime_type) {
            return (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
                    No se puede mostrar una vista previa para este archivo
                </div>
            );
        }

        if (mediaItem.mime_type.startsWith('image/')) {
            return (
                <div className="flex items-center justify-center">
                    <img
                        src={mediaItem.file_url}
                        alt={mediaItem.name}
                        className="max-h-[600px] object-contain rounded-md"
                    />
                </div>
            );
        }

        if (mediaItem.mime_type.startsWith('video/')) {
            return (
                <div className="flex items-center justify-center">
                    <video
                        src={mediaItem.file_url}
                        controls
                        className="max-h-[600px] max-w-full rounded-md"
                        controlsList="nodownload"
                        poster={mediaItem.thumbnail || undefined}
                    >
                        Tu navegador no soporta la reproducción de videos.
                        <a href={route('media-library.download', mediaItem.id)} target="_blank" rel="noopener noreferrer">
                            Descargar video
                        </a>
                    </video>
                </div>
            );
        }

        if (mediaItem.mime_type.startsWith('audio/')) {
            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-5xl mb-6">{getTypeIcon()}</div>
                    <h3 className="text-xl font-medium mb-4">{mediaItem.name}</h3>
                    <audio
                        src={mediaItem.file_url}
                        controls
                        className="w-full max-w-md"
                        controlsList="nodownload"
                    >
                        Tu navegador no soporta la reproducción de audio.
                        <a href={route('media-library.download', mediaItem.id)} target="_blank" rel="noopener noreferrer">
                            Descargar audio
                        </a>
                    </audio>
                </div>
            );
        }

        if (mediaItem.mime_type === 'application/pdf' && mediaItem.file_url) {
            return (
                <div className="h-[600px] rounded-md overflow-hidden">
                    <iframe
                        src={mediaItem.file_url}
                        className="w-full h-full"
                        title={mediaItem.name}
                    />
                </div>
            );
        }

        // Para otros tipos de archivos, mostrar información sobre el archivo
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-md p-6 text-center">
                <div className="text-5xl mb-4">{getTypeIcon()}</div>
                <h3 className="text-xl font-medium">{mediaItem.file_name || mediaItem.name}</h3>
                <p className="text-gray-500 mt-2">{mediaItem.type_name || mediaItem.mime_type}</p>
                <p className="text-gray-500">{mediaItem.human_readable_size}</p>
                <div className="mt-4">
                    <Button onClick={() => window.open(route('media-library.download', mediaItem.id), '_blank')}>
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Descargar para visualizar
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mediaItem.name} />

            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">{mediaItem.name}</h1>
                    <div className="flex space-x-2">
                        <Link href={route('media-library.index')}>
                            <Button variant="outline">
                                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                                Volver al listado
                            </Button>
                        </Link>
                        <Link href={route('media-library.edit', mediaItem.id)}>
                            <Button variant="outline">
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={() => window.open(route('media-library.download', mediaItem.id), '_blank')}
                        >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Descargar
                        </Button>
                        <Button variant="destructive" onClick={deleteMedia}>
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Vista Previa</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {renderPreview()}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Archivo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                                        <p className="mt-1">{mediaItem.name}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Tipo de archivo</h3>
                                        <div className="flex items-center mt-1 space-x-2">
                                            {getTypeIcon()}
                                            <span>{mediaItem.type_name || mediaItem.mime_type}</span>
                                        </div>
                                    </div>

                                    {mediaItem.description && (
                                        <div className="col-span-1 sm:col-span-2">
                                            <h3 className="text-sm font-medium text-gray-500">Descripción</h3>
                                            <p className="mt-1">{mediaItem.description}</p>
                                        </div>
                                    )}

                                    {mediaItem.category && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Categoría</h3>
                                            <Badge variant="outline" className="mt-1">{mediaItem.category}</Badge>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Tamaño</h3>
                                        <p className="mt-1">{mediaItem.human_readable_size}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Colección</h3>
                                        <p className="mt-1 capitalize">{mediaItem.collection_name}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Fecha de creación</h3>
                                        <p className="mt-1">
                                            {new Date(mediaItem.created_at).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>

                                    {mediaItem.last_modified && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Última modificación</h3>
                                            <p className="mt-1">{mediaItem.last_modified}</p>
                                        </div>
                                    )}

                                    <div className="col-span-1 sm:col-span-2 border-t pt-3">
                                        <details className="group">
                                            <summary className="flex items-center font-medium cursor-pointer list-none text-sm text-gray-500">
                                                <span>Información técnica</span>
                                                <span className="transition group-open:rotate-180 ml-auto">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                                                </span>
                                            </summary>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mt-3">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Nombre del archivo</h3>
                                                    <p className="mt-1 text-xs break-all">{mediaItem.file_name}</p>
                                                </div>

                                                {mediaItem.original_filename && mediaItem.original_filename !== mediaItem.file_name && (
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-500">Nombre original</h3>
                                                        <p className="mt-1 text-xs break-all">{mediaItem.original_filename}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">MIME Type</h3>
                                                    <p className="mt-1 text-xs">{mediaItem.mime_type}</p>
                                                </div>

                                                {mediaItem.extension && (
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-500">Extensión</h3>
                                                        <p className="mt-1 uppercase">{mediaItem.extension}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Almacenamiento</h3>
                                                    <p className="mt-1">{mediaItem.disk}</p>
                                                </div>

                                                {mediaItem.uuid && (
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-500">UUID</h3>
                                                        <p className="mt-1 text-xs break-all">{mediaItem.uuid}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 