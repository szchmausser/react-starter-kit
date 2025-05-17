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
        role?: string;
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
        role?: string;
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
    
    // Debug de los datos recibidos
    console.log("Datos del expediente:", legalCase);
    console.log("Individuos:", legalCase.individuals);
    console.log("Entidades legales:", legalCase.legal_entities);
    
    // Combinar todas las partes y agruparlas por rol
    const getAllParties = () => {
        const parties: {[key: string]: Array<{id: number, name: string, identifier: string, type: 'individual' | 'entity', entityObj: Individual | LegalEntity}>} = {};
        
        // Procesar individuos
        legalCase.individuals.forEach(individual => {
            console.log("Individual:", individual.first_name, "Pivot:", individual.pivot, "Role:", individual.pivot?.role);
            const role = individual.pivot?.role || 'Sin rol asignado';
            if (!parties[role]) {
                parties[role] = [];
            }
            parties[role].push({
                id: individual.id, 
                name: getFullName(individual), 
                identifier: individual.national_id,
                type: 'individual',
                entityObj: individual
            });
        });
        
        // Procesar entidades legales
        legalCase.legal_entities.forEach(entity => {
            console.log("Entidad:", entity.business_name, "Pivot:", entity.pivot, "Role:", entity.pivot?.role);
            const role = entity.pivot?.role || 'Sin rol asignado';
            if (!parties[role]) {
                parties[role] = [];
            }
            parties[role].push({
                id: entity.id, 
                name: getEntityName(entity), 
                identifier: entity.rif,
                type: 'entity',
                entityObj: entity
            });
        });
        
        return parties;
    };
    
    // Obtener todas las partes agrupadas por rol
    const partiesByRole = getAllParties();
    console.log("Partes por rol:", partiesByRole);
    
    // Orden de roles para mostrar en la interfaz
    const roleOrder = [
        'Juez', 
        'Solicitante', 
        'Abogado de Solicitante',
        'Demandado',
        'Abogado de Demandado',
        'Testigo',
        'Sin rol asignado'
    ];
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detalle del Expediente: ${legalCase.code}`} />
            <div className="p-4 sm:p-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-4 sm:p-6 text-gray-900">
                        <h1 className="text-2xl font-semibold mb-4">Detalle del Expediente</h1>
                        
                        {/* Sección de Información General - Ahora con estilo de tarjeta */}
                        <div className="mb-6 border rounded-md overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 font-medium">
                                Información General
                            </div>
                            <div className="p-4">
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
                        </div>
                        
                        {/* Sección de Descripción del Tipo de Caso - Ahora con estilo de tarjeta */}
                        {legalCase.case_type.description && (
                            <div className="mb-6 border rounded-md overflow-hidden">
                                <div className="bg-gray-100 px-4 py-2 font-medium">
                                    Descripción del Tipo de Caso
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-700">{legalCase.case_type.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Sección única para todas las partes relacionadas - Ya tiene estilo de tarjeta */}
                        <div className="mb-6">
                            <h2 className="text-xl font-medium mb-2">Partes Relacionadas</h2>
                            
                            {Object.keys(partiesByRole).length > 0 ? (
                                <div className="space-y-6">
                                    {roleOrder.map(role => {
                                        // Solo mostrar roles que tengan partes asignadas
                                        if (!partiesByRole[role] || partiesByRole[role].length === 0) return null;
                                        
                                        return (
                                            <div key={role} className="border rounded-md overflow-hidden">
                                                <div className="bg-gray-100 px-4 py-2 font-medium">
                                                    {role}
                                                </div>
                                                <div className="divide-y divide-gray-200">
                                                    {partiesByRole[role].map(party => (
                                                        <div key={`${party.type}-${party.id}`} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">{party.name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {party.type === 'individual' ? 'Cédula:' : 'RIF:'} {party.identifier}
                                                                </p>
                                                            </div>
                                                            <div className="mt-2 sm:mt-0">
                                                                <Button 
                                                                    onClick={() => router.visit(
                                                                        party.type === 'individual' 
                                                                            ? route('individuals.show', party.id) 
                                                                            : route('legal-entities.show', party.id)
                                                                    )} 
                                                                    className="bg-blue-500 text-white"
                                                                    size="sm"
                                                                >
                                                                    Ver Detalles
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p>No hay partes relacionadas con este expediente.</p>
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