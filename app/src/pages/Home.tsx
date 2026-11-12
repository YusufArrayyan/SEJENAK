import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Plus, Wind, Smartphone, MessagesSquare, Minus, CalendarClock } from "lucide-react";
import { Sheet, useToast } from "../components/ui";
import { UsageBars } from "../components/charts";
import { addDays } from "../lib/data";
import { perAppToday, useStore } from "../lib/store";
import { APPS, PEERS, bandFor, dayKey, fmtDateTime, fmtMin, greeting } from "../lib/data";
import { useDockState } from "./Dok";
import { WeekBars } from "../components/charts";

export default function Home() {
  const { s, todayLogs, todayTotal, overLimit } = useStore();
  const [open, setOpen] = useState(false);
  const per = perAppToday(todayLogs);
  const totalLimit = Object.entries(s.limits).filter(([k]) => k !== "lainnya").reduce((a, [, v]) => a + v, 0);
  const next = s.sessions.find((x) => x.status === "terjadwal");
  const peer = PEERS.find((p) => p.id === next?.peer);
  const dockToday = s.dockLogs.find((x) => x.date === dayKey())?.minutes ?? 0;
  const last = s.screenings.at(-1);
  const band = last ? bandFor(last.score) : null;
  const { st: dockConn } = useDockState();
  const days = Array.from({ length: 7 }, (_, i) => { const k = dayKey(addDays(new Date(), i - 6)); return { date: k, social: s.logs.filter((l) => l.date === k).reduce((a, b) => a + b.minutes, 0), dock: s.dockLogs.find((x) => x.date === k)?.minutes ?? 0 }; });
  const pausesToday = s.pauses.filter((p) => p.at.slice(0, 10) === dayKey() || new Date(p.at).toDateString() === new Date().toDateString());

  return (
    <div className="home">
      <header className="home-greet">
        <h1 className="serif greet-title">{greeting()}, {s.user?.name}.</h1>
        <p className="lede">Mau lihat pola hari ini?</p>
      </header>

      <div className="home-grid">
        <section className="panel today" aria-labelledby="today-h">
          <div className="row-between">
            <h2 id="today-h" className="h-card">Pola hari ini</h2>
            {band && <span className={`tag ${band.tag}`}>{band.title.replace("Pola yang ", "")}</span>}
          </div>
          <p className="today-total num">
            <span className="big">{fmtMin(todayTotal)}</span>
            <span className="muted small"> dari batas {fmtMin(totalLimit)}</span>
          </p>
          {overLimit.length > 0
            ? <p className="small" style={{ color: "var(--coral-ink)" }}>{overLimit.map((a) => APPS.find((x) => x.id === a)?.name).join(", ")} sudah melewati batasmu hari ini.</p>
            : <p className="small muted">Semua masih di bawah batas pribadimu.</p>}
          <UsageBars per={per} limits={s.limits} />
          <div className="today-actions">
            <button className="btn btn-primary" onClick={() => setOpen(true)}><Plus aria-hidden />Catat durasi</button>
            <Link className="btn btn-secondary" to="/rehat?dari=manual" style={{ ["--accent" as string]: "var(--coral)" }}><Wind aria-hidden />Rehat 10 detik</Link>
          </div>
          <p className="tiny faint">{pausesToday.length} rehat hari ini · catatan hanya berisi nama aplikasi dan menit, tanpa isi.</p>
        </section>

        <aside className="home-rail">
          <Link to="/saya/dok" className="rail-item panel">
            <span className="list-icon" style={{ background: "var(--teal-soft)", color: "var(--teal-ink)" }}><Smartphone aria-hidden /></span>
            <span className="grow">
              <span className="label" style={{ display: "block" }}>Dok Sejenak</span>
              <span className="small muted">
                {!s.dock.paired ? "Belum dipasangkan" : s.dock.docked ? "Ponsel sedang di dok" : `${fmtMin(dockToday)} bebas layar hari ini`}
              </span>
            </span>
            {s.dock.paired && <span className={`status-dot ${dockConn === "tersambung" ? "on" : ""}`} aria-label={dockConn} />}
            <ChevronRight aria-hidden className="chev" />
          </Link>

          <Link to={next ? `/teman/obrolan/${next.id}` : "/teman"} className="rail-item panel">
            <span className="list-icon" style={{ background: "var(--violet-soft)", color: "var(--violet-ink)" }}><MessagesSquare aria-hidden /></span>
            <span className="grow">
              <span className="label" style={{ display: "block" }}>Teman Sejenak</span>
              <span className="small muted">{next && peer ? `Bersama ${peer.name} · ${fmtDateTime(next.at)}` : "Jadwalkan obrolan 30 menit"}</span>
            </span>
            <ChevronRight aria-hidden className="chev" />
          </Link>

          <Link to="/tinjauan" className="rail-item panel">
            <span className="list-icon" style={{ background: "var(--sun-soft)", color: "var(--sun-ink)" }}><CalendarClock aria-hidden /></span>
            <span className="grow">
              <span className="label" style={{ display: "block" }}>Tinjauan 4 pekan</span>
              <span className="small muted">{s.screenings.length >= 2 ? `Skor ${s.screenings[0].score} → ${last?.score}` : "Terbuka setelah pekan pertama"}</span>
            </span>
            <ChevronRight aria-hidden className="chev" />
          </Link>
        </aside>
      </div>

      <section className="section week-sec" aria-labelledby="wk-h">
        <div className="section-head"><h2 id="wk-h">7 hari terakhir</h2><Link to="/tinjauan">Lihat tinjauan</Link></div>
        <div className="panel"><WeekBars days={days} /></div>
      </section>

      <LogSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function LogSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s, set } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [app, setApp] = useState("instagram");
  const [min, setMin] = useState(15);

  const save = () => {
    const k = dayKey();
    const already = s.logs.filter((l) => l.date === k && l.app === app).reduce((a, b) => a + b.minutes, 0);
    set((st) => ({ ...st, logs: [...st.logs, { id: `${Date.now()}`, date: k, app, minutes: min }] }));
    onClose();
    if (s.limits[app] && already + min > s.limits[app]) nav(`/rehat?dari=catat&app=${app}`);
    else toast(`Tercatat ${min} menit ${APPS.find((a) => a.id === app)?.name}.`);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Catat durasi">
      <h2 className="h-card">Catat durasi</h2>
      <p className="small muted" style={{ marginTop: 4 }}>Lihat angka di Waktu Layar ponselmu, lalu salin ke sini.</p>
      <p className="label" style={{ marginTop: 20 }} id="app-l">Aplikasi</p>
      <div className="chips" role="group" aria-labelledby="app-l" style={{ marginTop: 8 }}>
        {APPS.map((a) => <button key={a.id} className="chip" aria-pressed={app === a.id} onClick={() => setApp(a.id)}>{a.name}</button>)}
      </div>
      <p className="label" style={{ marginTop: 20 }} id="min-l">Durasi</p>
      <div className="row-between" style={{ marginTop: 8 }}>
        <div className="stepper" role="group" aria-labelledby="min-l">
          <button className="icon-btn" style={{ border: "1px solid var(--line-strong)" }} aria-label="Kurangi 5 menit" onClick={() => setMin(Math.max(5, min - 5))}><Minus aria-hidden /></button>
          <output aria-live="polite" className="num">{min}</output>
          <button className="icon-btn" style={{ border: "1px solid var(--line-strong)" }} aria-label="Tambah 5 menit" onClick={() => setMin(Math.min(600, min + 5))}><Plus aria-hidden /></button>
          <span className="muted">menit</span>
        </div>
      </div>
      <div className="chips" style={{ marginTop: 12 }}>
        {[15, 30, 60, 90].map((m) => <button key={m} className="chip" aria-pressed={min === m} onClick={() => setMin(m)}>{m} mnt</button>)}
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 24 }} onClick={save}>Simpan catatan</button>
      <p className="tiny faint" style={{ marginTop: 10, textAlign: "center" }}>Tersimpan di perangkat dulu, lalu dikirim saat tersambung.</p>
    </Sheet>
  );
}
