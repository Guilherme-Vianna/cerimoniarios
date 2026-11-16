/**
 * Google tag (gtag.js) events for Google Ads / Google Analytics. Every call is a no-op when the tag is not configured
 * or blocked, so tracking can never break a sign-in or a quiz.
 */

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export type SignInMethod = "google" | "email";

/**
 * Two levels for Google Ads: `complete_quiz` is the frequent micro-conversion that gives the bidding enough data;
 * `donate_click` is the rare macro-conversion that actually brings money in.
 */
export type ConversionKind = "sign_up" | "complete_quiz" | "donate_click";

export const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID?.trim() || null;

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || null;

const CONVERSION_LABELS: Record<ConversionKind, string | null> = {
  sign_up: process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGN_UP_LABEL?.trim() || null,
  complete_quiz: process.env.NEXT_PUBLIC_GOOGLE_ADS_COMPLETE_QUIZ_LABEL?.trim() || null,
  donate_click: process.env.NEXT_PUBLIC_GOOGLE_ADS_DONATE_LABEL?.trim() || null,
};

function send(name: string, params?: Record<string, unknown>) {
  try {
    window.gtag?.("event", name, params);
  } catch {
    // An ad blocker or a broken tag must not affect the app.
  }
}

/** Google Ads conversion, when its label is configured (Ads → Goals → Conversions → Tag setup). */
function sendConversion(kind: ConversionKind) {
  const label = CONVERSION_LABELS[kind];
  if (ADS_ID && label) send("conversion", { send_to: `${ADS_ID}/${label}` });
}

export function trackSignUp(method: SignInMethod, fromGuest: boolean) {
  send("sign_up", { method, from_guest: fromGuest });
  sendConversion("sign_up");
}

export function trackLogin(method: SignInMethod) {
  send("login", { method });
}

export function trackGuestStart() {
  send("guest_start");
}

export function trackQuizComplete(details: { total: number; answered: number; guest: boolean }) {
  send("complete_quiz", { total_questions: details.total, answered: details.answered, guest: details.guest });
  sendConversion("complete_quiz");
}

export function trackDonateClick(method: "pix_copy" | "link") {
  send("donate_click", { method });
  sendConversion("donate_click");
}

export function trackShare(method: "native" | "whatsapp") {
  send("share", { method, content_type: "quiz_result" });
}
