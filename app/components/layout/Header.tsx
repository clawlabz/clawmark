"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, Upload, X, Search } from "lucide-react";

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  onAddClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
  bookmarkCount: number;
}

export function Header({
  query,
  onQueryChange,
  onAddClick,
  onExportClick,
  onImportClick,
  bookmarkCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-3 px-4">
        {/* Logo */}
        <h1 className="text-lg font-bold tracking-tight whitespace-nowrap">
          ClawMark
        </h1>

        {/* Search */}
        <div className="relative flex-1 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search bookmarks..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-9 pr-8 h-9"
            aria-label="Search bookmarks"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onImportClick}
            aria-label="Import bookmarks"
            className="h-9 w-9"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onExportClick}
            disabled={bookmarkCount === 0}
            aria-label="Export bookmarks"
            className="h-9 w-9"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={onAddClick} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Bookmark</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
