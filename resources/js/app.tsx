import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { router } from '@inertiajs/react';
import axios from 'axios';

// Configurar axios para que maneje correctamente los formularios con archivos
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Manejador global para errores de Inertia
document.addEventListener('inertia:error', (event: any) => {
    // Si el error es de autenticación (401), redirigir al login
    if (event.detail?.response?.status === 401) {
        event.preventDefault();
        try {
            router.visit(route('login'), {
                preserveState: false,
                preserveScroll: false,
                replace: true
            });
        } catch (error) {
            console.error('Error al redireccionar:', error);
            // Si falla el router.visit, intentar con window.location
            try {
                window.location.href = route('login');
            } catch (routeError) {
                // Si todo falla, redireccionar a /login directamente
                window.location.href = '/login';
            }
        }
    }
});

// Manejador global para errores de promesas no capturadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa no manejada:', event.reason);
    // Si el error parece estar relacionado con la autenticación, redirigir al login
    if (event.reason?.response?.status === 401 ||
        (typeof event.reason === 'string' && event.reason.includes('auth')) ||
        (event.reason?.message && event.reason.message.includes('auth'))) {
        try {
            router.visit(route('login'), {
                preserveState: false,
                preserveScroll: false,
                replace: true
            });
        } catch (error) {
            window.location.href = '/login';
        }
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
