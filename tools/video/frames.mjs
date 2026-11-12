// Bingkai video 1920x1080 per kalimat narasi (dengan teks terjemahan tertanam).
// node frames.mjs
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.join(here, "build/frames"); fs.mkdirSync(out, { recursive: true });
const u = (p) => pathToFileURL(path.join(root, p)).href;
const S = (f) => u(`docs/screenshots/${f}`);
const LOGO = u("app/src/assets/brand/mark.png");
const scenes = JSON.parse(fs.readFileSync(path.join(here, "scenes.json"), "utf8"));

const SB = '<div class="sb"><span>09.41</span><span class="sbr"><b><i style="height:40%"></i><i style="height:60%"></i><i style="height:80%"></i><i style="height:100%"></i></b><em></em></span></div>';
const phone = (f, w = 330, bg = "#fbfbfa", extra = "") => `<div class="phone" style="--w:${w}px;${extra}"><div class="scr" style="background:${bg}">${SB}<img src="${S(f)}"></div></div>`;
const chip = (t, c) => `<span class="chip" style="background:${c}">${t}</span>`;
const two = (a, b, chipT, c, title, pts) => `
  <div class="lay">
    <div class="txt">${chip(chipT, c)}<h1 class="serif">${title}</h1><ul class="pts">${pts.map((p) => `<li>${p}</li>`).join("")}</ul></div>
    <div class="phones">${a}${b}</div>
  </div>`;

const DOCK_SVG = (glow = false, phoneOn = true) => `
<svg viewBox="0 0 520 380" class="dock-svg">
  <defs><radialGradient id="g"><stop offset="0" stop-color="#f89a65" stop-opacity=".9"/><stop offset="1" stop-color="#f89a65" stop-opacity="0"/></radialGradient></defs>
  ${glow ? '<ellipse cx="260" cy="292" rx="210" ry="60" fill="url(#g)"/>' : ""}
  ${phoneOn ? '<rect x="205" y="40" width="110" height="215" rx="20" fill="#1d1d20" stroke="#4a4a4e" stroke-width="5"/><rect x="215" y="50" width="90" height="195" rx="13" fill="#111"/>' : ""}
  <path d="M70 250 Q70 230 95 230 H425 Q450 230 450 250 V300 Q450 330 420 330 H100 Q70 330 70 300 Z" fill="#2a2a2c"/>
  <rect x="190" y="246" width="140" height="10" rx="5" fill="${glow ? "#f89a65" : "#5a5a5e"}"/>
  <circle cx="405" cy="270" r="13" fill="#d1ca1f"/>
</svg>`;

const scene = {
  judul: () => `
    <div class="full yellow">
      <div class="title-l"><img class="tile" src="${LOGO}"><h1 class="serif big">SEJENAK</h1><p class="sub">Alur kerja sistem dan integrasi dengan Dok Sejenak (IoT)</p></div>
      <div class="title-r">${phone("m05-beranda.png", 330)}${phone("m07-rehat.png", 330, "#fdeee5", "transform:translateY(-40px)")}</div>
    </div>`,
  masalah: () => `
    <div class="full light pad">
      ${chip("Latar masalah", "#2a2a2c")}
      <h1 class="serif h1">Banyak yang terhubung, sedikit yang didampingi</h1>
      <div class="stats">
        <div><p class="serif n">79,5%</p><p>penetrasi internet Indonesia</p><span>APJII, 2024</span></div>
        <div><p class="serif n" style="color:#9a4517">18,4%</p><p>prevalensi kecanduan media sosial pada mahasiswa</p><span>Salari dkk.</span></div>
        <div><p class="serif n" style="color:#0d6b60">2,6%</p><p>remaja bermasalah mental yang mengakses layanan</p><span>I-NAMHS 2022</span></div>
      </div>
    </div>`,
  arsitektur: () => `
    <div class="full dark pad">
      ${chip("Arsitektur", "#fdbc22;color:#1c1606")}
      <h1 class="serif h1" style="color:#fff">Tiga lapisan, satu alur data</h1>
      <div class="arch">
        <div class="box"><h3>Aplikasi web (PWA)</h3><p>Mahasiswa</p><p>Teman Sejenak</p><p>Konselor BK</p><p>Admin kampus</p></div>
        <div class="arrow">HTTPS<br>↔</div>
        <div class="box"><h3>Server kampus</h3><p>SSO kampus (OIDC)</p><p>API + RBAC + log akses</p><p>PostgreSQL terenkripsi</p><p>Hosting dalam negeri</p></div>
        <div class="arrow">WSS<br>↔</div>
        <div class="box"><h3>Broker MQTT</h3><p>TLS 1.2</p><p>ACL per perangkat</p><p>Tanpa penyimpanan pesan</p></div>
        <div class="arrow">MQTT/TLS<br>↔</div>
        <div class="box yel"><h3>Dok Sejenak</h3><p>ESP32</p><p>Sensor IR</p><p>Cincin LED</p><p>Tombol bantuan</p></div>
      </div>
    </div>`,
  masuk: () => two(phone("m01-masuk.png"), phone("m02-persetujuan.png"), "Mulai", "#2a2a2c", "Masuk dan memberi persetujuan", ["Masuk dengan akun kampus (SSO)", "Tiga sakelar: aplikasi, Teman Sejenak, BK", "Semua mati sejak awal, bisa dicabut"]),
  cekpola: () => two(phone("m03-skrining.png"), phone("m04-hasil.png"), "Langkah 1 · Cek Pola", "#0d6b60", "Enam pertanyaan, satu gambaran", ["Skala BSMAS, satu pertanyaan per layar", "Hasil dalam bahasa sehari-hari", "Bukan diagnosis"]),
  beranda: () => two(phone("m05-beranda.png"), phone("m06-catat.png"), "Langkah 1 · Cek Pola", "#0d6b60", "Pola hari ini", ["Menit per aplikasi vs batas pribadi", "Catat durasi kurang dari 30 detik", "Tersimpan di perangkat saat luring"]),
  rehat: () => two(phone("m07-rehat.png", 330, "#fdeee5"), phone("m08-rehat-pilih.png", 330, "#fdeee5"), "Langkah 2 · Rehat", "#9a4517", "Sebentar. Untuk apa kamu membuka ini?", ["Napas 4 detik tarik, 4 detik hembus", "Pertanyaan tujuan setelah 10 detik", "Tutup dan lanjut sama besar"]),
  dok: () => `
    <div class="full light pad">
      ${chip("IoT · Dok Sejenak", "#7a5300")}
      <h1 class="serif h1">Alas ponsel yang tahu kapan ponselmu beristirahat</h1>
      <div class="dok-wrap">
        ${DOCK_SVG(false, true)}
        <ul class="callouts">
          <li><b>ESP32</b>Wi-Fi dan MQTT over TLS</li>
          <li><b>Sensor IR</b>Mendeteksi ponsel diletakkan atau diangkat</li>
          <li><b>Cincin LED WS2812</b>Lampu napas saat Rehat</li>
          <li><b>Tombol bantuan</b>Tahan 1 detik untuk kartu bantuan</li>
          <li class="no"><b>Tanpa kamera, mikrofon, GPS</b>Hanya peristiwa dan waktu</li>
        </ul>
      </div>
    </div>`,
  iot1: () => seq(1),
  iot2: () => seq(2),
  bantuan: () => two(phone("m11-krisis.png"), phone("m16-bantuan.png"), "Keselamatan", "#4f4b05", "Jalur krisis selalu terbuka", ["Tombol Bantuan di setiap layar", "Tombol fisik di dok", "Kata kunci bahaya: pesan ditahan, kartu Healing119 muncul"]),
  teman: () => two(phone("m09-teman.png"), phone("m10-obrolan.png"), "Langkah 3 · Teman Sejenak", "#4a3bb3", "Ngobrol dengan teman terlatih", ["Teks atau suara, maksimal 30 menit", "Disupervisi dosen BK", "Ringkasan disimpan atas persetujuan"]),
  rujuk: () => two(phone("m12-rujuk.png"), phone("m13-tinjauan.png"), "Langkah 4 · Rujuk dan Tinjau", "#384351", "Rujukan yang bisa dibaca dulu", ["Pratinjau persis seperti yang dibaca BK", "Tinjauan tiap 4 pekan", "Skor, rehat, dan menit bebas layar"]),
  panel: () => `
    <div class="full light pad">
      ${chip("Sisi kampus", "#384351")}
      <h1 class="serif h1">Tiga panel untuk tiga peran</h1>
      <div class="panels">
        <figure><img src="${S("d05-teman-panel.png")}"><figcaption>Teman Sejenak · antrean dan eskalasi</figcaption></figure>
        <figure><img src="${S("d06-bk.png")}"><figcaption>Konselor BK · rujukan bersetuju</figcaption></figure>
        <figure><img src="${S("d07-dasbor.png")}"><figcaption>Admin · dasbor agregat, k ≥ 10</figcaption></figure>
      </div>
    </div>`,
  privasi: () => `
    <div class="full dark pad">
      ${chip("Privasi dan keamanan", "#fdbc22;color:#1c1606")}
      <h1 class="serif h1" style="color:#fff">Data seminimal mungkin</h1>
      <div class="priv">
        <div><b>Peristiwa, bukan isi</b>Dok hanya mengirim <code>docked</code>, <code>lifted</code>, <code>help</code> beserta waktunya.</div>
        <div><b>Satu akun per dok</b>ACL membatasi tiap dok ke topik MQTT miliknya sendiri.</div>
        <div><b>Tanpa penyimpanan pesan</b>Broker meneruskan saja; server menyimpan total menit per hari.</div>
        <div><b>Persetujuan berlapis</b>Identitas dan skor terpisah, sesuai UU 27/2022 tentang PDP.</div>
      </div>
    </div>`,
  penutup: () => `
    <div class="full" style="background:#2a2a2c"><img class="bgimg" src="${u("docs/mockup/mockup-hero.png")}"></div>`,
};

function seq(step) {
  const rows = [
    ["Dok", "docked", "Broker", "→", "Aplikasi", "Mulai hitung waktu bebas layar", 1],
    ["Dok", "lifted", "Broker", "→", "Aplikasi", "Tambah menit ke catatan + buka Rehat", 2],
    ["Aplikasi", "breath", "Broker", "→", "Dok", "Cincin LED bernapas 4–4 detik", 2],
  ];
  return `
    <div class="full light pad">
      ${chip("IoT · Integrasi", "#7a5300")}
      <h1 class="serif h1">${step === 1 ? "Ponsel diletakkan" : "Ponsel diangkat"}</h1>
      <div class="seq-wrap">
        <div class="seq">
          <div class="lanes"><span>Dok Sejenak (ESP32)</span><span>Broker MQTT</span><span>Aplikasi SEJENAK</span></div>
          ${rows.map((r) => `<div class="msg ${r[6] === step ? "on" : "off"} ${r[0] === "Aplikasi" ? "rev" : ""}"><div class="line"><code>${r[1]}</code></div><p>${r[5]}</p></div>`).join("")}
          <p class="topic">Topik: <code>sejenak/dok/DOK-7F3A/event</code> dan <code>…/cmd</code></p>
        </div>
        <div class="seq-vis">${DOCK_SVG(step === 2, step === 1)}${step === 1 ? phone("m14-dok.png", 260) : phone("m07-rehat.png", 260, "#fdeee5")}</div>
      </div>
    </div>`;
}

const css = `
@font-face { font-family: Inter; src: url(${u("app/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2")}); font-weight: 100 900; }
@font-face { font-family: Serif4; src: url(${u("app/node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2")}); font-weight: 200 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1920px; height: 1080px; overflow: hidden; font-family: Inter, sans-serif; color: #1f2933; background: #f4f4f2; }
.serif { font-family: Serif4, serif; font-weight: 500; letter-spacing: -0.02em; }
.full { position: absolute; inset: 0; }
.pad { padding: 90px 120px 0; }
.light { background: #f4f4f2; } .dark { background: #2a2a2c; color: #fff; } .yellow { background: #fdbc22; color: #1c1606; }
.chip { display: inline-block; color: #fff; font-weight: 650; font-size: 22px; padding: 8px 20px; border-radius: 99px; }
.h1 { font-size: 64px; line-height: 1.1; margin-top: 26px; max-width: 1500px; }
.lay { position: absolute; inset: 0; display: grid; grid-template-columns: 760px 1fr; padding: 80px 110px 0 130px; }
.txt { padding-top: 90px; }
.txt h1 { font-size: 66px; line-height: 1.1; margin: 28px 0 40px; }
.pts { list-style: none; display: grid; gap: 22px; }
.pts li { font-size: 30px; color: #4a5360; padding-left: 40px; position: relative; line-height: 1.35; }
.pts li::before { content: ""; position: absolute; left: 0; top: 13px; width: 14px; height: 14px; border-radius: 50%; background: #fdbc22; }
.phones { display: flex; gap: 50px; justify-content: center; align-items: flex-start; padding-top: 30px; }
.phone { position: relative; width: var(--w); aspect-ratio: 390 / 891; border-radius: calc(var(--w) * .15); background: #111214; padding: calc(var(--w) * .035); box-shadow: 0 40px 70px -30px rgb(0 0 0 / .45); flex: none; }
.phone::after { content: ""; position: absolute; top: calc(var(--w) * .058); left: 50%; width: 30%; height: calc(var(--w) * .075); transform: translateX(-50%); background: #111214; border-radius: 99px; }
.scr { width: 100%; height: 100%; border-radius: calc(var(--w) * .12); overflow: hidden; display: flex; flex-direction: column; }
.sb { height: calc(var(--w) * .125); flex: none; display: flex; justify-content: space-between; align-items: center; padding: 0 9% 0 11%; font-weight: 600; font-size: calc(var(--w) * .04); color: #1f2933; }
.sbr { display: flex; gap: 6px; align-items: center; } .sbr b { display: inline-flex; gap: 2px; align-items: flex-end; height: 10px; } .sbr b i { width: 3px; background: currentColor; border-radius: 1px; }
.sbr em { width: 20px; height: 10px; border: 2px solid currentColor; border-radius: 3px; }
.scr img { width: 100%; flex: 1; min-height: 0; object-fit: cover; object-position: top; display: block; }
.title-l { position: absolute; left: 150px; top: 200px; width: 760px; }
.tile { width: 150px; height: 150px; background: #fff; border-radius: 38px; padding: 18px; box-shadow: 0 24px 40px -22px rgb(80 50 0 / .6); }
.big { font-size: 130px; line-height: 1; margin-top: 50px; }
.sub { font-size: 38px; margin-top: 26px; line-height: 1.3; color: #3b2f0a; }
.title-r { position: absolute; right: 150px; top: 120px; display: flex; gap: 50px; align-items: flex-start; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 60px; margin-top: 90px; }
.stats .n { font-size: 150px; line-height: 1; }
.stats p { font-size: 32px; margin-top: 20px; line-height: 1.3; }
.stats span { display: block; font-size: 22px; color: #626977; margin-top: 14px; }
.arch { display: flex; align-items: stretch; gap: 18px; margin-top: 70px; }
.box { flex: 1; background: #3a3b3f; border-radius: 22px; padding: 30px; }
.box h3 { font-size: 30px; margin-bottom: 18px; color: #fff; }
.box p { font-size: 24px; color: #c4cad1; padding: 8px 0; border-top: 1px solid #4a4b50; }
.box.yel { background: #fdbc22; } .box.yel h3, .box.yel p { color: #1c1606; border-color: rgb(0 0 0 / .12); }
.arrow { align-self: center; text-align: center; font-size: 20px; color: #fdbc22; font-weight: 600; line-height: 1.6; width: 90px; }
.dok-wrap { display: grid; grid-template-columns: 820px 1fr; align-items: center; margin-top: 30px; }
.dock-svg { width: 100%; }
.callouts { list-style: none; display: grid; gap: 22px; }
.callouts li { font-size: 26px; color: #4a5360; padding: 18px 26px; background: #fff; border-radius: 16px; border: 1px solid #e7e5e0; }
.callouts li b { display: block; color: #1f2933; font-size: 28px; }
.callouts li.no { background: #e3f5f2; border-color: #bfe6df; }
.seq-wrap { display: grid; grid-template-columns: 1fr 640px; gap: 50px; margin-top: 40px; }
.seq { background: #fff; border-radius: 24px; border: 1px solid #e7e5e0; padding: 34px 40px; }
.lanes { display: grid; grid-template-columns: repeat(3, 1fr); font-weight: 650; font-size: 24px; text-align: center; padding-bottom: 18px; border-bottom: 1px solid #e7e5e0; }
.msg { padding: 22px 0 6px; transition: none; }
.msg.off { opacity: .25; }
.msg .line { position: relative; height: 44px; margin: 0 16%; border-bottom: 4px solid #2a2a2c; }
.msg .line::after { content: ""; position: absolute; right: -4px; bottom: -12px; border: 10px solid transparent; border-left: 16px solid #2a2a2c; }
.msg.rev .line::after { right: auto; left: -4px; border-left-color: transparent; border-right: 16px solid #2a2a2c; }
.msg .line code { position: absolute; left: 50%; top: 0; transform: translateX(-50%); font-size: 24px; background: #fdbc22; color: #1c1606; }
.msg p { text-align: center; font-size: 24px; color: #4a5360; margin-top: 12px; }
.msg.on .line { border-color: #0d6b60; } .msg.on .line::after { border-left-color: #0d6b60; } .msg.on.rev .line::after { border-left-color: transparent; border-right-color: #0d6b60; }
.topic { font-size: 20px; color: #626977; margin-top: 24px; }
code { font-family: ui-monospace, Consolas, monospace; font-size: .9em; padding: 2px 10px; border-radius: 8px; background: #eceef1; }
.seq-vis { display: flex; flex-direction: column; align-items: center; gap: 0; position: relative; }
.seq-vis .dock-svg { width: 380px; position: absolute; left: -40px; bottom: 40px; z-index: 2; }
.seq-vis .phone { margin-left: 260px; }
.panels { display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px; margin-top: 60px; }
.panels figure { background: #fff; border-radius: 22px; padding: 16px; box-shadow: 0 30px 50px -30px rgb(0 0 0 / .35); }
.panels img { width: 100%; border-radius: 12px; display: block; }
.panels figcaption { font-size: 24px; font-weight: 600; margin: 16px 8px 6px; }
.priv { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 60px; max-width: 1500px; }
.priv div { background: #3a3b3f; border-radius: 22px; padding: 34px 38px; font-size: 27px; color: #c4cad1; line-height: 1.4; }
.priv b { display: block; color: #fdbc22; font-size: 32px; margin-bottom: 10px; }
.priv code { background: #2a2a2c; color: #fff; }
.bgimg { width: 100%; height: 100%; object-fit: cover; }
.cap { position: absolute; left: 50%; bottom: 46px; transform: translateX(-50%); max-width: 1560px; width: max-content; background: rgb(20 24 28 / .88); color: #fff; font-size: 34px; line-height: 1.38; padding: 18px 34px; border-radius: 18px; text-align: center; text-wrap: balance; }
.brandmark { position: absolute; right: 60px; top: 50px; width: 64px; height: 64px; }
`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const only = process.argv[2];
for (const [si, sc] of scenes.entries()) {
  if (only && sc.id !== only) continue;
  for (const [j, text] of sc.s.entries()) {
    const showMark = !["judul", "penutup"].includes(sc.id);
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${scene[sc.id]()}${showMark ? `<img class="brandmark" src="${LOGO}">` : ""}<div class="cap">${text}</div></body></html>`;
    const f = path.join(here, "build", "tmp.html");
    fs.writeFileSync(f, html);
    await page.goto(pathToFileURL(f).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(out, `${String(si).padStart(2, "0")}_${j}.png`) });
  }
  console.log("ok", sc.id);
}
await browser.close();
