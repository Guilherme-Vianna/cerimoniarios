import { afterEach, describe, expect, it, vi } from "vitest";
import { isNativeApp, nativeGoogleIdToken, nativeSignOut } from "@/lib/native-app";

type Listener = (event: { data: unknown }) => void;

function installBridge(answer: (type: string) => object) {
  const listeners = new Set<Listener>();
  const sent: string[] = [];
  const bridge = {
    postMessage(raw: string) {
      const { id, type } = JSON.parse(raw);
      sent.push(type);
      queueMicrotask(() => {
        const others = { data: JSON.stringify({ id: "someone-else", ok: false, error: "failed" }) };
        const mine = { data: JSON.stringify({ id, ...answer(type) }) };
        [...listeners].forEach((listener) => listener({ data: "not json" }));
        [...listeners].forEach((listener) => listener(others));
        [...listeners].forEach((listener) => listener(mine));
      });
    },
    addEventListener: (_: "message", listener: Listener) => listeners.add(listener),
    removeEventListener: (_: "message", listener: Listener) => listeners.delete(listener),
  };
  vi.stubGlobal("window", { CerimoniariosAndroid: bridge });
  return { listeners, sent };
}

afterEach(() => vi.unstubAllGlobals());

describe("native app bridge", () => {
  it("is absent outside the Android app", async () => {
    expect(isNativeApp()).toBe(false);
    await expect(nativeGoogleIdToken()).rejects.toMatchObject({ code: "native/unavailable" });
    await expect(nativeSignOut()).resolves.toBeUndefined();
  });

  it("returns the Google ID token and stops listening", async () => {
    const { listeners } = installBridge(() => ({ ok: true, idToken: "token-123" }));
    expect(isNativeApp()).toBe(true);
    await expect(nativeGoogleIdToken()).resolves.toBe("token-123");
    expect(listeners.size).toBe(0);
  });

  it("maps native failures to native/* error codes", async () => {
    installBridge(() => ({ ok: false, error: "cancelled" }));
    await expect(nativeGoogleIdToken()).rejects.toMatchObject({ code: "native/cancelled" });
  });

  it("asks the app to clear its Google account on sign out", async () => {
    const { sent } = installBridge(() => ({ ok: true }));
    await nativeSignOut();
    expect(sent).toEqual(["signOut"]);
  });
});
