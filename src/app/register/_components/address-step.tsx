"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useMultiStepForm } from "@/components/ui/multi-step-form-wrapper"
import type { Database } from "../../../../database.types"
import { addressSchema } from "@/lib/constants"

type Barangay = Database['public']['Tables']['mBarangay']['Row']

interface AddressStepProps {
  barangays: Barangay[]
}

type AddressFormData = z.infer<typeof addressSchema>

// Form field configuration
interface FormFieldConfig {
  name: keyof AddressFormData
  label: string
  type: 'text' | 'tel' | 'select'
  placeholder: string
}

const formFields: FormFieldConfig[] = [
  {
    name: 'address',
    label: 'Complete Address',
    type: 'text',
    placeholder: 'Enter your complete address'
  },
  {
    name: 'barangay',
    label: 'Barangay',
    type: 'select',
    placeholder: 'Select your barangay'
  },
  {
    name: 'contact_number',
    label: 'Contact Number',
    type: 'tel',
    placeholder: 'Enter your contact number'
  }
]

export function AddressStep({ barangays }: AddressStepProps) {
  const { updateFormData, formData, form } = useMultiStepForm<AddressFormData>()

  // Initialize form values if they don't exist
  React.useEffect(() => {
    const currentValues = form.getValues()
    const hasValues = Object.values(currentValues).some(value => value !== '' && value !== undefined && value !== null)
    
    if (!hasValues) {
      form.setValue('address', formData.address || '')
      form.setValue('barangay', formData.barangay || '')
      form.setValue('contact_number', formData.contact_number || '')
    }
  }, [form, formData])

  // Watch form values and update parent form data
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only update if a specific field changed to prevent infinite loops
      if (name) {
        updateFormData({ [name]: value[name] } as Partial<AddressFormData>)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, updateFormData])

  const renderFormField = (field: FormFieldConfig) => {
    const commonProps = {
      className: "h-12 md:h-14 text-base"
    }

    if (field.type === 'select' && field.name === 'barangay') {
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base font-medium hidden md:inline-block">{field.label}</FormLabel>
              <Select onValueChange={formField.onChange} value={formField.value}>
                <FormControl>
                  <SelectTrigger {...commonProps}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {barangays.length > 0 ? (
                    barangays.map((barangay) => (
                      <SelectItem key={barangay.id} value={barangay.id.toString()}>
                        {barangay.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>No barangays available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    }

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
                type={field.type}
                placeholder={field.placeholder}
                {...formField}
                {...commonProps}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-6 py-2">
        <Form {...form}>
          <div className="space-y-6 md:space-y-6">
            {formFields.map((field) => renderFormField(field))}
          </div>
        </Form>
      </div>
    </div>
  )
}