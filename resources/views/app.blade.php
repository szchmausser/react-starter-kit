<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        {{-- Tailwind CSS desde CDN --}}
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

        {{-- Personalizaciones de Tailwind CSS --}}
        <style type="text/tailwindcss">
            @custom-variant dark (&:is(.dark *));

            @theme {
                --font-sans: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';

                --radius-lg: var(--radius);
                --radius-md: calc(var(--radius) - 2px);
                --radius-sm: calc(var(--radius) - 4px);

                --color-background: var(--background);
                --color-foreground: var(--foreground);

                --color-card: var(--card);
                --color-card-foreground: var(--card-foreground);

                --color-popover: var(--popover);
                --color-popover-foreground: var(--popover-foreground);

                --color-primary: var(--primary);
                --color-primary-foreground: var(--primary-foreground);

                --color-secondary: var(--secondary);
                --color-secondary-foreground: var(--secondary-foreground);

                --color-muted: var(--muted);
                --color-muted-foreground: var(--muted-foreground);

                --color-accent: var(--accent);
                --color-accent-foreground: var(--accent-foreground);

                --color-destructive: var(--destructive);
                --color-destructive-foreground: var(--destructive-foreground);

                --color-border: var(--border);
                --color-input: var(--input);
                --color-ring: var(--ring);

                --color-chart-1: var(--chart-1);
                --color-chart-2: var(--chart-2);
                --color-chart-3: var(--chart-3);
                --color-chart-4: var(--chart-4);
                --color-chart-5: var(--chart-5);

                --color-sidebar: var(--sidebar);
                --color-sidebar-foreground: var(--sidebar-foreground);
                --color-sidebar-primary: var(--sidebar-primary);
                --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
                --color-sidebar-accent: var(--sidebar-accent);
                --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
                --color-sidebar-border: var(--sidebar-border);
                --color-sidebar-ring: var(--sidebar-ring);
            }
        </style>

        {{-- Estilos base convertidos de @apply a CSS estándar --}}
        <style>
            /* Estilos base que antes usaban @apply */
            *,
            ::after,
            ::before,
            ::backdrop,
            ::file-selector-button {
                border-color: var(--color-gray-200, currentColor);
            }

            body {
                background-color: var(--color-background);
                color: var(--color-foreground);
            }
        </style>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
