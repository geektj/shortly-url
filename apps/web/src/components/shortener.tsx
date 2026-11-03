"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createShortUrlSchema, type CreateShortUrlInput } from "@short/shared";
import { createShortUrl } from "@/lib/api";
export function Shortener() {
  const [copyMessage, setCopyMessage] = useState("");
  const mutation = useMutation({ mutationFn: createShortUrl });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateShortUrlInput>({
    resolver: zodResolver(createShortUrlSchema),
    defaultValues: { longUrl: "", customAlias: "", expiresAt: "" },
  });
  async function copy() {
    if (!mutation.data) return;
    try {
      await navigator.clipboard.writeText(mutation.data.shortUrl);
      setCopyMessage("Copied to clipboard!");
    } catch {
      setCopyMessage("Could not copy. Select and copy the link above.");
    }
  }
  return (
    <div className="site-shell">
      {/* <a className="skip-link" href="#main">
        Skip to content
      </a> */}
      <header>
        <Link href="/" className="brand" aria-label="Shortly home">
          <span className="brand-icon" aria-hidden="true">
            ↗
          </span>
          shortly<span className="brand-dot">.</span>
        </Link>
        <span className="header-note">A little link goes a long way.</span>
        <span className="phase-tag">LINK LAB / 01</span>
      </header>
      <main id="main">
        <section className="intro">
          <p className="eyebrow">
            <span /> LESS LINK. MORE POSSIBILITY.
          </p>
          <h1>
            Big ideas.
            <br />
            <span>Small links.</span>
          </h1>
          <p className="intro-copy">
            Make your next link a little more memorable.
            <br className="desktop-break" /> Shorten, customize, and share it in
            seconds.
          </p>
        </section>
        <div className="workspace">
          <section className="form-card" aria-labelledby="form-title">
            <div className="card-heading">
              <span className="step">01 / CREATE</span>
              <span className="card-symbol" aria-hidden="true">
                ↗
              </span>
            </div>
            <h2 id="form-title">Give your link a new look.</h2>
            <p className="subtext">
              Paste a long URL below. We’ll keep it short.
            </p>
            <form
              noValidate
              onSubmit={handleSubmit((values) => {
                setCopyMessage("");
                mutation.mutate({
                  ...values,
                  expiresAt: values.expiresAt
                    ? new Date(values.expiresAt).toISOString()
                    : "",
                });
              })}
              aria-busy={mutation.isPending}
            >
              <label htmlFor="longUrl">
                Long URL <span className="required">*</span>
              </label>
              <input
                id="longUrl"
                type="url"
                placeholder="https://example.com/your-very-long-link"
                autoComplete="url"
                maxLength={2048}
                aria-invalid={!!errors.longUrl}
                aria-describedby="longUrl-error"
                {...register("longUrl")}
              />
              <p className="field-error" id="longUrl-error">
                {errors.longUrl?.message}
              </p>
              <div className="optional-heading">
                <span>MAKE IT YOURS</span>
                <span>Optional</span>
              </div>
              <div className="field-grid">
                <div>
                  <label htmlFor="customAlias">Custom alias</label>
                  <input
                    id="customAlias"
                    placeholder="your-great-idea"
                    maxLength={64}
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={!!errors.customAlias}
                    aria-describedby="alias-hint alias-error"
                    {...register("customAlias")}
                  />
                  <p className="hint" id="alias-hint">
                    Letters, numbers, hyphens, underscores.
                  </p>
                  <p className="field-error" id="alias-error">
                    {errors.customAlias?.message}
                  </p>
                </div>
                <div>
                  <label htmlFor="expiresAt">Expiration date</label>
                  <input
                    id="expiresAt"
                    type="datetime-local"
                    aria-invalid={!!errors.expiresAt}
                    aria-describedby="expiry-hint expiry-error"
                    {...register("expiresAt")}
                  />
                  <p className="hint" id="expiry-hint">
                    Leave blank for a link that lasts.
                  </p>
                  <p className="field-error" id="expiry-error">
                    {errors.expiresAt?.message}
                  </p>
                </div>
              </div>
              {mutation.isError && (
                <p className="api-error" role="alert">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : "Something went wrong. Please try again."}
                </p>
              )}
              <button
                className="generate"
                disabled={mutation.isPending}
                type="submit"
              >
                {mutation.isPending
                  ? "Creating your link…"
                  : "Generate short link"}
                <span aria-hidden="true">{mutation.isPending ? "◌" : "↗"}</span>
              </button>
              <p className="form-footnote">Simple links. No account needed.</p>
            </form>
          </section>
          <aside
            className={`result-card ${mutation.data ? "has-result" : ""}`}
            aria-labelledby="result-title"
            aria-live="polite"
          >
            <span className="step">02 / SHARE</span>
            {mutation.data ? (
              <>
                <div className="result-art" aria-hidden="true">
                  ✓
                </div>
                <p className="eyebrow">READY WHEN YOU ARE</p>
                <h2 id="result-title">Small link. All yours.</h2>
                <p className="subtext">Your link is ready to go places.</p>
                <a
                  className="short-link"
                  href={mutation.data.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mutation.data.shortUrl}
                </a>
                <p className="original">{mutation.data.longUrl}</p>
                <div className="result-actions">
                  <button type="button" onClick={copy}>
                    Copy link <span aria-hidden="true">⧉</span>
                  </button>
                  <a
                    href={mutation.data.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open short URL in a new tab"
                  >
                    Open link ↗
                  </a>
                </div>
                <p className="copy-feedback" role="status">
                  {copyMessage || "Link created successfully."}
                </p>
                {mutation.data.expiresAt && (
                  <p className="hint">
                    Expires {new Date(mutation.data.expiresAt).toLocaleString()}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="result-art" aria-hidden="true">
                  ↗<span>↗</span>
                </div>
                <h2 id="result-title">
                  Your next great link
                  <br />
                  starts here.
                </h2>
                <p className="subtext">
                  Your short link will appear here,
                  <br />
                  ready to copy and share.
                </p>
                <div className="sample-link" aria-hidden="true">
                  shortly / <span>something-good</span>
                </div>
              </>
            )}
            <p className="demo-note">
              Browser demo · Links work only in this browser.
              <br />
              Clearing site data removes your links.
            </p>
          </aside>
        </div>
        <section className="benefits" aria-label="Features">
          <div>
            <span aria-hidden="true">↗</span>
            <h3>Short & shareable</h3>
            <p>Less clutter. More connection.</p>
          </div>
          <div>
            <span aria-hidden="true">✳</span>
            <h3>A personal touch</h3>
            <p>Your link, your choice of words.</p>
          </div>
          <div>
            <span aria-hidden="true">◷</span>
            <h3>On your schedule</h3>
            <p>Set an expiration. Stay in control.</p>
          </div>
        </section>
      </main>
      <footer>
        <span>© {new Date().getFullYear()} Shortly</span>
        <span>
          Made for the way you share.<span className="footer-dot"> ✳</span>
        </span>
      </footer>
    </div>
  );
}
