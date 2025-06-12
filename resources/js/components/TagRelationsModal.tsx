import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@inertiajs/react';
import { Eye, Loader2 } from 'lucide-react';
import { useState } from 'react';

// Estructura de los tipos relacionados a una etiqueta
interface RelatedItem {
    id: number;
    title?: string;
    name?: string;
    code?: string;
    description?: string;
    created_at?: string;
}

// Estructura de las relaciones agrupadas por tipo de modelo
interface TagRelations {
    [modelType: string]: RelatedItem[];
}

// Props del componente
interface TagRelationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tag: {
        id: number;
        name: string | Record<string, string>;
        type: string | null;
    } | null;
    relations: TagRelations | null;
    isLoading: boolean;
}

/**
 * Función para obtener el nombre de la etiqueta según el idioma actual
 */
const getTagName = (tag: { name: string | Record<string, string> } | null) => {
    if (!tag) return '';

    if (typeof tag.name === 'string') return tag.name;

    const locale = document.documentElement.lang || 'es';
    return tag.name[locale] || Object.values(tag.name)[0] || 'Sin nombre';
};

/**
 * Función para obtener la ruta de detalle según el tipo de modelo
 * Comprueba primero si la ruta existe usando route().check()
 */
const getModelDetailRoute = (modelType: string, id: number): string => {
    // Mapeo de tipos de modelo a nombres de rutas
    const routeMapping: Record<string, string> = {
        Expedientes: 'legal-cases.show',
        Archivos: 'files.show',
        Personas: 'individuals.show',
        Entidades: 'legal-entities.show',
        // Añadir más modelos según se implementen
    };

    const routeName = routeMapping[modelType];

    // Si no hay mapeo para este tipo de modelo, retornar '#'
    if (!routeName) return '#';

    try {
        // Intentar generar la ruta y verificar si existe
        return route(routeName, id);
    } catch (error) {
        // Si hay error (la ruta no existe), devolver '#'
        return '#';
    }
};

/**
 * Función para obtener una versión abreviada del nombre del modelo
 * para mostrar en dispositivos móviles
 */
const getShortModelName = (modelType: string): string => {
    const shortNames: Record<string, string> = {
        Expedientes: 'Exp.',
        Personas: 'Pers.',
        Entidades: 'Ent.',
        Archivos: 'Arch.',
        Documentos: 'Docs.',
        Tareas: 'Tareas',
    };

    return shortNames[modelType] || modelType;
};

export function TagRelationsModal({ isOpen, onClose, tag, relations, isLoading }: TagRelationsModalProps) {
    // Estado para el tab activo
    const [activeTab, setActiveTab] = useState<string>('');

    // Establecer el tab activo cuando cambian las relaciones
    if (relations && Object.keys(relations).length > 0 && !activeTab) {
        setActiveTab(Object.keys(relations)[0]);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[80vh] w-[95vw] flex-col overflow-hidden sm:max-w-[600px]">
                <DialogHeader className="text-center sm:text-left">
                    <DialogTitle className="flex flex-col gap-1 text-lg sm:flex-row sm:items-center sm:text-xl">
                        <span className="truncate">Relaciones de etiqueta:</span>
                        <span className="font-semibold">{getTagName(tag)}</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm">Elementos que utilizan esta etiqueta en el sistema</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="text-primary h-8 w-8 animate-spin" />
                            <span className="text-muted-foreground ml-2 text-sm">Cargando relaciones...</span>
                        </div>
                    ) : relations && Object.keys(relations).length > 0 ? (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full w-full flex-col">
                            {/* TabsList con scroll horizontal en móviles cuando hay muchas pestañas */}
                            <div className="-mx-1 overflow-x-auto px-1 pb-1">
                                <TabsList className="flex w-auto min-w-full sm:inline-flex sm:min-w-0">
                                    {Object.keys(relations).map((modelType) => (
                                        <TabsTrigger
                                            key={modelType}
                                            value={modelType}
                                            className="px-2 py-1.5 text-xs whitespace-nowrap sm:px-3 sm:text-sm"
                                        >
                                            <span className="sm:hidden">{getShortModelName(modelType)}</span>
                                            <span className="hidden sm:inline">{modelType}</span>
                                            <span className="ml-1 text-xs">({relations[modelType].length})</span>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                {Object.entries(relations).map(([modelType, items]) => (
                                    <TabsContent
                                        key={modelType}
                                        value={modelType}
                                        className="mt-3 h-full overflow-y-auto"
                                        {...(activeTab === modelType ? { forceMount: true } : {})}
                                    >
                                        {items.length > 0 ? (
                                            <div className="space-y-2">
                                                {items.map((item) => {
                                                    const detailRoute = getModelDetailRoute(modelType, item.id);

                                                    // Obtener un texto de identificación según el tipo de modelo
                                                    let itemIdentifier = '';
                                                    if (modelType === 'Expedientes') {
                                                        itemIdentifier = `Expediente ${item.code || `EXP-${item.id}`}`;
                                                    } else if (modelType === 'Archivos') {
                                                        itemIdentifier = `Archivo ${item.code || `F-${item.id}`}`;
                                                    } else if (modelType === 'Personas') {
                                                        itemIdentifier = `Persona ${item.code || `#${item.id}`}`;
                                                    } else if (modelType === 'Entidades') {
                                                        itemIdentifier = `Entidad ${item.code || `#${item.id}`}`;
                                                    } else {
                                                        itemIdentifier = `${modelType} ${item.code || item.id}`;
                                                    }

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="flex flex-col gap-2 rounded-md border p-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-zinc-800"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <div className="truncate font-medium">
                                                                    {item.title || item.name || itemIdentifier}
                                                                </div>
                                                                {item.description && (
                                                                    <div className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                                                                        {item.description}
                                                                    </div>
                                                                )}
                                                                {item.created_at && (
                                                                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                                        Creado: {new Date(item.created_at).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {detailRoute !== '#' ? (
                                                                <Link href={detailRoute} className="self-end sm:self-center">
                                                                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                        <Eye className="mr-1 h-4 w-4" />
                                                                        Ver detalles
                                                                    </Button>
                                                                </Link>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled
                                                                    className="self-end whitespace-nowrap sm:self-center"
                                                                >
                                                                    <Eye className="mr-1 h-4 w-4" />
                                                                    Ver detalles
                                                                </Button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                                No hay elementos de tipo {modelType} relacionados con esta etiqueta.
                                            </div>
                                        )}
                                    </TabsContent>
                                ))}
                            </div>
                        </Tabs>
                    ) : (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            No se encontraron elementos relacionados con esta etiqueta.
                            <p className="mt-2 text-sm">
                                Esta etiqueta no está siendo utilizada actualmente por ningún expediente u otro elemento en el sistema.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
