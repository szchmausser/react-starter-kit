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
    
    try {
        // Extraer directamente los componentes de la fecha de la cadena
        // Este enfoque evita los problemas de zona horaria
        if (dateString.includes('-') && dateString.length >= 10) {
            const [year, month, day] = dateString.substring(0, 10).split('-');
            if (year && month && day) {
                return `${day}/${month}/${year}`;
            }
        }
        
        // Si el formato no es el esperado, intentamos con Date
        // pero ajustamos para evitar el problema de zona horaria
        const date = new Date(dateString);
        
        if (!isNaN(date.getTime())) {
            // Convertimos a UTC para evitar ajustes de zona horaria
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            
            return `${day}/${month}/${year}`;
        }
        
        // Si todo falla, devolvemos la fecha original
        return dateString;
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return dateString;
    }
}
