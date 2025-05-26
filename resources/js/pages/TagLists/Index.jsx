import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, Tag as TagIcon } from 'lucide-react';

export default function TagListsIndex({ tagLists, filters }) {
    const [search, setSearch] = React.useState(filters.search || '');
    
    // Filtrar etiquetas localmente para una mejor experiencia de usuario
    const filteredTagLists = React.useMemo(() => {
        if (!search) return tagLists;
        const searchLower = search.toLowerCase();
        return tagLists.filter(tag => 
            tag.name.toLowerCase().includes(searchLower) ||
            (tag.description && tag.description.toLowerCase().includes(searchLower))
        );
    }, [tagLists, search]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('tag-lists.index'), { search }, { preserveState: true });
    };

    return (
        <AppLayout
            title="Lista de Etiquetas"
            header={{
                title: 'Lista de Etiquetas',
                description: 'Gestione las etiquetas disponibles para asignar a los casos legales.',
                actions: (
                    <Button asChild>
                        <Link href={route('tag-lists.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Etiqueta
                        </Link>
                    </Button>
                ),
            }}
        >
            <Head title="Lista de Etiquetas" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <form onSubmit={handleSearch} className="w-full sm:max-w-sm">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar etiquetas..."
                                className="w-full pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </form>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Fecha de creación</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTagLists.length > 0 ? (
                                filteredTagLists.map((tag) => (
                                    <TableRow key={tag.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <TagIcon className="h-4 w-4 text-muted-foreground" />
                                                {tag.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {tag.description || 'Sin descripción'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(tag.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link href={route('tag-lists.edit', tag.id)}>
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Editar</span>
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        if (confirm('¿Está seguro de que desea eliminar esta etiqueta?')) {
                                                            router.delete(route('tag-lists.destroy', tag.id));
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No se encontraron etiquetas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}

// Asegúrate de que la página se muestre sin el diseño de autenticación
TagListsIndex.layout = page => <AppLayout children={page} />;
