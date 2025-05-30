import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { type FilterCriterion } from '../AdvancedSearchContainer';

interface LegalEntityFilterProps {
    criterion: FilterCriterion;
    onChange: (updates: Partial<FilterCriterion>) => void;
    onRemove: () => void;
}

// Campos disponibles para filtrar entidades legales
const legalEntityFields = [
    { value: 'legal_entity_rif', label: 'RIF' },
    { value: 'legal_entity_business_name', label: 'Nombre (Razón social / Comercial)' },
];

// Operadores disponibles para filtro de entidades legales
const legalEntityOperators = [
    { value: 'equals', label: 'Igual a' },
    { value: 'contains', label: 'Contiene' },
    { value: 'starts_with', label: 'Comienza con' },
];

export function LegalEntityFilter({ criterion, onChange, onRemove }: LegalEntityFilterProps) {
    // Cuando cambia el campo seleccionado
    const handleFieldChange = (value: string) => {
        const selectedField = legalEntityFields.find(field => field.value === value);
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

    // Determinar el placeholder y descripción según el campo seleccionado
    const getPlaceholder = () => {
        if (criterion.field === 'legal_entity_rif') {
            return "J-12345678-9";
        }
        return "Nombre de la empresa";
    };

    const getDescription = () => {
        if (criterion.field === 'legal_entity_rif') {
            return "Busca expedientes relacionados con entidades legales por su RIF";
        }
        return "Busca expedientes por razón social o nombre comercial de la entidad";
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
                <div className="text-sm font-medium mb-2">Persona Jurídica</div>
                <div className="text-xs text-gray-500">
                    {getDescription()}
                </div>
            </div>

            <div>
                <Select
                    value={criterion.field}
                    onValueChange={handleFieldChange}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar campo" />
                    </SelectTrigger>
                    <SelectContent>
                        {legalEntityFields.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                                {field.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Select
                    value={criterion.operator}
                    onValueChange={handleOperatorChange}
                    disabled={!criterion.field}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar operador" />
                    </SelectTrigger>
                    <SelectContent>
                        {legalEntityOperators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                                {op.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    value={criterion.value || ''}
                    onChange={handleValueChange}
                    placeholder={getPlaceholder()}
                    disabled={!criterion.field || !criterion.operator}
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