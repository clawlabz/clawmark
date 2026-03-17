"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink, Link as LinkIcon } from "lucide-react";
import type { Bookmark } from "@/lib/types";
import { formatRelativeTime, getFaviconUrl } from "@/lib/bookmarkOps";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
  onTagClick: (tag: string) => void;
}

export function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onTagClick,
}: BookmarkCardProps) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const faviconUrl = getFaviconUrl(bookmark.url);

  return (
    <div className="group flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      {/* Favicon */}
      <div className="mt-0.5 flex-shrink-0">
        {faviconFailed || !faviconUrl ? (
          <LinkIcon className="h-5 w-5 text-muted-foreground" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faviconUrl}
            alt=""
            width={20}
            height={20}
            className="rounded-sm"
            onError={() => setFaviconFailed(true)}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline truncate"
          >
            {bookmark.title}
          </a>
          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {bookmark.url}
        </p>

        {bookmark.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {bookmark.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2">
          {bookmark.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer text-xs"
              onClick={() => onTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatRelativeTime(bookmark.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(bookmark)}
          aria-label={`Edit ${bookmark.title}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(bookmark)}
          aria-label={`Delete ${bookmark.title}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
