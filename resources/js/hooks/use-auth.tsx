import type { PageProps } from '@inertiajs/core';
import { router, usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

// Extender PageProps para incluir auth
interface AuthPageProps extends PageProps {
    auth: {
        user: User | null;
    };
}

/**
 * Hook para manejar la autenticación del usuario
 * @returns Objeto con métodos y propiedades para gestionar la autenticación
 */
export function useAuth() {
    const { auth } = usePage<AuthPageProps>().props;

    /**
     * Verifica si el usuario está autenticado
     */
    const isAuthenticated = (): boolean => {
        return !!auth?.user;
    };

    /**
     * Redirecciona al usuario a la página de login
     */
    const redirectToLogin = (): void => {
        router.visit(route('login'), {
            preserveState: false,
            preserveScroll: false,
            replace: true,
        });
    };

    /**
     * Obtiene el usuario actual o null si no está autenticado
     */
    const getUser = () => {
        return auth?.user || null;
    };

    return {
        isAuthenticated,
        redirectToLogin,
        getUser,
        user: auth?.user,
    };
}
