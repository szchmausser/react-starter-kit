import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Search',
        href: '/search',
    },
];

export default function SearchIndex() {
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
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
            <Head title="Búsqueda de Usuarios" />
            <div className="w-full px-4 sm:px-6 md:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto flex">
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 sm:p-8 md:p-12">
                    <HeadingSmall title="Formulario de busqueda de expedientes:" description='Busque por codigo de expediente, cedula o nombres de participante.'/>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <Input
                            id="query"
                            name="query"
                            type="text"
                            required
                            tabIndex={1}
                            autoComplete="query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Escriba un patron de busqueda..."
                        />
                        <div className="flex justify-center">
                        <Button type="submit" className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3" tabIndex={2}>Buscar</Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
