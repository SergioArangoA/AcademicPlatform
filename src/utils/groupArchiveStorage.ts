const STORAGE_KEY = 'archivedGroupIds';

export const getArchivedGroupIds = (): Set<string> => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw) as string[];
        return new Set(parsed.map(String));
    } catch {
        return new Set();
    }
};

export const archiveGroupLocally = (groupId: string): void => {
    const ids = getArchivedGroupIds();
    ids.add(String(groupId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
};

export const isGroupArchivedLocally = (groupId: string): boolean => {
    return getArchivedGroupIds().has(String(groupId));
};
