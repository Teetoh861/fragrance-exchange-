import Link from "next/link";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ signedUp?: string; error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/account",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        return; // NextAuth redirects with ?error= on failure by default
      }
      throw err;
    }
  }

  async function googleAction() {
    "use server";
    await signIn("google", { redirectTo: "/account" });
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-1 text-2xl font-bold text-stone-900">Log in</h1>
      <p className="mb-6 text-sm text-muted">Welcome back.</p>

      {params.signedUp && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Account created — log in below.
        </p>
      )}
      {params.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          Invalid email or password.
        </p>
      )}

      <form action={loginAction} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Log in
        </Button>
      </form>

      {googleEnabled && (
        <form action={googleAction} className="mt-3">
          <Button type="submit" variant="outline" className="w-full">
            Continue with Google
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
}
