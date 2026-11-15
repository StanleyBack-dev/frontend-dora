import { NextResponse } from "next/server";
import { APP_BUILD } from "@/shared/lib/app-version";

// The build this deployment serves. Open apps compare it with their own to
// offer "Nova versão do Dora" after a deploy. Never cached.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(APP_BUILD, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
