// Top-level imports and types
"use client"

import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FormSection } from "@/lib/types"
import { RegistrationData } from "@/lib/types"

interface ConfirmationDialogProps {
    data: RegistrationData
    onConfirm: () => void
    onCancel: () => void
}

// Configuration for form sections display
const FORM_SECTIONS: FormSection[] = [
    {
        title: "Personal Information",
        fields: [
            { key: "first_name", label: "First Name" },
            { key: "middle_name", label: "Middle Name" },
            { key: "last_name", label: "Last Name" },
            { key: "birthdate", label: "Date of Birth" }
        ]
    },
    {
        title: "Account Information",
        fields: [
            { key: "email", label: "Email Address" },
            { key: "user_type", label: "User Type" }
        ]
    },
    {
        title: "Address & Contact",
        fields: [
            { key: "address", label: "Address" },
            { key: "barangay", label: "Barangay" },
            { key: "contact_number", label: "Contact Number" }
        ]
    }
]

function FormSection({ section, data }: { section: FormSection; data: RegistrationData }) {
    return (
        <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {section.title}
            </h4>
            <div className="divide-y rounded-md border">
                {section.fields.map((field) => {
                    const value = String(data[field.key] ?? "")
                    const display = value.trim() ? value : "Not provided"
                    
                    // Format birthdate for better display
                    const formattedDisplay = field.key === 'birthdate' && value.trim() 
                        ? new Date(value).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : display
                    
                    return (
                        <div key={field.key} className="grid grid-cols-2 gap-2 p-2 text-sm">
                            <span className="text-muted-foreground">{field.label}</span>
                            <span className="text-right font-medium">{formattedDisplay}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function ConfirmationDialog({ data, onConfirm, onCancel }: ConfirmationDialogProps) {
    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="text-xs text-muted-foreground">
                    Please review the details before submitting your registration.
                </p>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {FORM_SECTIONS.map((section) => (
                    <FormSection key={section.title} section={section} data={data} />
                ))}
            </div>

            <div className="text-center text-xs text-muted-foreground">
                Your registration will be processed and you will receive a confirmation once approved.
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={onCancel} className="sm:min-w-32">
                    <ArrowLeft size={16} />
                    Go Back
                </Button>
                <Button onClick={onConfirm} className="sm:min-w-32">
                    Confirm Registration
                </Button>
            </div>
        </div>
    )
}