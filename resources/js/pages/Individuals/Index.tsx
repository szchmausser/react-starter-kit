import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Edit, Eye, PlusCircle, Search, Trash2 } from 'lucide-react';
import { Individual } from '@/types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  individuals: {
    data: Individual[];
    links: {
      first: string;
      last: string;
      prev: string | null;
      next: string | null;
    };
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      links: {
        url: string | null;
        label: string;
        active: boolean;
      }[];
      path: string;
      per_page: number;
      to: number;
      total: number;
    };
  };
  filters: {
    search: string;
  };
}

export default function IndividualsIndex({ individuals, filters }: Props) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [individualToDelete, setIndividualToDelete] = useState<Individual | null>(null);
  const [search, setSearch] = useState(filters.search || '');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Inicio',
      href: route('search.index'),
    },
    {
      title: 'Personas Naturales',
      href: route('individuals.index'),
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('individuals.index'), { search }, { preserveState: true });
  };

  const confirmDelete = (individual: Individual) => {
    setIndividualToDelete(individual);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (individualToDelete) {
      router.delete(route('individuals.destroy', individualToDelete.id));
    }
    setIsDeleteDialogOpen(false);
  };

  const getFullName = (individual: Individual): string => {
    return `${individual.first_name} ${individual.middle_name || ''} ${individual.last_name} ${individual.second_last_name || ''}`.trim();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Personas Naturales" />

      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Personas Naturales</h1>
          <Button 
            onClick={() => router.visit(route('individuals.create'))}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Persona
          </Button>
        </div>

        {/* Filtros de búsqueda */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o cédula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="outline" className="flex gap-2 items-center">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </form>
        </div>

        {/* Tabla de individuos */}
        <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sm:rounded-lg">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {individuals.data.length > 0 ? (
                  individuals.data.map((individual) => (
                    <TableRow key={individual.id}>
                      <TableCell className="font-medium">{individual.national_id}</TableCell>
                      <TableCell>{getFullName(individual)}</TableCell>
                      <TableCell>{individual.email_1 || '-'}</TableCell>
                      <TableCell>{individual.phone_number_1 || '-'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => router.visit(route('individuals.show', individual.id))}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => router.visit(route('individuals.edit', individual.id))}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => confirmDelete(individual)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {individuals.meta.last_page > 1 && (
            <div className="px-4 py-2">
              <Pagination>
                <PaginationContent>
                  {individuals.meta.current_page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        href={individuals.links.prev ?? '#'} 
                        onClick={(e) => {
                          e.preventDefault();
                          router.get(individuals.links.prev ?? '');
                        }}
                      />
                    </PaginationItem>
                  )}
                  
                  {individuals.meta.links.slice(1, -1).map((link, i) => (
                    <PaginationItem key={i}>
                      {link.url ? (
                        <PaginationLink 
                          href={link.url}
                          isActive={link.active}
                          onClick={(e) => {
                            e.preventDefault();
                            router.get(link.url as string);
                          }}
                        >
                          {link.label}
                        </PaginationLink>
                      ) : (
                        <PaginationEllipsis />
                      )}
                    </PaginationItem>
                  ))}
                  
                  {individuals.meta.current_page < individuals.meta.last_page && (
                    <PaginationItem>
                      <PaginationNext 
                        href={individuals.links.next ?? '#'} 
                        onClick={(e) => {
                          e.preventDefault();
                          router.get(individuals.links.next ?? '');
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente a{' '}
              {individualToDelete && getFullName(individualToDelete)} de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
} 