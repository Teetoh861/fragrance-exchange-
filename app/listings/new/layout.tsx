import { requireUser } from "@/lib/session";

export default async function NewListingLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
