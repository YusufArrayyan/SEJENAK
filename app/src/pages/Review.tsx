import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, CheckCircle2, Pencil } from "lucide-react";
import { ConsentSwitch, NotDiagnosis, PageHead, useToast } from "../components/ui";
import { ScoreLine, WeekBars } from "../components/charts";
import { useStore } from "../lib/store";
import { addDays, bandFor, dayKey, fmtMin } from "../lib/data";

export function Tinjauan() {
  const { s, set } = useStore();
  const toast = useToast();
  const [text, setText] = useState("");
  const pts = s.screenings.slice(-4);
  const last = pts.at(-1), first = pts[0];
  const days = Array.from({ length: 7 }, (_, i) => {
    const k = dayKey(addDays(new Date(), i - 6));
    return { date: k, social: s.logs.filter((l) => l.date === k).reduce((a, b) => a + b.minutes, 0), dock: s.dockLogs.find((d) => d.date === k)?.minutes ?? 0 };
  });
  const p28 = s.pauses.filter((p) => Date.now() - new Date(p.at).getTime() < 28 * 864e5);
  const closed = p28.filter((p) => p.choice === "tutup").length;
  const dock28 = s.dockLogs.slice(-28).reduce((a, b) => a + b.minutes, 0);
  const avgSocial = Math.round(s.logs.filter((l) => Date.now() - new Date(l.date).getTime() < 7 * 864e5).reduce((a, b) => a + b.minutes, 0) / 7);

  const save = (decision: "lanjut" | "ubah") => {
    if (!text.trim()) return;
    set((st) => ({ ...st, reflections: [...st.reflections, { at: new Date().toISOString(), text: text.trim(), decision }] }));
    setText("");
    toast(decision === "lanjut" ? "Refleksi tersimpan. Rencana dilanjutkan." : "Refleksi tersimpan. Atur ulang batasmu di Saya.");
  };

  if (pts.length === 0) return <div className="stack"><PageHead title="Tinjauan" /><p className="muted">Tinjauan muncul setelah skrining pertama.</p></div>;

  return (
    <div>
      <PageHead title="Tinjauan 4 pekan" lede="Lihat apa yang bergeser, lalu putuskan sendiri langkah berikutnya." />

      <section className="panel review-hero" aria-labelledby="sc-h" style={{ marginTop: 24 }}>
        <div className="row-between" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <h2 id="sc-h" className="h-card">Skor pola</h2>
            <p className="small muted">Skala 6 sampai 30. Makin rendah, makin seimbang.</p>
          </div>
          {last && <span className={`tag ${bandFor(last.score).tag}`}>{bandFor(last.score).title}</span>}
        </div>
        <ScoreLine points={pts} />
        {first && last && pts.length > 1 && (
          <p className="small">Skormu bergerak dari <strong className="num">{first.score}</strong> ke <strong className="num">{last.score}</strong> dalam {pts.length} pekan.</p>
        )}
      </section>

      <dl className="facts">
        <div><dt>Rehat yang kamu tutup</dt><dd className="num">{closed}<span className="faint"> / {p28.length}</span></dd></div>
        <div><dt>Bebas layar di dok</dt><dd className="num">{fmtMin(dock28)}</dd></div>
        <div><dt>Rata-rata media sosial</dt><dd className="num">{fmtMin(avgSocial)}<span className="faint small"> /hari</span></dd></div>
      </dl>

      <section className="section" aria-labelledby="wk-h">
        <div className="section-head"><h2 id="wk-h">7 hari terakhir</h2></div>
        <div className="panel"><WeekBars days={days} /></div>
      </section>

      <section className="section" aria-labelledby="rf-h">
        <div className="section-head"><h2 id="rf-h">Refleksi</h2></div>
        <div className="panel stack">
          <label htmlFor="rf" className="serif reflect-q">Apa yang berubah bagimu bulan ini?</label>
          <textarea id="rf" className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis sesingkat atau sepanjang yang kamu mau." />
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn-primary" disabled={!text.trim()} onClick={() => save("lanjut")}>Simpan, lanjutkan rencana</button>
            <button className="btn btn-secondary" disabled={!text.trim()} onClick={() => save("ubah")}>Simpan, ubah rencana</button>
          </div>
        </div>
        {s.reflections.slice().reverse().map((r) => (
          <blockquote key={r.at} className="reflection">
            <p className="serif">{r.text}</p>
            <footer className="tiny faint">{new Date(r.at).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}</footer>
          </blockquote>
        ))}
      </section>
      <div style={{ marginTop: 24 }}><NotDiagnosis /></div>
    </div>
  );
}

export function Rujuk() {
  const { s, set } = useStore();
  const toast = useToast();
  const last = s.screenings.at(-1);
  const peerSum = s.sessions.find((x) => x.summaryApproved)?.summary;
  const r = s.referral ?? {
    reason: "Saya ingin bicara dengan konselor tentang kebiasaan begadang dan gulir malam yang mengganggu kuliah pagi.",
    summary: "",
    includeScore: true,
    includePeerSummary: Boolean(peerSum),
    status: "draf" as const,
  };
  const [editing, setEditing] = useState(false);
  const update = (patch: Partial<typeof r>) => set((st) => ({ ...st, referral: { ...r, ...patch } }));

  if (r.status !== "draf")
    return (
      <div className="stack">
        <PageHead title="Rujukan terkirim" serif />
        <div className="panel stack">
          <p className="row"><CheckCircle2 aria-hidden style={{ color: "var(--teal-ink)" }} />Konselor BK akan menghubungi lewat surel kampus dalam 2 hari kerja.</p>
          <p className="small muted">Kamu bisa membatalkan rujukan kapan saja selama belum dijadwalkan.</p>
          <button className="btn btn-secondary" onClick={() => update({ status: "draf" })}>Batalkan rujukan</button>
        </div>
      </div>
    );

  return (
    <div>
      <PageHead title="Rujukan ke BK" lede="Ini yang akan dibaca konselor BK. Kamu bisa mengubahnya." />
      <article className="referral-doc" aria-label="Pratinjau ringkasan rujukan">
        <header className="row-between">
          <p className="label">Untuk: Layanan BK Universitas Bengkulu</p>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(!editing)}><Pencil aria-hidden />{editing ? "Selesai" : "Ubah"}</button>
        </header>
        <hr className="divider" />
        <p className="small muted">Alasan dengan kata-katamu sendiri</p>
        {editing
          ? <textarea className="textarea" aria-label="Alasan rujukan" value={r.reason} onChange={(e) => update({ reason: e.target.value })} />
          : <p className="serif" style={{ fontSize: "1.0625rem", marginTop: 4 }}>{r.reason}</p>}
        {r.includeScore && last && <p className="small" style={{ marginTop: 16 }}><span className="muted">Skor pola terakhir:</span> <strong className="num">{last.score}</strong> ({bandFor(last.score).title.toLowerCase()})</p>}
        {r.includePeerSummary && peerSum && <p className="small" style={{ marginTop: 8 }}><span className="muted">Ringkasan Teman Sejenak:</span> {peerSum}</p>}
        <p className="tiny faint" style={{ marginTop: 16 }}>Tidak dikirim: catatan harian, isi obrolan, dan data Dok Sejenak.</p>
      </article>

      <div className="panel" style={{ marginTop: 16, paddingTop: 4, paddingBottom: 4 }}>
        <ConsentSwitch id="r-score" checked={r.includeScore} onChange={(v) => update({ includeScore: v })} title="Sertakan skor pola" desc="Membantu konselor memahami gambaran awal." />
        <ConsentSwitch id="r-peer" checked={r.includePeerSummary} disabled={!peerSum} onChange={(v) => update({ includePeerSummary: v })} title="Sertakan ringkasan Teman Sejenak" desc={peerSum ? "Hanya ringkasan yang sudah kamu setujui." : "Belum ada ringkasan yang disetujui."} />
        <ConsentSwitch id="r-bk" checked={s.consent.bk} onChange={(v) => set((st) => ({ ...st, consent: { ...st.consent, bk: v } }))} title="Saya setuju rujukan ini dikirim ke BK" desc="Persetujuan ini bisa kamu cabut di menu Saya." />
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} disabled={!s.consent.bk || !r.reason.trim()} onClick={() => { update({ status: "terkirim", sentAt: new Date().toISOString() }); toast("Rujukan terkirim ke BK."); }}>
        <Send aria-hidden />Kirim rujukan
      </button>
      {!s.consent.bk && <p className="hint" style={{ textAlign: "center", marginTop: 8 }}>Nyalakan persetujuan terakhir untuk mengirim.</p>}
      <p className="small" style={{ marginTop: 24 }}>Butuh bicara sekarang juga? <Link to="/bantuan">Lihat jalur bantuan</Link>.</p>
    </div>
  );
}
