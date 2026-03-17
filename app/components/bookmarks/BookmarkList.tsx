"use client";

import type { Bookmark } from "@/lib/types";
import { BookmarkCard } from "./BookmarkCard";
import { EmptyState } from "./EmptyState";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  totalBookmarks: number;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
  onTagClick: (tag: string) => void;
  onAddClick: () => void;
  hasActiveFilter: boolean;
  onClearFilter: () => void;
}

export function BookmarkList({
  bookmarks,
  totalBookmarks,
  onEdit,
  onDelete,
  onTagClick,
  onAddClick,
  hasActiveFilter,
  onClearFilter,
}: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <EmptyState
        isFirstUse={totalBookmarks === 0}
        hasActiveFilter={hasActiveFilter}
        onAddClick={onAddClick}
        onClearFilter={onClearFilter}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {bookmarks.map((b) => (
        <BookmarkCard
          key={b.id}
          bookmark={b}
          onEdit={onEdit}
          onDelete={onDelete}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
}
