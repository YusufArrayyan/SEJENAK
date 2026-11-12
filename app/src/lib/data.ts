// Konten dan data contoh SEJENAK

export type Role = "mahasiswa" | "peer" | "bk" | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  mahasiswa: "Mahasiswa",
  peer: "Teman Sejenak",
  bk: "Konselor BK",
  admin: "Admin kampus",
};

export interface AppDef { id: string; name: string; color: string }
export const APPS: AppDef[] = [
  { id: "instagram", name: "Instagram", color: "var(--coral)" },
  { id: "tiktok", name: "TikTok", color: "var(--violet)" },
  { id: "youtube", name: "YouTube", color: "var(--teal)" },
  { id: "x", name: "X", color: "var(--slate)" },
  { id: "lainnya", name: "Lainnya", color: "var(--line-strong)" },
];
export const appName = (id: string) => APPS.find((a) => a.id === id)?.name ?? id;

// BSMAS (Andreassen dkk., 2016), parafrase bahasa Indonesia untuk uji coba
export const BSMAS_ITEMS = [
  "Menghabiskan banyak waktu memikirkan media sosial atau merencanakan kapan membukanya.",
  "Merasa terdorong untuk makin sering memakai media sosial.",
  "Membuka media sosial untuk melupakan masalah pribadi.",
  "Mencoba mengurangi media sosial, tetapi tidak berhasil.",
  "Merasa gelisah atau terganggu saat tidak bisa membuka media sosial.",
  "Memakai media sosial begitu sering sampai kuliah atau pekerjaanmu terganggu.",
];
export const LIKERT = ["Sangat jarang", "Jarang", "Kadang-kadang", "Sering", "Sangat sering"];

export interface Band { key: "seimbang" | "perhatikan" | "kuat"; title: string; body: string; tag: string }
export function bandFor(score: number): Band {
  if (score <= 12)
    return {
      key: "seimbang",
      tag: "tag-teal",
      title: "Pola yang cukup seimbang",
      body: "Media sosial hadir di harimu, tetapi jarang mengambil alih. Catatan harian bisa membantumu menjaga ritme ini.",
    };
  if (score <= 18)
    return {
      key: "perhatikan",
      tag: "tag-sun",
      title: "Pola yang layak diperhatikan",
      body: "Ada beberapa momen ketika media sosial terasa sulit dilepas. Batas pribadi dan jeda Rehat biasanya membantu di tahap ini.",
    };
  return {
    key: "kuat",
    tag: "tag-coral",
    title: "Pola yang cukup kuat",
    body: "Media sosial tampaknya sering memengaruhi waktu dan perasaanmu. Ngobrol dengan Teman Sejenak bisa jadi langkah awal yang ringan.",
  };
}

// Kata kunci krisis (F-07). Daftar ini sengaja luas; lebih baik kartu bantuan muncul terlalu sering daripada terlewat.
export const CRISIS_PATTERNS = [
  /bunuh\s*diri/i, /ingin\s*mati/i, /pengen\s*mati/i, /mau\s*mati/i, /mengakhiri\s*hidup/i, /akhiri\s*hidup/i,
  /menyakiti\s*diri/i, /melukai\s*diri/i, /self[\s-]*harm/i, /tidak\s*ingin\s*hidup/i, /gak\s*mau\s*hidup/i,
  /nggak\s*mau\s*hidup/i, /lebih\s*baik\s*(aku|saya)\s*(tidak\s*ada|mati|hilang)/i, /suicid/i, /sayat/i,
];
export const isCrisis = (t: string) => CRISIS_PATTERNS.some((p) => p.test(t));

export const PEERS = [
  { id: "dewi", name: "Dewi", prodi: "Psikologi, semester 6", topics: ["Kebiasaan malam", "Fokus kuliah"] },
  { id: "bima", name: "Bima", prodi: "Teknik Informatika, semester 7", topics: ["Gim dan video", "Tidur"] },
  { id: "nadia", name: "Nadia", prodi: "Pendidikan Bahasa, semester 5", topics: ["Perbandingan diri", "Kecemasan ringan"] },
];

export const PURPOSES = ["Membalas pesan", "Mencari info kuliah", "Hiburan sebentar", "Bosan", "Kebiasaan saja", "Lainnya"];

// ---------- util tanggal ----------
export const dayKey = (d = new Date()) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const shortDay = (key: string) => HARI[new Date(key + "T00:00").getDay()];
export const fmtDate = (key: string) => { const d = new Date(key + "T00:00"); return `${d.getDate()} ${BULAN[d.getMonth()]}`; };
export const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
};
export const fmtMin = (m: number) => (m < 60 ? `${m} mnt` : `${Math.floor(m / 60)} j ${m % 60 ? `${m % 60} mnt` : ""}`.trim());
export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

// ---------- pseudo-random deterministik untuk data contoh ----------
function rng(seed: number) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

export function seedLogs(today = new Date()) {
  const r = rng(42);
  const logs: { id: string; date: string; app: string; minutes: number }[] = [];
  const base: Record<string, number> = { instagram: 95, tiktok: 110, youtube: 60, x: 25 };
  for (let i = 27; i >= 0; i--) {
    const date = dayKey(addDays(today, -i));
    const trend = 1 - (27 - i) * 0.012; // perlahan turun seiring uji coba
    for (const app of Object.keys(base)) {
      if (i === 0 && (app === "youtube" || app === "x")) continue; // hari ini baru sebagian
      const m = Math.max(5, Math.round(base[app] * trend * (0.7 + r() * 0.6) / 5) * 5);
      logs.push({ id: `${date}-${app}`, date, app, minutes: i === 0 ? Math.round(m * 0.55 / 5) * 5 : m });
    }
  }
  return logs;
}
export function seedDock(today = new Date()) {
  const r = rng(7);
  const out: { date: string; minutes: number }[] = [];
  for (let i = 27; i >= 1; i--) out.push({ date: dayKey(addDays(today, -i)), minutes: Math.round((40 + (27 - i) * 4 + r() * 50) / 5) * 5 });
  out.push({ date: dayKey(today), minutes: 45 });
  return out;
}
export function seedPauses(today = new Date()) {
  const r = rng(99);
  const out: { at: string; choice: "lanjut" | "tutup"; purpose?: string; source: "catat" | "dok" | "manual" }[] = [];
  for (let i = 27; i >= 0; i--) {
    const n = 1 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const d = addDays(today, -i); d.setHours(19 + k * 2, Math.floor(r() * 59));
      const closeBias = 0.35 + (27 - i) * 0.012;
      out.push({ at: d.toISOString(), choice: r() < closeBias ? "tutup" : "lanjut", purpose: PURPOSES[Math.floor(r() * PURPOSES.length)], source: r() < 0.4 ? "dok" : "catat" });
    }
  }
  return out;
}
export function seedScreenings(today = new Date()) {
  return [21, 19, 18, 16].map((score, i) => ({ date: dayKey(addDays(today, -21 + i * 7)), score, answers: [] as number[] }));
}

// ---------- data panel (contoh, tanpa identitas asli) ----------
export const PEER_QUEUE = [
  { id: "q1", alias: "Mahasiswa A-17", at: 0, mode: "teks", topic: "Sulit tidur karena gulir malam", consent: true, status: "berikutnya" },
  { id: "q2", alias: "Mahasiswa A-23", at: 2, mode: "suara", topic: "Merasa tertinggal dibanding teman", consent: true, status: "terjadwal" },
  { id: "q3", alias: "Mahasiswa B-04", at: 26, mode: "teks", topic: "Mengatur waktu belajar", consent: false, status: "terjadwal" },
];
export const BK_REFERRALS = [
  { id: "r1", alias: "Mahasiswa A-09", from: "Teman Sejenak (Dewi)", reason: "Pola tidur terganggu 3 pekan, minta bicara dengan konselor", score: 22, status: "baru", days: 0 },
  { id: "r2", alias: "Mahasiswa C-12", from: "Mahasiswa sendiri", reason: "Ingin strategi mengurangi penggunaan saat belajar", score: 19, status: "dijadwalkan", days: 2 },
  { id: "r3", alias: "Mahasiswa A-31", from: "Teman Sejenak (Bima)", reason: "Kecemasan menjelang ujian, sudah 2 sesi sebaya", score: 20, status: "selesai", days: 9 },
];
export const COHORTS = [
  { fakultas: "Keguruan dan Ilmu Pendidikan", n: 142, seimbang: 58, perhatikan: 51, kuat: 33, sesi: 64, rujukan: 9 },
  { fakultas: "Teknik", n: 96, seimbang: 31, perhatikan: 38, kuat: 27, sesi: 41, rujukan: 6 },
  { fakultas: "Ekonomi dan Bisnis", n: 88, seimbang: 36, perhatikan: 34, kuat: 18, sesi: 29, rujukan: 4 },
  { fakultas: "Hukum", n: 7, seimbang: 3, perhatikan: 2, kuat: 2, sesi: 3, rujukan: 0 },
  { fakultas: "Pertanian", n: 54, seimbang: 24, perhatikan: 19, kuat: 11, sesi: 17, rujukan: 2 },
];
export const K_MIN = 10;
