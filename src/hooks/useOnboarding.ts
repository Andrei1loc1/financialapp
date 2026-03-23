import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, OnboardingSchemaType } from '../schemas/onboarding';
import {
    ONBOARDING_COMPLETED_KEY,
    ONBOARDING_STORAGE_KEY,
} from '../types/onboarding';
import { initializeUserData } from '../actions/user';

/**
 * Custom hook for onboarding form logic
 * Handles form state, validation, persistence, and submission
 * Now integrates with Firebase for data storage
 */
export const useOnboarding = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        setValue,
        trigger,
        reset,
    } = useForm<OnboardingSchemaType>({
        resolver: zodResolver(onboardingSchema),
        mode: 'onChange',
        defaultValues: {
            fullName: '',
            income: '',
        },
    });

    // Watch form values for real-time validation
    const watchedValues = watch();

    // Load persisted data on mount
    useEffect(() => {
        const loadPersistedData = () => {
            try {
                const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored) as OnboardingSchemaType;
                    if (parsed.fullName) setValue('fullName', parsed.fullName);
                    if (parsed.income) setValue('income', parsed.income);
                    // Trigger validation after setting values
                    setTimeout(() => trigger(), 100);
                }
            } catch (err) {
                console.error('Failed to load persisted data:', err);
            }
        };

        loadPersistedData();
    }, [setValue, trigger]);

    // Persist data on change (debounced)
    useEffect(() => {
        const persistData = () => {
            try {
                if (watchedValues.fullName || watchedValues.income) {
                    localStorage.setItem(
                        ONBOARDING_STORAGE_KEY,
                        JSON.stringify(watchedValues)
                    );
                }
            } catch (err) {
                console.error('Failed to persist data:', err);
            }
        };

        const timeoutId = setTimeout(persistData, 500);
        return () => clearTimeout(timeoutId);
    }, [watchedValues]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Optional: Clear persisted data on unmount if needed
            // localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        };
    }, []);

    /**
     * Submit data to Firebase - replaces the mock API call
     */
    const submitToBackend = useCallback(
        async (data: OnboardingSchemaType): Promise<void> => {
            // Simulate network delay for better UX
            await new Promise((resolve) => setTimeout(resolve, 1000));

            try {
                // Initialize user data in Firebase
                const success = await initializeUserData(
                    data.fullName.trim(),
                    Number(data.income)
                );

                if (!success) {
                    throw new Error('Failed to save data to database');
                }

                // Mark onboarding as completed in localStorage
                localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

                return Promise.resolve();
            } catch (err) {
                console.error('Firebase submission error:', err);
                throw new Error('A apărut o eroare la salvarea datelor');
            }
        },
        []
    );

    /**
     * Form submission handler
     */
    const onSubmit = useCallback(
        async (data: OnboardingSchemaType) => {
            setIsSubmitting(true);
            setError(null);

            try {
                await submitToBackend(data);
                setIsSubmitted(true);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'A apărut o eroare';
                setError(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        },
        [submitToBackend]
    );

    /**
     * Check if onboarding is already completed
     */
    const isOnboardingCompleted = useCallback(() => {
        return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
    }, []);

    /**
     * Reset onboarding state
     */
    const resetOnboarding = useCallback(() => {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
        reset();
        setIsSubmitted(false);
        setError(null);
    }, [reset]);

    return {
        // Form state
        register,
        handleSubmit: handleSubmit(onSubmit),
        errors,
        isValid,
        watchedValues,
        // Submission state
        isSubmitting,
        isSubmitted,
        error,
        // Actions
        resetOnboarding,
        isOnboardingCompleted,
        // Debounced validation trigger
        trigger,
    };
};
