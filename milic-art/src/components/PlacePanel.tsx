import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site, type PlaceId } from "../content";
import { ArtPlaceholder } from "./WorldArt";
import { ClockyArt } from "./ClockyArt";

/* ------------------------------------------------------------ shell bits */

function SpiralBinding() {
  return (
    <div
      aria-hidden="true"
      className="hidden justify-center gap-2.5 border-b border-paper-deep bg-paper-deep/45 px-4 py-1.5 sm:flex"
    >
      {Array.from({ length: 15 }).map((_, index) => (
        <span
          key={index}
          className="h-2.5 w-2.5 rounded-full border border-ink/25 bg-paper shadow-[inset_0_1px_0_rgba(75,58,42,0.25)]"
        />
      ))}
    </div>
  );
}

function Kicker({ children }: { children: string }) {
  return (
    <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-orange-deep">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ gallery */

function Lightbox({
  items,
  index,
  onClose,
  onStep,
}: {
  items: typeof site.gallery.items;
  index: number;
  onClose: () => void;
  onStep: (next: number) => void;
}) {
  const item = items[index];
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
      if (event.key === "ArrowRight") onStep((index + 1) % items.length);
      if (event.key === "ArrowLeft") onStep((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKeyDown, true);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [index, items.length, onClose, onStep]);

  const overlay = (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-3 bg-ink/85 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-3xl items-center justify-between gap-3">
        <p className="font-display text-sm font-bold text-paper">
          {item.title}
          <span className="ml-2 font-body text-xs font-normal text-paper/70">{item.year}</span>
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={site.labels.close}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-paper/70 bg-paper/15 text-paper transition-colors hover:bg-paper/30"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="relative flex w-full max-w-3xl items-center justify-center">
        <button
          type="button"
          onClick={() => onStep((index - 1 + items.length) % items.length)}
          aria-label={site.labels.previous}
          className="absolute left-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-paper/70 bg-ink/60 text-paper"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M14.5 5 8 12l6.5 7" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="mx-auto max-h-[72dvh] w-full max-w-2xl overflow-hidden rounded-2xl border-4 border-paper bg-paper">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="max-h-[70dvh] w-full object-contain"
            />
          ) : (
            <div className="aspect-square w-full">
              <ArtPlaceholder variant={item.variant} />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onStep((index + 1) % items.length)}
          aria-label={site.labels.next}
          className="absolute right-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-paper/70 bg-ink/60 text-paper"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M9.5 5 16 12l-6.5 7" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <p className="max-w-xl text-center text-[12.5px] leading-relaxed text-paper/85">
        {item.description}
      </p>
    </div>
  );

  if (typeof document === "undefined") return overlay;
  return createPortal(overlay, document.body);
}

function GalleryBody() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = site.gallery.items;

  return (
    <div>
      <p className="max-w-[58ch] text-[15px] leading-relaxed text-ink-soft">{site.gallery.intro}</p>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="thumb group block w-full rounded-xl border-2 border-ink/80 bg-chalk p-1.5 text-left shadow-[0_3px_0_rgba(75,58,42,0.35)]"
              aria-label={`${site.labels.viewPiece}: ${item.title}`}
            >
              <span className="relative block overflow-hidden rounded-lg border border-ink/30">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="block aspect-square w-full">
                    <ArtPlaceholder variant={item.variant} />
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-orange/0 transition-colors duration-200 group-hover:bg-orange/10"
                />
              </span>
              <span className="mt-2 block px-1 pb-1">
                <span className="block font-display text-[13.5px] font-bold leading-tight text-ink">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                  {item.medium} · {item.year}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onStep={setOpenIndex}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------- commissions */

function CommissionsBody({ onNavigate }: { onNavigate: (id: PlaceId) => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-orange bg-orange/10 px-4 py-3.5">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-orange-deep px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-chalk">
          {site.commissions.statusTag}
        </span>
        <p className="mt-2 font-display text-[17px] font-bold leading-snug text-ink">
          {site.commissions.status}
        </p>
      </div>

      <p className="max-w-[58ch] text-[15px] leading-relaxed text-ink-soft">
        {site.commissions.intro}
      </p>

      <section>
        <h3 className="font-display text-lg">{site.labels.prices}</h3>
        <ul className="mt-2 divide-y divide-ink/15 rounded-xl border-2 border-ink/25 bg-chalk/70">
          {site.commissions.prices.map((tier) => (
            <li key={tier.name} className="flex flex-wrap items-start justify-between gap-2 px-3.5 py-3">
              <div className="max-w-[36ch]">
                <p className="font-display text-[15px] font-bold leading-tight text-ink">{tier.name}</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-ink-soft">{tier.detail}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-[16px] font-bold leading-none text-orange-deep">{tier.price}</p>
                <p className="mt-1 text-[11px] font-semibold text-ink-soft">{itemTime(tier.time)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Kicker>{site.labels.rules}</Kicker>
        <ul className="mt-2 space-y-2">
          {site.commissions.rules.map((rule) => (
            <li key={rule} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-soft">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-moss" aria-hidden="true">
                <path d="M4 13l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-ink/20 bg-paper-deep/60 px-3.5 py-3">
          <Kicker>{site.labels.availability}</Kicker>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink">{site.commissions.availability}</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{site.commissions.turnaround}</p>
        </div>
        <div className="rounded-xl border-2 border-ink/20 bg-paper-deep/60 px-3.5 py-3">
          <Kicker>{site.labels.notDrawing}</Kicker>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {site.commissions.notDrawing.map((thing) => (
              <li
                key={thing}
                className="rounded-full border border-ink/30 bg-chalk px-2.5 py-1 text-[11.5px] font-semibold text-ink-soft"
              >
                {thing}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{site.commissions.payments}</p>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-ink/35 px-4 py-4 text-center">
        <p className="text-[13px] text-ink-soft">{site.commissions.ctaNote}</p>
        <button
          type="button"
          onClick={() => onNavigate("contact")}
          className="stamp-btn mt-2.5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-orange-deep px-5 py-2.5 font-display text-[15px] font-bold text-chalk shadow-[0_3px_0_rgba(75,58,42,0.85)]"
        >
          {site.commissions.ctaLabel}
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function itemTime(time: string) {
  return time;
}

/* -------------------------------------------------------------------- about */

function AboutBody() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative mx-auto w-32 shrink-0 sm:mx-0">
          <span
            aria-hidden="true"
            className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 rotate-[-5deg] rounded-[2px] border border-ink/20 bg-orange-soft/80"
          />
          <div className="rounded-xl border-2 border-ink/80 bg-chalk p-2 shadow-[0_3px_0_rgba(75,58,42,0.3)]">
            {site.about.portrait ? (
              <img
                src={site.about.portrait}
                alt={`${site.about.name} at the drawing desk`}
                className="aspect-square w-full rounded-lg object-cover"
              />
            ) : (
              <div className="aspect-square w-full">
                <ClockyArt state="wave" />
              </div>
            )}
          </div>
          <p className="mt-2 text-center font-display text-[13px] font-bold text-ink">
            {site.about.name}
          </p>
        </div>

        <div>
          <p className="text-[15px] leading-relaxed text-ink">{site.about.intro}</p>
          <div className="mt-3 space-y-2.5">
            {site.about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-[14px] leading-relaxed text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      <section>
        <Kicker>{site.labels.whatIDraw}</Kicker>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {site.about.draws.map((thing) => (
            <li
              key={thing}
              className="rounded-full border-2 border-ink/25 bg-chalk px-3 py-1.5 text-[12.5px] font-semibold text-ink"
            >
              {thing}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Kicker>{site.labels.tools}</Kicker>
        <ul className="mt-2 divide-y divide-ink/15 rounded-xl border-2 border-ink/25 bg-chalk/70">
          {site.about.tools.map((tool) => (
            <li key={tool.name} className="flex items-baseline justify-between gap-3 px-3.5 py-2.5">
              <span className="font-display text-[14px] font-bold text-ink">{tool.name}</span>
              <span className="text-right text-[12.5px] text-ink-soft">{tool.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border-2 border-ink/20 bg-paper-deep/60 px-3.5 py-3">
        <Kicker>{site.labels.littleFacts}</Kicker>
        <ul className="mt-1.5 space-y-1.5">
          {site.about.facts.map((fact) => (
            <li key={fact} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-soft">
              <span aria-hidden="true" className="text-orange">
                •
              </span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="font-display text-[14px] font-bold text-river">{site.about.signOff}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ contact */

function ContactBody() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="max-w-[58ch] text-[15px] leading-relaxed text-ink-soft">{site.contact.intro}</p>

      {site.contact.email && (
      <div className="rounded-2xl border-2 border-ink/80 bg-chalk px-4 py-4">
        <Kicker>Email</Kicker>
        <a
          href={`mailto:${site.contact.email}`}
          className="mt-1 block break-all font-display text-[19px] font-bold leading-tight text-ink underline decoration-orange decoration-2 underline-offset-4"
        >
          {site.contact.email}
        </a>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{site.contact.emailNote}</p>
        <button
          type="button"
          onClick={copyEmail}
          className="stamp-btn mt-2.5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-orange-soft px-3.5 py-1.5 font-display text-[12.5px] font-bold text-ink shadow-[0_2px_0_rgba(75,58,42,0.8)]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <rect x="8" y="8" width="11" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.9" />
            <path d="M16 8V5.5A2.5 2.5 0 0 0 13.5 3H6.5A2.5 2.5 0 0 0 4 5.5v9A2.5 2.5 0 0 0 6.5 17H8" fill="none" stroke="currentColor" strokeWidth="1.9" />
          </svg>
          {copied ? site.contact.copiedLabel : site.contact.copyLabel}
        </button>
      </div>
      )}

      <ul className="space-y-2">
        {site.contact.links.map((link) => {
          const inner = (
            <>
              <span className="flex min-w-0 flex-col">
                <span className="font-display text-[15px] font-bold leading-tight text-ink">
                  {link.label}
                  <span className="ml-2 font-body text-[12.5px] font-semibold text-orange-deep">
                    {link.handle}
                  </span>
                </span>
                <span className="mt-0.5 text-[12px] leading-snug text-ink-soft">{link.note}</span>
              </span>
              <svg viewBox="0 0 24 24" className="row-arrow h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          );

          return (
            <li key={link.id}>
              {link.url ? (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="contact-row flex items-center justify-between gap-3 rounded-xl border-2 border-ink/25 bg-chalk/70 px-3.5 py-2.5 hover:bg-orange/10"
                >
                  {inner}
                </a>
              ) : (
                <div className="contact-row flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-ink/25 bg-chalk/50 px-3.5 py-2.5">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-[12.5px] font-semibold text-ink-soft">{site.contact.responseTime}</p>
    </div>
  );
}

/* -------------------------------------------------------------------- panel */

const titles: Record<PlaceId, { title: string; kicker: string }> = {
  gallery: { title: site.gallery.heading, kicker: site.gallery.kicker },
  commissions: { title: site.commissions.heading, kicker: site.commissions.kicker },
  about: { title: site.about.heading, kicker: site.about.kicker },
  contact: { title: site.contact.heading, kicker: site.contact.kicker },
};

export function PlacePanel({
  placeId,
  onClose,
  onNavigate,
}: {
  placeId: PlaceId;
  onClose: () => void;
  onNavigate: (id: PlaceId) => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreRef = useRef<Element | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const headingId = `panel-title-${placeId}`;

  useEffect(() => {
    restoreRef.current = document.activeElement;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      const previous = restoreRef.current;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [onClose]);

  const meta = titles[placeId];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={site.labels.close}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/45 backdrop-blur-[2px]"
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="sheet-up paper-card relative z-10 flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[26px] border-2 border-ink shadow-[0_10px_0_rgba(75,58,42,0.28)] sm:max-h-[86dvh] sm:max-w-[720px] sm:rounded-[26px]"
      >
        <SpiralBinding />

        <div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-ink/20 px-4 pb-3 pt-3 sm:px-7 sm:pt-6">
          <div className="min-w-0">
            <div aria-hidden="true" className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ink/25 sm:hidden" />
            <Kicker>{meta.kicker}</Kicker>
            <h2 id={headingId} className="mt-0.5 font-display text-[26px] font-extrabold leading-none sm:text-[30px]">
              {meta.title}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span className="hidden text-[11px] font-bold uppercase tracking-wide text-ink-soft sm:inline">
              {site.labels.closeHint}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={site.labels.close}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-chalk text-ink shadow-[0_2px_0_rgba(75,58,42,0.7)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="panel-scroll overflow-y-auto px-4 pb-8 pt-4 sm:px-7">
          {placeId === "gallery" && <GalleryBody />}
          {placeId === "commissions" && <CommissionsBody onNavigate={onNavigate} />}
          {placeId === "about" && <AboutBody />}
          {placeId === "contact" && <ContactBody />}

          <p className="mt-7 border-t border-dashed border-ink/20 pt-3 text-[11.5px] leading-relaxed text-ink-soft">
            {site.brand.footerNote}
          </p>
        </div>
      </div>
    </div>
  );
}
