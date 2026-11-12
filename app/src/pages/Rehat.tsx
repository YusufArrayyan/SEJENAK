import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LifeBuoy, Lightbulb } from "lucide-react";
import { BreathCircle, useToast } from "../components/ui";
import { useStore, type Pause } from "../lib/store";
import { PURPOSES, appName } from "../lib/data";
import { dock } from "../lib/iot";

const TOTAL = 10;

export default function Rehat() {
  const [params] = useSearchParams();
  const src = (params.get("dari") ?? "manual") as Pause["source"];
  const app = params.get("app");
  const { s, set } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [sec, setSec] = useState(TOTAL);
  const [purpose, setPurpose] = useState<string | null>(null);
  const breathing = sec > 0;

  useEffect(() => {
    if (s.dock.paired && s.dock.breathLight) dock.send({ type: "breath", seconds: TOTAL });
    const t = setInterval(() => setSec((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => { clearInterval(t); dock.send({ type: "breath_stop" }); };
  }, [s.dock.paired, s.dock.breathLight]);

  const choose = (choice: Pause["choice"]) => {
    set((st) => ({ ...st, pauses: [...st.pauses, { at: new Date().toISOString(), choice, purpose: purpose ?? undefined, source: src }] }));
    toast(choice === "tutup" ? "Bagus, kamu memilih berhenti sebentar." : "Silakan lanjut. Kamu sudah memilih dengan sadar.");
    nav("/");
  };

  const context =
    src === "dok" ? "Ponselmu baru diangkat dari Dok Sejenak." :
    src === "catat" && app ? `Catatan ${appName(app)} hari ini sudah melewati batasmu.` :
    "Kamu memilih rehat sendiri.";

  return (
    <div className="rehat">
      <header className="rehat-top">
        <span className="tag tag-coral">Rehat</span>
        <Link to="/bantuan" className="help-pill"><LifeBuoy aria-hidden />Bantuan</Link>
      </header>
      <main className="rehat-body" id="main">
        <p className="small muted" style={{ textAlign: "center" }}>{context}</p>
        <BreathCircle seconds={sec} total={TOTAL} />
        <h1 className="serif rehat-q">Sebentar. Untuk apa kamu membuka ini?</h1>

        <div className={`rehat-choices${breathing ? " is-waiting" : ""}`} aria-hidden={breathing}>
          <div className="chips" role="group" aria-label="Tujuan membuka" style={{ justifyContent: "center" }}>
            {PURPOSES.map((p) => <button key={p} className="chip" disabled={breathing} aria-pressed={purpose === p} onClick={() => setPurpose(p)}>{p}</button>)}
          </div>
          <div className="rehat-actions">
            <button className="btn btn-secondary" disabled={breathing} onClick={() => choose("tutup")}>Tutup dulu</button>
            <button className="btn btn-secondary" disabled={breathing} onClick={() => choose("lanjut")}>Lanjut dengan sadar</button>
          </div>
          {s.dock.paired && s.dock.breathLight && (
            <p className="tiny faint row" style={{ justifyContent: "center", gap: 6 }}><Lightbulb aria-hidden style={{ width: 14, height: 14 }} />Lampu Dok Sejenak ikut bernapas bersamamu.</p>
          )}
        </div>
      </main>
    </div>
  );
}
