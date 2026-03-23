import { z } from 'zod';

/**
 * Zod validation schema for onboarding form
 * All error messages are in Romanian as per requirements
 */
export const onboardingSchema = z.object({
    fullName: z
        .string()
        .min(2, 'Numele trebuie să conțină cel puțin 2 caractere')
        .max(50, 'Numele nu poate depăși 50 de caractere')
        .regex(
            /^[a-zA-ZÀ-ÿ\s'-]+$/,
            'Numele poate conține doar litere, spații, cratime și apostrof'
        )
        .refine((val) => val.trim().length >= 2, {
            message: 'Numele trebuie să conțină cel puțin 2 caractere',
        }),
    income: z
        .string()
        .min(1, 'Trebuie să introduci venitul')
        .refine((val) => !isNaN(Number(val)), {
            message: 'Venitul trebuie să fie un număr',
        })
        .refine((val) => Number(val) >= 1, {
            message: 'Venitul trebuie să fie cel puțin 1 leu',
        })
        .refine((val) => Number(val) <= 1000000, {
            message: 'Venitul nu poate depăși 1.000.000 lei',
        }),
});

/**
 * Type inferred from the schema
 */
export type OnboardingSchemaType = z.infer<typeof onboardingSchema>;

/**
 * Form field configurations with labels and placeholders
 */
export const formFields = [
    {
        name: 'fullName' as const,
        label: 'Nume complet',
        placeholder: 'Ex: Andrei Popescu',
        type: 'text' as const,
        autoComplete: 'name',
        autoFocus: true,
    },
    {
        name: 'income' as const,
        label: 'Venitul lunar actual (lei)',
        placeholder: 'Ex: 5000',
        type: 'number' as const,
        autoComplete: 'off',
        autoFocus: false,
    },
] as const;
