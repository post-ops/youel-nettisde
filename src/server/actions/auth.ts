"use server";

import { signIn, signOut } from "@/lib/auth";
import { adminLoginInput } from "@/lib/validators";

export type LoginState = { ok: boolean; error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = adminLoginInput.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Ugyldig e-post eller passord" };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: (formData.get("callbackUrl") as string) || "/admin",
    });
    return { ok: true };
  } catch (err) {
    // NextAuth kaster en redirect-error når innlogging lykkes — la den bobble.
    const message = (err as Error)?.message || "";
    if (message.includes("NEXT_REDIRECT")) throw err;
    return { ok: false, error: "Feil e-post eller passord" };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
