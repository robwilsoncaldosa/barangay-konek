"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  label = "Date of birth",
  placeholder = "Pick a date",
  disabled = false,
  className
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <FormItem className={cn("flex flex-col", className)}>
      {label && <FormLabel className="text-sm md:text-base font-medium hidden md:inline-block">{label}</FormLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                // Base styling consistent with Input and Select
                "data-[placeholder]:text-muted-foreground dark:bg-input/30 border-input border-0 flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-sm bg-primary/10 p-4 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                // Focus styling consistent with Input and Select
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                // Invalid styling consistent with Input and Select
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                // Height override for mobile consistency
                "h-12 md:h-14",
                // Text styling
                "font-normal",
                // Placeholder styling
                !value && "text-muted-foreground"
              )}
            >
              {value ? (
                format(value, "PPP")
              ) : (
                <span>{placeholder}</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50 shrink-0" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            captionLayout="dropdown"
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )
}

// Keep the old component for backward compatibility
export function Calendar22() {
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      className="max-w-[240px]"
    />
  )
}
