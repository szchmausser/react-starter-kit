import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import * as React from 'react';

interface LaravelPaginationProps {
    links: { url: string | null; label: string; active: boolean }[];
    onPageChange: (url: string | null) => void;
}

const LaravelPagination: React.FC<LaravelPaginationProps> = ({ links, onPageChange }) => {
    // Si no hay links, mostrar controles de paginación de fallback
    if (!links || links.length === 0) {
        return (
            <div className="flex items-center space-x-1">
                <Button variant="outline" size="icon" disabled className="h-8 w-8">
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" disabled className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" disabled className="h-8 w-8 font-bold">
                    1
                </Button>
                <Button variant="outline" size="icon" disabled className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" disabled className="h-8 w-8">
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    // Filtrar los links para excluir los de "previous" y "next" si queremos mostrar solo números
    const pageLinks = links.filter((link) => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;' && link.url !== null);

    // Función para decodificar entidades HTML en las etiquetas
    const decodeHtmlEntities = (text: string): string => {
        return text
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&hellip;/g, '...');
    };

    // Función auxiliar para obtener un enlace y verificar si es nulo
    const getLinkByLabel = (label: string) => {
        return links.find((link) => link.label === label);
    };

    // Controles de paginación simple para la mayoría de casos de uso
    return (
        <div className="flex items-center space-x-1">
            {/* Primera página */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => {
                    const firstLink = getLinkByLabel('1');
                    if (firstLink?.url) onPageChange(firstLink.url);
                }}
                disabled={!getLinkByLabel('1')?.url || getLinkByLabel('1')?.active}
                className="h-8 w-8"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Página anterior */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => {
                    const prevLink = getLinkByLabel('&laquo; Previous');
                    if (prevLink?.url) onPageChange(prevLink.url);
                }}
                disabled={!getLinkByLabel('&laquo; Previous')?.url}
                className="h-8 w-8"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Números de página */}
            {links
                .filter((link) => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;')
                .map((link, i) => {
                    // Omitir los botones que no tienen URL (no son clicables)
                    if (!link.url && link.label.includes('...')) {
                        return (
                            <span key={i} className="px-2 text-gray-500">
                                ...
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={i}
                            variant={link.active ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => {
                                if (link.url) onPageChange(link.url);
                            }}
                            disabled={!link.url || link.active}
                            className={`h-8 w-8 ${link.active ? 'font-bold' : ''}`}
                        >
                            {decodeHtmlEntities(link.label)}
                        </Button>
                    );
                })}

            {/* Si no hay números de página, mostrar al menos el actual */}
            {links.filter((link) => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;').length === 0 && (
                <Button variant="default" size="icon" disabled className="h-8 w-8 font-bold">
                    1
                </Button>
            )}

            {/* Página siguiente */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => {
                    const nextLink = getLinkByLabel('Next &raquo;');
                    if (nextLink?.url) onPageChange(nextLink.url);
                }}
                disabled={!getLinkByLabel('Next &raquo;')?.url}
                className="h-8 w-8"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Última página */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => {
                    const lastPageLink = links
                        .filter((link) => /^\d+$/.test(link.label) && link.url)
                        .sort((a, b) => parseInt(b.label) - parseInt(a.label))[0];

                    if (lastPageLink?.url) onPageChange(lastPageLink.url);
                }}
                disabled={!links.find((link) => /^\d+$/.test(link.label) && !link.active && link.url)}
                className="h-8 w-8"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default LaravelPagination;
