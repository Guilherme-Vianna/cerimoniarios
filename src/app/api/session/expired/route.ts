import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth/constants";

export async function GET() {
  (await cookies()).delete(SESSION_COOKIE);
  return new NextResponse(null, { status: 307, headers: { location: `${LOGIN_PATH}?sessao=expirada` } });
}
