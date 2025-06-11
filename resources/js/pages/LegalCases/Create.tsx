import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch'; // Importar Switch
import AppLayout from '@/layouts/app-layout';
import { type CaseType, type PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Props extends PageProps {
    caseTypes: CaseType[];
}

export default function Create() {
    const { caseTypes } = usePage<Props>().props;
    const [newCaseType, setNewCaseType] = useState('');
    const [selectedCaseTypeId, setSelectedCaseTypeId] = useState('');
    const [showNewCaseTypeInput, setShowNewCaseTypeInput] = useState(false); // Nuevo estado para controlar la visibilidad

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        entry_date: '',
        case_type_id: '',
        new_case_type: '',
    });

    // Efecto para sincronizar los estados locales con los datos del formulario
    useEffect(() => {
        // Cuando cambia el tipo de caso seleccionado, actualizar el formulario
        if (selectedCaseTypeId) {
            setData('case_type_id', selectedCaseTypeId);
            setData('new_case_type', '');
            setShowNewCaseTypeInput(false); // Desactivar el campo de nuevo tipo si se selecciona uno existente
        }
    }, [selectedCaseTypeId]);

    // Efecto para sincronizar el nuevo tipo de caso con los datos del formulario
    useEffect(() => {
        // Cuando cambia el nuevo tipo de caso, actualizar el formulario
        if (newCaseType) {
            setData('new_case_type', newCaseType);
            setData('case_type_id', '');
            // No cambiar showNewCaseTypeInput aquí, ya que el switch lo controla
        }
    }, [newCaseType]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Verificar qué opción está usando el usuario
        if (showNewCaseTypeInput && newCaseType.trim() !== '') {
            // Si el switch está activado y hay un nuevo tipo
            setData('case_type_id', '');
            setData('new_case_type', newCaseType.trim());
        } else if (selectedCaseTypeId) {
            // Si hay un tipo seleccionado
            setData('new_case_type', '');
            setData('case_type_id', selectedCaseTypeId);
        } else {
            // Si ninguna opción es válida, no enviar el formulario o mostrar un error
            // Esto ya debería ser manejado por la validación de Inertia/Laravel
            console.warn('No se ha seleccionado ni creado un tipo de caso.');
            return;
        }

        // Pequeño retraso para asegurar que los datos se actualicen antes de enviar
        setTimeout(() => {
            post(route('legal-cases.store'), {
                onSuccess: () => reset(),
            });
        }, 10);
    };

    // Manejar cambio en el selector de tipo de caso
    const handleCaseTypeChange = (value: string) => {
        setSelectedCaseTypeId(value);
        // Limpiar el campo de nuevo tipo cuando se selecciona uno existente
        if (value) {
            setNewCaseType('');
            setShowNewCaseTypeInput(false); // Asegurarse de que el switch esté desactivado
        }
    };

    // Manejar cambio en el campo de nuevo tipo de caso
    const handleNewCaseTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewCaseType(value);
        // Limpiar la selección existente cuando se escribe un nuevo tipo
        if (value.trim() !== '') {
            setSelectedCaseTypeId('');
        }
    };

    return (
        <AppLayout>
            <Head title="Crear Expediente Legal" />

            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h2 className="mb-4 text-xl font-semibold">Crear Nuevo Expediente</h2>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Código de Expediente
                                </Label>
                                <div className="mt-1">
                                    <Input
                                        id="code"
                                        type="text"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        required
                                        autoFocus
                                        placeholder="EXP-2023-001"
                                    />
                                </div>
                                <InputError message={errors.code} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="entry_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Fecha de Entrada
                                </Label>
                                <div className="mt-1">
                                    <Input
                                        id="entry_date"
                                        type="date"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600"
                                        value={data.entry_date}
                                        onChange={(e) => setData('entry_date', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.entry_date} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="case_type_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tipo de Caso
                                </Label>

                                <div className="mt-1 space-y-4">
                                    <Select
                                        value={selectedCaseTypeId}
                                        onValueChange={handleCaseTypeChange}
                                        disabled={showNewCaseTypeInput} // Deshabilitar si el switch está activado
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione un tipo de caso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {caseTypes.map((caseType) => (
                                                <SelectItem key={caseType.id} value={caseType.id.toString()}>
                                                    {caseType.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="mt-4 flex items-center space-x-2">
                                        <Switch
                                            id="create-new-case-type"
                                            checked={showNewCaseTypeInput}
                                            onCheckedChange={(checked) => {
                                                setShowNewCaseTypeInput(checked);
                                                if (checked) {
                                                    setSelectedCaseTypeId(''); // Limpiar la selección si se activa el switch
                                                } else {
                                                    setNewCaseType(''); // Limpiar el campo de nuevo tipo si se desactiva el switch
                                                }
                                            }}
                                        />
                                        <Label htmlFor="create-new-case-type">Crear un nuevo tipo de caso</Label>
                                    </div>

                                    {showNewCaseTypeInput && (
                                        <div>
                                            <Input
                                                placeholder="Nombre del nuevo tipo de caso"
                                                value={newCaseType}
                                                onChange={handleNewCaseTypeChange}
                                                className="block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-zinc-800"
                                            />
                                        </div>
                                    )}
                                </div>

                                <InputError message={errors.case_type_id || errors.new_case_type} className="mt-2" />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Crear Expediente
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
