export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export interface BookmarkFormData {
  url: string;
  title: string;
  description: string;
  tags: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export interface StorageQuota {
  used: number;
  total: number;
  percentUsed: number;
  isWarning: boolean;
  isFull: boolean;
}
