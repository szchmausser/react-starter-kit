import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error('Debe seleccionar un archivo');
            return;
        }

        if (!name) {
            toast.error('Debe ingresar un nombre para el archivo');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('file', file);

        router.post(route('legal-cases.media.store', legalCase.id), formData, {
            onSuccess: () => {
                // El servidor ya se encarga de la redirección y los mensajes flash
                // No necesitamos hacer nada más aquí
            },
            onError: (errors) => {
                setIsUploading(false);
                if (errors.file) {
                    toast.error(`Error: ${errors.file}`);
                } else {
                    toast.error('Error al subir el archivo');
                }
            },
            onFinish: () => {
                setIsUploading(false);
            },
            forceFormData: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Subir Archivo - Expediente: ${legalCase.code}`} />
            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-xl font-bold">Subir Archivo - Expediente: {legalCase.code}</h1>
                            <Button
                                onClick={() => router.visit(route('legal-cases.show', legalCase.id))}
                                variant="outline"
                                size="sm"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al Expediente
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
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
                                <Label htmlFor="file">Archivo *</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="file"
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileChange}
                                        required
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
                                        Archivo seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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
                                    {isUploading ? 'Subiendo...' : 'Subir Archivo'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 