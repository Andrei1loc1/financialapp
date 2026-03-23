import { getData, setData, updateData } from './database';
import { getCurrentUserId } from './user';

/**
 * User settings data structure
 */
export interface UserSettings {
    notifications: boolean;
    currency: string;
}

/**
 * Default settings for new users
 */
export const defaultSettings: UserSettings = {
    notifications: true,
    currency: 'RON'
};

/**
 * Get user settings
 */
export async function getSettings(): Promise<UserSettings> {
    const uid = getCurrentUserId();
    const settings = await getData<UserSettings>(`users/${uid}/settings`);
    return settings || defaultSettings;
}

/**
 * Update user settings
 */
export async function updateSettings(updates: Partial<UserSettings>): Promise<boolean> {
    const uid = getCurrentUserId();
    return updateData(`users/${uid}/settings`, updates);
}

/**
 * Toggle notifications
 */
export async function toggleNotifications(): Promise<boolean> {
    const settings = await getSettings();
    return updateSettings({ notifications: !settings.notifications });
}

/**
 * Check if settings have been initialized
 */
export async function isSettingsInitialized(): Promise<boolean> {
    const settings = await getData(`users/${getCurrentUserId()}/settings`);
    return settings !== null;
}