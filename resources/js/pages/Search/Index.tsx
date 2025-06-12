import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Building2, FileText, Search, User } from 'lucide-react';
import { useState } from 'react';

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
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                <h1 className="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-white">Sistema de Búsqueda</h1>
                <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
                    Encuentre expedientes judiciales, personas y entidades en el sistema
                </p>

                <div className="overflow-hidden border bg-white shadow-lg sm:rounded-xl dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="grid gap-0 md:grid-cols-5">
                        {/* Panel lateral con información */}
                        <div className="border-r bg-gray-50 p-6 md:col-span-2 dark:border-zinc-700 dark:bg-zinc-800">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">¿Qué desea buscar?</h2>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <FileText className="mt-1 h-5 w-5 text-amber-500 dark:text-amber-400" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Expedientes</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Búsqueda por código de expediente</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <User className="mt-1 h-5 w-5 text-blue-500 dark:text-blue-400" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Personas Naturales</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Búsqueda por cédula o nombre</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Building2 className="mt-1 h-5 w-5 text-green-500 dark:text-green-400" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Personas Jurídicas</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Búsqueda por RIF o razón social</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formulario de búsqueda */}
                        <div className="p-6 md:col-span-3">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Formulario de Búsqueda</h2>

                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="relative">
                                    <div className="overflow-hidden rounded-lg border focus-within:ring-2 focus-within:ring-blue-500 dark:border-zinc-700 dark:focus-within:ring-blue-400">
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
                                            className="rounded-none border-0 py-6 pl-12 text-lg focus-visible:border-0 focus-visible:ring-0 dark:border-0 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
                                        />
                                        <Search className="absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2 transform text-gray-400" />
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-4">
                                    <Button
                                        type="submit"
                                        className="h-auto w-full bg-blue-600 px-8 py-6 text-lg font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                        tabIndex={2}
                                        disabled={query.trim().length === 0}
                                    >
                                        <Search className="mr-2 h-5 w-5" />
                                        Buscar
                                    </Button>

                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                        Ingrese términos específicos para obtener resultados más precisos
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
