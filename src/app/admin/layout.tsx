import Link from "next/link";
import { CalendarDays, ListChecks, Ban, LogOut, Type, ImageIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/server/actions/auth";
import { Logo } from "@/components/site/Logo";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      {session?.user ? (
        <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
            <Link href="/admin" className="inline-flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-[var(--color-muted)] text-sm hidden sm:inline">
                · Admin
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <NavLink href="/admin" icon={<CalendarDays className="h-4 w-4" />}>
                Oversikt
              </NavLink>
              <NavLink
                href="/admin/bookings"
                icon={<ListChecks className="h-4 w-4" />}
              >
                Bestillinger
              </NavLink>
              <NavLink href="/admin/blocks" icon={<Ban className="h-4 w-4" />}>
                Blokker
              </NavLink>
              <NavLink href="/admin/content" icon={<Type className="h-4 w-4" />}>
                Tekst
              </NavLink>
              <NavLink href="/admin/images" icon={<ImageIcon className="h-4 w-4" />}>
                Bilder
              </NavLink>
            </nav>
            <form action={logoutAction}>
              <button className="text-sm inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
                <LogOut className="h-4 w-4" />
                {session.user.email}
              </button>
            </form>
          </div>
        </header>
      ) : null}
      <main className="flex-1">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
