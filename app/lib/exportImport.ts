import { nanoid } from "nanoid";
import type { Bookmark, ImportResult } from "./types";

export function exportToJson(bookmarks: Bookmark[]): void {
  const json = JSON.stringify(bookmarks, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split("T")[0];

  const a = document.createElement("a");
  a.href = url;
  a.download = `clawmark-export-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function isValidBookmark(item: unknown): item is Partial<Bookmark> {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;
  return typeof obj.url === "string" && typeof obj.title === "string";
}

export async function parseImportFile(file: File): Promise<Bookmark[]> {
  const text = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON format.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid format. Only ClawMark JSON exports are supported.");
  }

  const bookmarks: Bookmark[] = [];
  for (const item of parsed) {
    if (!isValidBookmark(item)) {
      throw new Error("Invalid format. Only ClawMark JSON exports are supported.");
    }

    const now = new Date().toISOString();
    bookmarks.push({
      id: (item as Partial<Bookmark>).id ?? nanoid(),
      url: ((item as Partial<Bookmark>).url ?? "").trim(),
      title: ((item as Partial<Bookmark>).title ?? "").trim(),
      description: (item as Partial<Bookmark>).description,
      tags: Array.isArray((item as Partial<Bookmark>).tags)
        ? ((item as Partial<Bookmark>).tags as string[])
        : [],
      createdAt: (item as Partial<Bookmark>).createdAt ?? now,
      updatedAt: (item as Partial<Bookmark>).updatedAt ?? now,
    });
  }

  return bookmarks;
}

export function mergeBookmarks(
  existing: Bookmark[],
  incoming: Bookmark[]
): ImportResult & { merged: Bookmark[] } {
  const existingUrls = new Set(existing.map((b) => b.url.toLowerCase()));
  const seenIncoming = new Set<string>();

  let imported = 0;
  let skipped = 0;
  const newBookmarks: Bookmark[] = [];

  for (const b of incoming) {
    const urlLower = b.url.toLowerCase();

    if (existingUrls.has(urlLower) || seenIncoming.has(urlLower)) {
      skipped++;
      continue;
    }

    seenIncoming.add(urlLower);
    newBookmarks.push(b);
    imported++;
  }

  return {
    merged: [...newBookmarks, ...existing],
    imported,
    skipped,
    errors: [],
  };
}
