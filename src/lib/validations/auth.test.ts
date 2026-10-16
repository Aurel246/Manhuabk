import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/auth/password";
import { registerSchema } from "@/lib/validations/auth";

describe("hashPassword / verifyPassword", () => {
  it("hash puis vérifie un mot de passe", async () => {
    const hash = await hashPassword("mon-secret");
    expect(hash).toMatch(/^scrypt:/);
    expect(await verifyPassword("mon-secret", hash)).toBe(true);
    expect(await verifyPassword("mauvais", hash)).toBe(false);
  });

  it("rejette un hash malformé", async () => {
    expect(await verifyPassword("x", "nimporte-quoi")).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepte une entrée valide", () => {
    const r = registerSchema.safeParse({
      username: "alice",
      email: "alice@example.com",
      password: "motdepasse1",
    });
    expect(r.success).toBe(true);
  });

  it("rejette un username court", () => {
    const r = registerSchema.safeParse({
      username: "ab",
      email: "a@b.com",
      password: "motdepasse1",
    });
    expect(r.success).toBe(false);
  });

  it("rejette un email invalide", () => {
    const r = registerSchema.safeParse({
      username: "alice",
      email: "pas-un-email",
      password: "motdepasse1",
    });
    expect(r.success).toBe(false);
  });
});
