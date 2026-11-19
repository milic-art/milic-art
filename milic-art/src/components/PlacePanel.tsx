import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site, type Discipline, type PlaceId } from "../content";
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

/** Muestra los [corchetes] como espacios para completar. */
function Txt({ children }: { children: string }) {
  const parts = children.split(/(\[[^\]]*\])/);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("[") ? (
          <span
            key={index}
            className="rounded-md border border-dashed border-orange-deep/60 bg-orange/10 px-1 text-orange-deep"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
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

function CommissionsBody({ onContact }: { onContact: (preset: string) => void }) {
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
                <p className="font-display text-[16px] font-bold leading-none text-orange-deep"><Txt>{tier.price}</Txt></p>
                <p className="mt-1 text-[11px] font-semibold text-ink-soft"><Txt>{itemTime(tier.time)}</Txt></p>
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
                <Txt>{thing}</Txt>
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
          onClick={() => onContact("encargo")}
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
                alt={`${site.about.name} en su escritorio de dibujo`}
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
        <Kicker>{site.about.nowLabel}</Kicker>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {site.about.now.map((thing) => (
            <li
              key={thing}
              className="rounded-full border-2 border-ink/25 bg-chalk px-3 py-1.5 text-[12.5px] font-semibold text-ink"
            >
              <Txt>{thing}</Txt>
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

const messageOptions: { id: string; label: string; text: string }[] = [
  { id: "periodismo", label: "Nota o investigación", text: site.periodismo.messageStarter },
  { id: "diseno", label: "Diseño o redes", text: site.diseno.messageStarter },
  { id: "encargo", label: "Un dibujo", text: "Hola Mili, quiero hacer un encargo de dibujo: [contame qué querés y para qué].  " },
  { id: "programacion", label: "Web, juego o UI/UX", text: site.programacion.messageStarter },
  { id: "otro", label: "Otra cosa", text: site.contact.otherMessage },
];

function ContactBody({ preset }: { preset: string | null }) {
  const [choice, setChoice] = useState<string | null>(preset);
  const [text, setText] = useState(() => messageOptions.find((o) => o.id === preset)?.text.trim() ?? "");
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  const pick = (id: string) => {
    setChoice(id);
    setText(messageOptions.find((o) => o.id === id)?.text.trim() ?? "");
    setStatus("idle");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2200);
    } catch {
      areaRef.current?.focus();
      areaRef.current?.select();
      setStatus("failed");
    }
  };

  return (
    <div className="space-y-5">
      <p className="max-w-[58ch] text-[15px] leading-relaxed text-ink-soft">{site.contact.intro}</p>

      <section className="rounded-2xl border-2 border-ink/80 bg-chalk px-4 py-4">
        <Kicker>{site.contact.pickLabel}</Kicker>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{site.contact.pickHint}</p>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {messageOptions.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => pick(option.id)}
                aria-pressed={choice === option.id}
                className={`min-h-[44px] rounded-full border-2 px-3.5 font-display text-[13px] font-bold ${
                  choice === option.id
                    ? "border-ink bg-orange-deep text-chalk"
                    : "border-ink/30 bg-paper text-ink hover:bg-paper-deep"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>

        {choice && (
          <div className="mt-3">
            <label htmlFor="mensaje" className="text-[12px] font-bold uppercase tracking-wide text-ink-soft">
              {site.contact.messageLabel}
            </label>
            <textarea
              id="mensaje"
              ref={areaRef}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setStatus("idle");
              }}
              rows={4}
              className="mt-1 w-full resize-y rounded-xl border-2 border-ink/30 bg-paper px-3 py-2 text-[14px] leading-relaxed text-ink"
            />
            <button
              type="button"
              onClick={copy}
              className="stamp-btn mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-ink bg-orange-deep px-4 font-display text-[13.5px] font-bold text-chalk shadow-[0_2px_0_rgba(75,58,42,0.8)]"
            >
              {status === "copied" ? site.contact.copiedLabel : site.contact.copyLabel}
            </button>
            <p className="mt-1.5 text-[12px] text-ink-soft" role="status">
              {status === "failed" ? site.contact.copyFail : ""}
            </p>
          </div>
        )}
      </section>

      <ul className="space-y-2">
        {site.contact.links.map((link) => {
          const inner = (
            <>
              <span className="flex min-w-0 flex-col">
                <span className="font-display text-[15px] font-bold leading-tight text-ink">
                  {link.label}
                  <span className="ml-2 font-body text-[12.5px] font-semibold text-orange-deep">
                    <Txt>{link.handle}</Txt>
                  </span>
                </span>
                <span className="mt-0.5 text-[12px] leading-snug text-ink-soft">
                  <Txt>{link.note}</Txt>
                </span>
              </span>
              {link.url && (
                <svg viewBox="0 0 24 24" className="row-arrow h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
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

/* --------------------------------------------------------- disciplinas */

function DisciplineBody({
  data,
  onContact,
  presetId,
}: {
  data: Discipline;
  onContact: (preset: string) => void;
  presetId: string;
}) {
  return (
    <div className="space-y-6">
      <p className="max-w-[58ch] text-[15px] leading-relaxed text-ink">
        <Txt>{data.intro}</Txt>
      </p>

      <section>
        <Kicker>{site.labels.whatIDo}</Kicker>
        <ul className="mt-2 space-y-2">
          {data.does.map((item) => (
            <li key={item} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-soft">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-moss" aria-hidden="true">
                <path d="M4 13l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                <Txt>{item}</Txt>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
          <b className="font-display text-ink">{site.labels.forWhom}: </b>
          <Txt>{data.forWhom}</Txt>
        </p>
      </section>

      <section>
        <h3 className="font-display text-lg">{data.projectsLabel}</h3>
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          {data.projects.map((project, index) => (
            <li key={index} className="rounded-xl border-2 border-ink/25 bg-chalk/70 px-3.5 py-3">
              <p className="font-display text-[15px] font-bold leading-tight text-ink">
                <Txt>{project.title}</Txt>
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                <Txt>{project.kind}</Txt>
              </p>
              <dl className="mt-2 space-y-1.5">
                {project.fields.map((field) => (
                  <div key={field.label}>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">{field.label}</dt>
                    <dd className="text-[13px] leading-snug text-ink">
                      <Txt>{field.value}</Txt>
                    </dd>
                  </div>
                ))}
              </dl>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-block font-display text-[13px] font-bold text-orange-deep underline underline-offset-4"
                >
                  {site.labels.visit}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-xl border-2 border-ink/20 bg-paper-deep/60 px-3.5 py-3">
          <Kicker>{site.labels.tools}</Kicker>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {data.tools.map((tool) => (
              <li key={tool} className="rounded-full border border-ink/30 bg-chalk px-2.5 py-1 text-[12px] font-semibold text-ink">
                <Txt>{tool}</Txt>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border-2 border-ink/20 bg-paper-deep/60 px-3.5 py-3">
          <Kicker>{data.extraLabel}</Kicker>
          <ul className="mt-1.5 space-y-1">
            {data.extra.map((item) => (
              <li key={item} className="text-[13px] leading-snug text-ink-soft">
                <Txt>{item}</Txt>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-ink/35 px-4 py-4 text-center">
        <p className="text-[13px] text-ink-soft">{data.ctaNote}</p>
        <button
          type="button"
          onClick={() => onContact(presetId)}
          className="stamp-btn mt-2.5 inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-ink bg-orange-deep px-5 py-2.5 font-display text-[15px] font-bold text-chalk shadow-[0_3px_0_rgba(75,58,42,0.85)]"
        >
          {data.ctaLabel}
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function DibujoBody({ onContact }: { onContact: (preset: string) => void }) {
  const [tab, setTab] = useState<"galeria" | "encargos">("galeria");
  const tabs = [
    { id: "galeria" as const, label: site.commissions.tabGallery },
    { id: "encargos" as const, label: site.commissions.tabCommissions },
  ];
  return (
    <div>
      <div role="tablist" aria-label="Taller de dibujo" className="mb-4 flex gap-1.5">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`tabpanel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`min-h-[44px] rounded-full border-2 px-4 font-display text-[14px] font-bold ${
              tab === item.id ? "border-ink bg-orange-deep text-chalk" : "border-ink/30 bg-chalk text-ink hover:bg-paper-deep"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "galeria" ? <GalleryBody /> : <CommissionsBody onContact={onContact} />}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- panel */

const titles: Record<PlaceId, { title: string; kicker: string }> = {
  periodismo: { title: site.periodismo.heading, kicker: site.periodismo.kicker },
  diseno: { title: site.diseno.heading, kicker: site.diseno.kicker },
  dibujo: { title: "Taller de dibujo", kicker: "Galería y encargos" },
  programacion: { title: site.programacion.heading, kicker: site.programacion.kicker },
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
  const [preset, setPreset] = useState<string | null>(null);
  const goContact = (id: string) => {
    setPreset(id);
    onNavigate("contact");
  };
  const order = site.map.places.map((place) => place.id);
  const at = order.indexOf(placeId);
  const prevPlace = site.map.places[(at - 1 + order.length) % order.length];
  const nextPlace = site.map.places[(at + 1) % order.length];

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
          {placeId === "periodismo" && <DisciplineBody key="p" data={site.periodismo} onContact={goContact} presetId="periodismo" />}
          {placeId === "diseno" && <DisciplineBody key="d" data={site.diseno} onContact={goContact} presetId="diseno" />}
          {placeId === "dibujo" && <DibujoBody onContact={goContact} />}
          {placeId === "programacion" && <DisciplineBody key="g" data={site.programacion} onContact={goContact} presetId="programacion" />}
          {placeId === "about" && <AboutBody />}
          {placeId === "contact" && <ContactBody key={preset ?? "none"} preset={preset} />}

          <nav aria-label="Otros lugares" className="mt-7 flex items-stretch justify-between gap-2">
            <button
              type="button"
              onClick={() => onNavigate(prevPlace.id)}
              className="min-h-[44px] flex-1 rounded-xl border-2 border-ink/25 bg-chalk/70 px-3 py-2 text-left hover:bg-paper-deep"
            >
              <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-soft">← {site.labels.prevPlace}</span>
              <span className="block font-display text-[14px] font-bold leading-tight text-ink">{prevPlace.name}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate(nextPlace.id)}
              className="min-h-[44px] flex-1 rounded-xl border-2 border-ink/25 bg-chalk/70 px-3 py-2 text-right hover:bg-paper-deep"
            >
              <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-soft">{site.labels.nextPlace} →</span>
              <span className="block font-display text-[14px] font-bold leading-tight text-ink">{nextPlace.name}</span>
            </button>
          </nav>

          <p className="mt-5 border-t border-dashed border-ink/20 pt-3 text-[11.5px] leading-relaxed text-ink-soft">
            {site.brand.footerNote}
          </p>
        </div>
      </div>
    </div>
  );
}
