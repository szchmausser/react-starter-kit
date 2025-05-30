"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Componente personalizado para los días de la semana
const CustomWeekHeader = () => {
    const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    return (
        <div className="flex w-full justify-center">
            {weekdays.map((day, i) => (
                <div key={i} className="text-muted-foreground w-9 font-medium text-center text-xs py-2 dark:text-gray-400">
                    {day}
                </div>
            ))}
        </div>
    );
};

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            locale={es}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium dark:text-gray-100",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 dark:border-gray-700 dark:hover:bg-gray-800"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "hidden",
                head_cell: "hidden",
                row: "flex w-full mt-2 justify-center",
                cell: "w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected])]:bg-gray-800",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                ),
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700",
                day_today: "bg-accent text-accent-foreground dark:bg-gray-700 dark:text-gray-100",
                day_outside: "text-muted-foreground opacity-50 dark:text-gray-500",
                day_disabled: "text-muted-foreground opacity-50 dark:text-gray-600",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-300",
                day_hidden: "invisible",
                ...classNames,
            }}
            formatters={{
                formatWeekdayName: () => ""
            }}
            components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
                WeekHeader: CustomWeekHeader
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar } 