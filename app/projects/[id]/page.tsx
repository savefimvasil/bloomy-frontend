"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/projects/${params.id as string}/plan`);
  }, [params.id, router]);

  return null;
}
