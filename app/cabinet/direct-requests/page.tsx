"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DirectRequestsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/cabinet/nearby-requests"); }, [router]);
  return null;
}
