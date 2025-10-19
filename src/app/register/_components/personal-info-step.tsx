"use client"

import * as React from "react"
import { type UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DatePicker } from "@/components/ui/date-picker"
import { useMultiStepForm } from "@/components/ui/multi-step-form-wrapper"
import { personalInfoSchema } from "@/lib/constants"


type PersonalInfoFormData = z.infer<typeof personalInfoSchema>

// Form field configuration
interface FormFieldConfig {
  name: keyof PersonalInfoFormData
  label: string
  type: 'text' | 'date'
  placeholder: string
}

const formFields: FormFieldConfig[] = [
  {
    name: 'first_name',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter your first name'
  },
  {
    name: 'middle_name',
    label: 'Middle Name',
    type: 'text',
    placeholder: 'Enter your middle name (optional)'
  },
  {
    name: 'last_name',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter your last name'
  },
  {
    name: 'birthdate',
    label: 'Date of birth',
    type: 'date',
    placeholder: 'Select your birthdate'
  }
]

// Reusable form field renderer
const renderFormField = (field: FormFieldConfig, form: UseFormReturn<PersonalInfoFormData>) => {
  const commonProps = {
    className: "h-12 md:h-14 text-base"
  }

  switch (field.type) {
    case 'text':
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base font-medium hidden md:inline-block">{field.label}</FormLabel>
              <FormControl>
                <Input
                  name={formField.name}
                  value={formField.value as string}
                  onChange={formField.onChange}
                  onBlur={formField.onBlur}
                  disabled={formField.disabled}
                  ref={formField.ref}
                  type={field.type}
                  placeholder={field.placeholder}
                  {...commonProps}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )

    case 'date':
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <DatePicker
              value={formField.value ? new Date(formField.value as string) : undefined}
              onChange={(date) => {
                // Convert date to string format (YYYY-MM-DD) for form storage
                const dateString = date ? date.toISOString().split('T')[0] : ''
                formField.onChange(dateString)
              }}
              label={field.label}
              placeholder={field.placeholder}
            />
          )}
        />
      )

    default:
      return null
  }
}

export function PersonalInfoStep() {
  const { updateFormData, formData, form } = useMultiStepForm<PersonalInfoFormData>()

  // Initialize form values if they don't exist
  React.useEffect(() => {
    const currentValues = form.getValues()
    const hasValues = Object.values(currentValues).some(value => value !== '' && value !== undefined && value !== null)

    if (!hasValues) {
      form.setValue('first_name', formData.first_name || '')
      form.setValue('middle_name', formData.middle_name || '')
      form.setValue('last_name', formData.last_name || '')
      form.setValue('birthdate', formData.birthdate || '')
    }
  }, [form, formData])

  // Watch form values and update parent form data
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only update if a specific field changed to prevent infinite loops
      if (name) {
        updateFormData({ [name]: value[name] } as Partial<PersonalInfoFormData>)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, updateFormData])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-6 py-2">
        <Form {...form}>
          <div className="space-y-6 md:space-y-6">
            {formFields.map((field) => renderFormField(field, form))}
          </div>
        </Form>
      </div>
    </div>
  )
}