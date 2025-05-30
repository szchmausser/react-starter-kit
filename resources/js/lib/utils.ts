import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to combine class names with TailwindCSS
 * It merges multiple class names and resolves conflicts with Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Función para formatear fechas
export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Formatea fechas YYYY-MM-DD sin desfase de zona horaria
export function formatDateSafe(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.substring(0, 10).split('-');
    return `${day}/${month}/${year}`;
}
