"use client";

import { Button } from "@/components/ui/button";
import { Bookmark, Plus, SearchX } from "lucide-react";

interface EmptyStateProps {
  isFirstUse: boolean;
  hasActiveFilter: boolean;
  onAddClick: () => void;
  onClearFilter: () => void;
}

export function EmptyState({
  isFirstUse,
  hasActiveFilter,
  onAddClick,
  onClearFilter,
}: EmptyStateProps) {
  if (isFirstUse) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Save your first bookmark to get started. Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
            ⌘K
          </kbd>{" "}
          or click the button below.
        </p>
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Bookmark
        </Button>
      </div>
    );
  }

  if (hasActiveFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No bookmarks match</h2>
        <p className="text-muted-foreground mb-6">
          Try a different search term or clear the filter.
        </p>
        <Button variant="outline" onClick={onClearFilter}>
          Clear Filter
        </Button>
      </div>
    );
  }

  return null;
}
