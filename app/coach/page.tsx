import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import ApexCoachChat from "@/components/coach/ApexCoachChat";

export default async function CoachPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <ApexCoachChat
          preferredName={session.user.name}
        />
      </div>
    </main>
  );
}
