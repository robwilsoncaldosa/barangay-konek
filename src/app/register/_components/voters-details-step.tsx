"use client"

import * as React from "react"
import { useForm, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { CheckCircle } from "lucide-react"
import { useMultiStepForm } from "@/components/ui/multi-step-form-wrapper"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"

const votersDetailsSchema = z.object({
    votersId: z.string().min(1, "Voter's ID is required"),
    precinctNumber: z.string().min(1, "Precinct number is required"),
})

type VotersDetailsFormData = z.infer<typeof votersDetailsSchema>

// Form field configuration
interface FormFieldConfig {
    name: keyof VotersDetailsFormData
    label: string
    type: 'text'
    placeholder: string
}

const formFields: FormFieldConfig[] = [
    {
        name: 'votersId',
        label: "Voter's ID Number (VIN)",
        type: 'text',
        placeholder: 'Enter Voter ID Number'
    },
    {
        name: 'precinctNumber',
        label: 'Precinct Number',
        type: 'text',
        placeholder: 'Enter your precinct number'
    }
]

// Reusable form field renderer
//@ts-nocheck
const renderFormField = (field: FormFieldConfig, form: UseFormReturn<VotersDetailsFormData>) => {
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
                        <Input
                            {...formField}
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
}

// Precinct Finder Dialog Content Component
//@ts-nocheck
function PrecinctFinderContent({
    onClose,
    form
}: {
    onClose: () => void
    form: UseFormReturn<VotersDetailsFormData>
}) {
    const [selectedSitio, setSelectedSitio] = React.useState("")
    const [foundPrecinct, setFoundPrecinct] = React.useState<string | null>(null)

    // Sample precinct data - replace with actual data
    const precinctData = {
        "sitio-1": "2B1",
        "sitio-2": "2B2",
        "sitio-3": "2B3",
        "sitio-4": "2B4"
    }

    const handleFindPrecinct = () => {
        if (selectedSitio && precinctData[selectedSitio as keyof typeof precinctData]) {
            setFoundPrecinct(precinctData[selectedSitio as keyof typeof precinctData])
        }
    }

    const handleUsePrecinct = () => {
        if (foundPrecinct && form) {
            // Set the precinct number in the form using react-hook-form
            form.setValue('precinctNumber', foundPrecinct)
            onClose()
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="sitio-finder">Select your Sitio/Barangay</Label>
                    <Select value={selectedSitio} onValueChange={setSelectedSitio}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose your sitio" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sitio-1">Sitio 1</SelectItem>
                            <SelectItem value="sitio-2">Sitio 2</SelectItem>
                            <SelectItem value="sitio-3">Sitio 3</SelectItem>
                            <SelectItem value="sitio-4">Sitio 4</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleFindPrecinct}
                    disabled={!selectedSitio}
                    className="w-full"
                >
                    Find Precinct
                </Button>

                {foundPrecinct && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                        <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">Precinct Found!</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Your precinct number is: <span className="font-bold">{foundPrecinct}</span>
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                {foundPrecinct && (
                    <Button onClick={handleUsePrecinct}>
                        Use This Precinct
                    </Button>
                )}
            </div>
        </div>
    )
}

export function VotersDetailsStep() {
    const { updateFormData, formData } = useMultiStepForm<VotersDetailsFormData>()
    const [showPrecinctDialog, setShowPrecinctDialog] = React.useState(false)

    const form = useForm<VotersDetailsFormData>({
        resolver: zodResolver(votersDetailsSchema),
        defaultValues: {
            votersId: formData.votersId || "",
            precinctNumber: formData.precinctNumber || "",
        },
    })

    // Watch form values and update parent form data
    React.useEffect(() => {
        const subscription = form.watch((value) => {
            updateFormData(value as Partial<VotersDetailsFormData>)
        })
        return () => subscription.unsubscribe()
    }, [form, updateFormData])

    return (
        <>
            <div className="h-full flex flex-col">
                <div className="flex-1 space-y-6 py-2">
                    <Form {...form}>
                        <div className="space-y-6 md:space-y-6">
                            {formFields.map((field) => renderFormField(field, form))}

                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-blue-600"
                                    onClick={() => setShowPrecinctDialog(true)}
                                >
                                    Find your Precinct Number
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>

            <ResponsiveDialog
                open={showPrecinctDialog}
                onOpenChange={setShowPrecinctDialog}
                title="Find Your Precinct Number"
                description="Locate your precinct based on your address"
                className="sm:max-w-[500px]"
            >
                <PrecinctFinderContent onClose={() => setShowPrecinctDialog(false)} form={form} />
            </ResponsiveDialog>
        </>
    )
}