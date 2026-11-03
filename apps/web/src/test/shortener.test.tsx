import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Shortener } from "@/components/shortener";
import { Providers } from "@/components/providers";
import { createShortUrl } from "@/lib/api";
vi.mock("@/lib/api", () => ({ createShortUrl: vi.fn() }));
const result = {
  id: "hello",
  shortUrl: "https://short.test/s/hello",
  longUrl: "https://example.com/",
  expiresAt: null,
};
function setup() {
  const user = userEvent.setup();
  render(
    <Providers>
      <Shortener />
    </Providers>,
  );
  return user;
}
async function submit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Long URL/), "https://example.com/");
  await user.click(screen.getByRole("button", { name: /Generate/ }));
}
beforeEach(() => {
  vi.mocked(createShortUrl).mockReset();
});
describe("shortener", () => {
  it("renders labeled inputs and an empty state", () => {
    setup();
    expect(screen.getByLabelText(/Long URL/)).toBeVisible();
    expect(screen.getByLabelText("Custom alias")).toBeVisible();
    expect(screen.getByLabelText("Expiration date")).toBeVisible();
    expect(screen.getByText(/Your next great link/)).toBeVisible();
  });
  it("rejects an unsafe URL and focuses its input", async () => {
    const user = setup();
    await user.type(screen.getByLabelText(/Long URL/), "javascript:alert(1)");
    await user.click(screen.getByRole("button", { name: /Generate/ }));
    expect(await screen.findByText(/Enter a valid/)).toBeVisible();
    expect(screen.getByLabelText(/Long URL/)).toHaveFocus();
    expect(createShortUrl).not.toHaveBeenCalled();
  });
  it.each(["bad alias", "api", "ADMIN"])("rejects alias %s", async (alias) => {
    const user = setup();
    await user.type(screen.getByLabelText("Custom alias"), alias);
    await submit(user);
    expect(screen.getByLabelText("Custom alias")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(createShortUrl).not.toHaveBeenCalled();
  });
  it("shows loading and disables duplicate submissions", async () => {
    vi.mocked(createShortUrl).mockImplementation(() => new Promise(() => {}));
    const user = setup();
    await submit(user);
    expect(
      await screen.findByRole("button", { name: /Creating/ }),
    ).toBeDisabled();
  });
  it("shows an API error and allows retry", async () => {
    vi.mocked(createShortUrl).mockRejectedValue(
      new Error("Service unavailable"),
    );
    const user = setup();
    await submit(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Service unavailable",
    );
    expect(screen.getByRole("button", { name: /Generate/ })).toBeEnabled();
  });
  it("creates a link and copies it", async () => {
    vi.mocked(createShortUrl).mockResolvedValue(result);
    const user = setup();
    await submit(user);
    expect(await screen.findByText(result.shortUrl)).toHaveAttribute(
      "href",
      result.shortUrl,
    );
    const clipboard = vi.spyOn(navigator.clipboard, "writeText");
    await user.click(screen.getByRole("button", { name: /Copy link/ }));
    expect(clipboard).toHaveBeenCalledWith(result.shortUrl);
    expect(await screen.findByText("Copied to clipboard!")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Open short URL/ }),
    ).toHaveAttribute("rel", "noopener noreferrer");
  });
  it("reports a clipboard failure", async () => {
    vi.mocked(createShortUrl).mockResolvedValue(result);
    const user = setup();
    await submit(user);
    await screen.findByText(result.shortUrl);
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(
      new Error("Denied"),
    );
    await user.click(screen.getByRole("button", { name: /Copy link/ }));
    expect(await screen.findByText(/Could not copy/)).toBeVisible();
  });
  it("supports keyboard navigation and Enter submission", async () => {
    vi.mocked(createShortUrl).mockResolvedValue(result);
    const user = setup();
    await user.tab();
    // expect(screen.getByText("Skip to content")).toHaveFocus();
    // await user.tab();
    await user.tab();
    expect(screen.getByLabelText(/Long URL/)).toHaveFocus();
    await user.type(screen.getByLabelText(/Long URL/), "https://example.com/");
    await user.tab();
    expect(screen.getByLabelText("Custom alias")).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("Expiration date")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /Generate/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(createShortUrl).toHaveBeenCalledOnce());
  });
});
