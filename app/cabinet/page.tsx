"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthRole } from "@/store/auth";

export default function CabinetRoot() {
  const router = useRouter();

  useEffect(() => {
    const role = getAuthRole();
    if (role === "contractor") {
      router.replace("/cabinet/nearby-requests");
    } else {
      router.replace("/cabinet/projects");
    }
  }, [router]);

  return null;
}
