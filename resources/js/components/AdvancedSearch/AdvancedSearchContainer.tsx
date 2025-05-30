import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Filter, RotateCcw, Search, Plus } from 'lucide-react';
import { type LegalCase } from '@/types';
import { StringFilter } from './Filters/StringFilter';
import { DateFilter } from './Filters/DateFilter';
import { SelectFilter } from './Filters/SelectFilter';
import { IndividualFilter } from './Filters/IndividualFilter';
import { router } from '@inertiajs/react';

export interface FilterCriterion {
    id: string;
    field: string;
    operator: string;
    value: any;
    type: 'string' | 'date' | 'select' | 'boolean' | 'individual';
    label: string;
}

export interface AdvancedSearchProps {
    onSearch?: (criteria: FilterCriterion[]) => void;
    caseTypes?: { id: number; name: string }[];
    initialCriteria?: FilterCriterion[];
    className?: string;
}

export default function AdvancedSearchContainer({
    onSearch,
    caseTypes = [],
    initialCriteria = [],
    className = '',
}: AdvancedSearchProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [criteria, setCriteria] = useState<FilterCriterion[]>(initialCriteria);

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

    return (
        <Card className={`w-full ${className}`}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
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
                    <CardContent className="grid gap-4 px-6">
                        {criteria.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                No hay criterios de búsqueda. Añade un criterio para comenzar.
                            </div>
                        ) : (
                            criteria.map((criterion) => (
                                <div key={criterion.id} className="border rounded-md p-4">
                                    {criterion.type === 'string' && (
                                        <StringFilter
                                            criterion={criterion}
                                            onChange={(updates) => updateCriterion(criterion.id, updates)}
                                            onRemove={() => removeCriterion(criterion.id)}
                                        />
                                    )}
                                    {criterion.type === 'date' && (
                                        <DateFilter
                                            criterion={criterion}
                                            onChange={(updates) => updateCriterion(criterion.id, updates)}
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
                                            onChange={(updates) => updateCriterion(criterion.id, updates)}
                                            onRemove={() => removeCriterion(criterion.id)}
                                        />
                                    )}
                                    {criterion.type === 'individual' && (
                                        <IndividualFilter
                                            criterion={criterion}
                                            onChange={(updates) => updateCriterion(criterion.id, updates)}
                                            onRemove={() => removeCriterion(criterion.id)}
                                        />
                                    )}
                                </div>
                            ))
                        )}

                        <div className="flex flex-wrap gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addCriterion('string')}
                                className="flex items-center"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Texto
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addCriterion('date')}
                                className="flex items-center"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Fecha
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addCriterion('select')}
                                className="flex items-center"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Selección
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addCriterion('individual')}
                                className="flex items-center"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Persona Física
                            </Button>
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