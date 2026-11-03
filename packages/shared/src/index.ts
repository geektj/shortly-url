import { z } from "zod";
export const MAX_URL_LENGTH = 2048;
export const RESERVED_ALIASES = [
  "api",
  "health",
  "admin",
  "docs",
  "s",
  "_next",
];
export const httpUrl = z
  .string()
  .trim()
  .min(1, "Enter a long URL.")
  .max(MAX_URL_LENGTH, "Use a URL of 2,048 characters or fewer.")
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        ["http:", "https:"].includes(url.protocol) &&
        !!url.hostname &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Enter a valid http:// or https:// URL without embedded credentials.");
export const createShortUrlSchema = z.object({
  longUrl: httpUrl,
  customAlias: z
    .string()
    .trim()
    .max(64, "Use 64 characters or fewer.")
    .regex(
      /^[a-zA-Z0-9_-]*$/,
      "Use only letters, numbers, hyphens and underscores.",
    )
    .refine(
      (value) => !RESERVED_ALIASES.includes(value.toLowerCase()),
      "This alias is reserved. Choose another.",
    ),
  expiresAt: z
    .string()
    .refine(
      (value) =>
        value === "" ||
        (Number.isFinite(Date.parse(value)) && Date.parse(value) > Date.now()),
      "Choose an expiration in the future.",
    ),
});
export type CreateShortUrlInput = z.infer<typeof createShortUrlSchema>;
export const createShortUrlResponseSchema = z.object({
  id: z.string(),
  shortUrl: httpUrl,
  longUrl: httpUrl,
  expiresAt: z.string().nullable(),
});
export type CreateShortUrlResponse = z.infer<
  typeof createShortUrlResponseSchema
>;
export type ApiErrorResponse = { message: string };
