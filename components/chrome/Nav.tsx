import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function Nav() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-primary">
          Fragrance Exchange
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 sm:flex">
          <Link href="/browse" className="hover:text-primary">
            Browse
          </Link>
          {session && (
            <Link href="/listings/new" className="hover:text-primary">
              List your perfume
            </Link>
          )}
          {session?.user.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-primary">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/account" className="text-sm font-medium text-stone-700 hover:text-primary">
                {session.user.name}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="ghost" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
