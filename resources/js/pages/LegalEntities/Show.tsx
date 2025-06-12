import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, Briefcase, Calendar, CheckCircle, Contact, Eye, FileQuestion, Globe, Mail, Phone, UserCog } from 'lucide-react';

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
    const displayName = legalEntity.trade_name ? `${legalEntity.business_name} (${legalEntity.trade_name})` : legalEntity.business_name;

    const entityTypeMap: { [key: string]: string } = {
        sociedad_anonima: 'Sociedad Anónima',
        compania_anonima: 'Compañía Anónima',
        sociedad_de_responsabilidad_limitada: 'Sociedad de Responsabilidad Limitada',
        cooperativa: 'Cooperativa',
        fundacion: 'Fundación',
        asociacion_civil: 'Asociación Civil',
        otro: 'Otro',
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
        <AppLayout
            breadcrumbs={breadcrumbs}
            backButton={{
                show: true,
                onClick: () =>
                    router.visit(route('legal-entities.index'), {
                        preserveState: false,
                        replace: true,
                    }),
                label: 'Volver',
            }}
        >
            <Head title={`Detalle de Entidad Legal: ${legalEntity.business_name}`} />
            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <div className="mb-4">
                            <h1 className="text-center text-2xl font-bold uppercase">DETALLE DE PERSONA JURÍDICA</h1>
                        </div>

                        {/* Información Empresarial - Ahora con estilo de tarjeta */}
                        <div className="mb-6 overflow-hidden rounded-md border dark:border-zinc-700">
                            <div className="flex items-center bg-gray-100 px-4 py-2 font-medium dark:bg-zinc-900">
                                <Briefcase className="mr-2 h-5 w-5 text-green-500 dark:text-green-400" />
                                <span className="dark:text-gray-200">Información Empresarial</span>
                            </div>
                            <div className="p-4 dark:bg-zinc-900">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <strong>Razón Social:</strong> {displayName}
                                    </div>
                                    <div>
                                        <strong>RIF:</strong> {legalEntity.rif}
                                    </div>
                                    <div>
                                        <strong>Tipo de Entidad:</strong>{' '}
                                        {entityTypeMap[legalEntity.legal_entity_type] || legalEntity.legal_entity_type}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información de Contacto - Ahora con estilo de tarjeta */}
                        <div className="mb-6 overflow-hidden rounded-md border dark:border-zinc-700">
                            <div className="flex items-center bg-gray-100 px-4 py-2 font-medium dark:bg-zinc-900">
                                <Contact className="mr-2 h-5 w-5 text-green-500 dark:text-green-400" />
                                <span className="dark:text-gray-200">Información de Contacto</span>
                            </div>
                            <div className="p-4 dark:bg-zinc-900">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {legalEntity.email_1 && (
                                        <div className="flex items-center">
                                            <Mail className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                            <span>
                                                <strong>Email:</strong> {legalEntity.email_1}
                                            </span>
                                        </div>
                                    )}
                                    {legalEntity.phone_number_1 && (
                                        <div className="flex items-center">
                                            <Phone className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                            <span>
                                                <strong>Teléfono:</strong> {legalEntity.phone_number_1}
                                            </span>
                                        </div>
                                    )}
                                    {legalEntity.website && (
                                        <div className="flex items-center">
                                            <Globe className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                            <span>
                                                <strong>Sitio Web:</strong> {legalEntity.website}
                                            </span>
                                        </div>
                                    )}
                                    {!legalEntity.email_1 && !legalEntity.phone_number_1 && !legalEntity.website && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500 italic dark:text-gray-400">No hay información de contacto disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expedientes Relacionados - Con diseño responsivo (tabla/tarjetas) */}
                        <div className="mb-6">
                            <div className="mb-4">
                                <h2 className="text-center text-xl font-bold uppercase">EXPEDIENTES RELACIONADOS</h2>
                            </div>
                            {legalEntity.legal_cases && legalEntity.legal_cases.length > 0 ? (
                                <>
                                    {/* Vista de tabla para pantallas medianas y grandes */}
                                    <div className="hidden overflow-hidden rounded-md border md:block dark:border-zinc-700">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                                                <thead className="bg-gray-50 dark:bg-zinc-900">
                                                    <tr>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                                        >
                                                            Código
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                                        >
                                                            Tipo de Caso
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                                        >
                                                            Rol
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                                        >
                                                            Fecha de Entrada
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                                        >
                                                            Fecha de Sentencia
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                                        >
                                                            Estado
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
                                                        >
                                                            Acciones
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-zinc-900">
                                                    {legalEntity.legal_cases.map((legalCase) => (
                                                        <tr key={`table-${legalCase.id}`}>
                                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-200">
                                                                <div className="flex items-center">
                                                                    <FileQuestion className="mr-2 h-4 w-4 text-amber-500 dark:text-amber-400" />
                                                                    {legalCase.code}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                                                {legalCase.case_type.name}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                                                <div className="flex items-center">
                                                                    <UserCog className="mr-1 h-4 w-4 text-green-500 dark:text-green-400" />
                                                                    <span className="font-medium">{legalCase.pivot?.role || 'Sin rol asignado'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                                                {formatDate(legalCase.entry_date)}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                                                {formatDate(legalCase.sentence_date)}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                                                {legalCase.closing_date ? 'Cerrado' : 'Activo'}
                                                            </td>
                                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                                <Button
                                                                    onClick={() => router.visit(route('legal-cases.show', legalCase.id))}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    title="Ver detalles"
                                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Vista de tarjetas para dispositivos móviles */}
                                    <div className="space-y-4 md:hidden">
                                        {legalEntity.legal_cases.map((legalCase) => (
                                            <div key={`card-${legalCase.id}`} className="overflow-hidden rounded-md border dark:border-zinc-700">
                                                <div className="flex items-center justify-between bg-gray-100 px-4 py-2 font-medium dark:bg-zinc-900">
                                                    <div className="flex items-center">
                                                        <FileQuestion className="mr-2 h-4 w-4 text-amber-500 dark:text-amber-400" />
                                                        <span className="dark:text-gray-200">{legalCase.code}</span>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs ${legalCase.closing_date ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}
                                                    >
                                                        {legalCase.closing_date ? 'Cerrado' : 'Activo'}
                                                    </span>
                                                </div>
                                                <div className="space-y-3 p-4 dark:bg-zinc-900">
                                                    <div className="flex items-center">
                                                        <UserCog className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                                                        <div>
                                                            <div className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                                                Rol en el Expediente
                                                            </div>
                                                            <div className="text-sm font-medium dark:text-gray-300">
                                                                {legalCase.pivot?.role || 'Sin rol asignado'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                                            Tipo de Caso
                                                        </div>
                                                        <div className="text-sm dark:text-gray-300">{legalCase.case_type.name}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <div className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                                                Fecha de Entrada
                                                            </div>
                                                            <div className="flex items-center text-sm dark:text-gray-300">
                                                                <Calendar className="mr-1 h-3 w-3" />
                                                                {formatDate(legalCase.entry_date)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                                                Fecha de Sentencia
                                                            </div>
                                                            <div className="flex items-center text-sm dark:text-gray-300">
                                                                {legalCase.sentence_date ? (
                                                                    <>
                                                                        <CheckCircle className="mr-1 h-3 w-3 text-green-500 dark:text-green-400" />
                                                                        {formatDate(legalCase.sentence_date)}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <AlertCircle className="mr-1 h-3 w-3 text-amber-500 dark:text-amber-400" />
                                                                        Pendiente
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-center pt-2">
                                                        <Button
                                                            onClick={() => router.visit(route('legal-cases.show', legalCase.id))}
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Ver detalles"
                                                            className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="overflow-hidden rounded-md border dark:border-zinc-700">
                                    <div className="p-4 text-center text-gray-500 dark:bg-zinc-900 dark:text-gray-400">
                                        No hay expedientes relacionados con esta entidad.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
