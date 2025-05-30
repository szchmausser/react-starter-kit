import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';

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
        'Expedientes': 'legal-cases.show',
        'Archivos': 'files.show',
        'Personas': 'individuals.show',
        'Entidades': 'legal-entities.show',
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
        'Expedientes': 'Exp.',
        'Personas': 'Pers.',
        'Entidades': 'Ent.',
        'Archivos': 'Arch.',
        'Documentos': 'Docs.',
        'Tareas': 'Tareas',
    };

    return shortNames[modelType] || modelType;
};

export function TagRelationsModal({
    isOpen,
    onClose,
    tag,
    relations,
    isLoading
}: TagRelationsModalProps) {
    // Estado para el tab activo
    const [activeTab, setActiveTab] = useState<string>('');

    // Establecer el tab activo cuando cambian las relaciones
    if (relations && Object.keys(relations).length > 0 && !activeTab) {
        setActiveTab(Object.keys(relations)[0]);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col w-[95vw]">
                <DialogHeader className="text-center sm:text-left">
                    <DialogTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className="truncate">Relaciones de etiqueta:</span>
                        <span className="font-semibold">{getTagName(tag)}</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Elementos que utilizan esta etiqueta en el sistema
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">Cargando relaciones...</span>
                        </div>
                    ) : relations && Object.keys(relations).length > 0 ? (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                            {/* TabsList con scroll horizontal en móviles cuando hay muchas pestañas */}
                            <div className="overflow-x-auto pb-1 -mx-1 px-1">
                                <TabsList className="flex sm:inline-flex w-auto min-w-full sm:min-w-0">
                                    {Object.keys(relations).map(modelType => (
                                        <TabsTrigger
                                            key={modelType}
                                            value={modelType}
                                            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1.5"
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
                                                {items.map(item => {
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
                                                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium truncate">{item.title || item.name || itemIdentifier}</div>
                                                                {item.description && (
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                                        {item.description}
                                                                    </div>
                                                                )}
                                                                {item.created_at && (
                                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                        Creado: {new Date(item.created_at).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {detailRoute !== '#' ? (
                                                                <Link href={detailRoute} className="self-end sm:self-center">
                                                                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                        <Eye className="h-4 w-4 mr-1" />
                                                                        Ver detalles
                                                                    </Button>
                                                                </Link>
                                                            ) : (
                                                                <Button variant="outline" size="sm" disabled className="self-end sm:self-center whitespace-nowrap">
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    Ver detalles
                                                                </Button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                No hay elementos de tipo {modelType} relacionados con esta etiqueta.
                                            </div>
                                        )}
                                    </TabsContent>
                                ))}
                            </div>
                        </Tabs>
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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