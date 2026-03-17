import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  normalizeTags,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  findByUrl,
  searchBookmarks,
  getAllTags,
  formatRelativeTime,
  getFaviconUrl,
} from "./bookmarkOps";
import type { Bookmark, BookmarkFormData } from "./types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
  return {
    id: "test-id-1",
    url: "https://example.com",
    title: "Example",
    description: "A test bookmark",
    tags: ["test", "example"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeFormData(overrides: Partial<BookmarkFormData> = {}): BookmarkFormData {
  return {
    url: "https://example.com",
    title: "Example",
    description: "A test bookmark",
    tags: "test, example",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// normalizeTags
// ---------------------------------------------------------------------------

describe("normalizeTags", () => {
  it("splits on commas", () => {
    expect(normalizeTags("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("splits on whitespace", () => {
    expect(normalizeTags("foo bar baz")).toEqual(["foo", "bar", "baz"]);
  });

  it("splits on comma+space", () => {
    expect(normalizeTags("react, typescript, nextjs")).toEqual([
      "react",
      "typescript",
      "nextjs",
    ]);
  });

  it("lowercases all tags", () => {
    expect(normalizeTags("React TypeScript NextJS")).toEqual([
      "react",
      "typescript",
      "nextjs",
    ]);
  });

  it("removes empty strings from leading/trailing whitespace", () => {
    expect(normalizeTags("  tag1  ,  tag2  ")).toEqual(["tag1", "tag2"]);
  });

  it("removes duplicate tags", () => {
    expect(normalizeTags("react,react,typescript,react")).toEqual([
      "react",
      "typescript",
    ]);
  });

  it("returns empty array for empty string", () => {
    expect(normalizeTags("")).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    expect(normalizeTags("   ")).toEqual([]);
  });

  it("handles mixed comma and space separators", () => {
    expect(normalizeTags("a, b  c,d")).toEqual(["a", "b", "c", "d"]);
  });
});

// ---------------------------------------------------------------------------
// createBookmark
// ---------------------------------------------------------------------------

describe("createBookmark", () => {
  it("generates a non-empty id", () => {
    const b = createBookmark(makeFormData());
    expect(b.id).toBeTruthy();
    expect(typeof b.id).toBe("string");
  });

  it("generates unique ids on successive calls", () => {
    const b1 = createBookmark(makeFormData());
    const b2 = createBookmark(makeFormData());
    expect(b1.id).not.toBe(b2.id);
  });

  it("sets createdAt and updatedAt to the same ISO timestamp", () => {
    const before = Date.now();
    const b = createBookmark(makeFormData());
    const after = Date.now();
    const created = new Date(b.createdAt).getTime();
    const updated = new Date(b.updatedAt).getTime();
    expect(created).toBeGreaterThanOrEqual(before);
    expect(created).toBeLessThanOrEqual(after);
    expect(b.createdAt).toBe(b.updatedAt);
    expect(created).toBe(updated);
  });

  it("trims url and title", () => {
    const b = createBookmark(makeFormData({ url: "  https://example.com  ", title: "  Hello  " }));
    expect(b.url).toBe("https://example.com");
    expect(b.title).toBe("Hello");
  });

  it("normalizes tags", () => {
    const b = createBookmark(makeFormData({ tags: "React, TypeScript, React" }));
    expect(b.tags).toEqual(["react", "typescript"]);
  });

  it("sets description to undefined when empty", () => {
    const b = createBookmark(makeFormData({ description: "" }));
    expect(b.description).toBeUndefined();
  });

  it("sets description when provided", () => {
    const b = createBookmark(makeFormData({ description: "My desc" }));
    expect(b.description).toBe("My desc");
  });
});

// ---------------------------------------------------------------------------
// updateBookmark
// ---------------------------------------------------------------------------

describe("updateBookmark", () => {
  it("returns new array (immutable)", () => {
    const original = [makeBookmark()];
    const updated = updateBookmark(original, "test-id-1", makeFormData({ title: "New Title" }));
    expect(updated).not.toBe(original);
  });

  it("updates the target bookmark fields", () => {
    const original = [makeBookmark()];
    const updated = updateBookmark(original, "test-id-1", makeFormData({ title: "New Title" }));
    expect(updated[0].title).toBe("New Title");
  });

  it("sets a new updatedAt timestamp", async () => {
    const original = [makeBookmark({ updatedAt: "2020-01-01T00:00:00.000Z" })];
    await new Promise((r) => setTimeout(r, 5)); // ensure time passes
    const updated = updateBookmark(original, "test-id-1", makeFormData());
    expect(updated[0].updatedAt).not.toBe("2020-01-01T00:00:00.000Z");
  });

  it("preserves original createdAt", () => {
    const original = [makeBookmark({ createdAt: "2020-01-01T00:00:00.000Z" })];
    const updated = updateBookmark(original, "test-id-1", makeFormData());
    expect(updated[0].createdAt).toBe("2020-01-01T00:00:00.000Z");
  });

  it("does not modify other bookmarks", () => {
    const b1 = makeBookmark({ id: "id-1", title: "B1" });
    const b2 = makeBookmark({ id: "id-2", title: "B2" });
    const updated = updateBookmark([b1, b2], "id-1", makeFormData({ title: "Updated B1" }));
    expect(updated[1].title).toBe("B2");
  });

  it("returns original array if id not found (no-op)", () => {
    const original = [makeBookmark()];
    const updated = updateBookmark(original, "nonexistent-id", makeFormData());
    expect(updated[0]).toEqual(original[0]);
  });
});

// ---------------------------------------------------------------------------
// deleteBookmark
// ---------------------------------------------------------------------------

describe("deleteBookmark", () => {
  it("removes bookmark with given id", () => {
    const bookmarks = [
      makeBookmark({ id: "id-1" }),
      makeBookmark({ id: "id-2" }),
    ];
    const result = deleteBookmark(bookmarks, "id-1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("id-2");
  });

  it("returns new array (immutable)", () => {
    const original = [makeBookmark({ id: "id-1" })];
    const result = deleteBookmark(original, "id-1");
    expect(result).not.toBe(original);
  });

  it("returns same-length array when id not found", () => {
    const bookmarks = [makeBookmark({ id: "id-1" })];
    const result = deleteBookmark(bookmarks, "nonexistent");
    expect(result).toHaveLength(1);
  });

  it("returns empty array when deleting sole bookmark", () => {
    const bookmarks = [makeBookmark({ id: "id-1" })];
    const result = deleteBookmark(bookmarks, "id-1");
    expect(result).toHaveLength(0);
  });

  it("does not mutate the original array", () => {
    const original = [makeBookmark({ id: "id-1" })];
    deleteBookmark(original, "id-1");
    expect(original).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// findByUrl
// ---------------------------------------------------------------------------

describe("findByUrl", () => {
  const bookmarks = [
    makeBookmark({ id: "id-1", url: "https://example.com" }),
    makeBookmark({ id: "id-2", url: "https://github.com" }),
  ];

  it("finds bookmark by exact URL", () => {
    const result = findByUrl(bookmarks, "https://example.com");
    expect(result?.id).toBe("id-1");
  });

  it("finds bookmark case insensitively", () => {
    const result = findByUrl(bookmarks, "HTTPS://EXAMPLE.COM");
    expect(result?.id).toBe("id-1");
  });

  it("returns undefined when URL not found", () => {
    const result = findByUrl(bookmarks, "https://notfound.com");
    expect(result).toBeUndefined();
  });

  it("trims whitespace from query URL", () => {
    const result = findByUrl(bookmarks, "  https://example.com  ");
    expect(result?.id).toBe("id-1");
  });

  it("returns undefined for empty bookmarks array", () => {
    expect(findByUrl([], "https://example.com")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// searchBookmarks
// ---------------------------------------------------------------------------

describe("searchBookmarks", () => {
  const bookmarks: Bookmark[] = [
    {
      id: "id-1",
      url: "https://reactjs.org",
      title: "React Documentation",
      description: "Official React docs",
      tags: ["react", "frontend"],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "id-2",
      url: "https://typescriptlang.org",
      title: "TypeScript Handbook",
      description: "TypeScript language reference",
      tags: ["typescript", "language"],
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    },
    {
      id: "id-3",
      url: "https://nextjs.org",
      title: "Next.js Framework",
      description: undefined,
      tags: ["react", "framework"],
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-01-03T00:00:00.000Z",
    },
  ];

  it("returns all bookmarks when query is empty and no active tag", () => {
    expect(searchBookmarks(bookmarks, "", null)).toHaveLength(3);
  });

  it("searches by title", () => {
    const result = searchBookmarks(bookmarks, "TypeScript", null);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("id-2");
  });

  it("searches by URL", () => {
    const result = searchBookmarks(bookmarks, "nextjs.org", null);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("id-3");
  });

  it("searches by description", () => {
    const result = searchBookmarks(bookmarks, "language reference", null);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("id-2");
  });

  it("searches by tag", () => {
    const result = searchBookmarks(bookmarks, "frontend", null);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("id-1");
  });

  it("search is case insensitive", () => {
    const result = searchBookmarks(bookmarks, "REACT", null);
    // Matches title "React Documentation" and title "Next.js Framework" (tag 'react') + "React" in title
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((b) => b.id === "id-1")).toBe(true);
  });

  it("applies activeTag filter (AND logic with query)", () => {
    // activeTag 'react' should match id-1 and id-3; combined with query 'framework' → only id-3
    const result = searchBookmarks(bookmarks, "framework", "react");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("id-3");
  });

  it("activeTag with empty query returns only tagged bookmarks", () => {
    const result = searchBookmarks(bookmarks, "", "react");
    expect(result).toHaveLength(2);
    expect(result.map((b) => b.id).sort()).toEqual(["id-1", "id-3"]);
  });

  it("returns empty array when no bookmarks match", () => {
    const result = searchBookmarks(bookmarks, "python", null);
    expect(result).toHaveLength(0);
  });

  it("handles bookmark without description gracefully", () => {
    // id-3 has no description — searching within it should not throw
    const result = searchBookmarks(bookmarks, "framework", null);
    expect(result.some((b) => b.id === "id-3")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getAllTags
// ---------------------------------------------------------------------------

describe("getAllTags", () => {
  it("returns empty map for no bookmarks", () => {
    expect(getAllTags([])).toEqual(new Map());
  });

  it("counts each tag occurrence", () => {
    const bookmarks = [
      makeBookmark({ tags: ["react", "frontend"] }),
      makeBookmark({ tags: ["react", "typescript"] }),
      makeBookmark({ tags: ["typescript"] }),
    ];
    const result = getAllTags(bookmarks);
    expect(result.get("react")).toBe(2);
    expect(result.get("typescript")).toBe(2);
    expect(result.get("frontend")).toBe(1);
  });

  it("sorts by count descending", () => {
    const bookmarks = [
      makeBookmark({ tags: ["a"] }),
      makeBookmark({ tags: ["b", "a"] }),
      makeBookmark({ tags: ["b", "a", "c"] }),
    ];
    const result = getAllTags(bookmarks);
    const keys = [...result.keys()];
    expect(keys[0]).toBe("a"); // count 3
    expect(keys[1]).toBe("b"); // count 2
    expect(keys[2]).toBe("c"); // count 1
  });

  it("handles bookmarks with no tags", () => {
    const bookmarks = [makeBookmark({ tags: [] })];
    expect(getAllTags(bookmarks)).toEqual(new Map());
  });
});

// ---------------------------------------------------------------------------
// formatRelativeTime
// ---------------------------------------------------------------------------

describe("formatRelativeTime", () => {
  let now: number;

  beforeEach(() => {
    now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for < 60 seconds ago", () => {
    const iso = new Date(now - 30_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("just now");
  });

  it("returns minutes for < 60 minutes ago", () => {
    const iso = new Date(now - 5 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("5m ago");
  });

  it("returns hours for < 24 hours ago", () => {
    const iso = new Date(now - 3 * 3600_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("3h ago");
  });

  it("returns days for < 30 days ago", () => {
    const iso = new Date(now - 7 * 86400_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("7d ago");
  });

  it("returns months for < 12 months ago", () => {
    const iso = new Date(now - 60 * 86400_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("2mo ago");
  });

  it("returns years for >= 12 months ago", () => {
    const iso = new Date(now - 400 * 86400_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("1y ago");
  });

  it("handles boundary: exactly 60 seconds", () => {
    const iso = new Date(now - 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("1m ago");
  });
});

// ---------------------------------------------------------------------------
// getFaviconUrl
// ---------------------------------------------------------------------------

describe("getFaviconUrl", () => {
  it("returns google favicon url for valid URL", () => {
    const result = getFaviconUrl("https://github.com/clawlabz");
    expect(result).toBe("https://www.google.com/s2/favicons?domain=github.com&sz=32");
  });

  it("extracts just the hostname", () => {
    const result = getFaviconUrl("https://docs.example.com/path?foo=bar#section");
    expect(result).toBe("https://www.google.com/s2/favicons?domain=docs.example.com&sz=32");
  });

  it("returns empty string for invalid URL", () => {
    expect(getFaviconUrl("not a url")).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(getFaviconUrl("")).toBe("");
  });
});
