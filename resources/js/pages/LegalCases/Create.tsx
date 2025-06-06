import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { type CaseType, type PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props extends PageProps {
    caseTypes: CaseType[];
}

export default function Create() {
    const { caseTypes } = usePage<Props>().props;
    const [newCaseType, setNewCaseType] = useState('');
    const [selectedCaseTypeId, setSelectedCaseTypeId] = useState('');

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
        }
    }, [selectedCaseTypeId]);

    // Efecto para sincronizar el nuevo tipo de caso con los datos del formulario
    useEffect(() => {
        // Cuando cambia el nuevo tipo de caso, actualizar el formulario
        if (newCaseType) {
            setData('new_case_type', newCaseType);
            setData('case_type_id', '');
        }
    }, [newCaseType]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Verificar qué opción está usando el usuario
        if (newCaseType.trim() !== '') {
            // Si hay un nuevo tipo de caso, asegurarse de que case_type_id esté vacío
            setData('case_type_id', '');
            setData('new_case_type', newCaseType.trim());
        } else if (selectedCaseTypeId) {
            // Si hay un tipo seleccionado, asegurarse de que new_case_type esté vacío
            setData('new_case_type', '');
            setData('case_type_id', selectedCaseTypeId);
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

            <div className="py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
                <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Crear Expediente Legal</h2>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Código de Expediente
                                </Label>
                                <div className="mt-1">
                                    <Input
                                        id="code"
                                        type="text"
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md"
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
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md"
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

                                    <div>
                                        <div className="flex items-center mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Crear un tipo de caso</span>
                                        </div>
                                        <Input
                                            placeholder="Nombre del nuevo tipo de caso"
                                            value={newCaseType}
                                            onChange={handleNewCaseTypeChange}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800"
                                        />
                                    </div>
                                </div>

                                <InputError message={errors.case_type_id || errors.new_case_type} className="mt-2" />

                                {/* Mensaje de ayuda para el usuario */}
                                {selectedCaseTypeId && newCaseType && (
                                    <p className="text-amber-500 dark:text-amber-400 text-xs mt-1">
                                        Atención: Has seleccionado un tipo de caso existente y también has ingresado un nuevo tipo.
                                        Se utilizará el nuevo tipo que has ingresado.
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                        className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800"
                                    >
                                        {processing ? 'Guardando...' : 'Guardar Expediente'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 