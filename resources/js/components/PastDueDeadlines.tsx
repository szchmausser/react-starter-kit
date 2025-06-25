import { useEffect, useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

// Define la estructura de un vencimiento pasado
interface PastDueDeadline {
    id: number;
    description: string;
    date: string;
    legal_case: {
        id: number;
        case_number: string;
    };
}

// Componente principal de Vencimientos Pasados
export default function PastDueDeadlines() {
    const [deadlines, setDeadlines] = useState<PastDueDeadline[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPastDueDeadlines() {
            try {
                const response = await fetch('/dashboard/past-due-deadlines');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setDeadlines(data);
            } catch (error) {
                console.error('Error fetching past due deadlines:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPastDueDeadlines();
    }, []);

    if (loading) {
        // Esqueleto de carga
        return (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="h-7 w-56 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
                <div className="mt-4 h-16 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>
        );
    }

    if (deadlines.length === 0) {
        // No renderizar nada si no hay plazos vencidos
        return null;
    }

    return (
        <div className="rounded-xl bg-red-50 p-4 shadow-md ring-1 ring-red-200 dark:bg-red-900/20 dark:ring-red-800 md:p-6">
            <div className="flex items-center gap-3">
                <FaExclamationTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />
                <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
                    Plazos Vencidos Sin Atender ({deadlines.length})
                </h2>
            </div>
            <div className="mt-4">
                <ul className="space-y-2">
                    {deadlines.map((item) => (
                        <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300">
                            <a
                                href={`/legal-cases/${item.legal_case.id}`}
                                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                            >
                                {item.legal_case.case_number}
                            </a>
                            : {item.description} (Venció: {item.date})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
