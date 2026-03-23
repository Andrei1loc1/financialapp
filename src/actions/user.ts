import { getData, setData, updateData } from './database';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * User profile data structure
 */
export interface UserProfile {
    fullName: string;
    income: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Get the current user ID from Firebase Auth
 * Returns the Firebase UID or null if not authenticated
 */
export const getCurrentUserId = (): string | null => {
    return auth.currentUser?.uid || null;
};

/**
 * Set the current user ID (not used with Firebase Auth)
 * Kept for compatibility
 */
export const setCurrentUserId = (_userId: string): void => {
    // No-op with Firebase Auth - user ID comes from auth state
    console.warn('setCurrentUserId is deprecated - use Firebase Auth instead');
};

/**
 * Wait for auth state to be initialized
 */
export const waitForAuth = (): Promise<string | null> => {
    return new Promise((resolve) => {
        if (auth.currentUser) {
            resolve(auth.currentUser.uid);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user?.uid || null);
        });
    });
};

/**
 * Get user profile
 */
export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
    const uid = userId || getCurrentUserId();
    if (!uid) {
        console.warn('No user authenticated');
        return null;
    }
    return getData<UserProfile>(`users/${uid}/profile`);
}

/**
 * Create or update user profile (after onboarding)
 */
export async function saveUserProfile(
    fullName: string,
    income: number
): Promise<boolean> {
    const uid = getCurrentUserId();
    if (!uid) {
        console.error('Cannot save profile: no authenticated user');
        return false;
    }

    const profile: UserProfile = {
        fullName: fullName.trim(),
        income: Number(income),
        currency: 'RON',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    return setData(`users/${uid}/profile`, profile);
}

/**
 * Update user profile fields
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    const uid = getCurrentUserId();
    if (!uid) {
        console.error('Cannot update profile: no authenticated user');
        return false;
    }

    return updateData(`users/${uid}/profile`, {
        ...updates,
        updatedAt: new Date().toISOString()
    });
}

/**
 * Initialize user data after onboarding
 * Creates profile and budget data
 */
export async function initializeUserData(
    fullName: string,
    income: number
): Promise<boolean> {
    const uid = getCurrentUserId();
    if (!uid) {
        console.error('Cannot initialize user data: no authenticated user');
        return false;
    }

    const now = new Date().toISOString();

    // Set profile
    const profileSuccess = await setData(`users/${uid}/profile`, {
        fullName: fullName.trim(),
        income: Number(income),
        currency: 'RON',
        createdAt: now,
        updatedAt: now
    });

    if (!profileSuccess) return false;

    // Initialize budget
    const budgetSuccess = await setData(`users/${uid}/budget`, {
        monthlyIncome: Number(income),
        currentBalance: Number(income),
        dailyBurnRate: 0,
        budgetStartDate: now,
        estimatedDaysLeft: 30,
        lastUpdated: now
    });

    if (!budgetSuccess) return false;

    // Initialize settings (without gamification)
    const settingsSuccess = await setData(`users/${uid}/settings`, {
        notifications: true,
        currency: 'RON'
    });

    return settingsSuccess;
}