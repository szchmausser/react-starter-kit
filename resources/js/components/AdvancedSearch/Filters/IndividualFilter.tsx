import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { type FilterCriterion } from '../AdvancedSearchContainer';

interface IndividualFilterProps {
    criterion: FilterCriterion;
    onChange: (updates: Partial<FilterCriterion>) => void;
    onRemove: () => void;
}

// Operadores disponibles para filtro de documento de identidad
const individualOperators = [
    { value: 'equals', label: 'Igual a' },
    { value: 'contains', label: 'Contiene' },
];

export function IndividualFilter({ criterion, onChange, onRemove }: IndividualFilterProps) {
    // Cuando se inicializa el componente, establecemos el campo automáticamente
    if (!criterion.field) {
        onChange({
            field: 'individual_id_document',
            label: 'Documento de Identidad',
        });
    }

    // Cuando cambia el operador seleccionado
    const handleOperatorChange = (value: string) => {
        onChange({ operator: value });
    };

    // Cuando cambia el valor del input
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ value: e.target.value });
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
                <div className="text-sm font-medium mb-2">Documento de Identidad</div>
                <div className="text-xs text-gray-500">
                    Busca expedientes relacionados con individuos por su documento de identidad
                </div>
            </div>

            <div>
                <Select
                    value={criterion.operator}
                    onValueChange={handleOperatorChange}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar operador" />
                    </SelectTrigger>
                    <SelectContent>
                        {individualOperators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                                {op.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
                <Input
                    value={criterion.value || ''}
                    onChange={handleValueChange}
                    placeholder="Documento de identidad a buscar"
                    disabled={!criterion.operator}
                    className="flex-grow"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="flex-shrink-0"
                    title="Eliminar criterio"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
} 