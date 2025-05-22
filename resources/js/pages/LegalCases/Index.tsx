import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type LegalCase } from '@/types';
import { formatDateSafe } from '@/lib/utils';
import { PageProps } from '@inertiajs/core';

interface Props extends PageProps {
    legalCases: LegalCase[];
}

export default function Index() {
    const { legalCases } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title="Expedientes Legales" />

            <div className="p-4 sm:p-6">
                <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Expedientes Legales</h2>
                            <Button asChild>
                                <Link href={route('legal-cases.create')}>Crear Nuevo Expediente</Link>
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Tipo de Caso</TableHead>
                                        <TableHead>Fecha de Entrada</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {legalCases.map((legalCase) => (
                                        <TableRow key={legalCase.id}>
                                            <TableCell className="font-medium">{legalCase.code}</TableCell>
                                            <TableCell>{legalCase.case_type?.name || 'Sin tipo definido'}</TableCell>
                                            <TableCell>{formatDateSafe(legalCase.entry_date)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="secondary" size="sm" asChild>
                                                        <Link href={route('legal-cases.show', legalCase.id)}>Ver</Link>
                                                    </Button>
                                                    <Button variant="secondary" size="sm" asChild>
                                                        <Link href={route('legal-cases.edit', legalCase.id)}>Editar</Link>
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