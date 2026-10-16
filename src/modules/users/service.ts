import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/auth/password";
import { registerSchema } from "@/lib/validations/auth";
import { AppError } from "@/lib/errors";

export async function registerUser(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", parsed.error.issues[0].message);
  }
  const { username, email, password } = parsed.data;

  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { username }],
    },
  });
  if (existing) {
    throw new AppError("CONFLICT", "Ce pseudo ou cet e-mail est déjà utilisé.");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      email: normalizedEmail,
      passwordHash,
    },
    select: { id: true, username: true, email: true, role: true },
  });

  return user;
}
