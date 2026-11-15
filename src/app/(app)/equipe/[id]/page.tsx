import type { Metadata } from "next";

// A team member's page: the same as a resident's (data, role, permissions
// and access), reached from Equipe.
export { default } from "@/app/(app)/moradores/[id]/page";

export const metadata: Metadata = { title: "Equipe" };
