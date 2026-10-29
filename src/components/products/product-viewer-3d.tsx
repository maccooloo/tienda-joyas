"use client";

import { useEffect, useState } from "react";
import type { ComponentType, HTMLAttributes } from "react";

const ModelViewer = "model-viewer" as unknown as ComponentType<
  HTMLAttributes<HTMLElement> & {
    src: string;
    alt: string;
    loading: "lazy";
    cameraControls: boolean;
    ar: boolean;
  }
>;

export function ProductViewer3D({ src, title }: { src: string; title: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void import("@google/model-viewer").then(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, []);

  if (!ready) return <div className="product-viewer-loading" aria-label="Cargando vista 3D" />;

  return (
    <ModelViewer
      src={src}
      alt={`Modelo 3D de ${title}`}
      loading="lazy"
      cameraControls
      ar
      className="product-viewer"
    />
  );
}