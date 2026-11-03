"use client";
import Link from "next/link";
import { useEffect, useSyncExternalStore, use } from "react";
import { resolveMockUrl } from "@/mocks/short-urls";
const subscribe = () => () => {};
export default function DemoRedirect({
  params,
}: {
  params: Promise<{ alias: string }>;
}) {
  const { alias } = use(params);
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return JSON.stringify(resolveMockUrl(alias));
      } catch {
        return "null";
      }
    },
    () => "loading",
  );
  useEffect(() => {
    if (raw === "loading" || raw === "null") return;
    const result = resolveMockUrl(alias);
    if (result) window.location.replace(result.longUrl);
  }, [alias, raw]);
  const message =
    raw === "null"
      ? "This demo link is missing or expired. Links are available only in the browser that created them."
      : "Opening your link…";
  return (
    <main className="redirect-page">
      <h1>Shortly.</h1>
      <p role="status">{message}</p>
      <Link href="/">Create a new link</Link>
    </main>
  );
}
