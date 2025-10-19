import { User, UserPlus, MapPin } from "lucide-react"
import { z } from "zod"
import { StepIndicator } from "./types"

// Validation schemas for each step
export const personalInfoSchema = z.object({
  first_name: z.string().min(3, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  birthdate: z.string().min(1, "Date of birth is required"),
})

export const accountsSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8, "Password confirmation is required"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export const addressSchema = z.object({
  address: z.string().min(1, "Address is required"),
  barangay: z.string().min(1, "Barangay is required"),
  contact_number: z.string().min(1, "Contact number is required"),
})

export const REGISTRATION_CONSTANTS = {
  PERSIST_KEY: "resident-registration",
  LOGO_PATH: "/logo.png",
  THANK_YOU_ROUTE: "/register/success",
  CONFIRMATION_DIALOG_MAX_WIDTH: "sm:max-w-[600px]",
  FORM_MAX_WIDTH: "md:max-w-2xl",
  TRANSITION_DURATION: 200
} as const

export const STEP_INDICATORS: StepIndicator[] = [
  { icon: <User size={20} />, label: "Personal Info" },
  { icon: <UserPlus size={20} />, label: "Accounts" },
  { icon: <MapPin size={20} />, label: "Address" },
  // { icon: <Phone size={20} />, label: "Voter Info" }
] as const

export const STEP_CONFIG = [
  {
    title: "Personal Information",
    description: "Enter your personal details",
    component: "PersonalInfoStep",
    schema: personalInfoSchema,
    validationMessage: "Please complete all required personal information fields"
  },
  {
    title: "Account Setup",
    description: "Create your account credentials",
    component: "AccountsStep",
    schema: accountsSchema,
    validationMessage: "Please complete all account setup fields and ensure passwords match"
  },
  {
    title: "Address & Contact",
    description: "Provide your complete address and contact information",
    component: "AddressStep",
    schema: addressSchema,
    validationMessage: "Please complete all address and contact information fields"
  },
  // {
  //   title: "Voter Information",
  //   description: "Enter your voter registration details",
  //   component: "VotersDetailsStep"
  // }
] as const

export const MULTI_STEP_FORM_CONFIG = {
  showProgressBar: false,
  allowStepReset: false,
  autoSave: true,
  animateStepChange: true,
  nextButtonText: "Continue",
  completeButtonText: "Submit Registration"
} as const