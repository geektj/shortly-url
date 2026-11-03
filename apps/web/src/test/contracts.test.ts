import { describe, it, expect, vi, afterEach } from "vitest";
import { createShortUrlSchema } from "@short/shared";
import { createShortUrl } from "@/lib/api";
import { resolveMockUrl } from "@/mocks/short-urls";
const valid = {
  longUrl: "https://example.com/a",
  customAlias: "",
  expiresAt: "",
};
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("shared validation", () => {
  it.each([
    "",
    "not a url",
    "javascript:alert(1)",
    "data:text/plain,hello",
    "file:///tmp/test",
    "ftp://example.com",
    "https://user:pass@example.com",
    `https://example.com/${"a".repeat(2048)}`,
  ])("rejects unsafe/invalid URL %s", (longUrl) => {
    expect(createShortUrlSchema.safeParse({ ...valid, longUrl }).success).toBe(
      false,
    );
  });
  it("rejects past expiration and accepts future expiration", () => {
    expect(
      createShortUrlSchema.safeParse({ ...valid, expiresAt: "2000-01-01" })
        .success,
    ).toBe(false);
    expect(
      createShortUrlSchema.safeParse({
        ...valid,
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      }).success,
    ).toBe(true);
  });
  it("accepts valid alias characters", () => {
    expect(
      createShortUrlSchema.safeParse({ ...valid, customAlias: "My_link-123" })
        .success,
    ).toBe(true);
  });
});
describe("API abstraction", () => {
  it("uses the mock, prevents alias collisions and expires links", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    vi.useFakeTimers();
    const input = {
      ...valid,
      customAlias: "hello",
      expiresAt: new Date(Date.now() + 10000).toISOString(),
    };
    const pending = createShortUrl(input);
    await vi.advanceTimersByTimeAsync(650);
    const response = await pending;
    expect(resolveMockUrl("hello")).toEqual(response);
    const duplicate = expect(createShortUrl(input)).rejects.toThrow(
      /already taken/,
    );
    await vi.advanceTimersByTimeAsync(650);
    await duplicate;
    await vi.advanceTimersByTimeAsync(10000);
    expect(resolveMockUrl("hello")).toBeNull();
  });
  it("uses the configured HTTP endpoint with a typed body", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test/");
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "x",
            shortUrl: "https://short.test/x",
            longUrl: valid.longUrl,
            expiresAt: null,
          }),
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    await createShortUrl(valid);
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.test/urls",
      expect.objectContaining({ method: "POST", body: JSON.stringify(valid) }),
    );
  });
  it("handles HTTP conflicts and malformed successful responses", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 409 }))
      .mockResolvedValueOnce(new Response("{}"));
    vi.stubGlobal("fetch", fetcher);
    await expect(createShortUrl(valid)).rejects.toThrow(/already taken/);
    await expect(createShortUrl(valid)).rejects.toThrow();
  });
});
