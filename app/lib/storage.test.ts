import { describe, it, expect } from "vitest";
import { estimateQuota } from "./storage";
import type { Bookmark } from "./types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ESTIMATED_TOTAL = 5 * 1024 * 1024; // 5MB, same constant as storage.ts

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

// ---------------------------------------------------------------------------
// estimateQuota
// ---------------------------------------------------------------------------

describe("estimateQuota", () => {
  it("returns correct total of 5MB", () => {
    const result = estimateQuota([]);
    expect(result.total).toBe(ESTIMATED_TOTAL);
  });

  it("calculates used as JSON string length * 2 (UTF-16 bytes)", () => {
    const bookmarks = [makeBookmark()];
    const json = JSON.stringify(bookmarks);
    const expectedUsed = json.length * 2;
    const result = estimateQuota(bookmarks);
    expect(result.used).toBe(expectedUsed);
  });

  it("calculates percentUsed correctly", () => {
    const bookmarks = [makeBookmark()];
    const json = JSON.stringify(bookmarks);
    const used = json.length * 2;
    const expected = (used / ESTIMATED_TOTAL) * 100;
    const result = estimateQuota(bookmarks);
    expect(result.percentUsed).toBeCloseTo(expected, 5);
  });

  it("isWarning is false for low usage", () => {
    const result = estimateQuota([]); // empty → near 0
    expect(result.isWarning).toBe(false);
  });

  it("isWarning is false below 80% threshold", () => {
    // empty array → "[]" = 2 chars → 4 bytes → well under 80%
    const result = estimateQuota([]);
    expect(result.percentUsed).toBeLessThan(80);
    expect(result.isWarning).toBe(false);
  });

  it("isFull is false for low usage", () => {
    const result = estimateQuota([]);
    expect(result.isFull).toBe(false);
  });

  it("isWarning is true when percentUsed > 80", () => {
    // Build a payload that exceeds 80% of 5MB
    // 80% of 5MB = 4MB = 4,194,304 bytes
    // used = jsonLength * 2, so we need jsonLength > 2,097,152 chars
    // Create a single bookmark with a very long url
    const longUrl = "https://example.com/" + "a".repeat(2_100_000);
    const bookmarks = [makeBookmark({ url: longUrl })];
    const result = estimateQuota(bookmarks);
    expect(result.percentUsed).toBeGreaterThan(80);
    expect(result.isWarning).toBe(true);
  });

  it("isFull is true when percentUsed > 95", () => {
    // 95% of 5MB = 4.75MB = 4,980,736 bytes
    // used = jsonLength * 2, so we need jsonLength > 2,490,368 chars
    const longUrl = "https://example.com/" + "a".repeat(2_500_000);
    const bookmarks = [makeBookmark({ url: longUrl })];
    const result = estimateQuota(bookmarks);
    expect(result.percentUsed).toBeGreaterThan(95);
    expect(result.isFull).toBe(true);
    expect(result.isWarning).toBe(true); // isFull implies isWarning
  });

  it("returns used = 2 for empty array (just '[]')", () => {
    // JSON.stringify([]) === "[]" → length 2 → used = 4 bytes
    const result = estimateQuota([]);
    expect(result.used).toBe(4); // "[]".length * 2
  });

  it("used increases with more bookmarks", () => {
    const one = estimateQuota([makeBookmark()]);
    const two = estimateQuota([makeBookmark(), makeBookmark({ id: "id-2" })]);
    expect(two.used).toBeGreaterThan(one.used);
  });
});
