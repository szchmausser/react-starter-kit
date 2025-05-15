import { Head } from '@inertiajs/react';

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
}

interface Props {
    legalCase: LegalCase;
}

export default function LegalCaseShow({ legalCase }: Props) {
    // Format dates for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    
    return (
        <>
            <Head title={`Detalle del Expediente: ${legalCase.code}`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-4">Detalle del Expediente</h1>
                            
                            <div className="mb-4">
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
                                </div>
                            </div>
                            
                            {legalCase.case_type.description && (
                                <div className="mb-4">
                                    <h2 className="text-xl font-medium mb-2">Descripción del Tipo de Caso</h2>
                                    <p className="text-gray-700">{legalCase.case_type.description}</p>
                                </div>
                            )}

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