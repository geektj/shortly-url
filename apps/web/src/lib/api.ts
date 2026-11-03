import {
  createShortUrlResponseSchema,
  createShortUrlSchema,
  type CreateShortUrlInput,
  type CreateShortUrlResponse,
} from "@short/shared";
export async function createShortUrl(
  input: CreateShortUrlInput,
): Promise<CreateShortUrlResponse> {
  const validated = createShortUrlSchema.parse(input);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!base) {
    const { mockCreateShortUrl } = await import("../mocks/short-urls");
    return createShortUrlResponseSchema.parse(
      await mockCreateShortUrl(validated),
    );
  }
  const response = await fetch(`${base.replace(/\/$/, "")}/urls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validated),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error(
      response.status === 409
        ? "That alias is already taken. Try another."
        : "Unable to shorten this URL. Please try again.",
    );
  return createShortUrlResponseSchema.parse(await response.json());
}
