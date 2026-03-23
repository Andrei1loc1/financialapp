import {
    ref,
    get,
    set,
    update,
    remove,
    push,
    onValue,
    off,
    query,
    orderByChild,
    limitToLast
} from 'firebase/database';
import { database } from '../lib/firebase';

/**
 * Base database reference helper
 * @param path - Database path (e.g., 'users/userId/profile')
 */
export const dbRef = (path: string) => ref(database, path);

/**
 * Get data once from a reference
 */
export async function getData<T>(path: string): Promise<T | null> {
    try {
        const snapshot = await get(dbRef(path));
        return snapshot.exists() ? (snapshot.val() as T) : null;
    } catch (error) {
        console.error(`Error getting data from ${path}:`, error);
        return null;
    }
}

/**
 * Set data at a specific path (replaces existing data)
 */
export async function setData<T>(path: string, data: T): Promise<boolean> {
    try {
        await set(dbRef(path), data);
        return true;
    } catch (error) {
        console.error(`Error setting data at ${path}:`, error);
        return false;
    }
}

/**
 * Update specific fields at a path (merges with existing data)
 */
export async function updateData(path: string, data: Record<string, unknown>): Promise<boolean> {
    try {
        await update(dbRef(path), data);
        return true;
    } catch (error) {
        console.error(`Error updating data at ${path}:`, error);
        return false;
    }
}

/**
 * Remove data at a specific path
 */
export async function removeData(path: string): Promise<boolean> {
    try {
        await remove(dbRef(path));
        return true;
    } catch (error) {
        console.error(`Error removing data at ${path}:`, error);
        return false;
    }
}

/**
 * Push new data to a list (generates unique key)
 */
export async function pushData<T>(path: string, data: T): Promise<string | null> {
    try {
        const newRef = push(dbRef(path));
        await set(newRef, data);
        return newRef.key;
    } catch (error) {
        console.error(`Error pushing data to ${path}:`, error);
        return null;
    }
}

/**
 * Subscribe to real-time updates
 * @param path - Database path to listen to
 * @param callback - Function called with new data
 * @returns Unsubscribe function
 */
export function subscribeToData<T>(
    path: string,
    callback: (data: T | null) => void
): () => void {
    const reference = dbRef(path);

    const listener = onValue(reference, (snapshot) => {
        const data = snapshot.exists() ? (snapshot.val() as T) : null;
        callback(data);
    });

    // Return unsubscribe function
    return () => off(reference);
}

/**
 * Query data with ordering and limits
 */
export async function getOrderedData<T>(
    path: string,
    orderBy: string = 'createdAt',
    limit: number = 100
): Promise<T[]> {
    try {
        const orderedQuery = query(
            dbRef(path),
            orderByChild(orderBy),
            limitToLast(limit)
        );
        const snapshot = await get(orderedQuery);

        if (!snapshot.exists()) return [];

        const data = snapshot.val();
        return Object.entries(data).map(([key, value]) => ({
            ...(value as object),
            id: key
        })) as T[];
    } catch (error) {
        console.error(`Error getting ordered data from ${path}:`, error);
        return [];
    }
}