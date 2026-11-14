import "server-only";
import { cache } from "react";
import { getSessionToken, verifyIdToken } from "@/lib/auth/session";
import { ensureUser, type UserRow } from "./account";
import { ServiceError } from "./errors";

export const currentUser = cache(async (): Promise<UserRow> => {
  const token = await getSessionToken();
  if (!token) throw new ServiceError(401, "Not authenticated");
  let identity;
  try {
    identity = await verifyIdToken(token);
  } catch {
    throw new ServiceError(401, "Invalid or expired session");
  }
  return ensureUser(identity);
});
