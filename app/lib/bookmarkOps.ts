import { nanoid } from "nanoid";
import type { Bookmark, BookmarkFormData } from "./types";

export function normalizeTags(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0)
    .filter((t, i, arr) => arr.indexOf(t) === i);
}

export function createBookmark(data: BookmarkFormData): Bookmark {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    url: data.url.trim(),
    title: data.title.trim(),
    description: data.description.trim() || undefined,
    tags: normalizeTags(data.tags),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateBookmark(
  bookmarks: Bookmark[],
  id: string,
  data: BookmarkFormData
): Bookmark[] {
  return bookmarks.map((b) =>
    b.id === id
      ? {
          ...b,
          url: data.url.trim(),
          title: data.title.trim(),
          description: data.description.trim() || undefined,
          tags: normalizeTags(data.tags),
          updatedAt: new Date().toISOString(),
        }
      : b
  );
}

export function deleteBookmark(bookmarks: Bookmark[], id: string): Bookmark[] {
  return bookmarks.filter((b) => b.id !== id);
}

export function findByUrl(
  bookmarks: Bookmark[],
  url: string
): Bookmark | undefined {
  const trimmed = url.trim().toLowerCase();
  return bookmarks.find((b) => b.url.toLowerCase() === trimmed);
}

export function searchBookmarks(
  bookmarks: Bookmark[],
  query: string,
  activeTag: string | null
): Bookmark[] {
  const q = query.toLowerCase().trim();

  return bookmarks.filter((b) => {
    if (activeTag && !b.tags.includes(activeTag)) return false;

    if (!q) return true;

    return (
      b.title.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q) ||
      (b.description?.toLowerCase().includes(q) ?? false) ||
      b.tags.some((t) => t.includes(q))
    );
  });
}

export function getAllTags(bookmarks: Bookmark[]): Map<string, number> {
  const tagMap = new Map<string, number>();
  for (const b of bookmarks) {
    for (const t of b.tags) {
      tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
    }
  }
  // Sort by count descending
  return new Map(
    [...tagMap.entries()].sort((a, b) => b[1] - a[1])
  );
}

export function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
}
