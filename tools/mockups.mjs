// Membuat mockup PNG untuk esai dari tangkapan layar di docs/screenshots.
// node mockups.mjs
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shots = path.join(root, "docs/screenshots");
const out = path.join(root, "docs/mockup");
fs.mkdirSync(out, { recursive: true });
const img = (f) => "data:image/png;base64," + fs.readFileSync(path.join(shots, f)).toString("base64");
const logo = "data:image/png;base64," + fs.readFileSync(path.join(root, "app/src/assets/brand/mark.png")).toString("base64");
const interCss = fs.readFileSync(path.join(root, "app/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2")).toString("base64");
const serifCss = fs.readFileSync(path.join(root, "app/node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2")).toString("base64");

const SB = '<div class="sb"><span>09.41</span><span><b><span style="height:40%"></span><span style="height:60%"></span><span style="height:80%"></span><span style="height:100%"></span></b><i></i></span></div>';
const phone = (f, w, opt = "") => `<div class="phone" style="--w:${w}px;${opt}"><div class="scr">${SB}<img class="screen" src="${img(f)}"></div></div>`;
const base = `
@font-face { font-family: Inter; src: url(data:font/woff2;base64,${interCss}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: Serif4; src: url(data:font/woff2;base64,${serifCss}) format("woff2"); font-weight: 200 900; }
* { box-sizing: border-box; margin: 0; }
body { font-family: Inter, sans-serif; color: #1f2933; }
.phone { position: relative; width: var(--w, 360px); aspect-ratio: 390 / 891; border-radius: calc(var(--w, 360px) * 0.15); background: #111214; padding: calc(var(--w, 360px) * 0.035);
  box-shadow: 0 0 0 2px #3a3b3f inset, 0 40px 80px -30px rgb(20 20 20 / .45), 0 18px 30px -18px rgb(20 20 20 / .35); }
.phone .scr { width: 100%; height: 100%; border-radius: calc(var(--w, 360px) * 0.12); overflow: hidden; display: flex; flex-direction: column; background: var(--sb, #fbfbfa); }
.phone .sb { height: calc(var(--w, 360px) * 0.125); flex: none; display: flex; justify-content: space-between; align-items: center; padding: 0 9% 0 11%; font-weight: 600; font-size: calc(var(--w, 360px) * 0.04); color: var(--sbc, #1f2933); }
.phone .sb i { display: inline-block; width: 1.5em; height: 0.75em; border: 2px solid currentColor; border-radius: 4px; position: relative; margin-left: .4em; vertical-align: -0.05em; }
.phone .sb i::after { content: ""; position: absolute; inset: 1px; right: 30%; background: currentColor; border-radius: 1px; }
.phone .sb b { display: inline-flex; gap: 2px; align-items: flex-end; height: .75em; vertical-align: -0.05em; }
.phone .sb b span { width: 3px; background: currentColor; border-radius: 1px; }
.phone img.screen { width: 100%; flex: 1; min-height: 0; object-fit: cover; object-position: top; display: block; }
.phone::after { content: ""; position: absolute; top: calc(var(--w, 360px) * 0.058); left: 50%; width: 30%; height: calc(var(--w, 360px) * 0.075); transform: translateX(-50%); background: #111214; border-radius: 99px; }
.laptop { width: var(--lw, 1400px); }
.laptop .lid { background: #1a1b1e; border-radius: 26px 26px 6px 6px; padding: 22px 22px 30px; box-shadow: 0 0 0 2px #3a3b3f inset; }
.laptop .lid img { width: 100%; display: block; border-radius: 6px; }
.laptop .deck { height: 26px; margin: 0 -7%; background: linear-gradient(#d9dadc, #a9abaf); border-radius: 2px 2px 22px 22px; position: relative; box-shadow: 0 40px 60px -30px rgb(0 0 0 / .45); }
.laptop .deck::before { content: ""; position: absolute; left: 50%; top: 0; width: 16%; height: 10px; transform: translateX(-50%); background: #b8babd; border-radius: 0 0 12px 12px; }
.brand { display: flex; align-items: center; gap: 14px; font-weight: 700; letter-spacing: -0.01em; }
.brand img { width: 56px; height: 56px; }
.serif { font-family: Serif4, serif; font-weight: 500; letter-spacing: -0.02em; }
.cap { font-size: 22px; color: #4a5360; margin-top: 18px; text-align: center; }
.cap b { display: block; color: #1f2933; font-size: 26px; margin-bottom: 4px; }
`;

const pages = {
  // 1. Tiga ponsel di atas bidang kuning
  "mockup-mobile": { w: 2400, h: 1500, html: `
    <style>${base}
    .wrap { width: 2400px; height: 1500px; background: #fdbc22; position: relative; overflow: hidden; display: flex; align-items: center; padding: 0 140px; gap: 120px; }
    .wrap::before { content: ""; position: absolute; right: -300px; top: -380px; width: 1300px; height: 1300px; border-radius: 50%; box-shadow: 0 0 0 120px rgb(255 255 255 / .12), 0 0 0 260px rgb(255 255 255 / .07); }
    .txt { width: 640px; position: relative; color: #1c1606; }
    .txt h1 { font-size: 92px; line-height: 1.02; margin: 56px 0 28px; }
    .txt p { font-size: 30px; line-height: 1.45; color: #3b2f0a; }
    .row { display: flex; gap: 48px; align-items: center; position: relative; }
    .row .phone:nth-child(2) { transform: translateY(-50px); }
    .logo-tile { width: 120px; height: 120px; border-radius: 30px; background: #fff; padding: 14px; box-shadow: 0 20px 40px -20px rgb(80 50 0 / .5); }
    </style>
    <div class="wrap">
      <div class="txt"><img class="logo-tile" src="${logo}"><h1 class="serif">Berhenti sebentar. Lihat polamu.</h1><p>SEJENAK membantu mahasiswa mengenali pola media sosial, rehat 10 detik, dan terhubung dengan Teman Sejenak serta BK kampus.</p></div>
      <div class="row">
        ${phone("m05-beranda.png", 440)}
        ${phone("m07-rehat.png", 440, "--sb:#fdeee5")}
        ${phone("m10-obrolan.png", 440)}
      </div>
    </div>` },

  // 2. Siklus empat langkah, untuk gambar di esai
  "mockup-siklus": { w: 2600, h: 1500, html: `
    <style>${base}
    .wrap { width: 2600px; height: 1500px; background: #f4f4f2; padding: 90px 110px; }
    .head { display: flex; justify-content: space-between; align-items: center; }
    .head h1 { font-size: 64px; }
    .head p { font-size: 26px; color: #4a5360; max-width: 760px; text-align: right; }
    .row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 40px; margin-top: 80px; justify-items: center; }
    .num { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: #fff; font-weight: 700; font-size: 20px; margin-bottom: 10px; }
    </style>
    <div class="wrap">
      <div class="head"><div class="brand" style="font-size:34px"><img src="${logo}">SEJENAK</div><p>Siklus empat langkah: dari mengenali pola sampai rujukan ke BK, selalu atas persetujuan mahasiswa.</p></div>
      <div class="row">
        ${[
          ["m04-hasil.png", "#0d6b60", "1", "Cek Pola", "Skrining 6 butir BSMAS"],
          ["m07-rehat.png", "#9a4517", "2", "Rehat", "Jeda napas 10 detik"],
          ["m14-dok.png", "#7a5300", "2b", "Dok Sejenak", "Waktu bebas layar otomatis"],
          ["m10-obrolan.png", "#4a3bb3", "3", "Teman Sejenak", "Obrolan sebaya 30 menit"],
          ["m12-rujuk.png", "#384351", "4", "Rujuk dan Tinjau", "Ringkasan disetujui mahasiswa"],
        ].map(([f, c, n, t, d]) => `<div>${phone(f, 400, f.includes("rehat") ? "--sb:#fdeee5" : "")}<div class="cap"><span class="num" style="background:${c}">${n}</span><b>${t}</b>${d}</div></div>`).join("")}
      </div>
    </div>` },

  // 3. Laptop
  "mockup-desktop": { w: 2400, h: 1500, html: `
    <style>${base}
    .wrap { width: 2400px; height: 1500px; background: #e9eaec; display: grid; place-items: center; position: relative; }
    .wrap::after { content: ""; position: absolute; inset: auto 0 0 0; height: 360px; background: #dfe0e3; }
    .laptop { position: relative; z-index: 1; }
    </style>
    <div class="wrap"><div class="laptop" style="--lw:1640px"><div class="lid"><img src="${img("d02-beranda.png")}"></div><div class="deck"></div></div></div>` },

  // 4. Laptop + ponsel (sampul esai)
  "mockup-hero": { w: 2400, h: 1500, html: `
    <style>${base}
    .wrap { width: 2400px; height: 1500px; background: #2a2a2c; position: relative; overflow: hidden; }
    .glow { position: absolute; left: -260px; bottom: -760px; width: 1500px; height: 1500px; border-radius: 50%; background: #fdbc22; }
    .txt { position: absolute; left: 130px; top: 130px; color: #fff; width: 620px; }
    .txt .brand { color: #fff; font-size: 40px; }
    .txt h1 { font-size: 76px; line-height: 1.05; margin-top: 50px; }
    .txt p { font-size: 28px; color: #c4cad1; margin-top: 24px; line-height: 1.45; }
    .laptop { position: absolute; right: 120px; top: 200px; }
    .phone { position: absolute !important; right: 1140px; bottom: 90px; }
    </style>
    <div class="wrap"><div class="glow"></div>
      <div class="txt"><div class="brand"><img src="${logo}" style="background:#fff;border-radius:16px;padding:6px;width:64px;height:64px">SEJENAK</div><h1 class="serif">Kebiasaan digital sehat untuk mahasiswa</h1><p>PWA untuk mahasiswa, Teman Sejenak, BK, dan admin kampus, terhubung dengan Dok Sejenak berbasis ESP32.</p></div>
      <div class="laptop" style="--lw:1300px"><div class="lid"><img src="${img("d07-dasbor.png")}"></div><div class="deck"></div></div>
      ${phone("m05-beranda.png", 330)}
    </div>` },

  // 5. Mode gelap
  "mockup-gelap": { w: 2400, h: 1500, html: `
    <style>${base}
    .wrap { width: 2400px; height: 1500px; background: #14181c; display: flex; align-items: center; justify-content: center; gap: 90px; }
    .laptop .lid { background: #000; }
    </style>
    <div class="wrap"><div class="laptop" style="--lw:1380px"><div class="lid"><img src="${img("d08-gelap.png")}"></div><div class="deck"></div></div>
    ${phone("m17-gelap.png", 430, "--sb:#14181c;--sbc:#f2f4f5")}</div>` },

  // 6. Panel peran (Teman Sejenak, BK, Admin)
  "mockup-panel": { w: 2400, h: 1500, html: `
    <style>${base}
    .wrap { width: 2400px; height: 1500px; background: #eceef1; padding: 90px; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto 1fr 1fr; gap: 50px 60px; }
    .wrap h1 { grid-column: 1 / -1; font-size: 56px; }
    .card { background: #fff; border-radius: 24px; padding: 18px; box-shadow: 0 30px 60px -30px rgb(31 41 51 / .35); }
    .card { overflow: hidden; min-height: 0; } .card img { width: 100%; height: 520px; object-fit: cover; object-position: top left; border-radius: 12px; display: block; }
    .card p { font-size: 24px; font-weight: 600; margin: 4px 6px 14px; }
    .tall { grid-row: span 2; display: flex; flex-direction: column; justify-content: center; }
    </style>
    <div class="wrap"><h1 class="serif">Satu sistem, empat peran</h1>
      <div class="card"><p>Teman Sejenak · antrean dan eskalasi</p><img src="${img("d05-teman-panel.png")}"></div>
      <div class="card"><p>Konselor BK · rujukan bersetuju</p><img src="${img("d06-bk.png")}"></div>
      <div class="card"><p>Admin kampus · dasbor agregat k ≥ 10</p><img src="${img("d07-dasbor.png")}"></div>
      <div class="card"><p>Mahasiswa · tinjauan 4 pekan</p><img src="${img("d03-tinjauan.png")}"></div>
    </div>` },
};

const browser = await chromium.launch();
const only = process.argv[2];
for (const [name, p] of Object.entries(pages)) {
  if (only && name !== only) continue;
  const page = await browser.newPage({ viewport: { width: p.w, height: p.h }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body>${p.html}</body></html>`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, `${name}.png`) });
  console.log("ok", name);
  await page.close();
}
await browser.close();
