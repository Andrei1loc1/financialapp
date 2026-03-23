import { useState, useEffect, useCallback } from 'react';
import {
    getSettings,
    updateSettings,
    toggleNotifications,
    UserSettings,
    defaultSettings
} from '../actions/settings';
import { subscribeToData } from '../actions/database';

/**
 * Hook for managing user settings
 */
export function useSettings() {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load settings on mount and subscribe to updates
    useEffect(() => {
        loadSettings();

        // Subscribe to real-time updates
        const unsubscribe = subscribeToData<UserSettings>(
            `users/default_user/settings`,
            (data) => {
                setSettings(data || defaultSettings);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getSettings();
            setSettings(data);
        } catch (err) {
            setError('Failed to load settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const update = useCallback(async (updates: Partial<UserSettings>) => {
        try {
            setError(null);
            const success = await updateSettings(updates);
            if (success) {
                await loadSettings();
                return true;
            }
            setError('Failed to update settings');
            return false;
        } catch (err) {
            setError('Failed to update settings');
            console.error(err);
            return false;
        }
    }, []);

    const toggleNotificationsSetting = useCallback(async () => {
        try {
            setError(null);
            const success = await toggleNotifications();
            if (success) {
                await loadSettings();
                return true;
            }
            return false;
        } catch (err) {
            setError('Failed to toggle notifications');
            console.error(err);
            return false;
        }
    }, []);

    return {
        settings,
        loading,
        error,
        notifications: settings.notifications,
        currency: settings.currency,
        update,
        toggleNotifications: toggleNotificationsSetting,
        refresh: loadSettings
    };
}