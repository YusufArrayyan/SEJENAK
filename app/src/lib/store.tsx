import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dayKey, seedDock, seedLogs, seedPauses, seedScreenings, type Role } from "./data";

export interface Log { id: string; date: string; app: string; minutes: number }
export interface Pause { at: string; choice: "lanjut" | "tutup"; purpose?: string; source: "catat" | "dok" | "manual" }
export interface Screening { date: string; score: number; answers: number[] }
export interface Msg { from: "me" | "peer" | "system"; text: string; at: string }
export interface PeerSession { id: string; peer: string; at: string; mode: "teks" | "suara"; status: "terjadwal" | "berlangsung" | "selesai"; summary?: string; summaryApproved?: boolean }
export interface Referral { reason: string; summary: string; includeScore: boolean; includePeerSummary: boolean; status: "draf" | "terkirim" | "diterima"; sentAt?: string }
export interface Reflection { at: string; text: string; decision?: "lanjut" | "ubah" }
export interface DockState { paired: boolean; deviceId: string; mode: "sim" | "mqtt"; brokerUrl: string; autoLog: boolean; breathLight: boolean; helpButton: boolean; rehatOnLift: boolean; docked: boolean; dockedSince?: number }

export interface State {
  user: { name: string; role: Role; faculty: string } | null;
  onboarded: boolean;
  consent: { app: boolean; peer: boolean; bk: boolean; updatedAt?: string };
  screenings: Screening[];
  limits: Record<string, number>;
  logs: Log[];
  pauses: Pause[];
  sessions: PeerSession[];
  messages: Record<string, Msg[]>;
  referral: Referral | null;
  reflections: Reflection[];
  dock: DockState;
  dockLogs: { date: string; minutes: number }[];
  theme: "system" | "light" | "dark";
}

const KEY = "sejenak.v1";
const emptyDock: DockState = { paired: false, deviceId: "", mode: "sim", brokerUrl: "wss://mqtt.sejenak.unib.ac.id:8884/mqtt", autoLog: true, breathLight: true, helpButton: true, rehatOnLift: true, docked: false };

export const initialState: State = {
  user: null, onboarded: false,
  consent: { app: false, peer: false, bk: false },
  screenings: [], limits: { instagram: 60, tiktok: 60, youtube: 45, x: 30, lainnya: 30 },
  logs: [], pauses: [], sessions: [], messages: {}, referral: null, reflections: [],
  dock: emptyDock, dockLogs: [], theme: "system",
};

export function demoState(role: Role = "mahasiswa"): State {
  const now = new Date();
  const s1 = new Date(now); s1.setDate(s1.getDate() + 1); s1.setHours(16, 0, 0, 0);
  const past = new Date(now); past.setDate(past.getDate() - 6); past.setHours(19, 30, 0, 0);
  return {
    ...initialState,
    user: { name: "Raka", role, faculty: "Keguruan dan Ilmu Pendidikan" },
    onboarded: true,
    consent: { app: true, peer: true, bk: false, updatedAt: now.toISOString() },
    screenings: seedScreenings(now),
    logs: seedLogs(now),
    pauses: seedPauses(now),
    dockLogs: seedDock(now),
    sessions: [
      { id: "s-past", peer: "dewi", at: past.toISOString(), mode: "teks", status: "selesai", summary: "Raka ingin berhenti membuka TikTok setelah pukul 23.00. Rencana: ponsel di dok saat belajar malam, coba 1 pekan.", summaryApproved: true },
      { id: "s-next", peer: "dewi", at: s1.toISOString(), mode: "teks", status: "terjadwal" },
    ],
    messages: {
      "s-next": [
        { from: "system", text: "Obrolan dibuka. Batas sesi 30 menit.", at: now.toISOString() },
        { from: "peer", text: "Hai Raka, aku Dewi. Gimana pekan ini, rencana dok malamnya jalan?", at: now.toISOString() },
      ],
    },
    dock: { ...emptyDock, paired: true, deviceId: "DOK-7F3A", docked: false },
    reflections: [{ at: new Date(now.getTime() - 7 * 864e5).toISOString(), text: "Malam lebih tenang kalau ponsel sudah di dok sebelum mulai mengerjakan tugas." }],
  };
}

function load(): State {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...initialState, ...JSON.parse(raw) }; } catch { /* data rusak: mulai baru */ }
  return initialState;
}

interface Ctx {
  s: State;
  set: (fn: (s: State) => State) => void;
  reset: () => void;
  todayLogs: Log[];
  todayTotal: number;
  overLimit: string[];
}
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* penyimpanan penuh */ } }, [s]);

  // tema
  useEffect(() => {
    const apply = () => {
      const dark = s.theme === "dark" || (s.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#14181c" : "#fbfbfa");
    };
    apply();
    const mq = matchMedia("(prefers-color-scheme: dark)"); mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [s.theme]);

  const set = useCallback((fn: (s: State) => State) => setS(fn), []);
  const reset = useCallback(() => { localStorage.removeItem(KEY); setS(initialState); }, []);

  const derived = useMemo(() => {
    const k = dayKey();
    const todayLogs = s.logs.filter((l) => l.date === k);
    const per: Record<string, number> = {};
    todayLogs.forEach((l) => (per[l.app] = (per[l.app] ?? 0) + l.minutes));
    const overLimit = Object.keys(per).filter((a) => s.limits[a] && per[a] > s.limits[a]);
    return { todayLogs, todayTotal: todayLogs.reduce((a, b) => a + b.minutes, 0), overLimit };
  }, [s.logs, s.limits]);

  return <C.Provider value={{ s, set, reset, ...derived }}>{children}</C.Provider>;
}

export function useStore() { const c = useContext(C); if (!c) throw new Error("StoreProvider hilang"); return c; }

export function perAppToday(logs: Log[]) {
  const per: Record<string, number> = {};
  logs.forEach((l) => (per[l.app] = (per[l.app] ?? 0) + l.minutes));
  return per;
}
