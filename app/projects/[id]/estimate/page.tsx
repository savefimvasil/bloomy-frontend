"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEstimate } from "./estimateContext";

export default function EstimatePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { steps } = useEstimate();

  useEffect(() => {
    if (steps.length > 0) {
      router.replace(steps[0].href);
    } else {
      router.replace(`/projects/${id}/estimate/existing`);
    }
  }, [steps, id, router]);

  return null;
}
