"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function NewQuoteRequestRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get("projectId");

  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}/estimate/summary`);
    } else {
      router.replace("/cabinet/projects");
    }
  }, [router, projectId]);

  return null;
}
