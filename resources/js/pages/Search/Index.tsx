import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function SearchIndex() {
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('search.results'), { query }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    console.log("query: " + query)
    return (
        <>
            <Head title="Búsqueda de Usuarios" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-4">
                                Búsqueda de Usuarios
                            </h1>
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div>
                                    <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                                        Buscar por nombre o correo electrónico
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="query"
                                            id="query"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Ingrese nombre o correo electrónico..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Buscar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 