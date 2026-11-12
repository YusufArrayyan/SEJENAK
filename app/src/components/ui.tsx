import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Info, LifeBuoy, Phone, MessageCircleHeart } from "lucide-react";
import mark from "../assets/brand/mark.png";
import markDark from "../assets/brand/mark-dark.png";

export function Logo({ size = 30, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <span className="brand">
      <img src={mark} width={size} height={size} alt="" className="logo-light" style={{ width: size, height: size }} />
      <img src={markDark} width={size} height={size} alt="" className="logo-dark" style={{ width: size, height: size }} />
      {withText && <span>SEJENAK</span>}
    </span>
  );
}

/* ---------- Switch persetujuan ---------- */
export function ConsentSwitch({ id, checked, onChange, title, desc, disabled }: { id: string; checked: boolean; onChange: (v: boolean) => void; title: string; desc: string; disabled?: boolean }) {
  return (
    <label className="switch-row" htmlFor={id}>
      <span className="grow">
        <span className="label" style={{ display: "block" }}>{title}</span>
        <span className="hint" style={{ display: "block", marginTop: 2 }}>{desc}</span>
      </span>
      <span className="switch">
        <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="track" /><span className="thumb" />
      </span>
    </label>
  );
}

/* ---------- Banner bukan diagnosis ---------- */
export function NotDiagnosis({ children }: { children?: ReactNode }) {
  return (
    <p className="note"><Info aria-hidden />
      <span>{children ?? "Pola ini bukan diagnosis. Ini gambaran untuk membantumu memutuskan."}</span>
    </p>
  );
}

/* ---------- Kartu bantuan krisis (F-07) ---------- */
export function HelpCard({ compact = false }: { compact?: boolean }) {
  return (
    <section className="help-card" aria-labelledby="help-title">
      <div className="row" style={{ alignItems: "flex-start" }}>
        <span className="help-icon"><LifeBuoy aria-hidden /></span>
        <div className="grow">
          <h2 id="help-title" className="help-title">Kamu tidak sendirian. Bantuan tersedia sekarang.</h2>
          {!compact && <p className="small" style={{ marginTop: 4 }}>Teman Sejenak bukan layanan krisis. Hubungi salah satu jalur di bawah; semuanya gratis dan rahasia.</p>}
        </div>
      </div>
      <div className="help-actions">
        <a className="btn btn-primary btn-block" href="tel:119"><Phone aria-hidden />Healing119 · tekan 119, lalu 8</a>
        <Link className="btn btn-secondary btn-block" to="/rujuk"><MessageCircleHeart aria-hidden />Minta dihubungi BK kampus</Link>
      </div>
      {!compact && <p className="tiny" style={{ marginTop: 12 }}>Jika kamu dalam bahaya langsung, hubungi 112 atau minta orang terdekat menemanimu.</p>}
    </section>
  );
}

/* ---------- Sheet ---------- */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    setTimeout(() => ref.current?.querySelector<HTMLElement>("button, input, [tabindex]")?.focus(), 30);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="grabber" />
        {children}
      </div>
    </>
  );
}

/* ---------- Toast ---------- */
const ToastC = createContext<(msg: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<number | undefined>(undefined);
  const show = useCallback((m: string) => { setMsg(m); clearTimeout(t.current); t.current = window.setTimeout(() => setMsg(null), 3200); }, []);
  return (
    <ToastC.Provider value={show}>
      {children}
      <div aria-live="polite" className="sr-only">{msg}</div>
      {msg && <div className="toast" role="status"><CheckCircle2 aria-hidden />{msg}</div>}
    </ToastC.Provider>
  );
}
export const useToast = () => useContext(ToastC);

/* ---------- Lingkaran napas ---------- */
export function BreathCircle({ seconds, total, color = "var(--coral)" }: { seconds: number; total: number; color?: string }) {
  const phase = Math.floor((total - seconds) / 4) % 2 === 0 ? "Tarik napas" : "Hembuskan";
  const r = 46, c = 2 * Math.PI * r, p = (total - seconds) / total;
  return (
    <div className="breath" style={{ ["--breath" as string]: color }}>
      <div className="breath-glow" aria-hidden />
      <svg viewBox="0 0 100 100" className="breath-ring" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="2" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 1s linear" }} />
      </svg>
      <div className="breath-core">
        <span className="breath-phase" aria-live="polite">{seconds > 0 ? phase : "Jeda selesai"}</span>
        {seconds > 0 ? <span className="breath-num num" aria-hidden>{seconds}</span> : <span className="breath-done serif">Pilih langkahmu</span>}
      </div>
    </div>
  );
}

export function PageHead({ title, lede, serif, actions }: { title: string; lede?: ReactNode; serif?: boolean; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="grow">
        <h1 className={`page-title${serif ? " serif" : ""}`}>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
