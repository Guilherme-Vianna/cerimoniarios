import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GUEST_COOKIE, SESSION_COOKIE } from "@/lib/auth/constants";
import { verifyIdToken } from "@/lib/auth/session";
import { claimGuestData, ensureUser } from "@/server/account";

function stringField(body: unknown, key: string) {
  const value = (body as Record<string, unknown> | null)?.[key];
  return typeof value === "string" && value ? value : null;
}

/** A quiz taken as a guest moves to the account the visitor signs in to; a failure here must not block the login. */
async function claimGuest(identity: Awaited<ReturnType<typeof verifyIdToken>>, guestToken: string) {
  try {
    const guest = await verifyIdToken(guestToken);
    if (!guest.isGuest) return;
    await claimGuestData(await ensureUser(identity), guest.uid);
  } catch (error) {
    console.error("Could not claim guest data", error);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const idToken = stringField(body, "idToken");
  if (!idToken) {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  let identity;
  try {
    identity = await verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const guestToken = stringField(body, "guestToken");
  if (guestToken && !identity.isGuest) await claimGuest(identity, guestToken);

  const store = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.max(identity.exp - Math.floor(Date.now() / 1000), 0),
  } as const;
  store.set(SESSION_COOKIE, idToken, options);
  if (identity.isGuest) store.set(GUEST_COOKIE, "1", options);
  else store.delete(GUEST_COOKIE);
  return new NextResponse(null, { status: 204 });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(GUEST_COOKIE);
  return new NextResponse(null, { status: 204 });
}
