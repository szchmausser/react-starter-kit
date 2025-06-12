import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { type FilterCriterion } from '../AdvancedSearchContainer';

interface StringFilterProps {
    criterion: FilterCriterion;
    onChange: (updates: Partial<FilterCriterion>) => void;
    onRemove: () => void;
}

// Definición de campos de texto disponibles para filtrar
const stringFields = [{ value: 'code', label: 'Código de Expediente' }];

// Operadores disponibles para campos de texto
const stringOperators = [
    { value: 'equals', label: 'Igual a' },
    { value: 'contains', label: 'Contiene' },
    { value: 'starts_with', label: 'Comienza con' },
    { value: 'ends_with', label: 'Termina con' },
    { value: 'not_contains', label: 'No contiene' },
];

export function StringFilter({ criterion, onChange, onRemove }: StringFilterProps) {
    // Cuando cambia el campo seleccionado
    const handleFieldChange = (value: string) => {
        const selectedField = stringFields.find((field) => field.value === value);
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

    // Cuando cambia el valor del input
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ value: e.target.value });
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
                            {stringFields.map((field) => (
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
                            {stringOperators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                    <Input
                        value={criterion.value || ''}
                        onChange={handleValueChange}
                        placeholder="Valor a buscar"
                        disabled={!criterion.field || !criterion.operator}
                        className="h-8 flex-grow text-xs sm:h-10 sm:text-sm"
                    />
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
