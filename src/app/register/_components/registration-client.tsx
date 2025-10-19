"use client"

import * as React from "react"
import { MultiStepFormWrapper, Step } from "@/components/ui/multi-step-form-wrapper"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { useRegistration } from "@/hooks/use-registration"
import { MULTI_STEP_FORM_CONFIG, REGISTRATION_CONSTANTS, STEP_CONFIG, STEP_INDICATORS } from "@/lib/constants"
import { registrationSchema } from "@/lib/registration-schema"
import { AccountsStep } from "./accounts-step"
import { AddressStep } from "./address-step"
import { ConfirmationDialog } from "./confirmation-dialog"
import { PersonalInfoStep } from "./personal-info-step"
import { VotersDetailsStep } from "./voters-details-step"
import type { Database } from "../../../../database.types"

type Barangay = Database['public']['Tables']['mBarangay']['Row']

interface RegistrationClientProps {
  barangays: Barangay[]
  logo: React.ReactNode
}

// Step component mapping
const STEP_COMPONENTS = {
  PersonalInfoStep,
  AccountsStep,
  AddressStep,
  VotersDetailsStep
} as const

export function RegistrationClient({ barangays, logo }: RegistrationClientProps) {
  const {
    showConfirmation,
    setShowConfirmation,
    formData,
    handleRegistration,
    handleConfirm,
    handleCancel,
    handleStepChange
  } = useRegistration()

  return (
    <>
      <MultiStepFormWrapper
        className="flex-1 w-full h-full"
        persistKey={REGISTRATION_CONSTANTS.PERSIST_KEY}
        transitionDuration={REGISTRATION_CONSTANTS.TRANSITION_DURATION}
        onComplete={handleRegistration}
        onStepChange={handleStepChange}
        useCustomStepIndicators={true}
        customStepIndicators={STEP_INDICATORS}
        logo={logo}
        schema={registrationSchema}
        {...MULTI_STEP_FORM_CONFIG}
      >
        {STEP_CONFIG.map((stepConfig) => {
          const StepComponent = STEP_COMPONENTS[stepConfig.component as keyof typeof STEP_COMPONENTS]
          return (
            <Step
              key={stepConfig.component}
              title={stepConfig.title}
              description={stepConfig.description}
              schema={stepConfig.schema}
              validationMessage={stepConfig.validationMessage}
            >
              {stepConfig.component === 'AddressStep' ? (
                <StepComponent barangays={barangays} />
              ) : (
                <StepComponent barangays={[]} />
              )}
            </Step>
          )
        })}
      </MultiStepFormWrapper>

      <ResponsiveDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        className={REGISTRATION_CONSTANTS.CONFIRMATION_DIALOG_MAX_WIDTH}
        showCloseButton={false}
        title="Registration Confirmation"
      >
        <ConfirmationDialog
          data={formData}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </ResponsiveDialog>
    </>
  )
}