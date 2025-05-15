import { Head } from '@inertiajs/react';

interface Individual {
    id: number;
    national_id: string;
    passport?: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    second_last_name?: string;
    email_1?: string;
    phone_number_1?: string;
}

interface Props {
    individual: Individual;
}

export default function IndividualShow({ individual }: Props) {
    const fullName = `${individual.first_name} ${individual.middle_name || ''} ${individual.last_name} ${individual.second_last_name || ''}`.trim();

    return (
        <>
            <Head title={`Detalle de Persona: ${fullName}`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-4">Detalle de Persona Natural</h1>
                            
                            <div className="mb-4">
                                <h2 className="text-xl font-medium mb-2">Información Personal</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <strong>Nombre Completo:</strong> {fullName}
                                    </div>
                                    <div>
                                        <strong>Cédula:</strong> {individual.national_id}
                                    </div>
                                    {individual.passport && (
                                        <div>
                                            <strong>Pasaporte:</strong> {individual.passport}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <h2 className="text-xl font-medium mb-2">Información de Contacto</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {individual.email_1 && (
                                        <div>
                                            <strong>Email:</strong> {individual.email_1}
                                        </div>
                                    )}
                                    {individual.phone_number_1 && (
                                        <div>
                                            <strong>Teléfono:</strong> {individual.phone_number_1}
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