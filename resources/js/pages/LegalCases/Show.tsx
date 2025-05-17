import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface CaseType {
    id: number;
    name: string;
    description?: string;
}

interface Individual {
    id: number;
    national_id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    second_last_name?: string;
    pivot?: {
        individual_id: number;
        legal_case_id: number;
    };
}

interface LegalEntity {
    id: number;
    rif: string;
    business_name: string;
    trade_name?: string;
    pivot?: {
        legal_entity_id: number;
        legal_case_id: number;
    };
}

interface LegalCase {
    id: number;
    code: string;
    entry_date: string;
    sentence_date?: string;
    closing_date?: string;
    case_type: CaseType;
    individuals: Individual[];
    legal_entities: LegalEntity[];
}

interface Props {
    legalCase: LegalCase;
}

export default function LegalCaseShow({ legalCase }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Búsqueda',
            href: route('search.index'),
        },
        {
            title: 'Resultados',
            href: route('search.results'),
        },
        {
            title: `Expediente: ${legalCase.code}`,
            href: route('legal-cases.show', legalCase.id),
        },
    ];

    // Función para obtener el nombre completo de un individuo
    const getFullName = (individual: Individual): string => {
        return `${individual.first_name} ${individual.middle_name || ''} ${individual.last_name} ${individual.second_last_name || ''}`.trim();
    };

    // Función para obtener el nombre de la entidad legal
    const getEntityName = (entity: LegalEntity): string => {
        return entity.trade_name 
            ? `${entity.business_name} (${entity.trade_name})`
            : entity.business_name;
    };
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detalle del Expediente: ${legalCase.code}`} />
            <div className="p-4 sm:p-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-4 sm:p-6 text-gray-900">
                        <h1 className="text-2xl font-semibold mb-4">Detalle del Expediente</h1>
                        
                        <div className="mb-6">
                            <h2 className="text-xl font-medium mb-2">Información General</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <strong>Código de Expediente:</strong> {legalCase.code}
                                </div>
                                <div>
                                    <strong>Tipo de Caso:</strong> {legalCase.case_type.name}
                                </div>
                                <div>
                                    <strong>Fecha de Entrada:</strong> {formatDate(legalCase.entry_date)}
                                </div>
                                <div>
                                    <strong>Fecha de Sentencia:</strong> {formatDate(legalCase.sentence_date)}
                                </div>
                                <div>
                                    <strong>Fecha de Cierre:</strong> {formatDate(legalCase.closing_date)}
                                </div>
                                <div>
                                    <strong>Estado:</strong> {legalCase.closing_date ? 'Cerrado' : 'Activo'}
                                </div>
                            </div>
                        </div>
                        
                        {legalCase.case_type.description && (
                            <div className="mb-6">
                                <h2 className="text-xl font-medium mb-2">Descripción del Tipo de Caso</h2>
                                <p className="text-gray-700">{legalCase.case_type.description}</p>
                            </div>
                        )}

                        {/* Sección de personas naturales relacionadas */}
                        <div className="mb-6">
                            <h2 className="text-xl font-medium mb-2">Personas Naturales Relacionadas</h2>
                            {legalCase.individuals && legalCase.individuals.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Nombre
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Cédula
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {legalCase.individuals.map((individual) => (
                                                <tr key={individual.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {getFullName(individual)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {individual.national_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Button 
                                                            onClick={() => router.visit(route('individuals.show', individual.id))} 
                                                            className="bg-blue-500 text-white"
                                                            size="sm"
                                                        >
                                                            Ver Detalles
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p>No hay personas naturales relacionadas con este expediente.</p>
                            )}
                        </div>

                        {/* Sección de personas jurídicas relacionadas */}
                        <div className="mb-6">
                            <h2 className="text-xl font-medium mb-2">Personas Jurídicas Relacionadas</h2>
                            {legalCase.legal_entities && legalCase.legal_entities.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Razón Social
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    RIF
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {legalCase.legal_entities.map((entity) => (
                                                <tr key={entity.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {getEntityName(entity)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {entity.rif}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Button 
                                                            onClick={() => router.visit(route('legal-entities.show', entity.id))} 
                                                            className="bg-blue-500 text-white"
                                                            size="sm"
                                                        >
                                                            Ver Detalles
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p>No hay personas jurídicas relacionadas con este expediente.</p>
                            )}
                        </div>

                        <div className="mt-6">
                            <Button
                                onClick={() => router.visit(route('search.index'))}
                                className="bg-gray-800 hover:bg-gray-700"
                            >
                                Volver a Búsqueda
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 