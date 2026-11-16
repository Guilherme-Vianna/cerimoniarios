export const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY?.trim() || null;

/** Name the bank shows when paying, so donors can check they are paying the right person. */
export const PIX_RECIPIENT = process.env.NEXT_PUBLIC_PIX_RECIPIENT?.trim() || null;

/** Optional page like Buy Me a Coffee, for donors who prefer a card. */
export const DONATION_URL = process.env.NEXT_PUBLIC_DONATION_URL?.trim() || null;

export function isDonationConfigured() {
  return Boolean(PIX_KEY || DONATION_URL);
}
