import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";

export type SessionUser = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  /** Firebase anonymous sign-in: may take quizzes, stays off the leaderboard until it signs in for real. */
  isGuest: boolean;
};

const jwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export async function verifyIdToken(token: string): Promise<SessionUser & { exp: number }> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set");
  }
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  if (!payload.sub || !payload.exp) {
    throw new Error("Invalid token payload");
  }
  const firebase = payload.firebase as { sign_in_provider?: unknown } | undefined;
  return {
    uid: payload.sub,
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
    picture: typeof payload.picture === "string" ? payload.picture : null,
    isGuest: firebase?.sign_in_provider === "anonymous",
    exp: payload.exp,
  };
}

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}
