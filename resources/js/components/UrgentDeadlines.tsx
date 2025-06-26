import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

// Define la estructura de un vencimiento individual
interface Deadline {
    id: number;
    description: string;
    date: string;
    legal_case: {
        id: number;
        case_number: string;
    };
}

// Define la estructura de los datos de vencimientos urgentes que vienen de la API
interface UrgentDeadlinesData {
    today: Deadline[];
    tomorrow: Deadline[];
    thisWeek: Deadline[];
}

// Componente para mostrar una lista de vencimientos
function DeadlineList({ title, deadlines }: { title: string; deadlines: Deadline[] }) {
    return (
        <div className="flex flex-col rounded-lg bg-gray-50 p-4 dark:bg-zinc-800">
            <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            {deadlines.length > 0 ? (
                <ul className="space-y-2">
                    {deadlines.map((item) => (
                        <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300">
                            <a
                                href={`/legal-cases/${item.legal_case.id}`}
                                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                            >
                                {item.legal_case.case_number}
                            </a>
                            : {item.description}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay vencimientos.</p>
            )}
        </div>
    );
}

// Componente principal de Vencimientos Urgentes
export default function UrgentDeadlines() {
    const [deadlines, setDeadlines] = useState<UrgentDeadlinesData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDeadlines() {
            try {
                // Usamos una URL relativa estática para evitar problemas con la función route()
                const response = await fetch('/dashboard/urgent-deadlines');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setDeadlines(data);
            } catch (error) {
                console.error('Error fetching urgent deadlines:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchDeadlines();
    }, []);

    if (loading) {
        // Esqueleto de carga para una mejor UX
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 h-6 w-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="h-24 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-24 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-24 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Expedientes con plazos por vencer</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                <DeadlineList title="Hoy" deadlines={deadlines?.today ?? []} />
                <DeadlineList title="Mañana" deadlines={deadlines?.tomorrow ?? []} />
                <DeadlineList title="Próximos 7 días" deadlines={deadlines?.thisWeek ?? []} />
            </div>
        </div>
    );
}