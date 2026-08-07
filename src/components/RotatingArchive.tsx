import { useEffect, useMemo, useState } from "react";
import { photoArchive } from "../data/seed";

export type ArchivePlacement = "today" | "plan" | "register";

const placementOffset: Record<ArchivePlacement, number> = {
  today: 0,
  plan: 3,
  register: 6,
};

const archiveNotes: Record<ArchivePlacement, string> = {
  today: "drinking the motion potion",
  plan: "The plan moves slowly. The work changes everything.",
  register: "No selective memory. Everything gets written down.",
};

export function buildArchiveFrames(offset = 0) {
  return Array.from({ length: 3 }, (_, frameIndex) =>
    Array.from({ length: 3 }, (_, slotIndex) => photoArchive[(offset + frameIndex * 3 + slotIndex) % photoArchive.length]),
  );
}

export function RotatingArchive({ placement }: { placement: ArchivePlacement }) {
  const frames = useMemo(() => buildArchiveFrames(placementOffset[placement]), [placement]);
  const [activeFrame, setActiveFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const interval = window.setInterval(() => setActiveFrame((current) => (current + 1) % frames.length), 12_000);
    return () => window.clearInterval(interval);
  }, [frames.length, paused, reduceMotion]);

  return (
    <section
      className={`rotating-archive archive-${placement}`}
      aria-label={`Photo archive: ${placement}`}
      data-testid={`archive-${placement}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      tabIndex={0}
    >
      <div className="archive-heading">
        <span>ARCHIVE // 10.08.26</span>
        <span>{String(activeFrame + 1).padStart(2, "0")} / 03</span>
      </div>

      {frames.map((frame, frameIndex) => (
        <div className={`archive-frame ${frameIndex === activeFrame ? "is-active" : ""}`} aria-hidden={frameIndex !== activeFrame} key={frameIndex}>
          {frame.map((photo, slotIndex) => (
            <figure className={`archive-photo archive-slot-${slotIndex + 1} photo-${photo.crop}`} key={photo.src}>
              <img src={photo.src} alt={frameIndex === activeFrame ? photo.alt : ""} loading={frameIndex === 0 ? "eager" : "lazy"} />
              <span className="photo-wash" aria-hidden="true" />
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      ))}

      <span className="archive-tape" aria-hidden="true" />
      <p className="archive-note">“{archiveNotes[placement]}”</p>
    </section>
  );
}
