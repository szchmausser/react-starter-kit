import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, FileText, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MediaItem {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    human_readable_size: string;
    extension: string;
    description?: string;
    category?: string;
    file_url: string;
    created_at: string;
    updated_at: string;
}

interface LegalCase {
    id: number;
    code: string;
}

interface Props {
    mediaItem: MediaItem;
    legalCase: LegalCase;
}

export default function MediaEdit({ mediaItem, legalCase }: Props) {
    const [name, setName] = useState(mediaItem.name || '');
    const [description, setDescription] = useState(mediaItem.description || '');
    const [category, setCategory] = useState(mediaItem.category || '');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            title: 'Editar Archivo',
            href: route('legal-cases.media.edit', [legalCase.id, mediaItem.id]),
        },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name) {
            toast.error('Debe ingresar un nombre para el archivo');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('_method', 'PUT'); // Para simular el método PUT
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);

        if (file) {
            formData.append('file', file);
        }

        router.post(route('legal-cases.media.update', [legalCase.id, mediaItem.id]), formData, {
            onSuccess: () => {
                // El servidor ya se encarga de la redirección y los mensajes flash
                // No necesitamos hacer nada más aquí
            },
            onError: (errors) => {
                setIsUploading(false);
                if (errors.file) {
                    toast.error(`Error: ${errors.file}`);
                } else {
                    toast.error('Error al actualizar el archivo');
                }
            },
            onFinish: () => {
                setIsUploading(false);
            },
            forceFormData: true
        });
    };

    // Determinar el icono según el tipo MIME
    const getFileIcon = () => {
        if (mediaItem.mime_type.startsWith('image/')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-blue-500">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            );
        } else if (mediaItem.mime_type === 'application/pdf') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-red-500">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15v-1h6v1" />
                    <path d="M11 18v-6" />
                    <path d="M9 12v-1h6v1" />
                </svg>
            );
        } else if (mediaItem.mime_type.startsWith('video/')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-purple-500">
                    <path d="m10 7 5 3-5 3Z" />
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                </svg>
            );
        } else {
            return <FileText className="h-16 w-16 text-gray-500" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Archivo - Expediente: ${legalCase.code}`} />
            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-xl font-bold">Editar Archivo - Expediente: {legalCase.code}</h1>
                            <Button
                                onClick={() => router.visit(route('legal-cases.show', legalCase.id))}
                                variant="outline"
                                size="sm"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al Expediente
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre del archivo *</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ej: Contrato de compraventa"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descripción (opcional)</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Breve descripción del archivo"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoría (opcional)</Label>
                                        <Input
                                            id="category"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            placeholder="Ej: Contrato, Factura, Recibo"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="file">Reemplazar archivo (opcional)</Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                id="file"
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileChange}
                                                className="max-w-md"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Seleccionar archivo
                                            </Button>
                                        </div>
                                        {file && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Nuevo archivo seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Formatos permitidos: PDF, Word, Excel, imágenes, audio, video. Tamaño máximo: 10MB.
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('legal-cases.show', legalCase.id))}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={isUploading}>
                                            {isUploading ? 'Guardando...' : 'Guardar Cambios'}
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                    <h2 className="mb-4 text-lg font-medium">Archivo Actual</h2>
                                    <div className="flex flex-col items-center">
                                        {getFileIcon()}
                                        <div className="mt-4 text-center">
                                            <p className="font-medium">{mediaItem.file_name}</p>
                                            <p className="mt-1 text-sm text-gray-500">{mediaItem.human_readable_size}</p>
                                            <p className="text-sm text-gray-500">{mediaItem.mime_type}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(route('legal-cases.media.download', [legalCase.id, mediaItem.id]), '_blank')}
                                        >
                                            Descargar Archivo Original
                                        </Button>
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