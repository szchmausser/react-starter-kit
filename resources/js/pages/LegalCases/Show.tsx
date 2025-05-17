import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { FileText, Info, FileQuestion, Users, Gavel, UserCheck, ScrollText, Building, UserCog, Eye } from 'lucide-react';

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
    
    // Función para obtener el icono según el rol
    const getRoleIcon = (role: string) => {
        switch(role) {
            case 'Juez': 
                return <Gavel className="h-5 w-5 text-purple-500" aria-hidden="true" />;
            case 'Solicitante': 
                return <UserCheck className="h-5 w-5 text-blue-500" aria-hidden="true" />;
            case 'Abogado de Solicitante':
                return <UserCog className="h-5 w-5 text-blue-700" aria-hidden="true" />;
            case 'Demandado':
                return <Users className="h-5 w-5 text-orange-500" aria-hidden="true" />;
            case 'Abogado de Demandado':
                return <UserCog className="h-5 w-5 text-orange-700" aria-hidden="true" />;
            case 'Testigo':
                return <Eye className="h-5 w-5 text-green-500" aria-hidden="true" />;
            default:
                return <Users className="h-5 w-5 text-gray-500" aria-hidden="true" />;
        }
    };
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detalle del Expediente: ${legalCase.code}`} />
            <div className="p-4 sm:p-6">
                <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-4 sm:p-6 text-gray-900 dark:text-gray-100">
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold text-center uppercase">DETALLE DEL EXPEDIENTE</h1>
                        </div>
                        
                        {/* Sección de Información General - Ahora con estilo de tarjeta */}
                        <div className="mb-6 border dark:border-zinc-700 rounded-md overflow-hidden">
                            <div className="bg-gray-100 dark:bg-zinc-900 px-4 py-2 font-medium flex items-center">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" aria-hidden="true" />
                                <span className="dark:text-gray-200">Información General</span>
                            </div>
                            <div className="p-4 dark:bg-zinc-900">
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
                                        <strong>Estado:</strong> 
                                        <span className={`ml-2 px-2 py-1 text-sm rounded-full ${legalCase.closing_date ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}>
                                            {legalCase.closing_date ? 'Cerrado' : 'Activo'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Sección de Descripción del Tipo de Caso - Ahora con estilo de tarjeta */}
                        {legalCase.case_type.description && (
                            <div className="mb-6 border dark:border-zinc-700 rounded-md overflow-hidden">
                                <div className="bg-gray-100 dark:bg-zinc-900 px-4 py-2 font-medium flex items-center">
                                    <FileQuestion className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" aria-hidden="true" />
                                    <span className="dark:text-gray-200">Descripción del Tipo de Caso</span>
                                </div>
                                <div className="p-4 dark:bg-zinc-900">
                                    <p className="text-gray-700 dark:text-gray-300">{legalCase.case_type.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Sección única para todas las partes relacionadas - Ya tiene estilo de tarjeta */}
                        <div className="mb-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-center uppercase">PARTES RELACIONADAS</h2>
                            </div>
                            
                            {Object.keys(partiesByRole).length > 0 ? (
                                <div className="space-y-6">
                                    {roleOrder.map(role => {
                                        // Solo mostrar roles que tengan partes asignadas
                                        if (!partiesByRole[role] || partiesByRole[role].length === 0) return null;
                                        
                                        return (
                                            <div key={role} className="border dark:border-zinc-700 rounded-md overflow-hidden">
                                                <div className="bg-gray-100 dark:bg-zinc-900 px-4 py-2 font-medium flex items-center">
                                                    {getRoleIcon(role)}
                                                    <span className="ml-2 dark:text-gray-200">{role}</span>
                                                </div>
                                                <div className="divide-y divide-gray-200 dark:divide-zinc-800 dark:bg-zinc-900">
                                                    {partiesByRole[role].map(party => (
                                                        <div key={`${party.type}-${party.id}`} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between">
                                                            <div className="flex items-center">
                                                                {party.type === 'individual' ? 
                                                                    <UserCheck className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" aria-hidden="true" /> : 
                                                                    <Building className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" aria-hidden="true" />
                                                                }
                                                                <div>
                                                                    <p className="font-medium">{party.name}</p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {party.type === 'individual' ? 'Cédula:' : 'RIF:'} {party.identifier}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 sm:mt-0">
                                                                <Button 
                                                                    onClick={() => router.visit(
                                                                        party.type === 'individual' 
                                                                            ? route('individuals.show', party.id) 
                                                                            : route('legal-entities.show', party.id)
                                                                    )} 
                                                                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
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

                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={() => router.visit(route('search.index'))}
                                className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-200 dark:hover:bg-gray-100 dark:text-gray-900 text-white"
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