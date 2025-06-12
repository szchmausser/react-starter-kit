import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Building2, FileText, Search, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Búsqueda',
        href: '/search',
    },
    {
        title: 'Resultados',
        href: '/results',
    },
];

interface SearchResultItem {
    title: string;
    url: string;
    searchable: {
        id: number;
        // Campos de User
        name?: string;
        email?: string;
        // Campos de Individual
        national_id?: string;
        first_name?: string;
        last_name?: string;
        // Campos de LegalEntity
        rif?: string;
        business_name?: string;
        // Campos de LegalCase
        code?: string;
    };
}

interface Props {
    results: {
        [key: string]: SearchResultItem[];
    };
    query: string;
}

export default function SearchResults({ results, query }: Props) {
    // Función para obtener la información secundaria según el tipo de resultado
    const getSecondaryInfo = (result: SearchResultItem, type: string): string => {
        const { searchable } = result;

        // Personas naturales
        if (type.includes('individuals')) {
            return `ID: ${searchable.national_id || 'N/A'}`;
        }

        // Personas jurídicas
        if (type.includes('legal_entities')) {
            return `RIF: ${searchable.rif || 'N/A'}`;
        }

        // Expedientes judiciales
        if (type.includes('legal_cases')) {
            return `Código: ${searchable.code || 'N/A'}`;
        }

        return '';
    };

    // Función para obtener el icono según el tipo de resultado
    const getIcon = (type: string) => {
        if (type.includes('individuals')) {
            return <User className="h-5 w-5 text-blue-500" />;
        }
        if (type.includes('legal_entities')) {
            return <Building2 className="h-5 w-5 text-green-500" />;
        }
        if (type.includes('legal_cases')) {
            return <FileText className="h-5 w-5 text-amber-500" />;
        }
        return null;
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            backButton={{
                show: true,
                onClick: () =>
                    router.visit(route('search.index'), {
                        preserveState: false,
                        replace: true,
                    }),
                label: 'Volver',
            }}
        >
            <Head title="Resultados de Búsqueda" />
            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center">
                                <Search className="mr-2 h-6 w-6 text-gray-500 dark:text-gray-400" />
                                <h1 className="text-2xl font-semibold">Resultados de búsqueda</h1>
                            </div>
                        </div>

                        <div className="mb-6 overflow-hidden rounded-md border dark:border-zinc-700">
                            <div className="border-b bg-gray-100 px-4 py-2 font-medium dark:border-zinc-700 dark:bg-zinc-900">
                                <span className="dark:text-gray-200">Criterio de búsqueda</span>
                            </div>
                            <div className="p-4 dark:bg-zinc-900">
                                <p className="text-gray-700 dark:text-gray-300">
                                    Término buscado: <span className="font-semibold">"{query}"</span>
                                </p>
                            </div>
                        </div>

                        {Object.entries(results).length > 0 ? (
                            Object.entries(results).map(([type, items]) => (
                                <div key={type} className="mb-6 overflow-hidden rounded-md border dark:border-zinc-700">
                                    <div className="flex items-center border-b bg-gray-100 px-4 py-3 font-medium dark:border-zinc-700 dark:bg-zinc-900">
                                        {getIcon(type)}
                                        <span className="ml-2 dark:text-gray-200">
                                            {type.includes('individuals') && 'Personas Naturales'}
                                            {type.includes('legal_entities') && 'Personas Jurídicas'}
                                            {type.includes('legal_cases') && 'Expedientes Judiciales'}
                                            {!type.includes('individuals') &&
                                                !type.includes('legal_entities') &&
                                                !type.includes('legal_cases') &&
                                                type}
                                        </span>
                                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                            ({items.length} {items.length === 1 ? 'resultado' : 'resultados'})
                                        </span>
                                    </div>
                                    {items.length > 0 ? (
                                        <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                                            {items.map((result) => (
                                                <li
                                                    key={result.searchable.id}
                                                    className="p-4 hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-gray-900"
                                                >
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-lg font-medium dark:text-white">{result.title}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {getSecondaryInfo(result, type)}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            onClick={() => router.visit(result.url)}
                                                            className="w-full bg-blue-500 text-white hover:bg-blue-600 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
                                                            size="sm"
                                                        >
                                                            Ver Detalles
                                                        </Button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 dark:bg-zinc-900 dark:text-gray-400">
                                            No se encontraron resultados.
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="overflow-hidden rounded-md border dark:border-zinc-700">
                                <div className="border-b bg-gray-100 px-4 py-2 font-medium dark:border-zinc-700 dark:bg-zinc-900">
                                    <span className="dark:text-gray-200">Sin resultados</span>
                                </div>
                                <div className="p-6 text-center text-gray-500 dark:bg-zinc-900 dark:text-gray-400">
                                    No se encontraron resultados para tu búsqueda. Intenta con otros términos o revisa la ortografía.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
