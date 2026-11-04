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
  const [failed, setFailed] = useState(false);
  const [chapter, setChapter] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const viewport = window.matchMedia("(max-width: 760px)");
    let inView = false;
    const handlePlayError = (error: unknown) => {
      if (error instanceof DOMException && (error.name === "AbortError" || error.name === "NotAllowedError")) return;
      setFailed(true);
    };
    const attemptPlayback = () => {
      if (preference.matches || document.hidden || !inView || video.error) return;
      void video.play().catch(handlePlayError);
    };
    const syncPlayback = () => {
      if (preference.matches || document.hidden || !inView) {
        video.pause();
      } else {
        attemptPlayback();
      }
    };
    const syncSource = () => {
      const nextSource = viewport.matches ? mobileSource : source;
      if (video.getAttribute("src") !== nextSource) {
        video.src = nextSource;
        video.load();
      }
      syncPlayback();
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncPlayback(); }, { threshold: 0.1 });
    const retryPlayback = () => attemptPlayback();
    syncSource();
    observer.observe(video);
    preference.addEventListener("change", syncPlayback);
    viewport.addEventListener("change", syncSource);
    document.addEventListener("visibilitychange", syncPlayback);
    document.addEventListener("pointerdown", retryPlayback);
    document.addEventListener("keydown", retryPlayback);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", syncPlayback);
      viewport.removeEventListener("change", syncSource);
      document.removeEventListener("visibilitychange", syncPlayback);
      document.removeEventListener("pointerdown", retryPlayback);
      document.removeEventListener("keydown", retryPlayback);
      video.pause();
    };
  }, [source, mobileSource]);

  function seekChapter(index: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = index * 7;
    setChapter(index);
    void video.play().catch((error: unknown) => {
      if (error instanceof DOMException && (error.name === "AbortError" || error.name === "NotAllowedError")) return;
      setFailed(true);
    });
  }

  return (
    <section className={`campaign-film ${manifesto ? "manifesto-film" : ""}`} aria-labelledby="campaign-title">
      <Image className="campaign-poster" src={poster} alt={manifesto ? "Retrato renacentista reinterpretado con joyas" : currentEra.imageAlt} fill sizes="100vw" preload />
      <video ref={videoRef} className={`campaign-video ${failed ? "has-failed" : ""}`} src={source} poster={poster} autoPlay muted loop playsInline preload="auto" aria-hidden="true"
        onTimeUpdate={manifesto ? undefined : (event) => setChapter(Math.min(3, Math.floor(event.currentTarget.currentTime / 7)))}
        onError={() => setFailed(true)} />
      <div className="film-copy">
        <p>{manifesto ? `El universo ${brand.name}` : "Joyas que atraviesan el tiempo"}</p>
        <h1 id="campaign-title">El arte sigue vivo.</h1>
        <Link href={manifesto ? "#manifiesto" : "/shop"}>{manifesto ? "Nuestro manifiesto" : "Descubrir las piezas"}</Link>
      </div>
      {!manifesto && !failed && <div className="film-chapters" role="group" aria-label="Escenas de la película">
        {eras.map((era, index) => <button type="button" key={era.slug} aria-label={`Ver escena de ${era.title}`} aria-pressed={chapter === index} onClick={() => seekChapter(index)}><span>{era.title}</span></button>)}
      </div>}
    </section>
  );
}
