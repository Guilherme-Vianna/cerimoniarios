import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";

function visit(path: string, cookies: Record<string, string> = {}) {
  const request = new NextRequest(new URL(path, "https://example.test"));
  Object.entries(cookies).forEach(([name, value]) => request.cookies.set(name, value));
  const response = proxy(request);
  const location = response.headers.get("location");
  return location ? new URL(location).pathname + new URL(location).search : null;
}

const member = { session: "token" };
const guest = { session: "token", guest: "1" };

describe("proxy", () => {
  it("sends visitors without a session to the login", () => {
    expect(visit("/ranking")).toBe("/?next=%2Franking");
  });

  it("starts a guest session for ad visitors who land on the quiz page", () => {
    expect(visit("/prova")).toBe("/comecar");
    expect(visit("/prova?gclid=abc&utm_source=google")).toBe("/comecar?gclid=abc&utm_source=google");
    expect(visit("/prova/abc")).toBe("/?next=%2Fprova%2Fabc");
  });

  it("lets guests take quizzes", () => {
    expect(visit("/prova", guest)).toBeNull();
    expect(visit("/prova/abc", guest)).toBeNull();
  });

  it("sends guests to the login for account-only pages", () => {
    expect(visit("/flashcards", guest)).toBe("/?next=%2Fflashcards");
    expect(visit("/conta", guest)).toBe("/?next=%2Fconta");
  });

  it("keeps the login page open for guests but not for members", () => {
    expect(visit("/", guest)).toBeNull();
    expect(visit("/", member)).toBe("/prova");
    expect(visit("/?next=%2Franking", member)).toBe("/ranking");
  });

  it("lets members open every page", () => {
    expect(visit("/flashcards", member)).toBeNull();
  });
});
