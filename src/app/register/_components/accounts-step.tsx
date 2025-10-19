"use client"

import * as React from "react"
import { z } from "zod"
import type { Database } from "../../../../database.types"

import { Input } from "@/components/ui/input"
import { PasswordInput, PasswordInputStrengthChecker } from "@/components/ui/password-input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useMultiStepForm } from "@/components/ui/multi-step-form-wrapper"
import { accountsSchema } from "@/lib/constants"

// Use database types for better type safety
type UserRow = Database['public']['Tables']['mUsers']['Row']
type AccountsFields = Pick<UserRow, 'email' | 'password'>

type AccountsFormData = z.infer<typeof accountsSchema>

// Form field configuration
interface FormFieldConfig {
  name: keyof AccountsFormData
  label: string
  type: 'email' | 'password' | 'password-confirm'
  placeholder: string
  showStrengthChecker?: boolean
}

const formFields: FormFieldConfig[] = [
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter your email address'
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password (minimum 8 characters)',
    showStrengthChecker: true
  },
  {
    name: 'confirm_password',
    label: 'Confirm Password',
    type: 'password-confirm',
    placeholder: 'Confirm your password'
  }
]

export function AccountsStep() {
  const { updateFormData, formData, form } = useMultiStepForm<AccountsFormData>()

  // Initialize form values if they don't exist
  React.useEffect(() => {
    const currentValues = form.getValues()
    const hasValues = Object.values(currentValues).some(value => value !== '' && value !== undefined && value !== null)

    if (!hasValues) {
      form.setValue('email', formData.email || '')
      form.setValue('password', formData.password || '')
      form.setValue('confirm_password', formData.confirm_password || '')
    }
  }, [form, formData])

  // Watch form values and update parent form data
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only update if a specific field changed to prevent infinite loops
      if (name) {
        updateFormData({ [name]: value[name] } as Partial<AccountsFormData>)
        
        // Trigger validation for confirm_password when password changes
        if (name === 'password' && value.confirm_password) {
          form.trigger('confirm_password')
        }
        // Trigger validation for confirm_password when it changes
        if (name === 'confirm_password') {
          form.trigger('confirm_password')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, updateFormData])

  const renderFormField = (field: FormFieldConfig) => {
    const commonProps = {
      className: "h-12 md:h-14 text-base"
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
              {field.type === 'password' && field.showStrengthChecker ? (
                <PasswordInput
                  placeholder={field.placeholder}
                  {...formField}
                  {...commonProps}
                >
                  <PasswordInputStrengthChecker />
                </PasswordInput>
              ) : field.type === 'password' || field.type === 'password-confirm' ? (
                <PasswordInput
                  placeholder={field.placeholder}
                  {...formField}
                  {...commonProps}
                />
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...formField}
                  {...commonProps}
                />
              )}
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