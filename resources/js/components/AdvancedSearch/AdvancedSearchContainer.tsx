import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChevronDown,
    ChevronUp,
    Filter,
    RotateCcw,
    Search,
    Plus,
    FileText,
    Calendar,
    ListFilter,
    Users,
    Building2
} from 'lucide-react';
import { StringFilter } from './Filters/StringFilter';
import { DateFilter } from './Filters/DateFilter';
import { SelectFilter } from './Filters/SelectFilter';
import { IndividualFilter } from './Filters/IndividualFilter';
import { LegalEntityFilter } from './Filters/LegalEntityFilter';
import { router } from '@inertiajs/react';

export interface FilterCriterion {
    id: string;
    field: string;
    operator: string;
    value: any;
    type: 'string' | 'date' | 'select' | 'boolean' | 'individual' | 'legal_entity';
    label: string;
}

export interface AdvancedSearchProps {
    onSearch?: (criteria: FilterCriterion[]) => void;
    caseTypes?: { id: number; name: string }[];
    initialCriteria?: FilterCriterion[];
    className?: string;
}

// Definimos los grupos de filtros para mejor organización
interface FilterGroup {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    filters: {
        type: FilterCriterion['type'];
        name: string;
        icon: React.ReactNode;
    }[];
}

export default function AdvancedSearchContainer({
    onSearch,
    caseTypes = [],
    initialCriteria = [],
    className = '',
}: AdvancedSearchProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [criteria, setCriteria] = useState<FilterCriterion[]>(initialCriteria);
    const [activeTab, setActiveTab] = useState<string>('direct-fields');

    // Definición de grupos de filtros
    const filterGroups: FilterGroup[] = [
        {
            id: 'direct-fields',
            name: 'Campos del Expediente',
            description: 'Filtrar por campos directos del expediente legal',
            icon: <FileText className="h-4 w-4" />,
            filters: [
                { type: 'string', name: 'Texto', icon: <FileText className="h-3.5 w-3.5 mr-1.5" /> },
                { type: 'date', name: 'Fecha', icon: <Calendar className="h-3.5 w-3.5 mr-1.5" /> },
                { type: 'select', name: 'Selección', icon: <ListFilter className="h-3.5 w-3.5 mr-1.5" /> },
            ]
        },
        {
            id: 'related-entities',
            name: 'Entidades Relacionadas',
            description: 'Filtrar por entidades relacionadas con el expediente',
            icon: <Users className="h-4 w-4" />,
            filters: [
                { type: 'individual', name: 'Persona Física', icon: <Users className="h-3.5 w-3.5 mr-1.5" /> },
                { type: 'legal_entity', name: 'Persona Jurídica', icon: <Building2 className="h-3.5 w-3.5 mr-1.5" /> },
            ]
        }
    ];

    // Función para añadir un nuevo criterio de filtro
    const addCriterion = (type: FilterCriterion['type']) => {
        const newCriterion: FilterCriterion = {
            id: `criterion-${Date.now()}`,
            field: '',
            operator: '',
            value: '',
            type,
            label: '',
        };
        setCriteria([...criteria, newCriterion]);
    };

    // Función para actualizar un criterio existente
    const updateCriterion = (id: string, updates: Partial<FilterCriterion>) => {
        setCriteria(
            criteria.map((criterion) =>
                criterion.id === id ? { ...criterion, ...updates } : criterion
            )
        );
    };

    // Función para eliminar un criterio
    const removeCriterion = (id: string) => {
        setCriteria(criteria.filter((criterion) => criterion.id !== id));
    };

    // Función para resetear todos los criterios
    const resetCriteria = () => {
        setCriteria([]);

        // Navegar a la URL base sin filtros para restablecer los resultados
        // Mantenemos isOpen=true en los parámetros para que el panel siga desplegado
        router.visit(route('legal-cases.index', { open_search: 'true' }), {
            preserveState: false,
            replace: true,
        });
    };

    // Función para ejecutar la búsqueda
    const executeSearch = () => {
        if (onSearch) {
            onSearch(criteria);
        } else {
            // Si no se proporciona una función onSearch, usamos Inertia para navegar
            const queryParams = buildQueryParams(criteria);
            // Añadimos el parámetro open_search para mantener abierto el panel
            queryParams.open_search = 'true';

            router.visit(route('legal-cases.index', queryParams), {
                preserveState: true,
                replace: true,
                only: ['legalCases', 'filters', 'debug'],
            });
        }
    };

    // Función para construir los parámetros de consulta para la URL
    const buildQueryParams = (criteria: FilterCriterion[]) => {
        const params: Record<string, string> = {};

        criteria.forEach((criterion, index) => {
            params[`filter[${index}][field]`] = criterion.field;
            params[`filter[${index}][operator]`] = criterion.operator;

            // Manejo especial para valores según el tipo
            if (criterion.type === 'date' && criterion.operator === 'between' && typeof criterion.value === 'object') {
                params[`filter[${index}][value]`] = JSON.stringify(criterion.value);
            } else {
                params[`filter[${index}][value]`] = String(criterion.value || '');
            }

            params[`filter[${index}][type]`] = criterion.type;
        });

        return params;
    };

    // Contar criterios por tipo
    const countCriteriaByType = (type: FilterCriterion['type']) => {
        return criteria.filter(c => c.type === type).length;
    };

    // Contar criterios por grupo
    const countCriteriaByGroup = (groupId: string) => {
        const group = filterGroups.find(g => g.id === groupId);
        if (!group) return 0;

        return group.filters.reduce((count, filter) => {
            return count + countCriteriaByType(filter.type);
        }, 0);
    };

    return (
        <Card className={`w-full ${className}`}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="flex flex-row items-center justify-between py-4 px-6 bg-slate-50 dark:bg-zinc-800/50">
                    <CardTitle className="text-lg flex items-center">
                        <Filter className="h-5 w-5 mr-2" />
                        Búsqueda Avanzada
                    </CardTitle>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            {isOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="grid gap-4 px-6 pt-4">
                        {criteria.length > 0 && (
                            <div className="space-y-4 mb-2">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Criterios activos</h3>
                                {criteria.map((criterion) => (
                                    <div key={criterion.id} className="border rounded-md p-4 bg-white dark:bg-zinc-900 shadow-sm">
                                        {criterion.type === 'string' && (
                                            <StringFilter
                                                criterion={criterion}
                                                onChange={(updates: Partial<FilterCriterion>) => updateCriterion(criterion.id, updates)}
                                                onRemove={() => removeCriterion(criterion.id)}
                                            />
                                        )}
                                        {criterion.type === 'date' && (
                                            <DateFilter
                                                criterion={criterion}
                                                onChange={(updates: Partial<FilterCriterion>) => updateCriterion(criterion.id, updates)}
                                                onRemove={() => removeCriterion(criterion.id)}
                                            />
                                        )}
                                        {criterion.type === 'select' && (
                                            <SelectFilter
                                                criterion={criterion}
                                                options={
                                                    criterion.field === 'case_type_id'
                                                        ? caseTypes.map((type) => ({
                                                            value: type.id.toString(),
                                                            label: type.name,
                                                        }))
                                                        : []
                                                }
                                                onChange={(updates: Partial<FilterCriterion>) => updateCriterion(criterion.id, updates)}
                                                onRemove={() => removeCriterion(criterion.id)}
                                            />
                                        )}
                                        {criterion.type === 'individual' && (
                                            <IndividualFilter
                                                criterion={criterion}
                                                onChange={(updates: Partial<FilterCriterion>) => updateCriterion(criterion.id, updates)}
                                                onRemove={() => removeCriterion(criterion.id)}
                                            />
                                        )}
                                        {criterion.type === 'legal_entity' && (
                                            <LegalEntityFilter
                                                criterion={criterion}
                                                onChange={(updates: Partial<FilterCriterion>) => updateCriterion(criterion.id, updates)}
                                                onRemove={() => removeCriterion(criterion.id)}
                                            />
                                        )}
                                    </div>
                                ))}
                                <Separator className="my-4" />
                            </div>
                        )}

                        {criteria.length === 0 && (
                            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                No hay criterios de búsqueda. Añade un criterio para comenzar.
                            </div>
                        )}

                        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg p-4">
                            <h3 className="text-sm font-medium mb-3">Añadir filtros</h3>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="w-full mb-4">
                                    {filterGroups.map(group => (
                                        <TabsTrigger
                                            key={group.id}
                                            value={group.id}
                                            className="flex items-center gap-1.5 flex-1"
                                        >
                                            {group.icon}
                                            <span>{group.name}</span>
                                            {countCriteriaByGroup(group.id) > 0 && (
                                                <span className="ml-1.5 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                                                    {countCriteriaByGroup(group.id)}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {filterGroups.map(group => (
                                    <TabsContent key={group.id} value={group.id} className="mt-0">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            {group.description}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {group.filters.map(filter => (
                                                <Button
                                                    key={filter.type}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addCriterion(filter.type)}
                                                    className="flex items-center"
                                                >
                                                    {filter.icon}
                                                    {filter.name}
                                                    {countCriteriaByType(filter.type) > 0 && (
                                                        <span className="ml-1.5 bg-primary/10 text-primary rounded-full px-1.5 text-xs">
                                                            {countCriteriaByType(filter.type)}
                                                        </span>
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between px-6 py-4 border-t">
                        <Button
                            variant="outline"
                            onClick={resetCriteria}
                            className="flex items-center"
                            disabled={criteria.length === 0}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Limpiar
                        </Button>
                        <Button
                            onClick={executeSearch}
                            className="flex items-center"
                            disabled={criteria.length === 0}
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Buscar
                        </Button>
                    </CardFooter>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
} 