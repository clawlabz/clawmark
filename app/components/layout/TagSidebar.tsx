"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag } from "lucide-react";

interface TagSidebarProps {
  allTags: Map<string, number>;
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
  totalBookmarks: number;
}

export function TagSidebar({
  allTags,
  activeTag,
  onTagClick,
  totalBookmarks,
}: TagSidebarProps) {
  const tags = Array.from(allTags.entries());

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border">
        <div className="px-4 py-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags
        </div>
        <ScrollArea className="flex-1 px-2">
          <button
            onClick={() => onTagClick(null)}
            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
              activeTag === null
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            All{" "}
            <span className="text-xs opacity-70">({totalBookmarks})</span>
          </button>
          {tags.length === 0 && (
            <p className="px-3 py-4 text-xs text-muted-foreground">
              No tags yet
            </p>
          )}
          {tags.map(([tag, count]) => (
            <button
              key={tag}
              onClick={() =>
                onTagClick(activeTag === tag ? null : tag)
              }
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {tag}{" "}
              <span className="text-xs opacity-70">({count})</span>
            </button>
          ))}
        </ScrollArea>
      </aside>

      {/* Mobile horizontal strip */}
      <div className="md:hidden overflow-x-auto border-b border-border px-4 py-2 flex gap-2">
        <Badge
          variant={activeTag === null ? "default" : "secondary"}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => onTagClick(null)}
        >
          All ({totalBookmarks})
        </Badge>
        {tags.map(([tag, count]) => (
          <Badge
            key={tag}
            variant={activeTag === tag ? "default" : "secondary"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() =>
              onTagClick(activeTag === tag ? null : tag)
            }
          >
            {tag} ({count})
          </Badge>
        ))}
      </div>
    </>
  );
}
