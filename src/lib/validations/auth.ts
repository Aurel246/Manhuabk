import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Au moins 3 caractères")
    .max(24, "24 caractères max")
    .regex(/^[a-zA-Z0-9_-]+$/, "Lettres, chiffres, - et _ uniquement"),
  email: z.string().email("Adresse e-mail invalide").max(254),
  password: z
    .string()
    .min(8, "Au moins 8 caractères")
    .max(128, "128 caractères max"),
});

export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
