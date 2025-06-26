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
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <FaExclamationTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Expediente con plazos vencidos</h2>
                </div>
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    {deadlines.length}
                </span>
            </div>

            <div>
                <ul className="space-y-3">
                    {deadlines.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-start gap-3 rounded-lg border-l-4 border-red-400 bg-gray-50 p-3 dark:border-red-500 dark:bg-zinc-800"
                        >
                            <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <a
                                        href={`/legal-cases/${item.legal_case.id}`}
                                        className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        {item.legal_case.case_number}
                                    </a>
                                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-500/30 dark:text-gray-200">
                                        Venció: {item.date}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
