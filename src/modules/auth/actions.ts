"use server";

import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function loginRedirect() {
  redirect("/connecter");
}
