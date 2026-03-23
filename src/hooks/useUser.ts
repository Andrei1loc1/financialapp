import { useState, useEffect, useCallback } from 'react';
import {
    getUserProfile,
    saveUserProfile,
    initializeUserData,
    UserProfile,
    getCurrentUserId
} from '../actions/user';

/**
 * Hook for managing user profile
 */
export function useUser() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load profile on mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile();
            setProfile(data);
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = useCallback(async (fullName: string, income: number) => {
        try {
            setError(null);
            const success = await saveUserProfile(fullName, income);
            if (success) {
                await loadProfile();
                return true;
            }
            setError('Failed to save profile');
            return false;
        } catch (err) {
            setError('Failed to save profile');
            console.error(err);
            return false;
        }
    }, []);

    const initializeUser = useCallback(async (fullName: string, income: number) => {
        try {
            setError(null);
            const success = await initializeUserData(fullName, income);
            if (success) {
                await loadProfile();
                return true;
            }
            setError('Failed to initialize user data');
            return false;
        } catch (err) {
            setError('Failed to initialize user data');
            console.error(err);
            return false;
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        await loadProfile();
    }, []);

    return {
        profile,
        loading,
        error,
        userId: getCurrentUserId(),
        updateProfile,
        initializeUser,
        refreshProfile
    };
}