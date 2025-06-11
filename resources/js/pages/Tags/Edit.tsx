import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch'; // Importar Switch
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface Tag {
    id: number;
    name: string | Record<string, string>;
    type: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    tag: Tag;
    existingTypes: string[];
}

const Page = ({ tag, existingTypes = [] }: Props) => {
    const { data, setData, put, processing, errors } = useForm({
        name: typeof tag.name === 'string' ? tag.name : tag.name[Object.keys(tag.name)[0]] || '',
        type: tag.type || '',
    });

    const [newTagType, setNewTagType] = useState('');
    const [selectedTagType, setSelectedTagType] = useState(tag.type || ''); // Inicializar con el tipo de la etiqueta
    const [showNewTypeInput, setShowNewTypeInput] = useState(false);

    const handleSelectTypeChange = (value: string) => {
        const typeValue = value === 'none' ? '' : value;
        setSelectedTagType(typeValue);
        setData('type', typeValue); // Actualizar data.type directamente
        setNewTagType('');
        setShowNewTypeInput(false);
    };

    const handleNewTypeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewTagType(value);
        setData('type', value); // Actualizar data.type directamente
        setSelectedTagType('');
    };

    const handleSwitchChange = (checked: boolean) => {
        setShowNewTypeInput(checked);
        if (checked) {
            setSelectedTagType('');
            setData('type', ''); // Limpiar data.type cuando se activa el nuevo tipo
        } else {
            setNewTagType('');
            setData('type', selectedTagType || ''); // Restaurar el tipo seleccionado o vacío
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // La lógica de setData en los handlers ya asegura que data.type
        // tenga el valor correcto (nuevo tipo, tipo seleccionado o cadena vacía).
        // No es necesario un control condicional aquí, ya que el backend maneja 'nullable'.

        put(route('tags.update', tag.id), {
            onSuccess: () => {
                toast.success('Etiqueta actualizada exitosamente');
            },
            onError: () => {
                toast.error('Error al actualizar la etiqueta');
            },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Editar Etiqueta" />

            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h2 className="mb-4 text-xl font-semibold">Editar Etiqueta</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ej: Importante, Urgente, Pendiente"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo (opcional)</Label>

                                    <Select value={selectedTagType || 'none'} onValueChange={handleSelectTypeChange} disabled={showNewTypeInput}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione un tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin tipo</SelectItem>
                                            {existingTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="mt-4 flex items-center space-x-2">
                                        <Switch
                                            id="create-new-tag-type"
                                            checked={showNewTypeInput}
                                            onCheckedChange={handleSwitchChange} // Usar el nuevo manejador
                                        />
                                        <Label htmlFor="create-new-tag-type">Crear un nuevo tipo de etiqueta</Label>
                                    </div>

                                    {showNewTypeInput && (
                                        <div className="space-y-2">
                                            <Input
                                                id="new_type"
                                                value={newTagType}
                                                onChange={handleNewTypeInputChange}
                                                placeholder="Ej: prioridad, estado, categoría"
                                            />
                                        </div>
                                    )}

                                    <p className="text-muted-foreground text-xs">El tipo ayuda a agrupar etiquetas similares</p>
                                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                                </div>
                            </div>

                            <CardFooter className="flex justify-end gap-2 px-0 pb-0">
                                <Button type="button" variant="outline" onClick={() => router.visit(route('tags.index'))}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Actualizando...' : 'Actualizar etiqueta'}
                                </Button>
                            </CardFooter>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

Page.layout = (page: React.ReactNode) => <AppSidebarLayout>{page}</AppSidebarLayout>;

export default Page;
