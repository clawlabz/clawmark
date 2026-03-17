import type { Bookmark, StorageQuota } from "./types";

const STORAGE_KEY = "clawmark_bookmarks";
const ESTIMATED_TOTAL = 5 * 1024 * 1024; // 5MB conservative

export function loadBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error("Storage full. Delete some bookmarks or export and clear to continue.");
    }
    throw e;
  }
}

export function estimateQuota(bookmarks: Bookmark[]): StorageQuota {
  const raw = JSON.stringify(bookmarks);
  const used = raw.length * 2; // UTF-16 bytes estimate
  const percentUsed = (used / ESTIMATED_TOTAL) * 100;
  return {
    used,
    total: ESTIMATED_TOTAL,
    percentUsed,
    isWarning: percentUsed > 80,
    isFull: percentUsed > 95,
  };
}
