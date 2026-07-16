"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "./auth";

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
    }
  }, [router]);
}
