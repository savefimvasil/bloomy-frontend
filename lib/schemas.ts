import { z } from "zod";

const UK_POSTCODE_RE = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

// Number fields come from HTML inputs as strings; we coerce them here.
const positiveInt = (min: number, max: number, label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((v) => !isNaN(Number(v)) && Number.isInteger(Number(v)), { message: "Enter a whole number" })
    .refine((v) => Number(v) >= min, { message: `Minimum ${min}` })
    .refine((v) => Number(v) <= max, { message: `Maximum ${max}` });

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerInitSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  // Checkbox — value is boolean from RHF's register; validate it's true
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms to continue",
  }),
});

export const registerPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerProfileBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  reason: z.string().optional(),
  acceptPromo: z.boolean().optional(),
});

export const registerProfileContractorSchema = registerProfileBaseSchema.extend({
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .regex(UK_POSTCODE_RE, "Enter a valid UK postcode"),
  radiusMiles: positiveInt(1, 200, "Service radius"),
  businessName: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
});

export const contractorProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(200),
  bio: z.string().optional(),
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .regex(UK_POSTCODE_RE, "Enter a valid UK postcode"),
  radiusMiles: positiveInt(1, 200, "Service radius"),
  phone: z.string().max(30).optional().or(z.literal("")),
  website: z
    .string()
    .url("Enter a valid URL (including https://)")
    .optional()
    .or(z.literal("")),
});

export const proposalSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters"),
  priceNote: z.string().max(255).optional().or(z.literal("")),
  timelineDays: z
    .string()
    .optional()
    .refine(
      (v) => !v || (!isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 3650),
      { message: "Enter a number between 1 and 3650" },
    ),
});

export const quoteRequestSchema = z.object({
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .regex(UK_POSTCODE_RE, "Enter a valid UK postcode"),
  startBy: z.string().optional().or(z.literal("")),
});

export const projectNameSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterInitFormValues = z.infer<typeof registerInitSchema>;
export type RegisterPasswordFormValues = z.infer<typeof registerPasswordSchema>;
export type RegisterProfileBaseFormValues = z.infer<typeof registerProfileBaseSchema>;
export type RegisterProfileContractorFormValues = z.infer<typeof registerProfileContractorSchema>;
export type ContractorProfileFormValues = z.infer<typeof contractorProfileSchema>;
export type ProposalFormValues = z.infer<typeof proposalSchema>;
export type QuoteRequestFormValues = z.infer<typeof quoteRequestSchema>;
