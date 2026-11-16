import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GUEST_COOKIE, LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth/constants";

export async function GET() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(GUEST_COOKIE);
  return new NextResponse(null, { status: 307, headers: { location: `${LOGIN_PATH}?sessao=expirada` } });
}
