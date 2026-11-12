import { useEffect, useState } from "react";
import { Link2, Unlink, Radio, Hand, ArrowDownToLine, ArrowUpFromLine, CircleDot, Cpu } from "lucide-react";
import { ConsentSwitch, PageHead, useToast } from "../components/ui";
import { useStore } from "../lib/store";
import { dock, type ConnState, type DockCmd } from "../lib/iot";
import { dayKey, fmtMin } from "../lib/data";

export function useDockState() {
  const [st, setSt] = useState<ConnState>(dock.state);
  const [cmd, setCmd] = useState<DockCmd | null>(dock.lastCmd);
  useEffect(() => {
    const a = (e: Event) => setSt((e as CustomEvent<ConnState>).detail);
    const b = (e: Event) => setCmd((e as CustomEvent<DockCmd>).detail);
    dock.addEventListener("state", a); dock.addEventListener("cmd", b);
    return () => { dock.removeEventListener("state", a); dock.removeEventListener("cmd", b); };
  }, []);
  return { st, cmd };
}

export function DockVisual({ docked, breathing, on }: { docked: boolean; breathing: boolean; on: boolean }) {
  return (
    <div className={`dock-vis${docked ? " docked" : ""}${breathing ? " breathing" : ""}${on ? " on" : ""}`} aria-hidden>
      <div className="dv-phone"><span /></div>
      <div className="dv-base">
        <span className="dv-led" />
        <span className="dv-btn" />
      </div>
    </div>
  );
}

export default function Dok() {
  const { s, set } = useStore();
  const toast = useToast();
  const { st, cmd } = useDockState();
  const d = s.dock;
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"sim" | "mqtt">(d.mode);
  const [url, setUrl] = useState(d.brokerUrl);
  const upd = (patch: Partial<typeof d>) => set((x) => ({ ...x, dock: { ...x.dock, ...patch } }));
  const today = s.dockLogs.find((x) => x.date === dayKey())?.minutes ?? 0;
  const week = s.dockLogs.slice(-7).reduce((a, b) => a + b.minutes, 0);
  const breathing = cmd?.type === "breath";

  const pair = (e: React.FormEvent) => {
    e.preventDefault();
    const id = code.trim().toUpperCase();
    if (!/^DOK-[0-9A-F]{4}$/.test(id)) { toast("Kode tidak dikenali. Contoh: DOK-7F3A, tertera di bawah dok."); return; }
    upd({ paired: true, deviceId: id, mode, brokerUrl: url });
    toast(`Dok ${id} dipasangkan.`);
  };

  return (
    <div>
      <PageHead title="Dok Sejenak" lede="Alas ponsel yang mencatat waktu bebas layar secara otomatis, ikut bernapas saat Rehat, dan punya tombol bantuan." />

      <section className="dock-hero panel" style={{ marginTop: 24 }}>
        <DockVisual docked={d.docked} breathing={breathing} on={st === "tersambung"} />
        <div className="stack grow" style={{ minWidth: 220 }}>
          <div className="row" style={{ gap: 8 }}>
            <span className={`status-dot ${st === "tersambung" ? "on" : st === "menyambung" ? "wait" : ""}`} aria-hidden />
            <span className="label">{!d.paired ? "Belum dipasangkan" : st === "tersambung" ? `Tersambung · ${d.deviceId}` : st === "menyambung" ? "Menyambung…" : "Terputus, mencoba lagi"}</span>
          </div>
          {d.paired && (
            <dl className="facts compact">
              <div><dt>Status ponsel</dt><dd>{d.docked ? "Di dok" : "Dipegang"}</dd></div>
              <div><dt>Bebas layar hari ini</dt><dd className="num">{fmtMin(today)}</dd></div>
              <div><dt>7 hari</dt><dd className="num">{fmtMin(week)}</dd></div>
            </dl>
          )}
          {breathing && <p className="tag tag-coral"><CircleDot aria-hidden />Lampu sedang bernapas (Rehat)</p>}
        </div>
      </section>

      {!d.paired ? (
        <section className="section" aria-labelledby="pair-h">
          <div className="section-head"><h2 id="pair-h">Pasangkan dok</h2></div>
          <form className="panel stack" onSubmit={pair}>
            <div className="field">
              <label htmlFor="code">Kode perangkat</label>
              <input id="code" className="input" placeholder="DOK-7F3A" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
              <p className="hint">Tertera pada stiker di bawah dok, juga dalam bentuk kode QR.</p>
            </div>
            <ConnectionFields mode={mode} setMode={setMode} url={url} setUrl={setUrl} />
            <button className="btn btn-primary"><Link2 aria-hidden />Pasangkan</button>
          </form>
        </section>
      ) : (
        <>
          {d.mode === "sim" && (
            <section className="section" aria-labelledby="sim-h">
              <div className="section-head"><h2 id="sim-h">Simulator</h2><span className="tag">Mode demo</span></div>
              <div className="panel stack">
                <p className="small muted">Tiru peristiwa dari sensor dok untuk mencoba alurnya tanpa perangkat.</p>
                <div className="sim-grid">
                  <button className="btn btn-secondary" disabled={st !== "tersambung" || d.docked} onClick={() => dock.simulate("docked")}><ArrowDownToLine aria-hidden />Letakkan ponsel</button>
                  <button className="btn btn-secondary" disabled={st !== "tersambung" || !d.docked} onClick={() => dock.simulate("lifted")}><ArrowUpFromLine aria-hidden />Angkat ponsel</button>
                  <button className="btn btn-help" disabled={st !== "tersambung"} onClick={() => dock.simulate("help")}><Hand aria-hidden />Tekan tombol bantuan</button>
                </div>
              </div>
            </section>
          )}

          <section className="section" aria-labelledby="set-h">
            <div className="section-head"><h2 id="set-h">Pengaturan dok</h2></div>
            <div className="panel" style={{ paddingTop: 4, paddingBottom: 4 }}>
              <ConsentSwitch id="d-log" checked={d.autoLog} onChange={(v) => upd({ autoLog: v })} title="Catat waktu ponsel di dok" desc="Hanya waktu mulai dan selesai. Tidak ada isi layar." />
              <ConsentSwitch id="d-lift" checked={d.rehatOnLift} onChange={(v) => upd({ rehatOnLift: v })} title="Ajak Rehat saat ponsel diangkat" desc="Layar Rehat terbuka begitu ponsel diangkat dari dok." />
              <ConsentSwitch id="d-breath" checked={d.breathLight} onChange={(v) => upd({ breathLight: v })} title="Lampu napas saat Rehat" desc="Cincin LED menyala pelan 4 detik tarik, 4 detik hembus." />
              <ConsentSwitch id="d-help" checked={d.helpButton} onChange={(v) => upd({ helpButton: v })} title="Tombol bantuan fisik" desc="Menekan tombol membuka kartu bantuan di ponsel. Tidak menghubungi siapa pun otomatis." />
            </div>
          </section>

          <section className="section" aria-labelledby="con-h">
            <div className="section-head"><h2 id="con-h">Koneksi</h2></div>
            <div className="panel stack">
              <ConnectionFields mode={mode} setMode={setMode} url={url} setUrl={setUrl} />
              <div className="row" style={{ flexWrap: "wrap" }}>
                <button className="btn btn-secondary" onClick={() => { upd({ mode, brokerUrl: url }); toast("Koneksi diperbarui."); }}><Radio aria-hidden />Simpan koneksi</button>
                <button className="btn btn-ghost" onClick={() => upd({ paired: false, docked: false })}><Unlink aria-hidden />Lepas pasangan</button>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="section panel-flat small stack" aria-labelledby="how-h">
        <p id="how-h" className="label row" style={{ gap: 8 }}><Cpu aria-hidden style={{ width: 16, height: 16 }} />Cara kerjanya</p>
        <p className="muted">ESP32 di dalam dok membaca sensor jarak saat ponsel diletakkan, lalu mengirim peristiwa <code>docked</code>, <code>lifted</code>, atau <code>help</code> ke broker MQTT kampus lewat TLS. Aplikasi menerima peristiwa itu dan mengirim balik perintah lampu napas. Yang berpindah hanya jenis peristiwa dan waktunya.</p>
      </section>
    </div>
  );
}

function ConnectionFields({ mode, setMode, url, setUrl }: { mode: "sim" | "mqtt"; setMode: (m: "sim" | "mqtt") => void; url: string; setUrl: (u: string) => void }) {
  return (
    <div className="stack" style={{ ["--gap" as string]: "12px" }}>
      <div>
        <p className="label" id="mode-l">Sumber data</p>
        <div className="segmented" role="group" aria-labelledby="mode-l" style={{ marginTop: 8 }}>
          <button type="button" aria-pressed={mode === "sim"} onClick={() => setMode("sim")}>Simulator</button>
          <button type="button" aria-pressed={mode === "mqtt"} onClick={() => setMode("mqtt")}>Broker MQTT</button>
        </div>
      </div>
      {mode === "mqtt" && (
        <div className="field">
          <label htmlFor="broker">Alamat broker (WebSocket aman)</label>
          <input id="broker" className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="wss://broker.contoh.ac.id:8884/mqtt" />
        </div>
      )}
    </div>
  );
}
