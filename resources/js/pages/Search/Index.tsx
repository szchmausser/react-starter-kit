import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Búsqueda',
        href: '/search',
    },
];

export default function SearchIndex() {
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim().length === 0) return;
        
        router.get(
            route('search.results'),
            { query },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Búsqueda de Expedientes" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl font-semibold mb-6 text-center">Sistema de Búsqueda</h1>
                
                <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                    <div className="border rounded-md overflow-hidden">
                        <div className="bg-gray-100 px-4 py-3 font-medium border-b">
                            Formulario de Búsqueda
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 mb-6 text-center">
                                Busque por código de expediente, cédula o nombres de participantes, RIF o razón social de entidades.
                            </p>
                            
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="relative">
                                    <Input
                                        id="query"
                                        name="query"
                                        type="text"
                                        required
                                        tabIndex={1}
                                        autoComplete="off"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Escriba un patrón de búsqueda..."
                                        className="pl-10 py-6 text-lg"
                                    />
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                </div>
                                
                                <div className="flex justify-center">
                                    <Button 
                                        type="submit" 
                                        className="px-8 py-6 h-auto bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
                                        tabIndex={2}
                                        disabled={query.trim().length === 0}
                                    >
                                        Buscar
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <div className="mt-6 p-4 text-sm text-center text-gray-500">
                        Ingrese términos específicos para obtener resultados más precisos.
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
