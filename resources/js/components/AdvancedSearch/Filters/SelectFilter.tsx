import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { type FilterCriterion } from '../AdvancedSearchContainer';

interface SelectFilterProps {
    criterion: FilterCriterion;
    onChange: (updates: Partial<FilterCriterion>) => void;
    onRemove: () => void;
    options: { value: string; label: string }[];
}

// Definición de campos de selección disponibles para filtrar
const selectFields = [{ value: 'case_type_id', label: 'Tipo de Caso' }];

// Operadores disponibles para campos de selección
const selectOperators = [
    { value: 'equals', label: 'Es igual a' },
    { value: 'not_equals', label: 'No es igual a' },
];

export function SelectFilter({ criterion, onChange, onRemove, options }: SelectFilterProps) {
    // Cuando cambia el campo seleccionado
    const handleFieldChange = (value: string) => {
        const selectedField = selectFields.find((field) => field.value === value);
        onChange({
            field: value,
            label: selectedField?.label || '',
            // Resetear operador y valor cuando cambia el campo
            operator: '',
            value: '',
        });
    };

    // Cuando cambia el operador seleccionado
    const handleOperatorChange = (value: string) => {
        onChange({ operator: value });
    };

    // Cuando cambia el valor seleccionado
    const handleValueChange = (value: string) => {
        onChange({ value });
    };

    return (
        <div className="grid grid-cols-1 gap-2 sm:gap-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
                <div>
                    <Select value={criterion.field} onValueChange={handleFieldChange}>
                        <SelectTrigger className="h-8 w-full text-xs sm:h-10 sm:text-sm">
                            <SelectValue placeholder="Seleccionar campo" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectFields.map((field) => (
                                <SelectItem key={field.value} value={field.value}>
                                    {field.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Select value={criterion.operator} onValueChange={handleOperatorChange} disabled={!criterion.field}>
                        <SelectTrigger className="h-8 w-full text-xs sm:h-10 sm:text-sm">
                            <SelectValue placeholder="Seleccionar operador" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectOperators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                    <div className="flex-grow">
                        <Select
                            value={criterion.value?.toString() || ''}
                            onValueChange={handleValueChange}
                            disabled={!criterion.field || !criterion.operator}
                        >
                            <SelectTrigger className="h-8 w-full text-xs sm:h-10 sm:text-sm">
                                <SelectValue placeholder="Seleccionar valor" />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRemove}
                        className="h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10"
                        title="Eliminar criterio"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
