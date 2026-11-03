"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/src/config/brand";
import { currentEra, eras } from "@/src/config/eras";

export function CampaignHero({ manifesto = false }: { manifesto?: boolean }) {
  const source = manifesto ? "/videos/criseida-manifesto.mp4" : "/videos/criseida-epocas.mp4";
  const mobileSource = manifesto ? source : "/videos/criseida-epocas-mobile.mp4";
  const poster = manifesto ? "/images/art-botticelli.webp" : currentEra.image;
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [chapter, setChapter] = useState(0);

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
        if (!video.getAttribute("src")) video.src = window.matchMedia("(max-width: 760px)").matches ? mobileSource : source;
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
  }, [source, mobileSource]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      if (!video.getAttribute("src")) video.src = window.matchMedia("(max-width: 760px)").matches ? mobileSource : source;
      void video.play().catch(() => setFailed(true));
    } else {
      userPaused.current = true;
      video.pause();
    }
  }

  function seekChapter(index: number) {
    const video = videoRef.current;
    if (!video) return;
    if (!video.getAttribute("src")) video.src = window.matchMedia("(max-width: 760px)").matches ? mobileSource : source;
    video.currentTime = index * 7;
    userPaused.current = false;
    setChapter(index);
    void video.play().catch(() => setFailed(true));
  }

  return (
    <section className={`campaign-film ${manifesto ? "manifesto-film" : ""}`} aria-labelledby="campaign-title">
      <Image className="campaign-poster" src={poster} alt={manifesto ? "Retrato renacentista reinterpretado con joyas" : currentEra.imageAlt} fill sizes="100vw" preload />
      <video ref={videoRef} className={`campaign-video ${failed ? "has-failed" : ""}`} poster={poster} muted loop playsInline preload="none" aria-hidden="true"
        onTimeUpdate={manifesto ? undefined : (event) => setChapter(Math.min(3, Math.floor(event.currentTarget.currentTime / 7)))}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }} />
      <div className="film-copy">
        <p>{manifesto ? `El universo ${brand.name}` : "Joyas que atraviesan el tiempo"}</p>
        <h1 id="campaign-title">El arte sigue vivo.</h1>
        <Link href={manifesto ? "#manifiesto" : "/shop"}>{manifesto ? "Nuestro manifiesto" : "Descubrir las piezas"}</Link>
      </div>
      {!manifesto && !failed && <div className="film-chapters" role="group" aria-label="Escenas de la película">
        {eras.map((era, index) => <button type="button" key={era.slug} aria-label={`Ver escena de ${era.title}`} aria-pressed={chapter === index} onClick={() => seekChapter(index)}><span>{era.title}</span></button>)}
      </div>}
      {!failed && <button className="film-toggle" type="button" aria-label={playing ? "Pausar vídeo de campaña" : "Reproducir vídeo de campaña"} onClick={togglePlayback}>
        <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span><span>{playing ? "Pausar" : "Reproducir"}</span>
      </button>}
    </section>
  );
}
