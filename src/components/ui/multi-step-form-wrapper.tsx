"use client"

import React, { useContext, createContext, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useForm, UseFormReturn, DefaultValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"

type FormData = Record<string, unknown>

interface MultiStepFormContextType<T extends FormData = FormData> {
  currentStep: number
  totalSteps: number
  formData: T
  updateFormData: (stepData: Partial<T>) => void
  goToNextStep: () => Promise<void>
  goToPrevStep: () => void
  goToStep: (step: number) => void
  resetForm: () => void
  isFirstStep: boolean
  isLastStep: boolean
  isComplete: boolean
  isLoading: boolean
  form: UseFormReturn<T>
  getProgressPercentage: () => number
  stepErrors: Record<number, string>
  isCurrentStepValid: boolean
}

// Define a new interface for step indicator customization
interface StepIndicator {
  icon?: React.ReactNode
  label?: string
}

const MultiStepFormContext = createContext<MultiStepFormContextType<FormData> | undefined>(undefined)

export function useMultiStepForm<T extends FormData = FormData>() {
  const context = useContext(MultiStepFormContext) as MultiStepFormContextType<T>
  if (!context) {
    throw new Error("useMultiStepForm must be used within a MultiStepFormWrapper")
  }
  return context
}

export interface StepProps<T extends FormData = FormData> {
  children: React.ReactNode
  title?: string
  description?: string
  validate?: (data: T) => Promise<boolean> | boolean
  schema?: z.ZodObject<z.ZodRawShape>
  canSkip?: boolean
  isOptional?: boolean
  validationMessage?: string
  onEnter?: (data: T) => void
  onExit?: (data: T) => void
  // Add new properties for step indicator customization
  icon?: React.ReactNode
  label?: string
}

export interface MultiStepFormWrapperProps<T extends FormData = FormData> {
  children: React.ReactNode
  className?: string
  onComplete?: (data: T) => void
  initialData?: Partial<T>
  showStepIndicator?: boolean
  showStepTitle?: boolean
  allowSkipSteps?: boolean
  navigationPosition?: 'bottom' | 'top'
  nextButtonText?: string
  prevButtonText?: string
  completeButtonText?: string
  onStepChange?: (prevStep: number, nextStep: number) => void
  schema?: z.ZodType<T>
  persistKey?: string
  onStepValidationError?: (step: number, errors: Record<string, unknown>) => void
  showProgressBar?: boolean
  allowStepReset?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  transitionDuration?: number
  animateStepChange?: boolean
  // Add new properties for step indicator customization
  customStepIndicators?: StepIndicator[]
  useCustomStepIndicators?: boolean
  // Add logo support
  logo?: React.ReactNode
  // Add real-time validation property
  enableRealtimeValidation?: boolean
  // Add back button support
  showBackButton?: boolean
}

export function Step<T extends FormData = FormData>({ children }: StepProps<T>): React.ReactNode {
  return <>{children}</>
}

export function MultiStepFormWrapper<T extends FormData = FormData>({
  children,
  className,
  onComplete,
  initialData = {} as Partial<T>,
  showStepIndicator = true,
  showStepTitle = true,
  allowSkipSteps = false,
  navigationPosition = 'bottom',
  nextButtonText = "Next",
  prevButtonText = "Back",
  completeButtonText = "Complete",
  onStepChange,
  schema,
  persistKey,
  onStepValidationError,
  showProgressBar = false,
  allowStepReset = false,
  autoSave = false,
  autoSaveDelay = 1000,
  transitionDuration = 300,
  animateStepChange = true,
  // Add new properties with defaults
  customStepIndicators,
  useCustomStepIndicators = false,
  // Add logo prop
  logo,
  // Add real-time validation prop with default true
  enableRealtimeValidation = true,
  // Add back button prop with default true
  showBackButton = true,
}: MultiStepFormWrapperProps<T>): React.ReactNode {

  const router = useRouter()

  const steps = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Step
  ) as React.ReactElement<StepProps<T>>[]

  // Extract icons and labels from step props if not provided via customStepIndicators
  const stepIndicators = useCustomStepIndicators && customStepIndicators
    ? customStepIndicators
    : steps.map((step) => ({
      icon: step.props.icon,
      label: step.props.label
    }))

  const prepareDefaultValues = useCallback((initialData: Partial<T>, schema?: z.ZodType<T>): DefaultValues<T> => {
    const defaultValues = { ...initialData } as Record<string, unknown>;

    if (schema && 'shape' in schema) {
      const shapes = (schema as z.ZodObject<z.ZodRawShape>).shape;
      Object.keys(shapes).forEach(key => {
        if (defaultValues[key] === undefined) {
          defaultValues[key] = '';
        }
      });
    }

    return defaultValues as DefaultValues<T>;
  }, [])

  const [currentStep, setCurrentStep] = useState<number>(0)
  const [formData, setFormData] = useState<T>(initialData as T)
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({})
  const [isCurrentStepValid, setIsCurrentStepValid] = useState<boolean>(false)

  const form = useForm<T>({
    defaultValues: prepareDefaultValues(initialData, schema),
    // @ts-expect-error don't know how to fix this
    resolver: schema ? zodResolver(schema as z.ZodType<T, z.ZodTypeDef, T>) : undefined,
    mode: enableRealtimeValidation ? "onChange" : "onSubmit"
  })

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const CurrentStepComponent = steps[currentStep]
  const { title, description, schema: stepSchema, onEnter, onExit } = CurrentStepComponent?.props || {}

  React.useEffect(() => {
    if (!autoSave || !persistKey) return

    const handler = setTimeout(() => {
      try {
        localStorage.setItem(persistKey, JSON.stringify(formData))
      } catch (error) {
        console.warn('Failed to save form data to localStorage:', error)
      }
    }, autoSaveDelay)

    return () => clearTimeout(handler)
  }, [formData, autoSave, persistKey, autoSaveDelay])

  React.useEffect(() => {
    if (!persistKey) return

    try {
      const savedData = localStorage.getItem(persistKey)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setFormData(prevData => ({ ...prevData, ...parsedData }))

        Object.entries(parsedData).forEach(([key, value]) => {
          //@ts-expect-error don't know how to fix this
          form.setValue(key as keyof T, value as T[keyof T])
        })
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error)
    }
  }, [persistKey, form])

  React.useEffect(() => {
    if (onEnter) {
      onEnter(formData)
    }

    return () => {
      if (onExit) {
        onExit(formData)
      }
    }
  }, [currentStep, formData, onEnter, onExit])

  React.useEffect(() => {
    if (stepSchema) {
      form.clearErrors();
    }
  }, [currentStep, form, stepSchema])

  // Watch form values for validation
  const watchedValues = form.watch()

  // Check current step validity in real-time
  React.useEffect(() => {
    const stepSchema = CurrentStepComponent?.props.schema
    const canSkip = CurrentStepComponent?.props.canSkip || false

    if (!stepSchema || canSkip) {
      setIsCurrentStepValid(true)
      return
    }

    // If real-time validation is disabled, only validate when explicitly triggered
    if (!enableRealtimeValidation) {
      return
    }

    const checkValidation = async () => {
      try {
        // Get the fields for this step
        const stepFields = Object.keys(stepSchema.shape)

        // Trigger validation for the current step fields
        //@ts-expect-error don't know how to fix this
        const isValid = await form.trigger(stepFields as (keyof T)[])

        // Also check if all required fields have values
        const hasAllRequiredValues = stepFields.every(field => {
          const value = watchedValues[field as keyof T]
          return value !== undefined && value !== null && value !== ''
        })

        // The step is valid only if both validation passes AND all fields have values
        setIsCurrentStepValid(isValid && hasAllRequiredValues)
      } catch (error) {
        console.error('Validation error:', error)
        setIsCurrentStepValid(false)
      }
    }

    // Immediate validation without debounce for real-time feedback
    checkValidation()
  }, [watchedValues, currentStep, CurrentStepComponent?.props.schema, CurrentStepComponent?.props.canSkip, form, enableRealtimeValidation])

  const updateFormData = useCallback((stepData: Partial<T>): void => {
    setFormData((prev) => {
      const newData = { ...prev, ...stepData };
      return newData;
    });

    // Don't update form values if they're already the same to prevent infinite loops
    Object.entries(stepData).forEach(([key, value]) => {
      const currentValue = form.getValues()[key as keyof T];
      if (currentValue !== value) {
        //@ts-expect-error don't know how to fix this
        form.setValue(key as keyof T, value as T[keyof T], { shouldValidate: false });
      }
    });
  }, [form])

  const resetForm = useCallback((): void => {
    setCurrentStep(0);
    setFormData(initialData as T);
    setIsComplete(false);
    setStepErrors({});
    form.reset(prepareDefaultValues(initialData, schema));

    if (persistKey) {
      try {
        localStorage.removeItem(persistKey);
      } catch (error) {
        console.warn('Failed to clear persisted form data:', error);
      }
    }
  }, [initialData, schema, form, persistKey, prepareDefaultValues]);

  const getProgressPercentage = useCallback((): number => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  }, [currentStep, steps.length]);

  const goToNextStep = useCallback(async (): Promise<void> => {
    const validate = CurrentStepComponent?.props.validate
    const stepSchema = CurrentStepComponent?.props.schema
    const canSkip = CurrentStepComponent?.props.canSkip || false

    setStepErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[currentStep]
      return newErrors
    })

    // Always sync form data before validation
    const currentFormValues = form.getValues()
    updateFormData(currentFormValues)

    // Always trigger validation immediately when Continue is clicked
    setIsValidating(true)

    try {
      let validationPassed = true

      if (stepSchema && !canSkip) {
        const stepFields = Object.keys(stepSchema.shape)
        //@ts-expect-error don't know how to fix this
        const result = await form.trigger(stepFields as (keyof T)[])
        if (!result) {
          const formErrors = form.formState.errors
          const errorMessage = CurrentStepComponent?.props.validationMessage || 'Please fix the validation errors'
          setStepErrors(prev => ({ ...prev, [currentStep]: errorMessage }))
          onStepValidationError?.(currentStep, formErrors as Record<string, unknown>)
          validationPassed = false
        }
      } else if (validate && !canSkip) {
        const isValid = await validate({ ...formData, ...currentFormValues })
        if (!isValid) {
          const errorMessage = CurrentStepComponent?.props.validationMessage || 'Validation failed'
          setStepErrors(prev => ({ ...prev, [currentStep]: errorMessage }))
          validationPassed = false
        }
      } else if (!canSkip) {
        // Even if no explicit schema or validate function, trigger form validation
        // This ensures all form fields are validated according to their individual schemas
        const result = await form.trigger()
        if (!result) {
          const formErrors = form.formState.errors
          const errorMessage = CurrentStepComponent?.props.validationMessage || 'Please check all required fields'
          setStepErrors(prev => ({ ...prev, [currentStep]: errorMessage }))
          onStepValidationError?.(currentStep, formErrors as Record<string, unknown>)
          validationPassed = false
        }
      }

      // If validation failed, stop here and don't proceed to next step
      if (!validationPassed) {
        return
      }
    } catch (error) {
      console.error("Validation error:", error)
      setStepErrors(prev => ({ ...prev, [currentStep]: 'Validation failed' }))
      return
    } finally {
      setIsValidating(false)
    }

    if (isLastStep) {
      if (schema) {
        const isValid = await form.trigger()
        if (!isValid) return
      }

      setIsComplete(true)
      setIsLoading(true)
      try {
        const finalData = { ...formData, ...currentFormValues }
        await onComplete?.(finalData as T)
      } catch (error) {
        console.error("Error in onComplete callback:", error)
        setStepErrors(prev => ({ ...prev, [currentStep]: 'Failed to complete form submission' }))
        setIsComplete(false)
        return
      } finally {
        setIsLoading(false)
      }
      return
    }

    const prevStep = currentStep
    const nextStep = currentStep + 1
    setCurrentStep(nextStep)
    onStepChange?.(prevStep, nextStep)
  }, [currentStep, formData, isLastStep, CurrentStepComponent?.props, form, onComplete, onStepChange, schema, updateFormData, onStepValidationError])

  const goToPrevStep = useCallback((): void => {
    if (isFirstStep) return

    const prevStep = currentStep
    const nextStep = currentStep - 1
    setCurrentStep(nextStep)
    onStepChange?.(prevStep, nextStep)
  }, [currentStep, isFirstStep, onStepChange])

  const handleBackButton = useCallback((): void => {
    if (isFirstStep) {
      // If on first step, navigate back in browser
      router.back()
    } else {
      // Otherwise, go to previous step
      goToPrevStep()
    }
  }, [isFirstStep, router, goToPrevStep])

  const goToStep = useCallback((step: number): void => {
    if (step < 0 || step >= steps.length || (!allowSkipSteps && step > currentStep)) return

    const prevStep = currentStep
    setCurrentStep(step)
    onStepChange?.(prevStep, step)
  }, [allowSkipSteps, currentStep, steps.length, onStepChange])

  const renderNavigation = (): React.ReactNode => (
    <div className="flex justify-between items-center gap-3 md:gap-4">
      <Button
        variant="ghost"
        onClick={goToPrevStep}
        disabled={isFirstStep || isValidating}
        className={cn("gap-1 flex-1 h-12 md:h-14", isFirstStep && "hidden")}
        size={"lg"}
      >
        <ChevronLeft size={16} />
        {prevButtonText}
      </Button>

      <Button
        onClick={() => void goToNextStep()}
        disabled={isValidating || !isCurrentStepValid}
        className="gap-1 flex-1 h-12 md:h-14"
        size={"lg"}
      >
        {isValidating ? (
          <LoaderCircle size={16} className="animate-spin mr-2" />
        ) : isLastStep ? (
          completeButtonText
        ) : (
          <>
            {nextButtonText}
            <ChevronRight size={16} />
          </>
        )}
      </Button>
    </div>
  )

  const renderStepIndicators = (): React.ReactNode => (
    <div className="flex justify-between items-center mb-4 md:mb-6 w-full">
      {steps.map((_, index) => {
        const hasCustomIndicator = useCustomStepIndicators && stepIndicators[index];
        const customIcon = hasCustomIndicator && stepIndicators[index].icon;
        const customLabel = hasCustomIndicator && stepIndicators[index].label;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <div
                className={cn(
                  "h-[2px] flex-grow transition-colors",
                  index <= currentStep ? "bg-primary" : "bg-muted dark:bg-muted",
                  customLabel ? "mb-8 md:mb-10 mt-auto" : "my-auto"
                )}
              />
            )}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center transition-all",
                  allowSkipSteps && "cursor-pointer hover:scale-110"
                )}
                onClick={() => allowSkipSteps && goToStep(index)}
                role={allowSkipSteps ? "button" : undefined}
                tabIndex={allowSkipSteps ? 0 : undefined}
                aria-label={allowSkipSteps ? `Go to step ${index + 1}` : undefined}
              >
                {index < currentStep ? (
                  <div className="rounded-full bg-primary text-primary-foreground w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border-2 border-primary">
                    {customIcon ? (
                      <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                        {customIcon}
                      </div>
                    ) : (
                      <CheckCircle2 size={20} className="md:w-6 md:h-6" />
                    )}
                  </div>
                ) : index === currentStep ? (
                  <div className="rounded-full bg-primary text-primary-foreground w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border-2 border-primary">
                    {customIcon ? (
                      <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                        {customIcon}
                      </div>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                ) : (
                  <div className="rounded-full bg-background w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border-2 border-muted dark:border-muted">
                    {customIcon ? (
                      <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-muted-foreground">
                        {customIcon}
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                )}
              </div>
              {customLabel && (
                <span className={cn(
                  "text-xs mt-1 md:mt-2 text-center max-w-[60px] md:max-w-[80px] truncate",
                  index === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {customLabel}
                </span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  )

  const contextValue = React.useMemo(() => ({
    currentStep,
    totalSteps: steps.length,
    formData,
    updateFormData,
    goToNextStep,
    goToPrevStep,
    goToStep,
    resetForm,
    isFirstStep,
    isLastStep,
    isComplete,
    isLoading: isValidating || isLoading,
    form,
    getProgressPercentage,
    stepErrors,
    isCurrentStepValid,
  }), [
    currentStep,
    steps.length,
    formData,
    updateFormData,
    goToNextStep,
    goToPrevStep,
    goToStep,
    resetForm,
    isFirstStep,
    isLastStep,
    isComplete,
    isValidating,
    isLoading,
    form,
    getProgressPercentage,
    stepErrors,
    isCurrentStepValid,
  ])

  return (
    <div className={cn("w-full h-full min-h-dvh flex flex-col max-w-none md:max-w-2xl md:mx-auto", className)}>
      <MultiStepFormContext.Provider value={contextValue as MultiStepFormContextType}>
        {/* Header with back button, title, description and logo */}
        {showBackButton || (showStepTitle && (title || description)) || logo ? (
          <div className="p-4 md:p-6 pb-2 md:pb-4">
            {/* Title, description and logo row with back button beside title */}
            {((showStepTitle && (title || description)) || logo) && (
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Back button beside title */}
                  {showBackButton && (
                    <Button
                      variant="ghost"
                      size={'icon-lg'}
                      onClick={handleBackButton}
                    >
                      <ArrowLeftIcon size={10} className="w-full" />
                    </Button>
                  )}
                  <div className="min-w-0 flex-1">
                    {title && <h2 className="text-xl md:text-2xl font-bold dark:text-white truncate">{title}</h2>}
                    {description && <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs md:text-sm">{description}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-center ml-4 flex-shrink-0">
                  {logo && <div className="w-16 h-16 md:w-20 md:h-20">{logo}</div>}
                  {allowStepReset && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {showStepIndicator && (
          <div className="px-4 md:px-6">
            {renderStepIndicators()}
          </div>
        )}

        {showProgressBar && (
          <div className="mb-6 px-4 md:px-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {stepErrors[currentStep] && (
          <div className="mb-4 mx-4 md:mx-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-700 dark:text-red-400 text-sm">{stepErrors[currentStep]}</p>
          </div>
        )}

        {navigationPosition === 'top' && (
          <div className="px-4 md:px-6">
            {renderNavigation()}
          </div>
        )}

        <div
          className={cn(
            "flex-1 px-4 md:px-6 py-4 overflow-y-auto",
            animateStepChange && "transition-all duration-300 ease-in-out"
          )}
          style={{
            transitionDuration: animateStepChange ? `${transitionDuration}ms` : undefined
          }}
        >
          {CurrentStepComponent}
        </div>

        {navigationPosition === 'bottom' && (
          <div className="p-4 md:p-6 pt-2 md:pt-4 mt-auto">
            {renderNavigation()}
          </div>
        )}
      </MultiStepFormContext.Provider>
    </div>
  )
}
