"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginAction, type LoginState } from "@/server/actions/auth";

const initial: LoginState = { ok: false };

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/admin"} />
      <div>
        <Label htmlFor="email">E-post</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="password">Passord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5"
        />
      </div>
      {state.error ? (
        <div className="text-sm text-[var(--color-danger)]">{state.error}</div>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Logger inn…
          </>
        ) : (
          "Logg inn"
        )}
      </Button>
    </form>
  );
}
