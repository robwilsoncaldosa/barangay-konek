import { z } from "zod"
import { personalInfoSchema, accountsSchema, addressSchema } from "./constants"

// Modified personal info schema to match RegistrationData type (birthdate as string)
const personalInfoSchemaForRegistration = personalInfoSchema.extend({
    birthdate: z.string().min(1, "Birthdate is required")
})

// Combined registration schema that includes all step schemas
export const registrationSchema = personalInfoSchemaForRegistration
    .merge(accountsSchema)
    .merge(addressSchema)

export type RegistrationFormData = z.infer<typeof registrationSchema>