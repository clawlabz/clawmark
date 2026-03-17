"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Bookmark, BookmarkFormData } from "@/lib/types";

interface AddBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: BookmarkFormData) => Bookmark;
  onFindByUrl: (url: string) => Bookmark | undefined;
  existingTags: string[];
}

export function AddBookmarkDialog({
  open,
  onOpenChange,
  onSave,
  onFindByUrl,
  existingTags,
}: AddBookmarkDialogProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicate, setDuplicate] = useState<Bookmark | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => urlInputRef.current?.focus(), 50);
    }
  }, [open]);

  function handleOpenChange(value: boolean) {
    if (!value) {
      setUrl("");
      setTitle("");
      setDescription("");
      setTags("");
      setErrors({});
      setDuplicate(null);
    }
    onOpenChange(value);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else {
      try {
        new URL(url.trim());
      } catch {
        newErrors.url = "Invalid URL format";
      }
    }
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleUrlBlur() {
    if (url.trim()) {
      const found = onFindByUrl(url.trim());
      setDuplicate(found ?? null);
    }
  }

  function handleSave() {
    if (!validate()) return;
    onSave({ url, title, description, tags });
    handleOpenChange(false);
  }

  function handleTagSuggestion(tag: string) {
    const current = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!current.includes(tag)) {
      setTags(current.length > 0 ? `${tags}, ${tag}` : tag);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add Bookmark
            <kbd className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* URL */}
          <div>
            <Input
              ref={urlInputRef}
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setDuplicate(null);
              }}
              onBlur={handleUrlBlur}
              className={errors.url ? "border-destructive" : ""}
              aria-label="URL"
            />
            {errors.url && (
              <p className="text-xs text-destructive mt-1">{errors.url}</p>
            )}
            {duplicate && (
              <div className="mt-2 p-2 rounded bg-muted text-sm">
                <p className="text-muted-foreground">
                  URL already exists as:{" "}
                  <strong>{duplicate.title}</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You can still save as a new bookmark.
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <Input
              placeholder="Page title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-destructive" : ""}
              aria-label="Title"
            />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <textarea
            placeholder="Brief description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            aria-label="Description"
          />

          {/* Tags */}
          <div>
            <Input
              placeholder="Separate tags with commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              aria-label="Tags"
            />
            {existingTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {existingTags.slice(0, 8).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer text-xs hover:bg-accent"
                    onClick={() => handleTagSuggestion(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Bookmark</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
