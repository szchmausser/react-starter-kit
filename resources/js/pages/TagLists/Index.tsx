import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PaginationComponent from '@/components/PaginationComponent';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

interface TagListModel {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
}

interface Props {
    tagLists: TagListModel[];
    filters: {
        search: string;
    };
}

const ITEMS_PER_PAGE = 10;

export default function Index({ tagLists, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [tagListToDelete, setTagListToDelete] = useState<TagListModel | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Filtrado y paginación local
    const filteredTagLists = useMemo(() => {
        if (!search) return tagLists;
        const s = search.toLowerCase();
        return tagLists.filter(
            tag => tag.name.toLowerCase().includes(s) ||
                  (tag.description && tag.description.toLowerCase().includes(s))
        );
    }, [tagLists, search]);

    const totalPages = Math.ceil(filteredTagLists.length / ITEMS_PER_PAGE);
    const paginatedTagLists = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTagLists.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTagLists, currentPage]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const confirmDelete = (tagList: TagListModel) => {
        setIsDeleteDialogOpen(true);
        setTagListToDelete(tagList);
    };

    const handleDelete = () => {
        if (tagListToDelete) {
            router.delete(route('tag-lists.destroy', tagListToDelete.id), {
                onSuccess: () => {
                    toast.success('Etiqueta eliminada exitosamente');
                },
                onError: () => {
                    toast.error('No se pudo eliminar la etiqueta');
                }
            });
        }
        setIsDeleteDialogOpen(false);
    };

    return (
        <AppSidebarLayout>
            <Head title="Lista de Etiquetas" />
            <div className="p-4 sm:p-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <h1 className="text-2xl font-bold">Gestión de Lista de Etiquetas</h1>
                    <div className="flex flex-1 gap-2 items-center justify-end">
                        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full max-w-xs">
                            <Input
                                type="text"
                                placeholder="Buscar por nombre o descripción..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full"
                            />
                            <Button type="submit" variant="outline" className="shrink-0">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                        <Link href={route('tag-lists.create')}>
                            <Button className="hidden sm:inline-flex">
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Etiqueta
                            </Button>
                            <Button className="sm:hidden" size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="block sm:hidden space-y-2 mb-16">
                    {paginatedTagLists.length > 0 ? (
                        paginatedTagLists.map((tag) => (
                            <div key={tag.id} className="bg-white dark:bg-zinc-900 rounded shadow p-3 flex flex-col gap-2">
                                <div className="font-bold text-base">{tag.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{tag.description || '-'}</div>
                                <div className="text-xs text-gray-400">
                                    Creado: {new Date(tag.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2 mt-2 justify-end">
                                    <Link href={route('tag-lists.edit', tag.id)}>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="h-8 w-8" 
                                        onClick={() => confirmDelete(tag)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No se encontraron etiquetas.
                        </div>
                    )}
                </div>

                <div className="hidden sm:block bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Fecha de Creación</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedTagLists.length > 0 ? (
                                    paginatedTagLists.map((tag) => (
                                        <TableRow key={tag.id}>
                                            <TableCell className="font-medium">{tag.name}</TableCell>
                                            <TableCell>{tag.description || '-'}</TableCell>
                                            <TableCell>
                                                {new Date(tag.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('tag-lists.edit', tag.id)}>
                                                        <Button variant="outline" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="icon" 
                                                        onClick={() => confirmDelete(tag)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No se encontraron etiquetas.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {totalPages > 1 && (
                    <PaginationComponent
                        data={filteredTagLists}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={handlePageChange}
                    />
                )}

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de eliminar esta etiqueta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente la etiqueta <b>{tagListToDelete?.name}</b> de la base de datos.
                                Si esta etiqueta está siendo utilizada por algún caso legal, no podrá ser eliminada.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleDelete} 
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppSidebarLayout>
    );
}
