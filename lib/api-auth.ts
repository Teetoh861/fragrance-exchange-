import { auth } from "@/lib/auth";

export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be logged in." as const, status: 401 as const };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Admins only." as const, status: 403 as const };
  }
  return { user: session.user };
}
