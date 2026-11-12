import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, MessagesSquare, LineChart, UserRound, LifeBuoy, Inbox, ClipboardList, LayoutDashboard, BookOpen, type LucideIcon } from "lucide-react";
import { Logo, useToast } from "./ui";
import { useStore } from "../lib/store";
import { dock, type DockEvent } from "../lib/iot";
import { dayKey, ROLE_LABEL } from "../lib/data";

type Item = { to: string; label: string; icon: LucideIcon; end?: boolean };
const NAV: Record<string, Item[]> = {
  mahasiswa: [
    { to: "/", label: "Beranda", icon: Home, end: true },
    { to: "/teman", label: "Teman Sejenak", icon: MessagesSquare },
    { to: "/tinjauan", label: "Tinjauan", icon: LineChart },
    { to: "/saya", label: "Saya", icon: UserRound },
  ],
  peer: [
    { to: "/panel/teman", label: "Antrean", icon: Inbox, end: true },
    { to: "/panel/teman/panduan", label: "Panduan", icon: BookOpen },
    { to: "/saya", label: "Saya", icon: UserRound },
  ],
  bk: [
    { to: "/panel/bk", label: "Rujukan", icon: ClipboardList },
    { to: "/saya", label: "Saya", icon: UserRound },
  ],
  admin: [
    { to: "/dasbor", label: "Dasbor agregat", icon: LayoutDashboard },
    { to: "/saya", label: "Saya", icon: UserRound },
  ],
};

export function Shell() {
  const { s } = useStore();
  const role = s.user?.role ?? "mahasiswa";
  const items = NAV[role];
  const loc = useLocation();
  const wide = loc.pathname.startsWith("/dasbor") || loc.pathname.startsWith("/panel") || loc.pathname === "/";
  return (
    <div className="shell">
      <a href="#main" className="skip">Lompat ke isi</a>
      <nav className="side-nav" aria-label="Navigasi utama">
        <Logo />
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className="nav-item"><it.icon aria-hidden />{it.label}</NavLink>
        ))}
        <div className="nav-foot stack">
          <NavLink to="/bantuan" className="help-pill" style={{ width: "100%" }}><LifeBuoy aria-hidden />Bantuan sekarang</NavLink>
          <p className="tiny faint" style={{ padding: "0 4px" }}>Masuk sebagai {s.user?.name} · {ROLE_LABEL[role]}</p>
        </div>
      </nav>
      <main id="main" className={`shell-main${wide ? "" : " narrow"}`}>
        <div className="topbar">
          <Logo />
          <NavLink to="/bantuan" className="help-pill mobile-only" aria-label="Bantuan sekarang"><LifeBuoy aria-hidden />Bantuan</NavLink>
        </div>
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Navigasi bawah" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end}><it.icon aria-hidden /><span>{it.label}</span></NavLink>
        ))}
      </nav>
    </div>
  );
}

/* Jembatan peristiwa Dok Sejenak -> data & navigasi */
export function DockBridge() {
  const { s, set } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const d = s.dock;

  useEffect(() => {
    if (d.paired && s.user?.role === "mahasiswa") dock.connect({ mode: d.mode, deviceId: d.deviceId, brokerUrl: d.brokerUrl });
    else dock.disconnect();
    return () => dock.disconnect();
  }, [d.paired, d.mode, d.deviceId, d.brokerUrl, s.user?.role]);

  useEffect(() => {
    if (dock.state === "tersambung") dock.send({ type: "config", autoLog: d.autoLog, breathLight: d.breathLight, helpButton: d.helpButton });
  }, [d.autoLog, d.breathLight, d.helpButton]);

  useEffect(() => {
    const onEvent = (e: Event) => {
      const ev = (e as CustomEvent<DockEvent>).detail;
      if (ev.type === "docked") {
        set((st) => ({ ...st, dock: { ...st.dock, docked: true, dockedSince: ev.ts } }));
        toast("Ponsel di dok. Waktu bebas layar mulai dihitung.");
      }
      if (ev.type === "lifted") {
        set((st) => {
          const since = st.dock.dockedSince ?? ev.ts;
          const mins = Math.max(1, Math.round((ev.ts - since) / 60000));
          const k = dayKey();
          const dockLogs = st.dock.autoLog
            ? (st.dockLogs.some((x) => x.date === k) ? st.dockLogs.map((x) => (x.date === k ? { ...x, minutes: x.minutes + mins } : x)) : [...st.dockLogs, { date: k, minutes: mins }])
            : st.dockLogs;
          return { ...st, dockLogs, dock: { ...st.dock, docked: false, dockedSince: undefined } };
        });
        if (d.rehatOnLift) nav("/rehat?dari=dok");
      }
      if (ev.type === "help" && d.helpButton) nav("/bantuan?dari=dok");
    };
    dock.addEventListener("event", onEvent);
    return () => dock.removeEventListener("event", onEvent);
  }, [d.rehatOnLift, d.helpButton, nav, set, toast]);

  return null;
}
