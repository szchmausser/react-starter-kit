import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch'; // Importar Switch
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    existingTypes: string[];
}

const Page = ({ existingTypes }: Props) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: '',
    });

    const [newTagType, setNewTagType] = useState('');
    const [selectedTagType, setSelectedTagType] = useState('');
    const [showNewTypeInput, setShowNewTypeInput] = useState(false);

    // Efecto para sincronizar los estados locales con los datos del formulario
    useEffect(() => {
        if (selectedTagType) {
            setData('type', selectedTagType);
            setNewTagType('');
            setShowNewTypeInput(false);
        }
    }, [selectedTagType]);

    useEffect(() => {
        if (newTagType) {
            setData('type', newTagType);
            setSelectedTagType('');
        }
    }, [newTagType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // La lógica de setData en los useEffects y handlers ya asegura que data.type
        // tenga el valor correcto (nuevo tipo, tipo seleccionado o cadena vacía).
        // No es necesario un control condicional aquí, ya que el backend maneja 'nullable'.

        post(route('tags.store'), {
            onSuccess: () => {
                toast.success('Etiqueta creada exitosamente');
                reset();
                setNewTagType('');
                setSelectedTagType('');
                setShowNewTypeInput(false);
            },
            onError: () => {
                toast.error('Error al crear la etiqueta');
            },
            preserveScroll: true,
        });
    };

    const handleSelectTypeChange = (value: string) => {
        setSelectedTagType(value === 'none' ? '' : value);
    };

    const handleNewTypeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewTagType(value);
        if (value.trim() !== '') {
            setSelectedTagType('');
        }
    };

    return (
        <AppLayout>
            <Head title="Crear Etiqueta" />

            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h2 className="mb-4 text-xl font-semibold">Crear Nueva Etiqueta</h2>

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
                                            onCheckedChange={(checked) => {
                                                setShowNewTypeInput(checked);
                                                if (checked) {
                                                    setSelectedTagType('');
                                                } else {
                                                    setNewTagType('');
                                                }
                                            }}
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
                                    {processing ? 'Guardando...' : 'Guardar etiqueta'}
                                </Button>
                            </CardFooter>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Page;
