/**
 * Onboarding form values interface
 */
export interface OnboardingFormValues {
    fullName: string;
    income: number;
}

/**
 * API response type for onboarding submission
 */
export interface OnboardingResponse {
    success: boolean;
    message: string;
    data?: {
        userId: string;
        name: string;
        income: number;
        createdAt: string;
    };
    errors?: Record<string, string>;
}

/**
 * Onboarding step configuration
 */
export interface OnboardingStep {
    id: number;
    title: string;
    subtitle: string;
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
    name: keyof OnboardingFormValues;
    label: string;
    placeholder: string;
    type: 'text' | 'email' | 'tel' | 'number';
    autoComplete: string;
    autoFocus?: boolean;
}

/**
 * Local storage keys for onboarding persistence
 */
export const ONBOARDING_STORAGE_KEY = 'financier_onboarding_data';
export const ONBOARDING_COMPLETED_KEY = 'financier_onboarding_completed';
