import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, LegalEntity } from '@/types';
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
import { Building, Edit, Eye, PlusCircle, Search, Trash2 } from 'lucide-react';
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
  legalEntities: {
    data: LegalEntity[];
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

export default function LegalEntitiesIndex({ legalEntities, filters }: Props) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<LegalEntity | null>(null);
  const [search, setSearch] = useState(filters.search || '');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Inicio',
      href: route('search.index'),
    },
    {
      title: 'Entidades Legales',
      href: route('legal-entities.index'),
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('legal-entities.index'), { search }, { preserveState: true });
  };

  const confirmDelete = (entity: LegalEntity) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (entityToDelete) {
      router.delete(route('legal-entities.destroy', entityToDelete.id));
    }
    setIsDeleteDialogOpen(false);
  };

  const getEntityName = (entity: LegalEntity): string => {
    return entity.trade_name 
        ? `${entity.business_name} (${entity.trade_name})`
        : entity.business_name;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Entidades Legales" />

      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Entidades Legales</h1>
          <Button 
            onClick={() => router.visit(route('legal-entities.create'))}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Entidad
          </Button>
        </div>

        {/* Filtros de búsqueda */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o RIF..."
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

        {/* Tabla de entidades legales */}
        <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sm:rounded-lg">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RIF</TableHead>
                  <TableHead>Nombre Comercial</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {legalEntities.data.length > 0 ? (
                  legalEntities.data.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.rif}</TableCell>
                      <TableCell className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-500" />
                        {getEntityName(entity)}
                      </TableCell>
                      <TableCell>{entity.email_1 || '-'}</TableCell>
                      <TableCell>{entity.phone_number_1 || '-'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => router.visit(route('legal-entities.show', entity.id))}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => router.visit(route('legal-entities.edit', entity.id))}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => confirmDelete(entity)}
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
          {legalEntities.meta.last_page > 1 && (
            <div className="px-4 py-2">
              <Pagination>
                <PaginationContent>
                  {legalEntities.meta.current_page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        href={legalEntities.links.prev ?? '#'} 
                        onClick={(e) => {
                          e.preventDefault();
                          router.get(legalEntities.links.prev ?? '');
                        }}
                      />
                    </PaginationItem>
                  )}
                  
                  {legalEntities.meta.links.slice(1, -1).map((link, i) => (
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
                  
                  {legalEntities.meta.current_page < legalEntities.meta.last_page && (
                    <PaginationItem>
                      <PaginationNext 
                        href={legalEntities.links.next ?? '#'} 
                        onClick={(e) => {
                          e.preventDefault();
                          router.get(legalEntities.links.next ?? '');
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
              {entityToDelete && getEntityName(entityToDelete)} de la base de datos.
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