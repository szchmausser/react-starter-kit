import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, FileIcon, Upload } from 'lucide-react';
import React, { useState } from 'react';

interface LegalCase {
    id: number;
    code: string;
}

interface Props {
    legalCase: LegalCase;
}

export default function MediaCreate({ legalCase }: Props) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
            title: 'Subir Archivo',
            href: route('legal-cases.media.create', legalCase.id),
        },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Si no se ha ingresado un nombre, usar el nombre del archivo
            if (!name) {
                // Eliminar la extensión del nombre del archivo
                const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
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
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setErrors({ file: 'Debe seleccionar un archivo' });
            return;
        }

        if (!name) {
            setErrors({ name: 'Debe ingresar un nombre para el archivo' });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        // Simular intervalos de progreso
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
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
        formData.append('file', file);

        router.post(route('legal-cases.media.store', legalCase.id), formData, {
            onSuccess: () => {
                clearInterval(progressInterval);
                setUploadProgress(100);
                // El servidor ya se encarga de la redirección y los mensajes flash
            },
            onError: (errors) => {
                clearInterval(progressInterval);
                setIsUploading(false);
                setErrors(errors);
            },
            onFinish: () => {
                // No hacemos nada aquí para mantener la barra de progreso
            },
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Subir Archivo - Expediente: ${legalCase.code}`} />
            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Subir Archivo - Expediente: {legalCase.code}</h1>
                    <Button onClick={() => router.visit(route('legal-cases.media.index', legalCase.id))} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Archivos
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Archivo</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="file">Seleccionar Archivo</Label>
                                        <div
                                            className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 ${
                                                errors.file ? 'border-red-500' : 'border-gray-300'
                                            } ${isUploading ? 'opacity-50' : 'hover:border-primary cursor-pointer'}`}
                                            onClick={() => {
                                                if (!isUploading) {
                                                    document.getElementById('file')?.click();
                                                }
                                            }}
                                        >
                                            <input id="file" type="file" onChange={handleFileChange} className="hidden" disabled={isUploading} />

                                            {filePreview ? (
                                                <div className="w-full text-center">
                                                    <img src={filePreview} alt="Vista previa" className="mx-auto mb-4 max-h-[150px] object-contain" />
                                                    <p className="truncate text-sm text-gray-600 dark:text-gray-400">{file?.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                                        {file?.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                                                    </p>
                                                </div>
                                            ) : file ? (
                                                <div className="w-full text-center">
                                                    <FileIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                                    <p className="truncate text-sm text-gray-600 dark:text-gray-400">{file.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="mb-2 h-12 w-12 text-gray-400" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Arrastra y suelta un archivo aquí o haz clic para seleccionar
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Tamaño máximo: 10MB</p>
                                                </>
                                            )}
                                        </div>
                                        {errors.file && <p className="text-xs text-red-500">{errors.file}</p>}
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
                                            placeholder="Ej: Contrato de compraventa"
                                            className={errors.name ? 'border-red-500' : ''}
                                            disabled={isUploading}
                                        />
                                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descripción (opcional)</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Breve descripción del archivo"
                                            rows={4}
                                            className={errors.description ? 'border-red-500' : ''}
                                            disabled={isUploading}
                                        />
                                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoría (opcional)</Label>
                                        <Input
                                            id="category"
                                            type="text"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            placeholder="Ej: Contrato, Factura, Recibo"
                                            className={errors.category ? 'border-red-500' : ''}
                                            disabled={isUploading}
                                        />
                                        {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('legal-cases.media.index', legalCase.id))}
                            disabled={isUploading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isUploading || !file}>
                            {isUploading ? 'Subiendo...' : 'Subir Archivo'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
