import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router } from '@inertiajs/react';
import { Building2, Calendar, ChevronDown, ChevronUp, FileText, Filter, ListFilter, RotateCcw, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { DateFilter } from './Filters/DateFilter';
import { IndividualFilter } from './Filters/IndividualFilter';
import { LegalEntityFilter } from './Filters/LegalEntityFilter';
import { SelectFilter } from './Filters/SelectFilter';
import { StringFilter } from './Filters/StringFilter';

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

export default function AdvancedSearchContainer({ onSearch, caseTypes = [], initialCriteria = [], className = '' }: AdvancedSearchProps) {
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
                { type: 'string', name: 'Texto', icon: <FileText className="mr-1.5 h-3.5 w-3.5" /> },
                { type: 'date', name: 'Fecha', icon: <Calendar className="mr-1.5 h-3.5 w-3.5" /> },
                { type: 'select', name: 'Selección', icon: <ListFilter className="mr-1.5 h-3.5 w-3.5" /> },
            ],
        },
        {
            id: 'related-entities',
            name: 'Entidades Relacionadas',
            description: 'Filtrar por entidades relacionadas con el expediente',
            icon: <Users className="h-4 w-4" />,
            filters: [
                { type: 'individual', name: 'Persona Física', icon: <Users className="mr-1.5 h-3.5 w-3.5" /> },
                { type: 'legal_entity', name: 'Persona Jurídica', icon: <Building2 className="mr-1.5 h-3.5 w-3.5" /> },
            ],
        },
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
        setCriteria(criteria.map((criterion) => (criterion.id === id ? { ...criterion, ...updates } : criterion)));
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
        return criteria.filter((c) => c.type === type).length;
    };

    // Contar criterios por grupo
    const countCriteriaByGroup = (groupId: string) => {
        const group = filterGroups.find((g) => g.id === groupId);
        if (!group) return 0;

        return group.filters.reduce((count, filter) => {
            return count + countCriteriaByType(filter.type);
        }, 0);
    };

    return (
        <Card className={`w-full ${className} mb-0`}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="bg-sidebar flex flex-row items-center justify-between px-4 py-1.5 sm:px-6 sm:py-2 dark:bg-zinc-800/50">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                        <Filter className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                        Búsqueda Avanzada
                    </CardTitle>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:w-9">
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="grid gap-2 px-4 pt-1.5 pb-1.5 sm:gap-3 sm:px-6 sm:pt-2 sm:pb-2">
                        <div className="bg-sidebar max-w-full rounded-lg p-1.5 sm:p-2 dark:bg-zinc-800/50">
                            <h3 className="mb-0.5 text-xs font-medium sm:mb-1 sm:text-sm">Añadir filtros</h3>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="mb-1 grid h-auto w-full grid-cols-2 sm:mb-2">
                                    {filterGroups.map((group) => (
                                        <TabsTrigger
                                            key={group.id}
                                            value={group.id}
                                            className="flex flex-1 items-center gap-1 px-2 py-0.5 text-xs sm:text-sm"
                                        >
                                            {group.icon}
                                            <span className="truncate">{group.name}</span>
                                            {countCriteriaByGroup(group.id) > 0 && (
                                                <span className="bg-primary/10 text-primary ml-1 rounded-full px-1.5 py-0.5 text-xs">
                                                    {countCriteriaByGroup(group.id)}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {filterGroups.map((group) => (
                                    <TabsContent key={group.id} value={group.id} className="mt-0">
                                        <div className="mb-1 text-xs text-gray-500 sm:mb-2 dark:text-gray-400">{group.description}</div>
                                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                            {group.filters.map((filter) => (
                                                <Button
                                                    key={filter.type}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addCriterion(filter.type)}
                                                    className="flex h-7 items-center px-2 py-0.5 text-xs sm:text-sm"
                                                >
                                                    {filter.icon}
                                                    <span className="truncate">{filter.name}</span>
                                                    {countCriteriaByType(filter.type) > 0 && (
                                                        <span className="bg-primary/10 text-primary ml-1 rounded-full px-1 text-xs">
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

                        {criteria.length === 0 ? (
                            <div className="py-1.5 text-center text-sm text-gray-500 sm:py-2 dark:text-gray-400">
                                No hay criterios de búsqueda. Añade un criterio para comenzar.
                            </div>
                        ) : (
                            <div className="bg-sidebar max-w-full rounded-lg p-1.5 sm:p-2 dark:bg-zinc-800/50">
                                <h3 className="mb-0.5 text-xs font-medium sm:mb-1 sm:text-sm">Criterios activos</h3>

                                <div className="space-y-1.5 sm:space-y-2">
                                    {criteria.map((criterion) => (
                                        <div
                                            key={criterion.id}
                                            className="overflow-x-auto rounded-md border bg-white p-1.5 shadow-sm sm:p-2 dark:bg-zinc-900"
                                        >
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
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="mt-0.5 flex justify-between px-4 pt-1.5 pb-1 sm:mt-1 sm:px-6 sm:pt-1.5 sm:pb-1">
                        <Button
                            variant="outline"
                            onClick={resetCriteria}
                            className="flex h-6 items-center text-xs sm:h-6 sm:text-sm"
                            disabled={criteria.length === 0}
                        >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Limpiar
                        </Button>
                        <Button onClick={executeSearch} className="flex h-6 items-center text-xs sm:h-6 sm:text-sm" disabled={criteria.length === 0}>
                            <Search className="mr-1 h-3 w-3" />
                            Buscar
                        </Button>
                    </CardFooter>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
