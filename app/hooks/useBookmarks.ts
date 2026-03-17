"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Bookmark, BookmarkFormData, ImportResult, StorageQuota } from "@/lib/types";
import { loadBookmarks, saveBookmarks, estimateQuota } from "@/lib/storage";
import {
  createBookmark,
  updateBookmark as updateBookmarkOp,
  deleteBookmark as deleteBookmarkOp,
  findByUrl as findByUrlOp,
  searchBookmarks,
  getAllTags,
} from "@/lib/bookmarkOps";
import { mergeBookmarks } from "@/lib/exportImport";

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export interface UseBookmarksReturn {
  bookmarks: Bookmark[];
  filteredBookmarks: Bookmark[];
  allTags: Map<string, number>;
  query: string;
  setQuery: (q: string) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  addBookmark: (data: BookmarkFormData) => Bookmark;
  updateBookmark: (id: string, data: BookmarkFormData) => void;
  deleteBookmark: (id: string) => void;
  importBookmarks: (incoming: Bookmark[]) => ImportResult;
  findByUrl: (url: string) => Bookmark | undefined;
  quota: StorageQuota;
}

export function useBookmarks(): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    if (typeof window === "undefined") return [];
    return loadBookmarks();
  });
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 150);

  const persist = useCallback((updated: Bookmark[]) => {
    setBookmarks(updated);
    saveBookmarks(updated);
  }, []);

  const addBookmarkFn = useCallback(
    (data: BookmarkFormData): Bookmark => {
      const newBookmark = createBookmark(data);
      const updated = [newBookmark, ...bookmarks];
      persist(updated);
      return newBookmark;
    },
    [bookmarks, persist]
  );

  const updateBookmarkFn = useCallback(
    (id: string, data: BookmarkFormData): void => {
      const updated = updateBookmarkOp(bookmarks, id, data);
      persist(updated);
    },
    [bookmarks, persist]
  );

  const deleteBookmarkFn = useCallback(
    (id: string): void => {
      const updated = deleteBookmarkOp(bookmarks, id);
      persist(updated);
    },
    [bookmarks, persist]
  );

  const importBookmarksFn = useCallback(
    (incoming: Bookmark[]): ImportResult => {
      const result = mergeBookmarks(bookmarks, incoming);
      persist(result.merged);
      return { imported: result.imported, skipped: result.skipped, errors: result.errors };
    },
    [bookmarks, persist]
  );

  const findByUrlFn = useCallback(
    (url: string): Bookmark | undefined => findByUrlOp(bookmarks, url),
    [bookmarks]
  );

  const filteredBookmarks = useMemo(
    () => searchBookmarks(bookmarks, debouncedQuery, activeTag),
    [bookmarks, debouncedQuery, activeTag]
  );

  const allTags = useMemo(() => getAllTags(bookmarks), [bookmarks]);

  const quota = useMemo(() => estimateQuota(bookmarks), [bookmarks]);

  return {
    bookmarks,
    filteredBookmarks,
    allTags,
    query,
    setQuery,
    activeTag,
    setActiveTag,
    addBookmark: addBookmarkFn,
    updateBookmark: updateBookmarkFn,
    deleteBookmark: deleteBookmarkFn,
    importBookmarks: importBookmarksFn,
    findByUrl: findByUrlFn,
    quota,
  };
}
