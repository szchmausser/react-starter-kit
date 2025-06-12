import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatDateSafe } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArchiveIcon,
    ArrowLeft,
    ChevronDown,
    Download,
    Edit,
    FileIcon,
    FileSpreadsheetIcon,
    FileText,
    ImageIcon,
    MusicIcon,
    PresentationIcon,
    Trash2,
    VideoIcon,
} from 'lucide-react';

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

    // Función para obtener el icono según el tipo de archivo
    const getFileIcon = (size: 'sm' | 'lg' = 'lg') => {
        const iconSize = size === 'lg' ? 'h-24 w-24' : 'h-6 w-6';

        if (!mediaItem.type_icon) return <FileIcon className={`${iconSize} text-gray-500 dark:text-gray-400`} />;

        switch (mediaItem.type_icon) {
            case 'image':
                return <ImageIcon className={`${iconSize} text-blue-500`} />;
            case 'file-text':
                return <FileText className={`${iconSize} text-red-500`} />;
            case 'video':
                return <VideoIcon className={`${iconSize} text-purple-500`} />;
            case 'music':
                return <MusicIcon className={`${iconSize} text-pink-500`} />;
            case 'file-spreadsheet':
                return <FileSpreadsheetIcon className={`${iconSize} text-green-500`} />;
            case 'file-presentation':
                return <PresentationIcon className={`${iconSize} text-orange-500`} />;
            case 'file-archive':
                return <ArchiveIcon className={`${iconSize} text-yellow-500`} />;
            default:
                return <FileText className={`${iconSize} text-gray-500 dark:text-gray-400`} />;
        }
    };

    // Función para renderizar la vista previa según el tipo de archivo
    const renderPreview = () => {
        if (!mediaItem.mime_type) {
            return (
                <div className="flex h-64 flex-col items-center justify-center rounded-md bg-gray-100 dark:bg-zinc-800">
                    <span className="text-gray-500 dark:text-gray-400">No se puede mostrar una vista previa para este archivo</span>
                </div>
            );
        }

        if (mediaItem.mime_type.startsWith('image/')) {
            return (
                <div className="flex items-center justify-center">
                    <img src={mediaItem.file_url} alt={mediaItem.name} className="max-h-[600px] rounded-md object-contain" />
                </div>
            );
        }

        // Lógica mejorada para video
        if (mediaItem.mime_type.startsWith('video/')) {
            // Usar directamente la URL del archivo sin verificaciones adicionales
            const videoUrl = mediaItem.file_url;

            // Determinar el tipo MIME correcto basado en la extensión si es necesario
            let videoType = mediaItem.mime_type;
            const ext = mediaItem.extension.toLowerCase();

            // Mapa de extensiones a tipos MIME para asegurar compatibilidad
            const mimeMap: Record<string, string> = {
                mp4: 'video/mp4',
                webm: 'video/webm',
                ogg: 'video/ogg',
                mov: 'video/quicktime',
                avi: 'video/x-msvideo',
                wmv: 'video/x-ms-wmv',
                flv: 'video/x-flv',
                mkv: 'video/x-matroska',
            };

            // Si tenemos una extensión conocida, usar el tipo MIME correspondiente
            if (ext in mimeMap) {
                videoType = mimeMap[ext];
            }

            return (
                <div className="flex items-center justify-center">
                    <video
                        controls
                        className="max-h-[600px] max-w-full rounded-md"
                        controlsList="nodownload"
                        poster={mediaItem.thumbnail || undefined}
                        preload="metadata"
                    >
                        {/* Usar múltiples elementos source para mayor compatibilidad */}
                        <source src={videoUrl} type={videoType} />
                        {ext === 'mp4' && <source src={videoUrl} type="video/mp4" />}
                        {ext === 'webm' && <source src={videoUrl} type="video/webm" />}
                        {ext === 'ogg' && <source src={videoUrl} type="video/ogg" />}
                        Tu navegador no soporta la reproducción de videos.
                        <a href={route('legal-cases.media.download', [legalCase.id, mediaItem.id])} target="_blank" rel="noopener noreferrer">
                            Descargar video
                        </a>
                    </video>
                </div>
            );
        }

        // Lógica mejorada para audio
        if (mediaItem.mime_type.startsWith('audio/')) {
            // Determinar el tipo MIME correcto basado en la extensión si es necesario
            let audioType = mediaItem.mime_type;
            const ext = mediaItem.extension.toLowerCase();

            // Mapa de extensiones a tipos MIME para asegurar compatibilidad
            const mimeMap: Record<string, string> = {
                mp3: 'audio/mpeg',
                wav: 'audio/wav',
                ogg: 'audio/ogg',
                flac: 'audio/flac',
                aac: 'audio/aac',
                m4a: 'audio/mp4',
            };

            // Si tenemos una extensión conocida, usar el tipo MIME correspondiente
            if (ext in mimeMap) {
                audioType = mimeMap[ext];
            }

            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="mb-6 text-5xl">{getFileIcon('lg')}</div>
                    <h3 className="mb-4 text-xl font-medium">{mediaItem.name}</h3>
                    <audio controls className="w-full max-w-md" controlsList="nodownload" preload="metadata">
                        {/* Usar múltiples elementos source para mayor compatibilidad */}
                        <source src={mediaItem.file_url} type={audioType} />
                        {ext === 'mp3' && <source src={mediaItem.file_url} type="audio/mpeg" />}
                        {ext === 'wav' && <source src={mediaItem.file_url} type="audio/wav" />}
                        {ext === 'ogg' && <source src={mediaItem.file_url} type="audio/ogg" />}
                        Tu navegador no soporta la reproducción de audio.
                        <a href={route('legal-cases.media.download', [legalCase.id, mediaItem.id])} target="_blank" rel="noopener noreferrer">
                            Descargar audio
                        </a>
                    </audio>
                </div>
            );
        }

        if (mediaItem.mime_type === 'application/pdf' && mediaItem.file_url) {
            return (
                <div className="h-[600px] overflow-hidden rounded-md">
                    <iframe src={mediaItem.file_url} className="h-full w-full" title={mediaItem.name} />
                </div>
            );
        }

        // Para otros tipos de archivos, mostrar información sobre el archivo
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-md bg-gray-100 p-6 text-center dark:bg-zinc-800">
                <div className="mb-4 text-5xl">{getFileIcon('lg')}</div>
                <h3 className="text-xl font-medium">{mediaItem.file_name || mediaItem.name}</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{mediaItem.type_name || mediaItem.mime_type}</p>
                <p className="text-gray-500 dark:text-gray-400">{mediaItem.human_readable_size}</p>
                <div className="mt-4">
                    <Button
                        onClick={() => window.open(route('legal-cases.media.download', [legalCase.id, mediaItem.id]), '_blank')}
                        variant="outline"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar para visualizar
                    </Button>
                </div>
            </div>
        );
    };

    const deleteMedia = () => {
        if (confirm('¿Está seguro que desea eliminar este archivo?')) {
            router.delete(route('legal-cases.media.destroy', [legalCase.id, mediaItem.id]));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Archivo: ${mediaItem.name} - Expediente: ${legalCase.code}`} />
            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold">{mediaItem.name}</h1>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('legal-cases.media.index', legalCase.id))}
                            className="w-full justify-center sm:w-auto"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al listado
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('legal-cases.media.edit', [legalCase.id, mediaItem.id]))}
                            className="w-full justify-center sm:w-auto"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.open(route('legal-cases.media.download', [legalCase.id, mediaItem.id]), '_blank')}
                            className="w-full justify-center sm:w-auto"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                        </Button>
                        <Button variant="destructive" onClick={deleteMedia} className="w-full justify-center sm:w-auto">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Vista Previa</CardTitle>
                            </CardHeader>
                            <CardContent>{renderPreview()}</CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Archivo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</h3>
                                        <p className="mt-1">{mediaItem.name}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de archivo</h3>
                                        <div className="mt-1 flex items-center space-x-2">
                                            {getFileIcon('sm')}
                                            <span>{mediaItem.type_name || mediaItem.mime_type}</span>
                                        </div>
                                    </div>

                                    {mediaItem.description && (
                                        <div className="col-span-1 sm:col-span-2">
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</h3>
                                            <p className="mt-1">{mediaItem.description}</p>
                                        </div>
                                    )}

                                    {mediaItem.category && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoría</h3>
                                            <Badge variant="outline" className="mt-1">
                                                {mediaItem.category}
                                            </Badge>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tamaño</h3>
                                        <p className="mt-1">{mediaItem.human_readable_size}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de creación</h3>
                                        <p className="mt-1">{formatDateSafe(mediaItem.created_at)}</p>
                                    </div>

                                    {mediaItem.last_modified && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Última modificación</h3>
                                            <p className="mt-1">{formatDateSafe(mediaItem.last_modified)}</p>
                                        </div>
                                    )}

                                    <div className="col-span-1 border-t pt-3 sm:col-span-2 dark:border-zinc-700">
                                        <details className="group">
                                            <summary className="flex cursor-pointer list-none items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                                <span>Información técnica</span>
                                                <span className="ml-auto transition group-open:rotate-180">
                                                    <ChevronDown className="h-4 w-4" />
                                                </span>
                                            </summary>
                                            <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre del archivo</h3>
                                                    <p className="mt-1 text-xs break-all">{mediaItem.file_name}</p>
                                                </div>

                                                {mediaItem.original_filename && mediaItem.original_filename !== mediaItem.file_name && (
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre original</h3>
                                                        <p className="mt-1 text-xs break-all">{mediaItem.original_filename}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">MIME Type</h3>
                                                    <p className="mt-1 text-xs">{mediaItem.mime_type}</p>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Extensión</h3>
                                                    <p className="mt-1 uppercase">{mediaItem.extension}</p>
                                                </div>
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
