"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/src/config/brand";

export function CampaignHero({ manifesto = false }: { manifesto?: boolean }) {
  const source = manifesto ? "/videos/criseida-manifesto.mp4" : "/videos/criseida-art.mp4";
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let inView = true;
    const syncPlayback = () => {
      if (preference.matches || connection?.saveData || userPaused.current || document.hidden || !inView) {
        video.pause();
      } else {
        if (!video.getAttribute("src")) video.src = source;
        void video.play().catch(() => { /* Keep the play control available if autoplay is blocked. */ });
      }
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncPlayback(); }, { threshold: 0.1 });
    observer.observe(video);
    preference.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [source]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      if (!video.getAttribute("src")) video.src = source;
      void video.play().catch(() => setFailed(true));
    } else {
      userPaused.current = true;
      video.pause();
    }
  }

  return (
    <section className={`campaign-film ${manifesto ? "manifesto-film" : ""}`} aria-labelledby="campaign-title">
      <Image className="campaign-poster" src="/images/art-botticelli.webp" alt="Retrato renacentista reinterpretado con las joyas de la colección" fill sizes="100vw" preload />
      <video ref={videoRef} className={`campaign-video ${failed ? "has-failed" : ""}`} poster="/images/art-botticelli.webp" muted loop playsInline preload="none" aria-hidden="true"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }} />
      <div className="film-copy">
        <p>{manifesto ? `El universo ${brand.name}` : "Una nueva mirada"}</p>
        <h1 id="campaign-title">{manifesto ? "El arte sigue vivo." : "Arte para llevar."}</h1>
        <Link href={manifesto ? "#manifiesto" : "#coleccion"}>{manifesto ? "Nuestro manifiesto" : "Descubrir las piezas"}</Link>
      </div>
      {!failed && <button className="film-toggle" type="button" aria-label={playing ? "Pausar vídeo de campaña" : "Reproducir vídeo de campaña"} onClick={togglePlayback}>
        <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span><span>{playing ? "Pausar" : "Reproducir"}</span>
      </button>}
    </section>
  );
}
