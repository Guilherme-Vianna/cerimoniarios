/**
 * Bridge to the Android app (android/ NativeBridge.kt), which injects `window.CerimoniariosAndroid` only into pages
 * from this site's origin. Google blocks its sign-in page inside WebViews, so the app picks the account natively.
 */

type NativeBridge = {
  postMessage(message: string): void;
  addEventListener(type: "message", listener: (event: { data: unknown }) => void): void;
  removeEventListener(type: "message", listener: (event: { data: unknown }) => void): void;
};

type NativeReply = { id: string; ok: boolean; idToken?: string; error?: string };

declare global {
  interface Window {
    CerimoniariosAndroid?: NativeBridge;
  }
}

export class NativeAppError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "NativeAppError";
  }
}

function bridge(): NativeBridge | undefined {
  return typeof window === "undefined" ? undefined : window.CerimoniariosAndroid;
}

export function isNativeApp() {
  return bridge() !== undefined;
}

let nextId = 0;

function request(type: string): Promise<NativeReply> {
  const target = bridge();
  if (!target) return Promise.reject(new NativeAppError("native/unavailable"));
  const id = `${Date.now()}-${++nextId}`;
  return new Promise((resolve) => {
    function onMessage(event: { data: unknown }) {
      let reply: NativeReply;
      try {
        reply = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (reply?.id !== id) return;
      target!.removeEventListener("message", onMessage);
      resolve(reply);
    }
    target.addEventListener("message", onMessage);
    target.postMessage(JSON.stringify({ id, type }));
  });
}

export async function nativeGoogleIdToken(): Promise<string> {
  const reply = await request("googleSignIn");
  if (!reply.ok || !reply.idToken) throw new NativeAppError(`native/${reply.error ?? "failed"}`);
  return reply.idToken;
}

export async function nativeSignOut() {
  if (!isNativeApp()) return;
  await request("signOut").catch(() => undefined);
}
