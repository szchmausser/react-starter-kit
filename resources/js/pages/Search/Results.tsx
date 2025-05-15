import { Head, router } from '@inertiajs/react';

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
    console.log("results formateado:", JSON.stringify(results, null, 2)); // Muestra el objeto con indentación de 2 espacios
    console.log("query: " + query)

    // Función para obtener la información secundaria según el tipo de resultado
    const getSecondaryInfo = (result: SearchResultItem, type: string): string => {
        const { searchable } = result;
        
        // Usuarios
        if (type.includes('User')) {
            return searchable.email || '';
        }
        
        // Personas naturales
        if (type.includes('Individual')) {
            return `Cédula: ${searchable.national_id || 'N/A'}`;
        }
        
        // Personas jurídicas
        if (type.includes('LegalEntity')) {
            return `RIF: ${searchable.rif || 'N/A'}`;
        }
        
        // Expedientes judiciales
        if (type.includes('LegalCase')) {
            return `Código: ${searchable.code || 'N/A'}`;
        }
        
        return '';
    };

    return (
        <>
            <Head title="Resultados de Búsqueda" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-2xl font-semibold">
                                    Resultados de búsqueda para: "{query}"
                                </h1>
                                <button
                                    onClick={() => router.visit(route('search.index'))}
                                    className="inline-flex items-center px-4 py-2 bg-gray-100 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Nueva búsqueda
                                </button>
                            </div>
                            {Object.entries(results).length > 0 ? (
                                Object.entries(results).map(([type, items]) => (
                                    <div key={type} className="mb-6">
                                        <h2 className="text-xl font-medium mb-3">
                                            {type.includes('User') && 'Usuarios'}
                                            {type.includes('Individual') && 'Personas Naturales'}
                                            {type.includes('LegalEntity') && 'Personas Jurídicas'}
                                            {type.includes('LegalCase') && 'Expedientes Judiciales'}
                                            {!type.includes('User') && !type.includes('Individual') && 
                                             !type.includes('LegalEntity') && !type.includes('LegalCase') && type}
                                        </h2>
                                        {items.length > 0 ? (
                                            <ul className="divide-y divide-gray-200">
                                                {items.map((result) => (
                                                    <li key={result.searchable.id} className="py-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {result.title}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {getSecondaryInfo(result, type)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <a
                                                                    href={result.url}
                                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                >
                                                                    Ver detalles
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">No se encontraron resultados.</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No se encontraron resultados para tu búsqueda.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 