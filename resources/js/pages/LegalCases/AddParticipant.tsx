import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface LegalCase {
    id: number;
    code: string;
}

interface SearchResult {
    id: number;
    type: 'individual' | 'entity';
    name: string;
    identifier: string;
}

interface Props {
    legalCase: LegalCase;
    availableRoles: string[];
}

export default function AddParticipant({ legalCase, availableRoles }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
    const [selectedRole, setSelectedRole] = useState(availableRoles[0]); // Por defecto selecciona el primer rol
    const [isSubmitting, setIsSubmitting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Búsqueda',
            href: route('search.index'),
        },
        {
            title: `Expediente: ${legalCase.code}`,
            href: route('legal-cases.show', legalCase.id),
        },
        {
            title: 'Añadir Participante',
            href: route('case-participants.add-form', legalCase.id),
        },
    ];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery || searchQuery.length < 2) return;

        setIsSearching(true);
        setSearchResults([]);
        setSelectedResult(null);

        try {
            const response = await axios.post(route('case-participants.search', legalCase.id), {
                query: searchQuery,
            });

            setSearchResults(response.data.results || []);
        } catch (error) {
            console.error('Error al buscar:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result: SearchResult) => {
        setSelectedResult(result);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedResult || isSubmitting) return;

        setIsSubmitting(true);

        router.post(
            route('case-participants.associate', legalCase.id),
            {
                id: selectedResult.id,
                type: selectedResult.type,
                role: selectedRole,
            },
            {
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            backButton={{
                show: true,
                onClick: () =>
                    router.visit(route('legal-cases.show', legalCase.id), {
                        preserveState: false,
                        replace: true,
                    }),
                label: 'Volver',
            }}
        >
            <Head title={`Añadir Participante al Expediente: ${legalCase.code}`} />

            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <div className="mb-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold">Añadir Participante al Expediente</h1>
                            </div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Expediente: {legalCase.code}</p>
                        </div>

                        {/* Búsqueda */}
                        <div className="mb-6">
                            <h2 className="mb-4 text-xl font-semibold">Buscar Persona o Entidad</h2>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Buscar por nombre, cédula o RIF..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full"
                                        minLength={2}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={isSearching || searchQuery.length < 2} className="flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Buscar
                                </Button>
                            </form>
                        </div>

                        {/* Resultados de la búsqueda */}
                        {isSearching ? (
                            <div className="py-8 text-center">
                                <p>Buscando...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="mb-6">
                                <h2 className="mb-4 text-xl font-semibold">Resultados de la búsqueda</h2>
                                <div className="rounded-md bg-gray-50 dark:bg-zinc-800">
                                    <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
                                        {searchResults.map((result) => (
                                            <li
                                                key={`${result.type}-${result.id}`}
                                                className={`cursor-pointer p-4 transition-colors ${
                                                    selectedResult?.id === result.id && selectedResult?.type === result.type
                                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                                        : 'hover:bg-gray-100 dark:hover:bg-zinc-700'
                                                }`}
                                                onClick={() => handleSelectResult(result)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{result.name}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {result.type === 'individual' ? 'Cédula:' : 'RIF:'} {result.identifier}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {result.type === 'individual' ? 'Persona Natural' : 'Entidad Legal'}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : searchResults.length === 0 && searchQuery && !isSearching ? (
                            <div className="mb-6 rounded-md bg-gray-50 py-8 text-center dark:bg-zinc-800">
                                <p>No se encontraron resultados para "{searchQuery}"</p>
                            </div>
                        ) : null}

                        {/* Selección de rol y formulario de envío */}
                        {selectedResult && (
                            <form onSubmit={handleSubmit} className="rounded-md border p-4 dark:border-zinc-700">
                                <h2 className="mb-4 text-xl font-semibold">Asignar Rol</h2>

                                <div className="mb-4">
                                    <p className="font-medium">Participante seleccionado:</p>
                                    <div className="mt-2 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                                        <p className="font-medium">{selectedResult.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedResult.type === 'individual' ? 'Cédula:' : 'RIF:'} {selectedResult.identifier}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="mb-2 font-medium">Seleccione un rol:</p>
                                    <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="flex flex-col space-y-2">
                                        {availableRoles.map((role) => (
                                            <div key={role} className="flex items-center space-x-2">
                                                <RadioGroupItem value={role} id={`role-${role}`} />
                                                <Label htmlFor={`role-${role}`}>{role}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <Button
                                    type="submit"
                                    className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                                    disabled={isSubmitting}
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Añadir Participante
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
