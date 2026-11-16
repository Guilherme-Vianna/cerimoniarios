import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadAnalytics(env: Record<string, string> = {}) {
  vi.resetModules();
  Object.entries(env).forEach(([name, value]) => vi.stubEnv(name, value));
  return import("@/lib/analytics");
}

let gtag: ReturnType<typeof vi.fn>;

beforeEach(() => {
  gtag = vi.fn();
  vi.stubGlobal("window", { gtag });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("analytics", () => {
  it("sends the event and the Google Ads conversion when its label is set", async () => {
    const { trackQuizComplete } = await loadAnalytics({
      NEXT_PUBLIC_GOOGLE_ADS_ID: "AW-123",
      NEXT_PUBLIC_GOOGLE_ADS_COMPLETE_QUIZ_LABEL: "quizLabel",
    });
    trackQuizComplete({ total: 10, answered: 9, guest: true });
    expect(gtag).toHaveBeenCalledWith("event", "complete_quiz", { total_questions: 10, answered: 9, guest: true });
    expect(gtag).toHaveBeenCalledWith("event", "conversion", { send_to: "AW-123/quizLabel" });
  });

  it("skips the conversion without a label", async () => {
    const { trackDonateClick } = await loadAnalytics({ NEXT_PUBLIC_GOOGLE_ADS_ID: "AW-123" });
    trackDonateClick("pix_copy");
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "donate_click", { method: "pix_copy" });
  });

  it("never throws when the tag is missing or broken", async () => {
    const { trackLogin, trackShare } = await loadAnalytics();
    vi.stubGlobal("window", {});
    expect(() => trackLogin("email")).not.toThrow();
    vi.stubGlobal("window", { gtag: () => { throw new Error("blocked"); } });
    expect(() => trackShare("whatsapp")).not.toThrow();
  });
});

describe("share message", () => {
  it("celebrates a perfect score and links the site", async () => {
    const { shareMessage } = await import("@/components/quiz/share-score");
    expect(shareMessage(10, 10, "https://site.test")).toMatch(/^Gabaritei a prova \(10 de 10\).*https:\/\/site\.test$/);
    expect(shareMessage(7, 10, "https://site.test")).toContain("Acertei 7 de 10 perguntas");
  });
});
