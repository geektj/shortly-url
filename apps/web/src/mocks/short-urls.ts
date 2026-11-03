import {
  createShortUrlResponseSchema,
  type CreateShortUrlInput,
  type CreateShortUrlResponse,
} from "@short/shared";
const key = (alias: string) => `short-demo:${alias}`;
export async function mockCreateShortUrl(
  input: CreateShortUrlInput,
): Promise<CreateShortUrlResponse> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  const alias =
    input.customAlias || crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  if (localStorage.getItem(key(alias)))
    throw new Error("That alias is already taken. Try another.");
  const result: CreateShortUrlResponse = {
    id: alias,
    shortUrl: `${location.origin}/s/${alias}`,
    longUrl: input.longUrl,
    expiresAt: input.expiresAt || null,
  };
  localStorage.setItem(key(alias), JSON.stringify(result));
  return result;
}
export function resolveMockUrl(alias: string): CreateShortUrlResponse | null {
  const raw = localStorage.getItem(key(alias));
  if (!raw) return null;
  const parsed = createShortUrlResponseSchema.safeParse(JSON.parse(raw));
  if (
    !parsed.success ||
    (parsed.data.expiresAt && Date.parse(parsed.data.expiresAt) <= Date.now())
  )
    return null;
  return parsed.data;
}
