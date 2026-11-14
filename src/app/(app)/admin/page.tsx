import { redirect } from "next/navigation";
import { openableSections } from "@/features/admin/model/admin-sections";
import { getSessionUser } from "@/server/auth/current-user";

// The first area the user can open.
export default async function AdminIndexPage() {
  const user = await getSessionUser();
  const [first] = openableSections(user, Boolean(user.condominium));
  redirect(first?.href ?? "/inicio");
}
