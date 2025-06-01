import { useState, FormEvent, ChangeEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChevronLeftIcon, UploadIcon, FileIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

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

interface MediaEditProps {
    mediaItem: Media;
}

export default function MediaEdit({ mediaItem }: MediaEditProps) {
    const [name, setName] = useState(mediaItem.name || '');
    const [description, setDescription] = useState(mediaItem.description || '');
    const [category, setCategory] = useState(mediaItem.category || '');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(mediaItem.thumbnail || null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/' },
        { title: 'Biblioteca de Archivos', href: route('media-library.index') },
        { title: 'Editar Archivo', href: route('media-library.edit', mediaItem.id) },
    ];

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);

        if (selectedFile) {
            // Crear una vista previa para imágenes
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFilePreview(e.target?.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true);
        setUploadProgress(0);

        // Simular intervalos de progreso
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 95) {
                    clearInterval(progressInterval);
                    return 95;
                }
                return prev + 5;
            });
        }, 200);

        const formData = new FormData();
        formData.append('_method', 'PUT'); // Para emular PUT con FormData
        formData.append('name', name);
        formData.append('description', description || '');
        formData.append('category', category || '');

        if (file) {
            formData.append('file', file);
        }

        router.post(route('media-library.update', mediaItem.id), formData, {
            forceFormData: true,
            onProgress: (progress) => {
                if (progress && progress.percentage) {
                    // setUploadProgress(progress.percentage);
                }
            },
            onSuccess: () => {
                clearInterval(progressInterval);
                setUploadProgress(100);
            },
            onError: (errors) => {
                clearInterval(progressInterval);
                setIsUploading(false);
                setErrors(errors);
            },
            onFinish: () => {
                // setIsUploading(false);
            }
        });
    };

    const getFileIcon = () => {
        if (!mediaItem.mime_type) return <FileIcon className="h-12 w-12 text-gray-400" />;

        if (mediaItem.mime_type.startsWith('image/')) {
            return filePreview ? (
                <img src={filePreview} alt="Vista previa" className="max-h-[120px] object-contain" />
            ) : <FileIcon className="h-12 w-12 text-gray-400" />;
        }

        return <FileIcon className="h-12 w-12 text-gray-400" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar: ${mediaItem.name}`} />

            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Editar Archivo</h1>
                    <Link href={route('media-library.show', mediaItem.id)}>
                        <Button variant="outline">
                            <ChevronLeftIcon className="h-4 w-4 mr-2" />
                            Volver a los detalles
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información del Archivo</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={errors.name ? 'border-red-500' : ''}
                                            disabled={isUploading}
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descripción</Label>
                                        <Textarea
                                            id="description"
                                            value={description || ''}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            className={errors.description ? 'border-red-500' : ''}
                                            disabled={isUploading}
                                        />
                                        {errors.description && (
                                            <p className="text-xs text-red-500">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoría</Label>
                                        <Input
                                            id="category"
                                            type="text"
                                            value={category || ''}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className={errors.category ? 'border-red-500' : ''}
                                            disabled={isUploading}
                                        />
                                        {errors.category && (
                                            <p className="text-xs text-red-500">{errors.category}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Archivo Actual</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col items-center justify-center p-4 text-center">
                                        {mediaItem.thumbnail ? (
                                            <img
                                                src={mediaItem.thumbnail}
                                                alt={mediaItem.name}
                                                className="max-h-[120px] mx-auto object-contain mb-4"
                                            />
                                        ) : (
                                            <FileIcon className="h-16 w-16 text-gray-400 mb-4" />
                                        )}
                                        <p className="text-sm font-medium">{mediaItem.file_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{mediaItem.human_readable_size}</p>
                                        <p className="text-xs text-gray-500">{mediaItem.mime_type}</p>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t">
                                        <Label htmlFor="file">Reemplazar archivo (opcional)</Label>
                                        <div
                                            className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center ${errors.file ? 'border-red-500' : 'border-gray-300'
                                                } ${isUploading ? 'opacity-50' : 'hover:border-primary cursor-pointer'}`}
                                            onClick={() => {
                                                if (!isUploading) {
                                                    document.getElementById('file')?.click();
                                                }
                                            }}
                                        >
                                            <input
                                                id="file"
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                disabled={isUploading}
                                            />

                                            {file ? (
                                                <div className="w-full text-center">
                                                    {file.type.startsWith('image/') && filePreview ? (
                                                        <img
                                                            src={filePreview}
                                                            alt="Vista previa"
                                                            className="max-h-[100px] mx-auto object-contain mb-2"
                                                        />
                                                    ) : (
                                                        <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                                    )}
                                                    <p className="text-sm text-gray-600 truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600">
                                                        Seleccionar nuevo archivo
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {errors.file && (
                                            <p className="text-xs text-red-500">{errors.file}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {isUploading && (
                        <Card>
                            <CardContent className="py-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Actualizando archivo...</span>
                                        <span className="text-sm">{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Separator />

                    <div className="flex justify-end space-x-4">
                        <Link href={route('media-library.show', mediaItem.id)}>
                            <Button variant="outline" type="button" disabled={isUploading}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isUploading}>
                            {isUploading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
} 