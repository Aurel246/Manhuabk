import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/auth/password";
import { registerSchema } from "@/lib/validations/auth";
import { AppError } from "@/lib/errors";
import { createVerificationToken } from "@/modules/email/tokens";
import { sendVerificationEmail } from "@/modules/email/service";

export interface RegisteredUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface RegisterResult {
  user: RegisteredUser;
  emailSent: boolean;
}

export async function registerUser(input: unknown): Promise<RegisterResult> {
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
  // emailVerifiedAt reste null → le compte est créé NON vérifié.
  const user = await prisma.user.create({
    data: {
      username,
      email: normalizedEmail,
      passwordHash,
    },
    select: { id: true, username: true, email: true, role: true },
  });

  const token = await createVerificationToken(user.id);
  const { sent } = await sendVerificationEmail(user.email, token);

  return { user, emailSent: sent };
}
