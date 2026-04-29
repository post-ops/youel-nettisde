import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/site/Logo";

export const metadata = { title: "Logg inn" };

type Props = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;
  return (
    <div className="min-h-screen grid place-items-center px-6 py-20">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-10">
          <Logo size="lg" showText />
          <p className="text-[var(--color-muted)] text-sm mt-4">
            Logg inn for å administrere kalenderen.
          </p>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
