import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, ShieldCheck, Smartphone, SlidersHorizontal, FileSignature, LifeBuoy, LogOut, Trash2, Moon, Sun, MonitorSmartphone, Minus, Plus, Download } from "lucide-react";
import { ConsentSwitch, HelpCard, PageHead, Sheet, useToast } from "../components/ui";
import { useStore } from "../lib/store";
import { APPS, ROLE_LABEL, fmtMin } from "../lib/data";

export function Saya() {
  const { s, set, reset } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [typed, setTyped] = useState("");
  const isStudent = s.user?.role === "mahasiswa";

  const exportData = () => {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "data-sejenak-saya.json"; a.click();
  };

  return (
    <div>
      <PageHead title="Saya" lede={`${s.user?.name} · ${ROLE_LABEL[s.user?.role ?? "mahasiswa"]} · ${s.user?.faculty}`} />
      <section className="section" style={{ marginTop: 24 }} aria-label="Pengaturan">
        <ul className="list panel" style={{ paddingTop: 0, paddingBottom: 0 }}>
          {isStudent && <>
            <li><Link to="/saya/persetujuan" className="list-row"><span className="list-icon" style={{ background: "var(--teal-soft)", color: "var(--teal-ink)" }}><ShieldCheck aria-hidden /></span><span className="grow"><span className="label" style={{ display: "block" }}>Persetujuan data</span><span className="small muted">{[s.consent.app && "Aplikasi", s.consent.peer && "Teman Sejenak", s.consent.bk && "BK"].filter(Boolean).join(", ") || "Belum ada"}</span></span><ChevronRight aria-hidden className="chev" /></Link></li>
            <li><Link to="/saya/batas" className="list-row"><span className="list-icon" style={{ background: "var(--coral-soft)", color: "var(--coral-ink)" }}><SlidersHorizontal aria-hidden /></span><span className="grow"><span className="label" style={{ display: "block" }}>Batas pribadi</span><span className="small muted">Pemicu ajakan Rehat</span></span><ChevronRight aria-hidden className="chev" /></Link></li>
            <li><Link to="/saya/dok" className="list-row"><span className="list-icon" style={{ background: "var(--sun-soft)", color: "var(--sun-ink)" }}><Smartphone aria-hidden /></span><span className="grow"><span className="label" style={{ display: "block" }}>Dok Sejenak</span><span className="small muted">{s.dock.paired ? `Terpasang · ${s.dock.deviceId}` : "Pasangkan perangkat"}</span></span><ChevronRight aria-hidden className="chev" /></Link></li>
            <li><Link to="/rujuk" className="list-row"><span className="list-icon" style={{ background: "var(--slate-soft)", color: "var(--slate-ink)" }}><FileSignature aria-hidden /></span><span className="grow"><span className="label" style={{ display: "block" }}>Rujukan ke BK</span><span className="small muted">{s.referral?.status === "terkirim" ? "Terkirim" : "Pratinjau dan kirim"}</span></span><ChevronRight aria-hidden className="chev" /></Link></li>
          </>}
          <li><Link to="/bantuan" className="list-row"><span className="list-icon" style={{ background: "var(--help-soft)", color: "var(--help-ink)" }}><LifeBuoy aria-hidden /></span><span className="grow"><span className="label" style={{ display: "block" }}>Bantuan</span><span className="small muted">BK kampus dan Healing119</span></span><ChevronRight aria-hidden className="chev" /></Link></li>
        </ul>
      </section>

      <section className="section" aria-labelledby="th-h">
        <div className="section-head"><h2 id="th-h">Tampilan</h2></div>
        <div className="segmented" role="group" aria-labelledby="th-h">
          {([["system", "Ikuti perangkat", MonitorSmartphone], ["light", "Terang", Sun], ["dark", "Gelap", Moon]] as const).map(([k, l, I]) => (
            <button key={k} aria-pressed={s.theme === k} onClick={() => set((st) => ({ ...st, theme: k }))}><I aria-hidden style={{ width: 16, height: 16, display: "inline", verticalAlign: -3, marginRight: 6 }} />{l}</button>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="pv-h">
        <div className="section-head"><h2 id="pv-h">Privasi</h2></div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={exportData}><Download aria-hidden />Unduh dataku</button>
          <button className="btn btn-secondary" onClick={() => { reset(); nav("/masuk"); }}><LogOut aria-hidden />Keluar</button>
          {isStudent && <button className="btn btn-ghost" style={{ color: "var(--coral-ink)" }} onClick={() => setConfirm(true)}><Trash2 aria-hidden />Hapus akun dan data</button>}
        </div>
      </section>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Hapus akun dan data">
        <h2 className="h-card">Hapus akun dan semua data?</h2>
        <p className="small muted" style={{ marginTop: 8 }}>Skrining, catatan, rehat, ringkasan obrolan, dan data Dok Sejenak akan dihapus permanen dalam 7 hari. Data evaluasi yang sudah dianonimkan tidak bisa dikaitkan lagi denganmu.</p>
        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="del">Ketik HAPUS untuk mengonfirmasi</label>
          <input id="del" className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
        </div>
        <div className="row" style={{ marginTop: 20 }}>
          <button className="btn btn-secondary grow" onClick={() => setConfirm(false)}>Batal</button>
          <button className="btn btn-primary grow" disabled={typed !== "HAPUS"} onClick={() => { reset(); toast("Akun dan data dijadwalkan untuk dihapus."); nav("/masuk"); }}>Hapus permanen</button>
        </div>
      </Sheet>
    </div>
  );
}

export function Persetujuan() {
  const { s, set } = useStore();
  const c = s.consent;
  const upd = (k: keyof typeof c, v: boolean) => set((st) => ({ ...st, consent: { ...st.consent, [k]: v, updatedAt: new Date().toISOString() } }));
  return (
    <div>
      <PageHead title="Persetujuan data" lede="Setiap sakelar bisa dicabut kapan saja. Pencabutan berlaku seketika untuk data berikutnya." />
      <div className="panel" style={{ marginTop: 24, paddingTop: 4, paddingBottom: 4 }}>
        <ConsentSwitch id="p-app" checked={c.app} onChange={(v) => upd("app", v)} title="Pakai SEJENAK untuk diriku" desc="Skrining, catatan durasi, dan rehat tersimpan di akunmu." />
        <ConsentSwitch id="p-peer" checked={c.peer} onChange={(v) => upd("peer", v)} title="Bagikan ringkasan ke Teman Sejenak" desc="Hanya ringkasan yang kamu setujui." />
        <ConsentSwitch id="p-bk" checked={c.bk} onChange={(v) => upd("bk", v)} title="Izinkan rujukan ke BK kampus" desc="Rujukan tetap butuh persetujuanmu setiap kali dikirim." />
      </div>
      {c.updatedAt && <p className="tiny faint" style={{ marginTop: 12 }}>Terakhir diubah {new Date(c.updatedAt).toLocaleString("id-ID")}</p>}
      <div className="panel-flat small stack" style={{ marginTop: 24 }}>
        <p className="label">Yang tidak pernah kami simpan</p>
        <p className="muted">Isi aplikasi yang kamu buka, isi obrolan di dasbor kampus, lokasi, dan kontak. Dasbor kampus hanya menampilkan angka kelompok berisi 10 orang atau lebih.</p>
      </div>
    </div>
  );
}

export function Batas() {
  const { s, set } = useStore();
  const toast = useToast();
  const [l, setL] = useState(s.limits);
  return (
    <div>
      <PageHead title="Batas pribadi" lede="Saat catatanmu melewati batas ini, SEJENAK mengajakmu rehat 10 detik." />
      <ul className="list panel" style={{ marginTop: 24, paddingTop: 0, paddingBottom: 0 }}>
        {APPS.map((a) => (
          <li key={a.id} className="list-row">
            <span className="dot" style={{ color: a.color }} aria-hidden />
            <span className="grow" id={`b-${a.id}`}>{a.name}</span>
            <div className="stepper" role="group" aria-labelledby={`b-${a.id}`}>
              <button className="icon-btn" aria-label={`Kurangi batas ${a.name}`} onClick={() => setL({ ...l, [a.id]: Math.max(10, l[a.id] - 10) })}><Minus aria-hidden /></button>
              <output className="num" style={{ fontSize: "1rem", minWidth: "7ch" }}>{fmtMin(l[a.id])}</output>
              <button className="icon-btn" aria-label={`Tambah batas ${a.name}`} onClick={() => setL({ ...l, [a.id]: Math.min(300, l[a.id] + 10) })}><Plus aria-hidden /></button>
            </div>
          </li>
        ))}
      </ul>
      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { set((st) => ({ ...st, limits: l })); toast("Batas pribadi disimpan."); }}>Simpan batas</button>
    </div>
  );
}

export function Bantuan() {
  const [p] = useSearchParams();
  const fromDock = p.get("dari") === "dok";
  return (
    <div className="stack">
      {fromDock && <p className="tag tag-sun">Dibuka dari tombol Dok Sejenak</p>}
      <HelpCard />
      <div className="panel-flat stack small">
        <p className="label">Yang terjadi setelah kamu menekan Bantuan</p>
        <p className="muted">Halaman ini tidak memberi tahu siapa pun secara otomatis dan tidak masuk ke antrean Teman Sejenak. Kamu yang memilih jalur mana yang dihubungi.</p>
      </div>
      <div className="panel stack small">
        <p className="label">Sambil menunggu tersambung</p>
        <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
          <li>Duduk di tempat yang aman dan dekat dengan orang lain bila bisa.</li>
          <li>Tarik napas 4 hitungan, hembuskan 4 hitungan, ulangi beberapa kali.</li>
          <li>Hubungi satu orang yang kamu percaya dan katakan kamu sedang butuh ditemani.</li>
        </ul>
      </div>
    </div>
  );
}
