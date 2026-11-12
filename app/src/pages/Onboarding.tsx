import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import { ConsentSwitch, Logo, NotDiagnosis } from "../components/ui";
import { useStore } from "../lib/store";
import { APPS, BSMAS_ITEMS, LIKERT, bandFor, dayKey, fmtMin } from "../lib/data";

type Step = "consent" | "q" | "result" | "limits";

export default function Onboarding() {
  const { s, set } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("consent");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(6).fill(0));
  const [limits, setLimits] = useState(s.limits);
  const score = answers.reduce((a, b) => a + b, 0);
  const band = bandFor(score);

  const total = 2 + BSMAS_ITEMS.length + 1;
  const pos = step === "consent" ? 1 : step === "q" ? 2 + qi : step === "result" ? 2 + BSMAS_ITEMS.length : total;

  const finish = () => {
    set((st) => ({ ...st, onboarded: true, limits, screenings: [...st.screenings, { date: dayKey(), score, answers }] }));
    nav("/");
  };

  return (
    <div className="onb">
      <header className="onb-top">
        <Logo />
        <span className="small faint num">Langkah {pos} dari {total}</span>
      </header>
      <div className="progress" aria-hidden><span style={{ width: `${(pos / total) * 100}%` }} /></div>

      <main className="onb-body" id="main">
        {step === "consent" && (
          <section className="stack">
            <h1 className="page-title serif">Kamu yang memutuskan apa yang dibagikan</h1>
            <p className="lede">Semua sakelar mati sejak awal. Kamu bisa mengubah atau mencabutnya kapan saja dari menu Saya.</p>
            <div className="panel" style={{ paddingTop: 4, paddingBottom: 4 }}>
              <ConsentSwitch id="c-app" checked={s.consent.app} onChange={(v) => set((st) => ({ ...st, consent: { ...st.consent, app: v, updatedAt: new Date().toISOString() } }))}
                title="Pakai SEJENAK untuk diriku" desc="Simpan skrining, catatan durasi, dan rehat di akunmu. Wajib untuk melanjutkan." />
              <ConsentSwitch id="c-peer" checked={s.consent.peer} onChange={(v) => set((st) => ({ ...st, consent: { ...st.consent, peer: v } }))}
                title="Bagikan ringkasan ke Teman Sejenak" desc="Hanya ringkasan yang kamu setujui, bukan catatan harian lengkap." />
              <ConsentSwitch id="c-bk" checked={s.consent.bk} onChange={(v) => set((st) => ({ ...st, consent: { ...st.consent, bk: v } }))}
                title="Izinkan rujukan ke BK kampus" desc="Rujukan tetap baru dikirim setelah kamu membaca dan menyetujui isinya." />
            </div>
            <button className="btn btn-primary btn-block" disabled={!s.consent.app} onClick={() => setStep("q")}>Lanjut ke 6 pertanyaan singkat<ArrowRight aria-hidden /></button>
            {!s.consent.app && <p className="hint" style={{ textAlign: "center" }}>Nyalakan sakelar pertama untuk melanjutkan.</p>}
          </section>
        )}

        {step === "q" && (
          <section className="stack" key={qi}>
            <p className="small muted">Pertanyaan {qi + 1} dari {BSMAS_ITEMS.length} · Dalam setahun terakhir, seberapa sering kamu…</p>
            <h1 className="q-title serif" id="q-title">{BSMAS_ITEMS[qi]}</h1>
            <div className="likert" role="radiogroup" aria-labelledby="q-title">
              {LIKERT.map((l, i) => (
                <label key={l}>
                  <input type="radio" name={`q${qi}`} checked={answers[qi] === i + 1}
                    onChange={() => { const a = [...answers]; a[qi] = i + 1; setAnswers(a); setTimeout(() => (qi < 5 ? setQi(qi + 1) : setStep("result")), 260); }} />
                  <span className="bubble" />
                  <span>{l}</span>
                </label>
              ))}
            </div>
            <p className="hint">Tidak ada jawaban benar atau salah.</p>
            <button className="btn btn-ghost" onClick={() => (qi ? setQi(qi - 1) : setStep("consent"))}><ArrowLeft aria-hidden />Kembali</button>
          </section>
        )}

        {step === "result" && (
          <section className="stack">
            <p className="small muted">Pola kamu saat ini</p>
            <h1 className="page-title serif">{band.title}</h1>
            <div className="result-meter" aria-label={`Skor ${score} dari 30`}>
              <div className="rm-track"><span style={{ left: `${((score - 6) / 24) * 100}%` }} /></div>
              <div className="rm-labels tiny faint"><span>Seimbang</span><span>Perlu diperhatikan</span><span>Cukup kuat</span></div>
            </div>
            <p className="measure" style={{ fontSize: "1.0625rem" }}>{band.body}</p>
            <NotDiagnosis />
            <button className="btn btn-primary btn-block" onClick={() => setStep("limits")}>Atur batas pribadi<ArrowRight aria-hidden /></button>
            {band.key !== "seimbang" && <button className="btn btn-secondary btn-block" onClick={() => { finish(); nav("/teman"); }}>Bicara dengan Teman Sejenak</button>}
          </section>
        )}

        {step === "limits" && (
          <section className="stack">
            <h1 className="page-title serif">Berapa lama yang terasa cukup untukmu?</h1>
            <p className="lede">Saat catatanmu melewati batas ini, SEJENAK akan mengajakmu rehat 10 detik. Hanya itu, tanpa hukuman.</p>
            <ul className="list panel" style={{ paddingTop: 0, paddingBottom: 0 }}>
              {APPS.filter((a) => a.id !== "lainnya").map((a) => (
                <li key={a.id} className="list-row">
                  <span className="dot" style={{ color: a.color }} aria-hidden />
                  <span className="grow" id={`lim-${a.id}`}>{a.name}</span>
                  <div className="stepper" role="group" aria-labelledby={`lim-${a.id}`}>
                    <button className="icon-btn" aria-label={`Kurangi batas ${a.name}`} onClick={() => setLimits({ ...limits, [a.id]: Math.max(10, limits[a.id] - 10) })}><Minus aria-hidden /></button>
                    <output className="num" style={{ fontSize: "1rem", minWidth: "7ch" }} aria-live="polite">{fmtMin(limits[a.id])}</output>
                    <button className="icon-btn" aria-label={`Tambah batas ${a.name}`} onClick={() => setLimits({ ...limits, [a.id]: Math.min(300, limits[a.id] + 10) })}><Plus aria-hidden /></button>
                  </div>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary btn-block" onClick={finish}>Selesai, ke Beranda</button>
          </section>
        )}
      </main>
    </div>
  );
}
