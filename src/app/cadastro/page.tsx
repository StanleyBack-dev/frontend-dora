import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { EnrollmentFlow } from "@/features/enrollment/components/EnrollmentFlow";

const SHARE_TITLE = "Cadastro de morador · Dora";
const SHARE_DESCRIPTION =
  "Use o código do convite para enviar os seus dados à administração do condomínio.";

export const metadata: Metadata = {
  title: "Cadastro de morador",
  robots: { index: false },
  // The invite links go over WhatsApp: their own preview.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Dora",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

export default function EnrollmentPage() {
  return (
    <AuthLayout wide>
      <EnrollmentFlow />
    </AuthLayout>
  );
}
