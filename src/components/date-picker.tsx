import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { SelectHandler } from "react-day-picker"

type Props = {
    value?: Date,
    onChange?: SelectHandler<{ mode: "single" }>;
    disabled?: boolean
}

export const DatePicker = ({
    value,
    onChange,
    disabled
}: Props) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    disabled={disabled}
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="size-4 mr-2" />
                    {value ? format(value, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent >
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(date) => onChange?.(date)}
                    disabled={disabled}
                    autoFocus
                >
                </Calendar>
            </PopoverContent>
        </Popover>
    )
}
