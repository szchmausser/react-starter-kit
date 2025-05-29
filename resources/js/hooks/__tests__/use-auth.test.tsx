import { useAuth } from '../use-auth';
import { renderHook } from '@testing-library/react';

// Mock de Inertia
jest.mock('@inertiajs/react', () => ({
    usePage: jest.fn(),
    router: {
        visit: jest.fn()
    }
}));

import { usePage, router } from '@inertiajs/react';

describe('useAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería determinar correctamente si el usuario está autenticado', () => {
        // Mock para un usuario autenticado
        (usePage as jest.Mock).mockReturnValue({
            props: {
                auth: {
                    user: { id: 1, name: 'Test User', email: 'test@example.com' }
                }
            }
        });

        const { result } = renderHook(() => useAuth());
        expect(result.current.isAuthenticated()).toBe(true);
        expect(result.current.user).toBeDefined();
    });

    it('debería determinar correctamente si el usuario no está autenticado', () => {
        // Mock para un usuario no autenticado
        (usePage as jest.Mock).mockReturnValue({
            props: {
                auth: {
                    user: null
                }
            }
        });

        const { result } = renderHook(() => useAuth());
        expect(result.current.isAuthenticated()).toBe(false);
        expect(result.current.user).toBeNull();
    });

    it('debería redirigir al login cuando se llama a redirectToLogin', () => {
        // Mock para route
        global.route = jest.fn().mockReturnValue('/login');

        (usePage as jest.Mock).mockReturnValue({
            props: {
                auth: {
                    user: null
                }
            }
        });

        const { result } = renderHook(() => useAuth());
        result.current.redirectToLogin();

        expect(router.visit).toHaveBeenCalledWith('/login', {
            preserveState: false,
            preserveScroll: false,
            replace: true
        });
    });
}); 