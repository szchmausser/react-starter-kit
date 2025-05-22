import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type CaseType } from '@/types';

interface Props {
    caseTypes: CaseType[];
}

export default function Index() {
    const { caseTypes } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title="Tipos de Casos" />

            <div className="p-4 sm:p-6">
                <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Tipos de Casos</h2>
                            <Button asChild>
                                <Link href={route('case-types.create')}>Crear Nuevo Tipo de Caso</Link>
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {caseTypes.map((caseType) => (
                                        <TableRow key={caseType.id}>
                                            <TableCell className="font-medium">{caseType.name}</TableCell>
                                            <TableCell>{caseType.description || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="secondary" size="sm" asChild>
                                                        <Link href={route('case-types.edit', caseType.id)}>Editar</Link>
                                                    </Button>
                                                    {/* Añadir botón de eliminar si es necesario */}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 