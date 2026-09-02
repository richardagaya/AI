"use client";

import { useEffect, useState } from "react";
import { firebaseAuth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { InfluencerPhoto } from "@/lib/influencers";

export function FaceThumb({
  influencerId,
  index,
  photo,
  alt,
  className,
}: {
  influencerId: string;
  index: number;
  photo: InfluencerPhoto;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(photo.url);
  useEffect(() => {
    if (photo.url) {
      setSrc(photo.url);
      return;
    }
    let objectUrl: string | null = null;
    let cancelled = false;
    (async () => {
      const token = await firebaseAuth.currentUser?.getIdToken();
      const res = await fetch(`/api/influencers/${influencerId}/photo/${index}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok || cancelled) return;
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);
      if (!cancelled) setSrc(objectUrl);
    })().catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [influencerId, index, photo.url]);

  if (!src) {
    return <div className={cn("bg-ink-soft", className)} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}
