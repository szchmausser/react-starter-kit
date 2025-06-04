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

export default function MediaCreate() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/' },
        { title: 'Biblioteca de Archivos', href: route('media-library.index') },
        { title: 'Subir Archivo', href: route('media-library.create') },
    ];

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);

        if (selectedFile) {
            // Establecer el nombre del archivo como el nombre por defecto si no se ha establecido
            if (!name) {
                const fileName = selectedFile.name.replace(/\.[^/.]+$/, ""); // Quitar extensión
                setName(fileName);
            }

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
        } else {
            setFilePreview(null);
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
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);
        if (file) {
            formData.append('file', file);
        }

        router.post(route('media-library.store'), formData, {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subir Archivo" />

            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Subir Nuevo Archivo</h1>
                    <Link href={route('media-library.index')}>
                        <Button variant="outline">
                            <ChevronLeftIcon className="h-4 w-4 mr-2" />
                            Volver al listado
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Archivo</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="file">Seleccionar Archivo</Label>
                                        <div
                                            className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center ${errors.file ? 'border-red-500' : 'border-gray-300'
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

                                            {filePreview ? (
                                                <div className="w-full text-center">
                                                    <img
                                                        src={filePreview}
                                                        alt="Vista previa"
                                                        className="max-h-[150px] mx-auto object-contain mb-4"
                                                    />
                                                    <p className="text-sm text-gray-600 truncate">{file?.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {file?.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                                                    </p>
                                                </div>
                                            ) : file ? (
                                                <div className="w-full text-center">
                                                    <FileIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-sm text-gray-600 truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadIcon className="h-12 w-12 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600">
                                                        Arrastra y suelta un archivo aquí o haz clic para seleccionar
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Tamaño máximo: 10MB
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
                                            value={description}
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
                                            value={category}
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
                    </div>

                    {isUploading && (
                        <Card>
                            <CardContent className="py-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Subiendo archivo...</span>
                                        <span className="text-sm">{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Separator />

                    <div className="flex justify-end space-x-4">
                        <Link href={route('media-library.index')}>
                            <Button variant="outline" type="button" disabled={isUploading}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isUploading || !file}>
                            {isUploading ? 'Subiendo...' : 'Subir Archivo'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
} 