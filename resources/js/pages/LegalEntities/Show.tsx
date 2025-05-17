import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Building2, Mail, Phone, Briefcase, Contact, FileText, Globe, FileQuestion, Calendar, CheckCircle, AlertCircle, UserCog } from 'lucide-react';

interface CaseType {
    id: number;
    name: string;
    description?: string;
}

interface LegalCase {
    id: number;
    code: string;
    entry_date: string;
    sentence_date?: string;
    closing_date?: string;
    case_type: CaseType;
    pivot?: {
        legal_entity_id: number;
        legal_case_id: number;
        role?: string;
    };
}

interface LegalEntity {
    id: number;
    rif: string;
    business_name: string;
    trade_name?: string;
    legal_entity_type: string;
    email_1?: string;
    phone_number_1?: string;
    website?: string;
    legal_cases: LegalCase[];
}

interface Props {
    legalEntity: LegalEntity;
}

export default function LegalEntityShow({ legalEntity }: Props) {
    const displayName = legalEntity.trade_name 
        ? `${legalEntity.business_name} (${legalEntity.trade_name})`
        : legalEntity.business_name;

    const entityTypeMap: {[key: string]: string} = {
        'sociedad_anonima': 'Sociedad Anónima',
        'compania_anonima': 'Compañía Anónima',
        'sociedad_de_responsabilidad_limitada': 'Sociedad de Responsabilidad Limitada',
        'cooperativa': 'Cooperativa',
        'fundacion': 'Fundación',
        'asociacion_civil': 'Asociación Civil',
        'otro': 'Otro'
    };

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
            title: legalEntity.business_name,
            href: route('legal-entities.show', legalEntity.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detalle de Entidad Legal: ${legalEntity.business_name}`} />
            <div className="p-4 sm:p-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-4 sm:p-6 text-gray-900">
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold text-center uppercase">DETALLE DE PERSONA JURÍDICA</h1>
                        </div>
                        
                        {/* Información Empresarial - Ahora con estilo de tarjeta */}
                        <div className="mb-6 border rounded-md overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 font-medium flex items-center">
                                <Briefcase className="h-5 w-5 text-green-500 mr-2" />
                                Información Empresarial
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <strong>Razón Social:</strong> {displayName}
                                    </div>
                                    <div>
                                        <strong>RIF:</strong> {legalEntity.rif}
                                    </div>
                                    <div>
                                        <strong>Tipo de Entidad:</strong> {entityTypeMap[legalEntity.legal_entity_type] || legalEntity.legal_entity_type}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información de Contacto - Ahora con estilo de tarjeta */}
                        <div className="mb-6 border rounded-md overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 font-medium flex items-center">
                                <Contact className="h-5 w-5 text-green-500 mr-2" />
                                Información de Contacto
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {legalEntity.email_1 && (
                                        <div className="flex items-center">
                                            <Mail className="h-4 w-4 text-blue-500 mr-2" />
                                            <span><strong>Email:</strong> {legalEntity.email_1}</span>
                                        </div>
                                    )}
                                    {legalEntity.phone_number_1 && (
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 text-blue-500 mr-2" />
                                            <span><strong>Teléfono:</strong> {legalEntity.phone_number_1}</span>
                                        </div>
                                    )}
                                    {legalEntity.website && (
                                        <div className="flex items-center">
                                            <Globe className="h-4 w-4 text-blue-500 mr-2" />
                                            <span><strong>Sitio Web:</strong> {legalEntity.website}</span>
                                        </div>
                                    )}
                                    {!legalEntity.email_1 && !legalEntity.phone_number_1 && !legalEntity.website && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500 italic">No hay información de contacto disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expedientes Relacionados - Con diseño responsivo (tabla/tarjetas) */}
                        <div className="mb-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-center uppercase">EXPEDIENTES RELACIONADOS</h2>
                            </div>
                            {legalEntity.legal_cases && legalEntity.legal_cases.length > 0 ? (
                                <>
                                    {/* Vista de tabla para pantallas medianas y grandes */}
                                    <div className="hidden md:block border rounded-md overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Código
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Tipo de Caso
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Rol
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Fecha de Entrada
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Fecha de Sentencia
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Estado
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Acciones
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {legalEntity.legal_cases.map((legalCase) => (
                                                        <tr key={`table-${legalCase.id}`}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                <div className="flex items-center">
                                                                    <FileQuestion className="h-4 w-4 text-amber-500 mr-2" />
                                                                    {legalCase.code}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {legalCase.case_type.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <div className="flex items-center">
                                                                    <UserCog className="h-4 w-4 text-green-500 mr-1" />
                                                                    <span className="font-medium">
                                                                        {legalCase.pivot?.role || 'Sin rol asignado'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(legalCase.entry_date)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(legalCase.sentence_date)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {legalCase.closing_date ? 'Cerrado' : 'Activo'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <Button 
                                                                    onClick={() => router.visit(route('legal-cases.show', legalCase.id))} 
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
                                    </div>

                                    {/* Vista de tarjetas para dispositivos móviles */}
                                    <div className="md:hidden space-y-4">
                                        {legalEntity.legal_cases.map((legalCase) => (
                                            <div key={`card-${legalCase.id}`} className="border rounded-md overflow-hidden">
                                                <div className="bg-gray-100 px-4 py-2 font-medium flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <FileQuestion className="h-4 w-4 text-amber-500 mr-2" />
                                                        <span>{legalCase.code}</span>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${legalCase.closing_date ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                                        {legalCase.closing_date ? 'Cerrado' : 'Activo'}
                                                    </span>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-center">
                                                        <UserCog className="h-4 w-4 text-green-600 mr-2" />
                                                        <div>
                                                            <div className="text-xs font-medium text-gray-500 uppercase">Rol en el Expediente</div>
                                                            <div className="text-sm font-medium">{legalCase.pivot?.role || 'Sin rol asignado'}</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 uppercase">Tipo de Caso</div>
                                                        <div className="text-sm">{legalCase.case_type.name}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <div className="text-xs font-medium text-gray-500 uppercase">Fecha de Entrada</div>
                                                            <div className="text-sm flex items-center">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                {formatDate(legalCase.entry_date)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-medium text-gray-500 uppercase">Fecha de Sentencia</div>
                                                            <div className="text-sm flex items-center">
                                                                {legalCase.sentence_date ? (
                                                                    <>
                                                                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                                                        {formatDate(legalCase.sentence_date)}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
                                                                        Pendiente
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-2">
                                                        <Button 
                                                            onClick={() => router.visit(route('legal-cases.show', legalCase.id))} 
                                                            className="w-full bg-blue-500 text-white"
                                                            size="sm"
                                                        >
                                                            Ver Detalles
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="border rounded-md overflow-hidden">
                                    <div className="p-4 text-center text-gray-500">
                                        No hay expedientes relacionados con esta entidad.
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-center">
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