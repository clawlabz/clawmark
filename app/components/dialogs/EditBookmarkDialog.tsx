"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Bookmark, BookmarkFormData } from "@/lib/types";

interface EditBookmarkDialogProps {
  bookmark: Bookmark | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: BookmarkFormData) => void;
}

export function EditBookmarkDialog({
  bookmark,
  open,
  onOpenChange,
  onSave,
}: EditBookmarkDialogProps) {
  if (!bookmark) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <EditForm
          key={bookmark.id}
          bookmark={bookmark}
          onSave={onSave}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  bookmark,
  onSave,
  onClose,
}: {
  bookmark: Bookmark;
  onSave: (id: string, data: BookmarkFormData) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(bookmark.url);
  const [title, setTitle] = useState(bookmark.title);
  const [description, setDescription] = useState(bookmark.description ?? "");
  const [tags, setTags] = useState(bookmark.tags.join(", "));
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  function handleSave() {
    if (!validate()) return;
    onSave(bookmark.id, { url, title, description, tags });
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Bookmark</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div>
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={errors.url ? "border-destructive" : ""}
            aria-label="URL"
          />
          {errors.url && (
            <p className="text-xs text-destructive mt-1">{errors.url}</p>
          )}
        </div>

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

        <textarea
          placeholder="Brief description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          aria-label="Description"
        />

        <Input
          placeholder="Separate tags with commas"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          aria-label="Tags"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </>
  );
}
