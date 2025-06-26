import { useEffect, useState } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import {
    Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

// Estructura de los datos de distribución
interface StatusDistributionData {
    status: string;
    count: number;
}

// Paleta de colores para el gráfico. Se pueden añadir más si hay muchos estados.
const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899', '#f59e0b'];

// Componente del Gráfico de Distribución de Expedientes por Estado
export default function CaseStatusChart() {
    const [data, setData] = useState<StatusDistributionData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Corregimos la llamada a la API para usar una URL estática
                const response = await fetch('/dashboard/case-status-distribution');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching case status distribution:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Esqueleto de carga para una mejor UX
    if (loading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 h-6 w-1/2 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-72 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <PieChartIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distribución de Expedientes por Estado</h2>
            </div>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        layout="horizontal"
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" />
                        <XAxis dataKey="status" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                            cursor={{ fill: 'rgba(128, 128, 128, 0.05)' }}
                            contentStyle={{
                                background: '#18181b',
                                border: '1px solid #3f3f46',
                                borderRadius: '0.75rem',
                            }}
                            labelStyle={{ color: '#f4f4f5' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Bar dataKey="count" name="Nº de Expedientes" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}