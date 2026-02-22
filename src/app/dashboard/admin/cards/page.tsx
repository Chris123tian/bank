
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminCardsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/admin/users");
  }, [router]);
  return null;
}
