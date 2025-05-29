import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

interface AuthMiddlewareProps {
    children: React.ReactNode;
}

/**
 * Middleware de autenticación que verifica si el usuario está autenticado
 * Si no lo está, lo redirecciona al login
 */
export function AuthMiddleware({ children }: AuthMiddlewareProps) {
    const { isAuthenticated, redirectToLogin } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Verificar autenticación al montar el componente
        const checkAuth = () => {
            try {
                if (!isAuthenticated()) {
                    redirectToLogin();
                }
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
                // En caso de error, intentar redireccionar al login
                try {
                    window.location.href = route('login');
                } catch (routeError) {
                    // Si todo falla, redireccionar a /login directamente
                    window.location.href = '/login';
                }
            } finally {
                setIsChecking(false);
            }
        };

        // Pequeño timeout para asegurar que la página se ha cargado completamente
        const timer = setTimeout(checkAuth, 50);
        return () => clearTimeout(timer);
    }, []);

    // Mientras se verifica la autenticación, no mostrar nada
    if (isChecking) {
        return null;
    }

    // Si no está autenticado, no renderizamos nada mientras se redirecciona
    if (!isAuthenticated()) {
        return null;
    }

    return <>{children}</>;
} 