import { APPS, fmtDate, fmtMin, shortDay } from "../lib/data";

/* Batang per aplikasi terhadap batas pribadi */
export function UsageBars({ per, limits }: { per: Record<string, number>; limits: Record<string, number> }) {
  const rows = APPS.filter((a) => per[a.id] || limits[a.id]).filter((a) => a.id !== "lainnya" || per[a.id]);
  const max = Math.max(...rows.map((a) => Math.max(per[a.id] ?? 0, limits[a.id] ?? 0)), 30) * 1.1;
  return (
    <ul className="usage-bars" aria-label="Durasi hari ini per aplikasi dibanding batas pribadi">
      {rows.map((a) => {
        const v = per[a.id] ?? 0, lim = limits[a.id] ?? 0, over = lim > 0 && v > lim;
        return (
          <li key={a.id}>
            <div className="row-between small">
              <span className="row" style={{ gap: 8 }}><span className="dot" style={{ color: a.color }} aria-hidden />{a.name}</span>
              <span className="num">
                <strong>{fmtMin(v)}</strong>
                <span className="faint"> / {fmtMin(lim)}</span>
                {over && <span className="sr-only">, melewati batas</span>}
              </span>
            </div>
            <div className="ub-track" aria-hidden>
              <span className="ub-fill" style={{ width: `${(v / max) * 100}%`, background: over ? "var(--coral)" : a.color }} />
              {lim > 0 && <span className="ub-limit" style={{ left: `${(lim / max) * 100}%` }} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* Garis skor BSMAS */
export function ScoreLine({ points }: { points: { date: string; score: number }[] }) {
  const W = 400, H = 220, pl = 30, pr = 16, pt = 20, pb = 34;
  const min = 6, max = 30;
  const x = (i: number) => pl + (points.length === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (points.length - 1));
  const y = (v: number) => pt + ((max - v) / (max - min)) * (H - pt - pb);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.score)}`).join(" ");
  const bands = [ { from: 6, to: 12, c: "var(--teal-soft)" }, { from: 12, to: 18, c: "var(--sun-soft)" }, { from: 18, to: 30, c: "var(--coral-soft)" } ];
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Skor pola selama ${points.length} pekan: ${points.map((p) => p.score).join(", ")}. Makin rendah makin seimbang.`}>
        {bands.map((b) => <rect key={b.from} x={pl} width={W - pl - pr} y={y(b.to)} height={y(b.from) - y(b.to)} fill={b.c} opacity="0.7" />)}
        {[6, 12, 18, 24, 30].map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={pl - 8} y={y(t) + 4} textAnchor="end" className="chart-axis">{t}</text>
          </g>
        ))}
        <path d={d} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={p.date}>
            <circle cx={x(i)} cy={y(p.score)} r="5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
            <text x={x(i)} y={y(p.score) - 12} textAnchor="middle" className="chart-val">{p.score}</text>
            <text x={x(i)} y={H - 10} textAnchor="middle" className="chart-axis">{i === points.length - 1 ? "Pekan ini" : fmtDate(p.date)}</text>
          </g>
        ))}
      </svg>
      <figcaption className="chart-legend tiny">
        <span><i style={{ background: "var(--teal-soft)" }} />Seimbang</span>
        <span><i style={{ background: "var(--sun-soft)" }} />Perlu diperhatikan</span>
        <span><i style={{ background: "var(--coral-soft)" }} />Cukup kuat</span>
      </figcaption>
    </figure>
  );
}

/* Batang harian: durasi media sosial + waktu ponsel di dok */
export function WeekBars({ days }: { days: { date: string; social: number; dock: number }[] }) {
  const max = Math.max(...days.map((d) => Math.max(d.social, d.dock)), 60);
  return (
    <figure className="chart">
      <div className="week-bars" role="img" aria-label={days.map((d) => `${shortDay(d.date)}: media sosial ${d.social} menit, ponsel di dok ${d.dock} menit`).join("; ")}>
        {days.map((d) => (
          <div key={d.date} className="wb-col">
            <div className="wb-pair" aria-hidden>
              <span className="wb-bar" style={{ height: `${(d.social / max) * 100}%`, background: "var(--coral)" }} />
              <span className="wb-bar" style={{ height: `${(d.dock / max) * 100}%`, background: "var(--teal)" }} />
            </div>
            <span className="chart-axis-html">{shortDay(d.date)}</span>
          </div>
        ))}
      </div>
      <figcaption className="chart-legend tiny">
        <span><i style={{ background: "var(--coral)" }} />Media sosial</span>
        <span><i style={{ background: "var(--teal)" }} />Ponsel di Dok Sejenak</span>
      </figcaption>
    </figure>
  );
}

/* Batang bertumpuk sebaran (dasbor) */
export function StackBar({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <div className="stack-bar" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(", ")}>
      {parts.map((p) => <span key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />)}
    </div>
  );
}
