import { describe, it, expect } from "vitest";
import { mergeBookmarks, parseImportFile } from "./exportImport";
import type { Bookmark } from "./types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
  return {
    id: "id-1",
    url: "https://example.com",
    title: "Example",
    description: undefined,
    tags: ["test"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeFile(content: string, name = "bookmarks.json"): File {
  return new File([content], name, { type: "application/json" });
}

// ---------------------------------------------------------------------------
// mergeBookmarks
// ---------------------------------------------------------------------------

describe("mergeBookmarks", () => {
  it("imports new bookmarks not in existing list", () => {
    const existing: Bookmark[] = [makeBookmark({ id: "e1", url: "https://a.com" })];
    const incoming: Bookmark[] = [makeBookmark({ id: "i1", url: "https://b.com" })];
    const result = mergeBookmarks(existing, incoming);
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
  });

  it("skips bookmarks whose URL already exists (case insensitive)", () => {
    const existing = [makeBookmark({ id: "e1", url: "https://example.com" })];
    const incoming = [makeBookmark({ id: "i1", url: "HTTPS://EXAMPLE.COM" })];
    const result = mergeBookmarks(existing, incoming);
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);
  });

  it("returns first-wins for duplicates within existing (existing takes priority)", () => {
    const existing = [makeBookmark({ id: "e1", url: "https://example.com", title: "Original" })];
    const incoming = [makeBookmark({ id: "i1", url: "https://example.com", title: "Duplicate" })];
    const result = mergeBookmarks(existing, incoming);
    // The existing one should be kept
    const found = result.merged.find((b) => b.url === "https://example.com");
    expect(found?.title).toBe("Original");
    expect(found?.id).toBe("e1");
  });

  it("deduplicates within incoming array (first wins)", () => {
    const existing: Bookmark[] = [];
    const incoming: Bookmark[] = [
      makeBookmark({ id: "i1", url: "https://dup.com", title: "First" }),
      makeBookmark({ id: "i2", url: "https://dup.com", title: "Second" }),
    ];
    const result = mergeBookmarks(existing, incoming);
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.merged.find((b) => b.url === "https://dup.com")?.title).toBe("First");
  });

  it("merged array contains new bookmarks prepended before existing", () => {
    const existing = [makeBookmark({ id: "e1", url: "https://existing.com" })];
    const incoming = [makeBookmark({ id: "i1", url: "https://new.com" })];
    const result = mergeBookmarks(existing, incoming);
    // new bookmarks come first in merged result
    expect(result.merged[0].url).toBe("https://new.com");
    expect(result.merged[1].url).toBe("https://existing.com");
  });

  it("returns empty errors array", () => {
    const result = mergeBookmarks([], []);
    expect(result.errors).toEqual([]);
  });

  it("handles empty existing and empty incoming", () => {
    const result = mergeBookmarks([], []);
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.merged).toHaveLength(0);
  });

  it("handles empty existing with non-empty incoming", () => {
    const incoming = [
      makeBookmark({ id: "i1", url: "https://a.com" }),
      makeBookmark({ id: "i2", url: "https://b.com" }),
    ];
    const result = mergeBookmarks([], incoming);
    expect(result.imported).toBe(2);
    expect(result.merged).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// parseImportFile
// ---------------------------------------------------------------------------

describe("parseImportFile", () => {
  it("parses valid ClawMark JSON export", async () => {
    const bookmarks = [
      {
        id: "abc",
        url: "https://example.com",
        title: "Example",
        tags: ["tag1"],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];
    const file = makeFile(JSON.stringify(bookmarks));
    const result = await parseImportFile(file);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://example.com");
    expect(result[0].title).toBe("Example");
    expect(result[0].tags).toEqual(["tag1"]);
  });

  it("preserves existing id when present", async () => {
    const bookmarks = [{ id: "existing-id", url: "https://a.com", title: "A" }];
    const file = makeFile(JSON.stringify(bookmarks));
    const result = await parseImportFile(file);
    expect(result[0].id).toBe("existing-id");
  });

  it("generates id when not present", async () => {
    const bookmarks = [{ url: "https://a.com", title: "A" }];
    const file = makeFile(JSON.stringify(bookmarks));
    const result = await parseImportFile(file);
    expect(result[0].id).toBeTruthy();
  });

  it("defaults tags to empty array when missing", async () => {
    const bookmarks = [{ url: "https://a.com", title: "A" }];
    const file = makeFile(JSON.stringify(bookmarks));
    const result = await parseImportFile(file);
    expect(result[0].tags).toEqual([]);
  });

  it("throws on invalid JSON", async () => {
    const file = makeFile("not json at all {{{");
    await expect(parseImportFile(file)).rejects.toThrow("Invalid JSON format.");
  });

  it("throws when JSON is not an array (object)", async () => {
    const file = makeFile(JSON.stringify({ url: "https://a.com", title: "A" }));
    await expect(parseImportFile(file)).rejects.toThrow(
      "Invalid format. Only ClawMark JSON exports are supported."
    );
  });

  it("throws when JSON is not an array (string)", async () => {
    const file = makeFile(JSON.stringify("just a string"));
    await expect(parseImportFile(file)).rejects.toThrow(
      "Invalid format. Only ClawMark JSON exports are supported."
    );
  });

  it("throws when array contains item missing url field", async () => {
    const file = makeFile(JSON.stringify([{ title: "No URL" }]));
    await expect(parseImportFile(file)).rejects.toThrow(
      "Invalid format. Only ClawMark JSON exports are supported."
    );
  });

  it("throws when array contains item missing title field", async () => {
    const file = makeFile(JSON.stringify([{ url: "https://a.com" }]));
    await expect(parseImportFile(file)).rejects.toThrow(
      "Invalid format. Only ClawMark JSON exports are supported."
    );
  });

  it("throws when array contains non-object items", async () => {
    const file = makeFile(JSON.stringify([42, "string"]));
    await expect(parseImportFile(file)).rejects.toThrow(
      "Invalid format. Only ClawMark JSON exports are supported."
    );
  });

  it("returns empty array for empty JSON array", async () => {
    const file = makeFile(JSON.stringify([]));
    const result = await parseImportFile(file);
    expect(result).toHaveLength(0);
  });

  it("handles multiple valid bookmarks", async () => {
    const bookmarks = [
      { url: "https://a.com", title: "A" },
      { url: "https://b.com", title: "B" },
    ];
    const file = makeFile(JSON.stringify(bookmarks));
    const result = await parseImportFile(file);
    expect(result).toHaveLength(2);
  });
});
