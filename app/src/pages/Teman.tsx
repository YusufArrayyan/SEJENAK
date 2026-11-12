import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Mic, Send, Shuffle, MessageSquareText, FileSignature, Clock3, LifeBuoy } from "lucide-react";
import { HelpCard, PageHead, useToast } from "../components/ui";
import { useStore, type Msg } from "../lib/store";
import { PEERS, fmtDateTime, isCrisis } from "../lib/data";

function slots() {
  const out: Date[] = [];
  const base = new Date(); base.setMinutes(0, 0, 0);
  for (let d = 1; d <= 3; d++) for (const h of [10, 13, 16, 19]) { const x = new Date(base); x.setDate(x.getDate() + d); x.setHours(h); out.push(x); }
  return out;
}

export default function Teman() {
  const { s, set } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [slot, setSlot] = useState<string | null>(null);
  const [peer, setPeer] = useState<string>("acak");
  const [mode, setMode] = useState<"teks" | "suara">("teks");
  const list = useMemo(slots, []);
  const [day, setDay] = useState(0);
  const days = useMemo(() => [0, 1, 2].map((i) => fmtDateTime(list[i * 4].toISOString()).split(" · ")[0]), [list]);
  const upcoming = s.sessions.filter((x) => x.status !== "selesai");
  const past = s.sessions.filter((x) => x.status === "selesai");

  const book = () => {
    if (!slot) return;
    const id = `s-${Date.now()}`;
    const p = peer === "acak" ? PEERS[Math.floor(Math.random() * PEERS.length)].id : peer;
    set((st) => ({
      ...st,
      sessions: [...st.sessions, { id, peer: p, at: slot, mode, status: "terjadwal" }],
      messages: { ...st.messages, [id]: [{ from: "system", text: "Obrolan dibuka. Batas sesi 30 menit.", at: new Date().toISOString() }] },
    }));
    setSlot(null);
    toast("Jadwal tersimpan. Pengingat dikirim ke surel kampusmu.");
  };

  if (!s.consent.peer)
    return (
      <div className="stack">
        <PageHead title="Teman Sejenak" lede="Ngobrol 30 menit dengan mahasiswa terlatih yang didampingi dosen BK." />
        <div className="panel stack">
          <p>Untuk menjadwalkan obrolan, izinkan dulu ringkasan yang kamu setujui dibagikan ke Teman Sejenak.</p>
          <Link to="/saya/persetujuan" className="btn btn-primary">Atur persetujuan</Link>
        </div>
      </div>
    );

  return (
    <div>
      <PageHead title="Teman Sejenak" lede="Ngobrol 30 menit dengan mahasiswa terlatih yang didampingi dosen BK. Teman Sejenak bukan psikolog." />

      {upcoming.length > 0 && (
        <section className="section" aria-labelledby="up-h" style={{ marginTop: 24 }}>
          <div className="section-head"><h2 id="up-h">Jadwal kamu</h2></div>
          <ul className="list panel" style={{ paddingTop: 0, paddingBottom: 0 }}>
            {upcoming.map((x) => {
              const p = PEERS.find((pp) => pp.id === x.peer)!;
              return (
                <li key={x.id}>
                  <Link to={`/teman/obrolan/${x.id}`} className="list-row">
                    <span className="avatar" aria-hidden>{p.name[0]}</span>
                    <span className="grow">
                      <span className="label" style={{ display: "block" }}>{p.name}</span>
                      <span className="small muted">{fmtDateTime(x.at)} · {x.mode === "teks" ? "Teks" : "Suara"}</span>
                    </span>
                    <span className="btn btn-sm btn-secondary" aria-hidden>Buka</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="section" aria-labelledby="book-h">
        <div className="section-head"><h2 id="book-h">Jadwalkan obrolan baru</h2></div>
        <div className="panel stack">
          <div>
            <p className="label" id="peer-l">Pilih teman</p>
            <div className="peer-pick" role="radiogroup" aria-labelledby="peer-l">
              <button role="radio" aria-checked={peer === "acak"} className="peer-opt" onClick={() => setPeer("acak")}>
                <span className="avatar" aria-hidden><Shuffle style={{ width: 16, height: 16 }} /></span>
                <span><span className="label" style={{ display: "block" }}>Siapa saja</span><span className="tiny muted">Paling cepat tersedia</span></span>
              </button>
              {PEERS.map((p) => (
                <button key={p.id} role="radio" aria-checked={peer === p.id} className="peer-opt" onClick={() => setPeer(p.id)}>
                  <span className="avatar" aria-hidden>{p.name[0]}</span>
                  <span><span className="label" style={{ display: "block" }}>{p.name}</span><span className="tiny muted">{p.topics.join(" · ")}</span></span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label" id="slot-l">Pilih waktu</p>
            <div className="segmented day-tabs" role="group" aria-label="Pilih hari" style={{ marginTop: 8 }}>
              {days.map((d, i) => <button key={d} aria-pressed={day === i} onClick={() => setDay(i)}>{d}</button>)}
            </div>
            <div className="slot-grid" role="radiogroup" aria-labelledby="slot-l">
              {list.slice(day * 4, day * 4 + 4).map((d) => (
                <button key={d.toISOString()} role="radio" aria-checked={slot === d.toISOString()} className="chip" aria-pressed={slot === d.toISOString()} onClick={() => setSlot(d.toISOString())}>
                  {String(d.getHours()).padStart(2, "0")}.00
                </button>
              ))}
            </div>
          </div>
          <div className="row-between" style={{ flexWrap: "wrap" }}>
            <div className="segmented" role="group" aria-label="Jenis obrolan">
              <button aria-pressed={mode === "teks"} onClick={() => setMode("teks")}><MessageSquareText aria-hidden style={{ width: 16, height: 16, display: "inline", verticalAlign: -3, marginRight: 6 }} />Teks</button>
              <button aria-pressed={mode === "suara"} onClick={() => setMode("suara")}><Mic aria-hidden style={{ width: 16, height: 16, display: "inline", verticalAlign: -3, marginRight: 6 }} />Suara</button>
            </div>
            <button className="btn btn-primary" disabled={!slot} onClick={book}><CalendarPlus aria-hidden />Jadwalkan</button>
          </div>
        </div>
      </section>

      {past.length > 0 && (
        <section className="section" aria-labelledby="past-h">
          <div className="section-head"><h2 id="past-h">Ringkasan sebelumnya</h2></div>
          {past.map((x) => (
            <article key={x.id} className="panel-flat stack" style={{ marginBottom: 12 }}>
              <p className="small muted">{fmtDateTime(x.at)} · bersama {PEERS.find((p) => p.id === x.peer)?.name}</p>
              <p className="serif" style={{ fontSize: "1.0625rem" }}>{x.summary}</p>
              <span className="tag tag-teal">Disetujui olehmu</span>
            </article>
          ))}
          <button className="btn btn-secondary" onClick={() => nav("/rujuk")}><FileSignature aria-hidden />Minta rujukan ke BK</button>
        </section>
      )}
    </div>
  );
}

const REPLIES = [
  "Makasih sudah cerita. Kalau boleh tahu, kapan biasanya dorongan buka ponsel paling kuat?",
  "Itu wajar kok. Mau coba satu langkah kecil untuk pekan ini?",
  "Kedengarannya rencana dok malam cukup membantu ya. Apa yang paling susah dari itu?",
];

export function Chat() {
  const { id = "" } = useParams();
  const { s, set } = useStore();
  const nav = useNavigate();
  const session = s.sessions.find((x) => x.id === id);
  const peer = PEERS.find((p) => p.id === session?.peer);
  const msgs = s.messages[id] ?? [];
  const [text, setText] = useState("");
  const [crisis, setCrisis] = useState(false);
  const [left, setLeft] = useState(30 * 60);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs.length, crisis]);

  if (!session || !peer) return <div className="stack"><p>Sesi tidak ditemukan.</p><Link to="/teman">Kembali ke Teman Sejenak</Link></div>;

  const push = (m: Msg) => set((st) => ({ ...st, messages: { ...st.messages, [id]: [...(st.messages[id] ?? []), m] } }));
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim(); if (!t) return;
    setText("");
    if (isCrisis(t)) {
      // F-07: tidak diteruskan ke antrean sebaya
      setCrisis(true);
      push({ from: "system", text: "Pesan ini tidak dikirim ke Teman Sejenak. Kami tampilkan jalur bantuan yang bisa langsung kamu hubungi.", at: new Date().toISOString() });
      return;
    }
    push({ from: "me", text: t, at: new Date().toISOString() });
    setTimeout(() => push({ from: "peer", text: REPLIES[msgs.filter((m) => m.from === "peer").length % REPLIES.length], at: new Date().toISOString() }), 1400);
  };
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");

  return (
    <div className="chat">
      <header className="chat-head">
        <button className="icon-btn" onClick={() => nav("/teman")} aria-label="Kembali"><ArrowLeft aria-hidden /></button>
        <span className="avatar" aria-hidden>{peer.name[0]}</span>
        <div className="grow">
          <p className="label">{peer.name}</p>
          <p className="tiny muted">Teman Sejenak · {peer.prodi}</p>
        </div>
        <span className="tag" aria-label={`Sisa waktu ${mm} menit ${ss} detik`}><Clock3 aria-hidden /><span className="num">{mm}.{ss}</span></span>
      </header>
      <p className="note" style={{ marginTop: 12 }}><LifeBuoy aria-hidden /><span>Teman Sejenak bukan psikolog. Untuk hal mendesak, tekan <Link to="/bantuan">Bantuan</Link>.</span></p>

      <div className="chat-log" role="log" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`bubble-row ${m.from}`}>
            <p className={`bubble ${m.from}`}>{m.text}</p>
          </div>
        ))}
        {crisis && <HelpCard compact />}
        <div ref={end} />
      </div>

      <form className="chat-input" onSubmit={send}>
        <label htmlFor="msg" className="sr-only">Tulis pesan</label>
        <input id="msg" className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis pesan…" autoComplete="off" />
        <button className="icon-btn send" aria-label="Kirim" disabled={!text.trim()}><Send aria-hidden /></button>
      </form>
    </div>
  );
}
