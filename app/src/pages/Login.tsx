import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Logo } from "../components/ui";
import { demoState, initialState, useStore } from "../lib/store";
import { ROLE_LABEL, type Role } from "../lib/data";
import mark from "../assets/brand/mark.png";

const HOME: Record<Role, string> = { mahasiswa: "/", peer: "/panel/teman", bk: "/panel/bk", admin: "/dasbor" };

export default function Login() {
  const { set } = useStore();
  const nav = useNavigate();
  const [role, setRole] = useState<Role>("mahasiswa");
  const [busy, setBusy] = useState(false);

  const sso = (withDemo: boolean) => {
    setBusy(true);
    setTimeout(() => {
      if (role === "mahasiswa" && !withDemo) {
        set(() => ({ ...initialState, user: { name: "Raka", role, faculty: "Keguruan dan Ilmu Pendidikan" } }));
        nav("/mulai");
      } else {
        const names: Record<Role, string> = { mahasiswa: "Raka", peer: "Dewi", bk: "Bu Sari", admin: "Admin FKIP" };
        set(() => ({ ...demoState(role), user: { name: names[role], role, faculty: "Keguruan dan Ilmu Pendidikan" } }));
        nav(HOME[role]);
      }
    }, 500);
  };

  return (
    <div className="login">
      <section className="login-art" aria-hidden>
        <img src={mark} alt="" className="login-mark" />
        <p className="serif login-quote">Berhenti sebentar.<br />Lihat polamu.<br />Pilih langkahmu sendiri.</p>
      </section>
      <section className="login-form">
        <div className="login-inner">
          <Logo size={36} />
          <h1 className="page-title" style={{ marginTop: 40 }}>Masuk ke SEJENAK</h1>
          <p className="lede">Pakai akun kampusmu. Kami tidak membaca isi aplikasi lain, dan kamu yang memilih apa yang dibagikan.</p>

          <button className="btn btn-primary btn-block" style={{ marginTop: 32 }} onClick={() => sso(false)} disabled={busy}>
            <KeyRound aria-hidden />{busy ? "Menghubungkan ke SSO kampus…" : "Masuk dengan akun kampus"}
          </button>

          <div className="demo-box">
            <p className="label">Mode demo uji coba</p>
            <p className="hint" style={{ marginTop: 2 }}>Pilih peran untuk melihat panelnya dengan data contoh.</p>
            <div className="chips" style={{ marginTop: 12 }} role="group" aria-label="Peran demo">
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <button key={r} className="chip" aria-pressed={role === r} onClick={() => setRole(r)}>{ROLE_LABEL[r]}</button>
              ))}
            </div>
            <button className="btn btn-secondary btn-block" style={{ marginTop: 16 }} onClick={() => sso(true)} disabled={busy}>
              Buka sebagai {ROLE_LABEL[role]} (data contoh)
            </button>
          </div>

          <p className="small muted row" style={{ marginTop: 32, alignItems: "flex-start" }}>
            <ShieldCheck aria-hidden style={{ width: 18, height: 18, flex: "none", marginTop: 2 }} />
            Data disimpan di server dalam negeri dan dienkripsi. Identitas dan skor disimpan terpisah (UU 27/2022).
          </p>
        </div>
      </section>
    </div>
  );
}
