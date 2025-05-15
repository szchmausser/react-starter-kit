import { Head } from '@inertiajs/react';

interface LegalEntity {
    id: number;
    rif: string;
    business_name: string;
    trade_name?: string;
    legal_entity_type: string;
    email_1?: string;
    phone_number_1?: string;
    website?: string;
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

    return (
        <>
            <Head title={`Detalle de Entidad Legal: ${legalEntity.business_name}`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-4">Detalle de Persona Jurídica</h1>
                            
                            <div className="mb-4">
                                <h2 className="text-xl font-medium mb-2">Información Empresarial</h2>
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

                            <div className="mb-4">
                                <h2 className="text-xl font-medium mb-2">Información de Contacto</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {legalEntity.email_1 && (
                                        <div>
                                            <strong>Email:</strong> {legalEntity.email_1}
                                        </div>
                                    )}
                                    {legalEntity.phone_number_1 && (
                                        <div>
                                            <strong>Teléfono:</strong> {legalEntity.phone_number_1}
                                        </div>
                                    )}
                                    {legalEntity.website && (
                                        <div>
                                            <strong>Sitio Web:</strong> {legalEntity.website}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <a
                                    href={route('search.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                                >
                                    Volver a Búsqueda
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 