"use client";

import { useState, useEffect, useCallback } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Header } from "@/components/layout/Header";
import { TagSidebar } from "@/components/layout/TagSidebar";
import { BookmarkList } from "@/components/bookmarks/BookmarkList";
import { AddBookmarkDialog } from "@/components/dialogs/AddBookmarkDialog";
import { EditBookmarkDialog } from "@/components/dialogs/EditBookmarkDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { ImportDialog } from "@/components/dialogs/ImportDialog";
import { exportToJson } from "@/lib/exportImport";
import type { Bookmark } from "@/lib/types";

export default function Home() {
  const {
    bookmarks,
    filteredBookmarks,
    allTags,
    query,
    setQuery,
    activeTag,
    setActiveTag,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    importBookmarks,
    findByUrl,
    quota,
  } = useBookmarks();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [quotaDismissed, setQuotaDismissed] = useState(false);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setAddOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleEdit = useCallback((bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback((bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setDeleteOpen(true);
  }, []);

  const handleTagClick = useCallback(
    (tag: string) => {
      setActiveTag(activeTag === tag ? null : tag);
    },
    [activeTag, setActiveTag]
  );

  const handleClearFilter = useCallback(() => {
    setQuery("");
    setActiveTag(null);
  }, [setQuery, setActiveTag]);

  const existingTags = Array.from(allTags.keys());

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        query={query}
        onQueryChange={setQuery}
        onAddClick={() => setAddOpen(true)}
        onExportClick={() => exportToJson(bookmarks)}
        onImportClick={() => setImportOpen(true)}
        bookmarkCount={bookmarks.length}
      />

      {/* Quota warning */}
      {quota.isWarning && !quotaDismissed && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-sm text-destructive flex items-center justify-between">
          <span>
            Storage is {Math.round(quota.percentUsed)}% full. Export your
            bookmarks to avoid data loss.
          </span>
          <button
            onClick={() => setQuotaDismissed(true)}
            className="text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <TagSidebar
          allTags={allTags}
          activeTag={activeTag}
          onTagClick={setActiveTag}
          totalBookmarks={bookmarks.length}
        />

        <main className="flex-1 overflow-y-auto p-4">
          <BookmarkList
            bookmarks={filteredBookmarks}
            totalBookmarks={bookmarks.length}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTagClick={handleTagClick}
            onAddClick={() => setAddOpen(true)}
            hasActiveFilter={!!query || !!activeTag}
            onClearFilter={handleClearFilter}
          />

          {/* Footer status */}
          {bookmarks.length > 0 && (
            <p className="text-xs text-muted-foreground text-center mt-6 pb-4">
              {filteredBookmarks.length === bookmarks.length
                ? `${bookmarks.length} bookmark${bookmarks.length !== 1 ? "s" : ""}`
                : `${filteredBookmarks.length} of ${bookmarks.length} bookmarks`}
              {" · Stored locally"}
            </p>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <AddBookmarkDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={addBookmark}
        onFindByUrl={findByUrl}
        existingTags={existingTags}
      />

      <EditBookmarkDialog
        bookmark={selectedBookmark}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={updateBookmark}
      />

      <DeleteConfirmDialog
        bookmark={selectedBookmark}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={deleteBookmark}
      />

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={importBookmarks}
      />
    </div>
  );
}
