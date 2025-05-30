import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse, isValid, getYear, getMonth, setYear, setMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { type FilterCriterion } from '../AdvancedSearchContainer';
import { Input } from '@/components/ui/input';
import CustomCalendar from './CustomCalendar';

interface DateFilterProps {
    criterion: FilterCriterion;
    onChange: (updates: Partial<FilterCriterion>) => void;
    onRemove: () => void;
}

// Definición de campos de fecha disponibles para filtrar
const dateFields = [
    { value: 'entry_date', label: 'Fecha de Entrada' },
    { value: 'sentence_date', label: 'Fecha de Sentencia' },
    { value: 'closing_date', label: 'Fecha de Salida' },
];

// Operadores disponibles para campos de fecha
const dateOperators = [
    { value: 'equals', label: 'Igual a' },
    { value: 'before', label: 'Antes de' },
    { value: 'after', label: 'Después de' },
    { value: 'between', label: 'Entre' },
    { value: 'is_null', label: 'No tiene fecha' },
    { value: 'is_not_null', label: 'Tiene fecha' },
];

export function DateFilter({ criterion, onChange, onRemove }: DateFilterProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(
        criterion.value && criterion.value.start ? new Date(criterion.value.start) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        criterion.value && criterion.value.end ? new Date(criterion.value.end) : undefined
    );

    const [startDateInput, setStartDateInput] = useState<string>(
        startDate ? format(startDate, 'dd/MM/yyyy') : ''
    );

    const [endDateInput, setEndDateInput] = useState<string>(
        endDate ? format(endDate, 'dd/MM/yyyy') : ''
    );

    // Estados para controlar la navegación del calendario
    const [startCalendarDate, setStartCalendarDate] = useState<Date>(startDate || new Date());
    const [endCalendarDate, setEndCalendarDate] = useState<Date>(endDate || new Date());

    // Actualizar inputs cuando cambian las fechas seleccionadas en el calendario
    useEffect(() => {
        if (startDate) {
            setStartDateInput(format(startDate, 'dd/MM/yyyy'));
            setStartCalendarDate(startDate);
        }
    }, [startDate]);

    useEffect(() => {
        if (endDate) {
            setEndDateInput(format(endDate, 'dd/MM/yyyy'));
            setEndCalendarDate(endDate);
        }
    }, [endDate]);

    // Actualizar el valor del criterio cuando cambian las fechas
    useEffect(() => {
        if (criterion.operator === 'between') {
            if (startDate || endDate) {
                // Crear un objeto JSON con las fechas de inicio y fin
                const rangeValue = {
                    start: startDate ? format(startDate, 'yyyy-MM-dd') : null,
                    end: endDate ? format(endDate, 'yyyy-MM-dd') : null,
                };

                // Convertir el objeto a JSON string para asegurar que se envíe correctamente
                onChange({
                    value: JSON.stringify(rangeValue)
                });
            }
        } else if (criterion.operator === 'equals' || criterion.operator === 'before' || criterion.operator === 'after') {
            if (startDate) {
                onChange({
                    value: format(startDate, 'yyyy-MM-dd'),
                });
            }
        } else if (criterion.operator === 'is_null' || criterion.operator === 'is_not_null') {
            onChange({ value: true });
        }
    }, [startDate, endDate, criterion.operator]);

    // Cuando cambia el campo seleccionado
    const handleFieldChange = (value: string) => {
        const selectedField = dateFields.find(field => field.value === value);
        onChange({
            field: value,
            label: selectedField?.label || '',
            operator: '',
            value: '',
        });
        setStartDate(undefined);
        setEndDate(undefined);
        setStartDateInput('');
        setEndDateInput('');
    };

    // Cuando cambia el operador seleccionado
    const handleOperatorChange = (value: string) => {
        onChange({
            operator: value,
            value: value === 'is_null' || value === 'is_not_null' ? true : '',
        });

        // Resetear fechas si cambia el operador
        if (value !== 'between') {
            setEndDate(undefined);
            setEndDateInput('');
        }
        if (value === 'is_null' || value === 'is_not_null') {
            setStartDate(undefined);
            setStartDateInput('');
        }
    };

    // Manejar cambio de input de fecha
    const handleStartDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStartDateInput(value);

        // Intentar parsear la fecha solo si tiene el formato completo
        if (value && value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            try {
                const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
                if (isValid(parsedDate)) {
                    setStartDate(parsedDate);
                    setStartCalendarDate(parsedDate); // Actualizar la fecha del calendario
                }
            } catch (error) {
                // Si hay error al parsear, no actualizamos la fecha
            }
        } else if (!value) {
            setStartDate(undefined);
        }
    };

    // Manejar cambio de input de fecha final
    const handleEndDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEndDateInput(value);

        // Intentar parsear la fecha solo si tiene el formato completo
        if (value && value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            try {
                const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
                if (isValid(parsedDate)) {
                    setEndDate(parsedDate);
                    setEndCalendarDate(parsedDate); // Actualizar la fecha del calendario
                }
            } catch (error) {
                // Si hay error al parsear, no actualizamos la fecha
            }
        } else if (!value) {
            setEndDate(undefined);
        }
    };

    // Renderizar el selector de fechas según el operador
    const renderDateSelector = () => {
        if (!criterion.field || !criterion.operator) return null;

        if (criterion.operator === 'is_null' || criterion.operator === 'is_not_null') {
            return null; // No necesitamos selector de fechas para estos operadores
        }

        if (criterion.operator === 'between') {
            return (
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                        <div className="relative">
                            <Input
                                value={startDateInput}
                                onChange={handleStartDateInputChange}
                                placeholder="DD/MM/AAAA"
                                className="pr-10"
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full"
                                    >
                                        <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CustomCalendar
                                        selectedDate={startDate}
                                        onDateSelect={(date) => {
                                            setStartDate(date);
                                            setStartDateInput(format(date, 'dd/MM/yyyy'));
                                        }}
                                        initialMonth={startDate || new Date()}
                                        onMonthChange={setStartCalendarDate}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="relative">
                            <Input
                                value={endDateInput}
                                onChange={handleEndDateInputChange}
                                placeholder="DD/MM/AAAA"
                                className="pr-10"
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full"
                                    >
                                        <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CustomCalendar
                                        selectedDate={endDate}
                                        onDateSelect={(date) => {
                                            setEndDate(date);
                                            setEndDateInput(format(date, 'dd/MM/yyyy'));
                                        }}
                                        initialMonth={endDate || new Date()}
                                        onMonthChange={setEndCalendarDate}
                                        minDate={startDate}
                                        disabledDates={(date) => startDate ? date < startDate : false}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative">
                <Input
                    value={startDateInput}
                    onChange={handleStartDateInputChange}
                    placeholder="DD/MM/AAAA"
                    className="pr-10"
                />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                        >
                            <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <CustomCalendar
                            selectedDate={startDate}
                            onDateSelect={(date) => {
                                setStartDate(date);
                                setStartDateInput(format(date, 'dd/MM/yyyy'));
                            }}
                            initialMonth={startDate || new Date()}
                            onMonthChange={setStartCalendarDate}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
                <Select value={criterion.field} onValueChange={handleFieldChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar campo" />
                    </SelectTrigger>
                    <SelectContent>
                        {dateFields.map((field) => (
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
                        {dateOperators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                                {op.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
                <div className="flex-grow">
                    {renderDateSelector()}
                </div>
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