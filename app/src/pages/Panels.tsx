import { useState } from "react";
import { AlertTriangle, ArrowUpRight, Lock, Mic, MessageSquareText, CheckCircle2, EyeOff } from "lucide-react";
import { PageHead, Sheet, useToast } from "../components/ui";
import { StackBar } from "../components/charts";
import { BK_REFERRALS, COHORTS, K_MIN, PEER_QUEUE } from "../lib/data";

/* ---------------- Panel Teman Sejenak (F-11) ---------------- */
export function PeerPanel() {
  const toast = useToast();
  const [sel, setSel] = useState(PEER_QUEUE[0].id);
  const [note, setNote] = useState("");
  const [esc, setEsc] = useState(false);
  const [reason, setReason] = useState("");
  const q = PEER_QUEUE.find((x) => x.id === sel)!;
  const when = (h: number) => (h === 0 ? "Hari ini, 16.00" : h < 24 ? `Hari ini, ${16 + h}.00` : "Besok, 10.00");

  return (
    <div>
      <PageHead title="Antrean pendampingan" lede="Tiga sesi pekan ini. Ingat batas tugas: dengarkan, temani, dan eskalasi bila ada tanda bahaya." />
      <div className="split" style={{ marginTop: 24 }}>
        <ul className="list panel queue" style={{ paddingTop: 0, paddingBottom: 0 }} aria-label="Antrean">
          {PEER_QUEUE.map((x) => (
            <li key={x.id}>
              <button className="list-row" aria-current={sel === x.id} onClick={() => setSel(x.id)}>
                <span className="avatar" aria-hidden>{x.alias.slice(-2)}</span>
                <span className="grow">
                  <span className="label" style={{ display: "block" }}>{x.alias}</span>
                  <span className="small muted">{when(x.at)} · {x.mode === "teks" ? "Teks" : "Suara"}</span>
                </span>
                {x.status === "berikutnya" && <span className="tag tag-violet">Berikutnya</span>}
              </button>
            </li>
          ))}
        </ul>

        <section className="panel stack" aria-label={`Detail ${q.alias}`}>
          <div className="row-between">
            <h2 className="h-card">{q.alias}</h2>
            <span className="tag">{q.mode === "teks" ? <MessageSquareText aria-hidden /> : <Mic aria-hidden />}{q.mode === "teks" ? "Teks" : "Suara"} · 30 mnt</span>
          </div>
          <div>
            <p className="small muted">Topik yang ditulis mahasiswa</p>
            <p className="serif" style={{ fontSize: "1.0625rem", marginTop: 4 }}>{q.topic}</p>
          </div>
          {q.consent
            ? <p className="small row" style={{ gap: 8 }}><CheckCircle2 aria-hidden style={{ width: 16, height: 16, color: "var(--teal-ink)" }} />Mahasiswa mengizinkan ringkasan dibagikan.</p>
            : <p className="small row muted" style={{ gap: 8 }}><EyeOff aria-hidden style={{ width: 16, height: 16 }} />Ringkasan tidak dibagikan. Kamu hanya melihat topik.</p>}
          <div className="field">
            <label htmlFor="pn">Catatan terbatas</label>
            <textarea id="pn" className="textarea" value={note} onChange={(e) => setNote(e.target.value)} maxLength={400} placeholder="Ringkas, tanpa nama atau detail identitas. Mahasiswa akan menyetujui ringkasan ini." />
            <p className="hint num">{note.length}/400 · Catatan dikirim ke mahasiswa untuk disetujui sebelum disimpan.</p>
          </div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn-primary" disabled={!note.trim()} onClick={() => { setNote(""); toast("Ringkasan dikirim ke mahasiswa untuk disetujui."); }}>Kirim ringkasan</button>
            <button className="btn btn-help" onClick={() => setEsc(true)}><AlertTriangle aria-hidden />Eskalasi ke penyelia</button>
          </div>
        </section>
      </div>

      <Sheet open={esc} onClose={() => setEsc(false)} title="Eskalasi ke penyelia">
        <h2 className="h-card">Eskalasi ke dosen penyelia</h2>
        <p className="small muted" style={{ marginTop: 8 }}>Pakai saat ada tanda bahaya, topik di luar kewenangan, atau kamu merasa tidak aman melanjutkan. Mahasiswa langsung melihat kartu bantuan.</p>
        <div className="chips" style={{ marginTop: 16 }}>
          {["Tanda menyakiti diri", "Di luar kewenangan", "Butuh konselor profesional", "Saya kewalahan"].map((r) => (
            <button key={r} className="chip" aria-pressed={reason === r} onClick={() => setReason(r)}>{r}</button>
          ))}
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} disabled={!reason} onClick={() => { setEsc(false); setReason(""); toast("Penyelia BK diberi tahu. Sesi dialihkan."); }}>Kirim eskalasi</button>
      </Sheet>
    </div>
  );
}

export function PeerGuide() {
  const steps = [
    ["Buka dengan hangat", "Perkenalkan diri, sebut batas waktu 30 menit, dan bahwa kamu bukan psikolog."],
    ["Dengarkan dulu", "Ulangi dengan kata-katamu sendiri apa yang kamu tangkap. Hindari menasihati di 10 menit pertama."],
    ["Cari satu langkah kecil", "Ajak mahasiswa memilih satu perubahan yang realistis untuk pekan ini."],
    ["Ringkas bersama", "Tulis ringkasan singkat tanpa identitas, lalu kirim untuk disetujui."],
  ];
  const red = ["Menyebut ingin mati atau menyakiti diri", "Tidak tidur lebih dari dua malam", "Menyebut kekerasan yang sedang terjadi", "Kamu merasa tidak aman melanjutkan"];
  return (
    <div>
      <PageHead title="Panduan percakapan" lede="Ringkasan dari pelatihan Teman Sejenak. Penyelia BK siap dihubungi selama jam layanan." />
      <ol className="guide-steps" style={{ marginTop: 24 }}>
        {steps.map(([t, d]) => <li key={t}><p className="label">{t}</p><p className="small muted">{d}</p></li>)}
      </ol>
      <section className="section help-card" aria-labelledby="rf-h">
        <h2 id="rf-h" className="help-title row" style={{ gap: 8 }}><AlertTriangle aria-hidden style={{ width: 18, height: 18 }} />Hentikan dan eskalasi bila</h2>
        <ul style={{ margin: "12px 0 0", paddingLeft: 18 }} className="small">{red.map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
    </div>
  );
}

/* ---------------- Panel BK ---------------- */
export function BKPanel() {
  const toast = useToast();
  const [filter, setFilter] = useState<"semua" | "baru" | "dijadwalkan" | "selesai">("semua");
  const rows = BK_REFERRALS.filter((r) => filter === "semua" || r.status === filter);
  const tag = (s: string) => (s === "baru" ? "tag-sun" : s === "dijadwalkan" ? "tag-violet" : "tag-teal");
  return (
    <div>
      <PageHead title="Rujukan masuk" lede="Setiap rujukan sudah disetujui mahasiswa. Isi obrolan sebaya tidak pernah ikut terkirim." />
      <div className="segmented" role="group" aria-label="Saring status" style={{ marginTop: 24 }}>
        {(["semua", "baru", "dijadwalkan", "selesai"] as const).map((f) => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</button>)}
      </div>
      <div className="table-wrap panel" style={{ marginTop: 16, padding: 0 }}>
        <table className="table">
          <thead><tr><th scope="col">Mahasiswa</th><th scope="col">Alasan</th><th scope="col">Dari</th><th scope="col" className="num">Skor</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Aksi</span></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><span className="label">{r.alias}</span><br /><span className="tiny faint">{r.days === 0 ? "Hari ini" : `${r.days} hari lalu`}</span></td>
                <td className="small" style={{ maxWidth: 340 }}>{r.reason}</td>
                <td className="small muted">{r.from}</td>
                <td className="num">{r.score}</td>
                <td><span className={`tag ${tag(r.status)}`}>{r.status}</span></td>
                <td>{r.status === "baru" && <button className="btn btn-sm btn-primary" onClick={() => toast(`Undangan temu dikirim ke ${r.alias}.`)}>Jadwalkan temu</button>}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="small muted" style={{ textAlign: "center", padding: 32 }}>Tidak ada rujukan dengan status ini.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="tiny faint row" style={{ marginTop: 12, gap: 6 }}><Lock aria-hidden style={{ width: 14, height: 14 }} />Akses tercatat di log audit. Identitas dibuka hanya setelah mahasiswa menerima undangan temu.</p>
    </div>
  );
}

/* ---------------- Dasbor agregat (F-10) ---------------- */
export function Dashboard() {
  const [fak, setFak] = useState("semua");
  const shown = COHORTS.filter((c) => c.n >= K_MIN);
  const hidden = COHORTS.filter((c) => c.n < K_MIN);
  const view = fak === "semua" ? shown : shown.filter((c) => c.fakultas === fak);
  const sum = (k: "n" | "seimbang" | "perhatikan" | "kuat" | "sesi" | "rujukan") => view.reduce((a, c) => a + c[k], 0);
  const n = sum("n");
  const pct = (v: number) => `${Math.round((v / (n || 1)) * 100)}%`;
  return (
    <div>
      <PageHead title="Dasbor agregat" lede="Gambaran pola dan beban layanan, tanpa identitas. Data kurang dari 10 orang tidak ditampilkan."
        actions={
          <div className="field" style={{ minWidth: 240 }}>
            <label htmlFor="fak" className="sr-only">Fakultas</label>
            <select id="fak" className="select" value={fak} onChange={(e) => setFak(e.target.value)}>
              <option value="semua">Semua fakultas</option>
              {shown.map((c) => <option key={c.fakultas} value={c.fakultas}>{c.fakultas}</option>)}
            </select>
          </div>
        } />

      <dl className="facts" style={{ marginTop: 24 }}>
        <div><dt>Peserta pilot</dt><dd className="num">{n}</dd></div>
        <div><dt>Sesi Teman Sejenak</dt><dd className="num">{sum("sesi")}</dd></div>
        <div><dt>Rujukan ke BK</dt><dd className="num">{sum("rujukan")}</dd></div>
        <div><dt>Siklus berjalan</dt><dd className="num">2<span className="faint small"> / 6</span></dd></div>
      </dl>

      <section className="section" aria-labelledby="dist-h">
        <div className="section-head"><h2 id="dist-h">Sebaran pola</h2></div>
        <div className="panel stack">
          <StackBar parts={[{ label: "Seimbang", value: sum("seimbang"), color: "var(--teal)" }, { label: "Perlu diperhatikan", value: sum("perhatikan"), color: "var(--sun)" }, { label: "Cukup kuat", value: sum("kuat"), color: "var(--coral)" }]} />
          <div className="legend-row small">
            <span><i style={{ background: "var(--teal)" }} />Seimbang <strong className="num">{pct(sum("seimbang"))}</strong></span>
            <span><i style={{ background: "var(--sun)" }} />Perlu diperhatikan <strong className="num">{pct(sum("perhatikan"))}</strong></span>
            <span><i style={{ background: "var(--coral)" }} />Cukup kuat <strong className="num">{pct(sum("kuat"))}</strong></span>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="fk-h">
        <div className="section-head"><h2 id="fk-h">Per fakultas</h2></div>
        <div className="table-wrap panel" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th scope="col">Fakultas</th><th scope="col" className="num">n</th><th scope="col" style={{ width: "34%" }}>Sebaran</th><th scope="col" className="num">Sesi</th><th scope="col" className="num">Rujukan</th></tr></thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.fakultas}>
                  <td className="label">{c.fakultas}</td>
                  <td className="num">{c.n}</td>
                  <td><StackBar parts={[{ label: "Seimbang", value: c.seimbang, color: "var(--teal)" }, { label: "Perlu diperhatikan", value: c.perhatikan, color: "var(--sun)" }, { label: "Cukup kuat", value: c.kuat, color: "var(--coral)" }]} /></td>
                  <td className="num">{c.sesi}</td>
                  <td className="num">{c.rujukan}</td>
                </tr>
              ))}
              {hidden.map((c) => (
                <tr key={c.fakultas} className="row-hidden">
                  <td className="label">{c.fakultas}</td>
                  <td colSpan={4} className="small muted"><EyeOff aria-hidden style={{ width: 14, height: 14, display: "inline", verticalAlign: -2, marginRight: 6 }} />Disembunyikan: kurang dari {K_MIN} peserta</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="gate-h">
        <div className="section-head"><h2 id="gate-h">Gerbang uji coba</h2><a href="#" onClick={(e) => e.preventDefault()} className="row" style={{ gap: 4 }}>Ekspor laporan<ArrowUpRight aria-hidden style={{ width: 14, height: 14 }} /></a></div>
        <ul className="gates">
          {[["Pengguna aktif pekan 4", "64%", "≥ 60%", true], ["System Usability Scale", "71", "≥ 68", true], ["Perubahan skor BSMAS", "−0,14 SD", "turun ≥ 0,2 SD", false], ["Insiden kebocoran data", "0", "0", true]].map(([l, v, t, ok]) => (
            <li key={l as string} className="panel">
              <p className="small muted">{l}</p>
              <p className="gate-val num">{v}</p>
              <p className="tiny"><span className={`tag ${ok ? "tag-teal" : "tag-sun"}`}>{ok ? "Tercapai" : "Belum"}</span> <span className="faint">target {t}</span></p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
