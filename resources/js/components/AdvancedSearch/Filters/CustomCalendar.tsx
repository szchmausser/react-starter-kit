import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomCalendarProps {
    selectedDate?: Date;
    onDateSelect: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: (date: Date) => boolean;
    initialMonth?: Date;
    onMonthChange?: (date: Date) => void;
}

export default function CustomCalendar({
    selectedDate,
    onDateSelect,
    minDate,
    maxDate,
    disabledDates,
    initialMonth = new Date(),
    onMonthChange
}: CustomCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(initialMonth);

    // Actualizar el estado cuando cambia el mes inicial
    useEffect(() => {
        if (initialMonth) {
            setCurrentMonth(initialMonth);
        }
    }, [initialMonth]);

    // Nombres de los meses en español
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Generar años para el selector (desde 1950 hasta el año actual + 10)
    const currentYearNow = new Date().getFullYear();
    const years = Array.from(
        { length: currentYearNow + 10 - 1950 + 1 },
        (_, i) => 1950 + i
    );

    // Manejar cambio de mes
    const handlePrevMonth = () => {
        const newDate = subMonths(currentMonth, 1);
        setCurrentMonth(newDate);
        if (onMonthChange) {
            onMonthChange(newDate);
        }
    };

    const handleNextMonth = () => {
        const newDate = addMonths(currentMonth, 1);
        setCurrentMonth(newDate);
        if (onMonthChange) {
            onMonthChange(newDate);
        }
    };

    const handleMonthChange = (monthIndex: string) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(parseInt(monthIndex, 10));
        setCurrentMonth(newDate);
        if (onMonthChange) {
            onMonthChange(newDate);
        }
    };

    const handleYearChange = (year: string) => {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(parseInt(year, 10));
        setCurrentMonth(newDate);
        if (onMonthChange) {
            onMonthChange(newDate);
        }
    };

    // Generar días del calendario
    const generateCalendarDays = () => {
        // Obtener el primer día del mes
        const firstDayOfMonth = startOfMonth(currentMonth);

        // Obtener el último día del mes
        const lastDayOfMonth = endOfMonth(currentMonth);

        // Ajustar para que la semana comience en lunes (1) en lugar de domingo (0)
        const startWeekday = getDay(firstDayOfMonth) === 0 ? 6 : getDay(firstDayOfMonth) - 1;

        // Calcular el día inicial para mostrar (puede ser del mes anterior)
        const calendarStart = addDays(firstDayOfMonth, -startWeekday);

        // Generar 42 días (6 semanas) para asegurar que se cubra todo el mes
        const days = [];
        for (let i = 0; i < 42; i++) {
            const day = addDays(calendarStart, i);
            days.push(day);
        }

        return days;
    };

    const calendarDays = generateCalendarDays();

    // Comprobar si un día está deshabilitado
    const isDayDisabled = (day: Date) => {
        if (minDate && day < minDate) return true;
        if (maxDate && day > maxDate) return true;
        if (disabledDates && disabledDates(day)) return true;
        return false;
    };

    return (
        <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-md">
            {/* Cabecera con selector de mes/año */}
            <div className="flex justify-between items-center p-2 border-b dark:border-zinc-800">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevMonth}
                    className="h-7 w-7"
                    type="button"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-1">
                    <Select
                        value={currentMonth.getMonth().toString()}
                        onValueChange={handleMonthChange}
                    >
                        <SelectTrigger className="h-7 w-32">
                            <SelectValue>{months[currentMonth.getMonth()]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((monthName, index) => (
                                <SelectItem key={index} value={index.toString()}>
                                    {monthName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={currentMonth.getFullYear().toString()}
                        onValueChange={handleYearChange}
                    >
                        <SelectTrigger className="h-7 w-24">
                            <SelectValue>{currentMonth.getFullYear()}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextMonth}
                    className="h-7 w-7"
                    type="button"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Nombre del mes y año */}
            <div className="text-center text-sm font-medium p-2 dark:text-gray-300">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-0 text-center">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                    <div key={index} className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-0">
                {calendarDays.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isCurrentDay = isToday(day);
                    const disabled = isDayDisabled(day);

                    let dayClasses = "h-9 w-full flex items-center justify-center text-sm rounded-md ";

                    if (!isCurrentMonth) {
                        dayClasses += "text-gray-400 dark:text-gray-600 ";
                    } else if (isSelected) {
                        dayClasses += "bg-primary text-primary-foreground font-medium dark:bg-blue-600 dark:text-white ";
                    } else if (isCurrentDay) {
                        dayClasses += "bg-accent text-accent-foreground dark:bg-gray-700 dark:text-gray-100 ";
                    } else {
                        dayClasses += "hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-800 ";
                    }

                    if (disabled) {
                        dayClasses += "opacity-50 cursor-not-allowed ";
                    } else {
                        dayClasses += "cursor-pointer ";
                    }

                    return (
                        <button
                            key={index}
                            className={dayClasses}
                            onClick={() => !disabled && onDateSelect(day)}
                            disabled={disabled}
                            type="button"
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
} 