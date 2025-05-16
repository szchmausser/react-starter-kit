import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Search',
        href: '/search',
    },
    {
        title: 'Results',
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
    console.log('results formateado:', JSON.stringify(results, null, 2)); // Muestra el objeto con indentación de 2 espacios
    console.log('query: ' + query);

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resultados de Búsqueda" />
            <div className="overflow-hidden">
                <div className="p-3 sm:p-4 md:p-6">
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h1 className="text-xl sm:text-2xl font-semibold">Resultados de búsqueda para: "{query}"</h1>
                        <button
                            onClick={() => router.visit(route('search.index'))}
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-xs font-semibold tracking-widest text-gray-700 uppercase transition duration-150 ease-in-out hover:bg-gray-200 focus:bg-gray-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none active:bg-gray-300"
                        >
                            Nueva búsqueda
                        </button>
                    </div>
                    {Object.entries(results).length > 0 ? (
                        Object.entries(results).map(([type, items]) => (
                            <div key={type} className="mb-6">
                                <h2 className="mb-3 text-lg sm:text-xl font-medium">
                                    {type.includes('individuals') && 'Resultados de Personas Naturales'}
                                    {type.includes('legal_entities') && 'Resultados de Personas Jurídicas'}
                                    {type.includes('legal_cases') && 'Resultados de Expedientes Judiciales'}
                                    {!type.includes('individuals') && !type.includes('legal_entities') && !type.includes('legal_cases') && type}
                                </h2>
                                {items.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {items.map((result) => (
                                            <li key={result.searchable.id} className="py-3 sm:py-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">{result.title}</p>
                                                        <p className="text-sm">{getSecondaryInfo(result, type)}</p>
                                                    </div>
                                                    <Button 
                                                        onClick={() => router.visit(result.url)} 
                                                        className="w-full sm:w-auto bg-blue-500 text-white"
                                                    >
                                                        Ver
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No se encontraron resultados.</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No se encontraron resultados para tu búsqueda.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
