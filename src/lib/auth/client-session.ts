import type { User } from "firebase/auth";

/** `guestToken`: ID token of the guest account the visitor used before signing in, so its quizzes move over. */
export async function createServerSession(user: User, forceRefresh = false, guestToken?: string) {
  const idToken = await user.getIdToken(forceRefresh);
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken, guestToken }),
  });
  if (!response.ok) {
    throw new Error(`Session request failed with ${response.status}`);
  }
}

export async function destroyServerSession() {
  await fetch("/api/session", { method: "DELETE" });
}
