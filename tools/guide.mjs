// Panduan penggunaan visual SEJENAK (PDF A4). node guide.mjs
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const u = (p) => pathToFileURL(path.join(root, p)).href;
const S = (f) => u(`docs/screenshots/${f}`);
const font = (p) => u(`app/node_modules/${p}`);

const phone = (f, w = 230, marks = []) => `
  <figure class="ph" style="--w:${w}px">
    <div class="ph-in"><img src="${S(f)}"></div>${marks.map(([n, x, y]) => `<span class="mk" style="left:${x}%;top:${y}%">${n}</span>`).join("")}
  </figure>`;
const desk = (f) => `<figure class="dk"><img src="${S(f)}"></figure>`;
const steps = (arr) => `<ol class="steps">${arr.map((s) => `<li>${s}</li>`).join("")}</ol>`;
const tip = (t, kind = "") => `<p class="tip ${kind}">${t}</p>`;
let pageNo = 0;
const page = (title, body, { kicker = "", color = "#2a2a2c" } = {}) => {
  pageNo++;
  return `<section class="page">
    <header class="ph-head"><span class="chip" style="background:${color}">${kicker}</span><span class="run">Panduan Penggunaan SEJENAK</span></header>
    <h2 class="serif">${title}</h2>
    ${body}
    <footer class="pf"><img src="${u("app/src/assets/brand/mark.png")}"><span>${pageNo + 1}</span></footer>
  </section>`;
};

const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(${font("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2")}); font-weight: 100 900; }
@font-face { font-family: Serif4; src: url(${font("@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2")}); font-weight: 200 900; }
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, sans-serif; color: #1f2933; font-size: 10.5pt; line-height: 1.55; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.serif { font-family: Serif4, serif; font-weight: 500; letter-spacing: -0.015em; }
.page { width: 210mm; height: 297mm; padding: 16mm 17mm 20mm; position: relative; page-break-after: always; overflow: hidden; }
.ph-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8mm; }
.chip { color: #fff; font-size: 8pt; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
.run { font-size: 8pt; color: #626977; }
h2 { font-size: 24pt; line-height: 1.15; margin-bottom: 4mm; }
h3 { font-size: 12pt; font-weight: 650; margin: 5mm 0 2mm; }
p { margin-bottom: 2.5mm; }
.lede { font-size: 11.5pt; color: #4a5360; max-width: 150mm; }
.pf { position: absolute; left: 17mm; right: 17mm; bottom: 9mm; display: flex; justify-content: space-between; align-items: center; font-size: 8pt; color: #626977; border-top: 1px solid #e7e5e0; padding-top: 3mm; }
.pf img { width: 18px; height: 18px; }
.cols { display: grid; grid-template-columns: auto 1fr; gap: 9mm; align-items: start; margin-top: 4mm; }
.cols.two-ph { grid-template-columns: 1fr 1fr; gap: 6mm 8mm; }
.cols.two-ph > div:last-child { grid-column: 1 / -1; column-count: 2; column-gap: 9mm; }
.cols.two-ph > div:last-child > * { break-inside: avoid; }
.cols.two-ph .steps { display: block; }
.cols.two-ph .steps li { margin-bottom: 2.4mm; break-inside: avoid; }
.cols.two-ph h3 { break-after: avoid; }
.cols.two-ph > div.full { column-count: 1; }
.cols.two-ph > div.full table { margin-top: 0; }
.ph { width: var(--w); flex: none; position: relative; margin: 0 auto; }
.ph-in { position: relative; border-radius: 26px; overflow: hidden; border: 7px solid #17181a; box-shadow: 0 10px 24px -14px rgb(0 0 0 / .5); }
.ph-in img { width: 100%; display: block; }
.mk { position: absolute; width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 50%; background: #fdbc22; color: #1c1606; font-weight: 700; font-size: 9pt; display: grid; place-items: center; box-shadow: 0 0 0 3px #fff, 0 2px 6px rgb(0 0 0 / .3); }
.dk.crop img { height: var(--h, 52mm); object-fit: cover; object-position: top left; }
.dk img { width: 100%; display: block; border-radius: 8px; border: 1px solid #e7e5e0; box-shadow: 0 10px 24px -16px rgb(0 0 0 / .4); }
.steps { list-style: none; counter-reset: s; display: grid; gap: 2.6mm; }
.steps li { counter-increment: s; position: relative; padding-left: 9mm; }
.steps li::before { content: counter(s); position: absolute; left: 0; top: 0; width: 6mm; height: 6mm; border-radius: 50%; background: #2a2a2c; color: #fff; font-size: 8pt; font-weight: 700; display: grid; place-items: center; }
.legend { list-style: none; display: grid; gap: 2.2mm; }
.legend li { display: grid; grid-template-columns: 7mm 1fr; align-items: start; }
.legend b.n { width: 5.5mm; height: 5.5mm; border-radius: 50%; background: #fdbc22; color: #1c1606; font-size: 8pt; display: grid; place-items: center; }
.tip { background: #f4f4f2; border-radius: 8px; padding: 3mm 4mm; font-size: 9.5pt; color: #4a5360; margin-top: 4mm; }
.tip.help { background: #f7f5cf; color: #4f4b05; border: 1px solid #e3dd78; }
.tip.teal { background: #e3f5f2; color: #0d6b60; }
table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 3mm; }
th, td { text-align: left; padding: 2.2mm 3mm; border-bottom: 1px solid #e7e5e0; vertical-align: top; }
th { background: #f4f4f2; font-weight: 600; }
.cover { background: #fdbc22; padding: 0; color: #1c1606; }
.cover .in { padding: 22mm 20mm; height: 100%; display: flex; flex-direction: column; }
.cover .tile { width: 34mm; height: 34mm; background: #fff; border-radius: 9mm; padding: 4mm; box-shadow: 0 12px 30px -16px rgb(80 50 0 / .6); }
.cover h1 { font-size: 40pt; line-height: 1.05; margin-top: 18mm; }
.cover .sub { font-size: 13pt; margin-top: 6mm; max-width: 130mm; color: #3b2f0a; }
.cover .img { margin-top: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 20px 40px -20px rgb(60 40 0 / .6); }
.cover .img img { width: 100%; display: block; }
.cover .meta { display: flex; justify-content: space-between; font-size: 9pt; margin-top: 8mm; color: #3b2f0a; }
.cycle { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-top: 5mm; }
.cycle div { border-radius: 10px; padding: 4mm; color: #1f2933; }
.cycle b { display: block; font-size: 11pt; margin: 1mm 0; }
.cycle span { font-size: 8pt; font-weight: 700; }
.roles { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-top: 3mm; }
.roles div { border: 1px solid #e7e5e0; border-radius: 10px; padding: 3.5mm 4mm; }
.roles b { display: block; }
.toc { list-style: none; columns: 2; column-gap: 10mm; margin-top: 3mm; }
.toc li { display: flex; justify-content: space-between; padding: 1.6mm 0; border-bottom: 1px dotted #cfccc5; break-inside: avoid; }
.flow { display: flex; align-items: center; gap: 2mm; margin: 4mm 0; flex-wrap: wrap; }
.flow div { background: #f4f4f2; border-radius: 8px; padding: 2.5mm 3.5mm; font-size: 9pt; font-weight: 600; }
.flow i { font-style: normal; color: #626977; }
.dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 6px; vertical-align: 0; }
.faq dt { font-weight: 650; margin-top: 3.5mm; }
.faq dd { color: #4a5360; margin-top: 1mm; }
</style></head><body>

<section class="page cover"><div class="in">
  <img class="tile" src="${u("app/src/assets/brand/mark.png")}">
  <h1 class="serif">Panduan Penggunaan SEJENAK</h1>
  <p class="sub">Cara memakai aplikasi kebiasaan digital sehat untuk mahasiswa, Teman Sejenak, konselor BK, dan admin kampus, termasuk Dok Sejenak.</p>
  <div class="img"><img src="${u("docs/mockup/mockup-siklus.png")}"></div>
  <div class="meta"><span>Versi 1.0 · uji coba pilot</span><span>Muhammad Yusuf Arrayyan · Universitas Bengkulu</span></div>
</div></section>

${page("Kenalan dengan SEJENAK", `
  <p class="lede">SEJENAK artinya berhenti sebentar untuk memeriksa kebiasaan sendiri. Aplikasi ini membantumu melihat pola media sosial, memberi jeda saat batas pribadi terlewati, dan menghubungkanmu dengan manusia saat kamu butuh teman bicara.</p>
  <div class="cycle">
    <div style="background:#e3f5f2"><span style="color:#0d6b60">LANGKAH 1</span><b>Cek Pola</b>Skrining 6 pertanyaan dan catatan durasi per aplikasi.</div>
    <div style="background:#fdeee5"><span style="color:#9a4517">LANGKAH 2</span><b>Rehat</b>Jeda napas 10 detik saat batasmu terlewati.</div>
    <div style="background:#efedfd"><span style="color:#4a3bb3">LANGKAH 3</span><b>Teman Sejenak</b>Obrolan 30 menit dengan konselor sebaya.</div>
    <div style="background:#eceef1"><span style="color:#384351">LANGKAH 4</span><b>Rujuk dan Tinjau</b>Rujukan ke BK dan tinjauan tiap 4 pekan.</div>
  </div>
  <h3>Empat peran dalam satu sistem</h3>
  <div class="roles">
    <div><b>Mahasiswa</b>Melihat pola sendiri, rehat, menjadwalkan obrolan, meminta rujukan.</div>
    <div><b>Teman Sejenak</b>Menangani antrean pendampingan, menulis ringkasan, eskalasi ke penyelia.</div>
    <div><b>Konselor BK</b>Menerima rujukan yang sudah disetujui mahasiswa dan menjadwalkan temu.</div>
    <div><b>Admin kampus</b>Melihat dasbor agregat tanpa identitas, kelompok kurang dari 10 orang disembunyikan.</div>
  </div>
  <h3>Isi panduan</h3>
  <ul class="toc">
    ${["Memulai dan persetujuan|3", "Skrining dan hasil|4", "Beranda|5", "Catat durasi dan Rehat|6", "Teman Sejenak|7", "Saat butuh bantuan|8", "Rujukan dan Tinjauan|9", "Dok Sejenak (IoT)|10", "Menu Saya dan privasi|12", "Panel Teman Sejenak dan BK|13", "Dasbor admin kampus|14", "Pertanyaan umum|15"].map((x) => { const [a, b] = x.split("|"); return `<li><span>${a}</span><span>${b}</span></li>`; }).join("")}
  </ul>
  ${tip("SEJENAK bukan alat diagnosis dan tidak menggantikan layanan profesional. Untuk keadaan mendesak, tekan tombol <b>Bantuan</b> yang selalu ada di pojok kanan atas.", "help")}
`, { kicker: "Pengantar" })}

${page("Memulai dan memberi persetujuan", `
  <div class="cols two-ph">
    ${phone("m01-masuk.png", 232)}
    ${phone("m02-persetujuan.png", 232)}
    <div>
      ${steps([
        "Buka SEJENAK di peramban ponsel atau laptop. Untuk memasang sebagai aplikasi, pilih <b>Tambahkan ke Layar Utama</b> dari menu peramban.",
        "Tekan <b>Masuk dengan akun kampus</b>. Kamu akan diarahkan ke SSO kampus.",
        "Pilih apa yang mau dibagikan. Ketiga sakelar <b>mati sejak awal</b>.",
        "Nyalakan sakelar pertama agar SEJENAK bisa menyimpan datamu. Dua sakelar lain boleh dibiarkan mati.",
        "Tekan <b>Lanjut ke 6 pertanyaan singkat</b>.",
      ])}
      <h3>Arti tiap sakelar</h3>
      <table><tr><th>Sakelar</th><th>Yang dibagikan</th></tr>
        <tr><td>Pakai SEJENAK</td><td>Disimpan di akunmu saja</td></tr>
        <tr><td>Teman Sejenak</td><td>Ringkasan yang kamu setujui</td></tr>
        <tr><td>Rujukan BK</td><td>Rujukan setelah kamu baca dan setujui</td></tr></table>
      ${tip("Mode demo: di halaman masuk, pilih peran lalu tekan <b>Buka sebagai … (data contoh)</b> untuk mencoba tanpa akun.")}
    </div>
  </div>
`, { kicker: "Mahasiswa", color: "#0d6b60" })}

${page("Skrining 6 pertanyaan dan hasilnya", `
  <div class="cols two-ph">
    ${phone("m03-skrining.png", 232)}
    ${phone("m04-hasil.png", 232)}
    <div>
      ${steps([
        "Setiap layar berisi satu pertanyaan. Pilih seberapa sering hal itu terjadi dalam setahun terakhir.",
        "Pilihanmu langsung tersimpan dan layar berpindah ke pertanyaan berikutnya. Tekan <b>Kembali</b> untuk mengubah jawaban.",
        "Setelah pertanyaan keenam, kamu melihat <b>pola kamu saat ini</b> dalam bahasa sehari-hari.",
        "Tekan <b>Atur batas pribadi</b> untuk menentukan berapa menit yang terasa cukup per aplikasi.",
      ])}
      <h3>Tiga gambaran pola</h3>
      <p><span class="dot" style="background:#2cb1a1"></span><b>Cukup seimbang</b> (skor 6–12)</p>
      <p><span class="dot" style="background:#fdbc22"></span><b>Layak diperhatikan</b> (13–18)</p>
      <p><span class="dot" style="background:#f89a65"></span><b>Cukup kuat</b> (19–30). Muncul ajakan bicara dengan Teman Sejenak.</p>
      ${tip("Pertanyaan berbasis Bergen Social Media Addiction Scale (BSMAS). Batas skor masih batas sementara uji coba dan bukan diagnosis.", "teal")}
    </div>
  </div>
`, { kicker: "Mahasiswa · Cek Pola", color: "#0d6b60" })}

${page("Beranda", `
  <div class="cols">
    ${phone("m05-beranda.png", 280, [[1, 62, 4.8], [2, 0, 12], [3, 0, 25.5], [4, 0, 50], [5, 0, 71], [6, 51, 75], [7, 0, 89.5], [8, 0, 96.5]])}
    <div>
      <p class="lede">Beranda menjawab satu pertanyaan: bagaimana pola hari ini?</p>
      <ul class="legend">
        <li><b class="n">1</b><span><b>Bantuan</b>: jalur krisis yang selalu tampil di setiap layar.</span></li>
        <li><b class="n">2</b><span>Sapaan sesuai waktu, tanpa angka atau peringatan.</span></li>
        <li><b class="n">3</b><span><b>Pola hari ini</b>: total menit dibanding total batas pribadimu, beserta gambaran pola terakhir.</span></li>
        <li><b class="n">4</b><span>Batang per aplikasi. Garis tegak menandai batas pribadimu.</span></li>
        <li><b class="n">5</b><span><b>Catat durasi</b>: menyalin angka Waktu Layar ponsel ke SEJENAK.</span></li>
        <li><b class="n">6</b><span><b>Rehat 10 detik</b>: jeda kapan saja, tanpa harus melewati batas.</span></li>
        <li><b class="n">7</b><span>Status <b>Dok Sejenak</b> dan menit bebas layar hari ini. Di bawahnya ada jadwal Teman Sejenak dan Tinjauan.</span></li>
        <li><b class="n">8</b><span>Navigasi: Beranda, Teman Sejenak, Tinjauan, Saya.</span></li>
      </ul>
      ${tip("Di laptop, navigasi pindah ke sisi kiri dan kartu Dok, Teman Sejenak, serta Tinjauan tampil di kolom kanan.")}
    </div>
  </div>
`, { kicker: "Mahasiswa", color: "#0d6b60" })}

${page("Catat durasi, lalu Rehat bila perlu", `
  <div class="cols two-ph">
    ${phone("m06-catat.png", 232)}
    ${phone("m08-rehat-pilih.png", 232)}
    <div>
      <h3 style="margin-top:0">Mencatat (kurang dari 30 detik)</h3>
      ${steps([
        "Buka Waktu Layar (iPhone) atau Kesejahteraan Digital (Android) untuk melihat menit per aplikasi.",
        "Di SEJENAK, tekan <b>Catat durasi</b>, pilih aplikasi, atur menit dengan tombol − + atau pilihan cepat.",
        "Tekan <b>Simpan catatan</b>. Saat luring, catatan tersimpan di perangkat dan dikirim saat tersambung.",
      ])}
      <h3>Rehat</h3>
      ${steps([
        "Jika catatan melewati batas, layar Rehat terbuka. Ikuti lingkaran: tarik napas 4 detik, hembuskan 4 detik.",
        "Setelah 10 detik, jawab <b>Untuk apa kamu membuka ini?</b> (boleh dilewati).",
        "Pilih <b>Tutup dulu</b> atau <b>Lanjut dengan sadar</b>. Keduanya sama besar dan sama sah.",
      ])}
      ${tip("Yang tercatat hanya waktu dan pilihanmu, tidak pernah isi aplikasi. Saat Dok Sejenak terpasang, lampunya ikut bernapas.")}
    </div>
  </div>
`, { kicker: "Mahasiswa · Rehat", color: "#9a4517" })}

${page("Teman Sejenak", `
  <div class="cols two-ph">
    ${phone("m09-teman.png", 232)}
    ${phone("m10-obrolan.png", 232)}
    <div>
      ${steps([
        "Buka tab <b>Teman Sejenak</b>. Pastikan persetujuan berbagi ringkasan sudah menyala.",
        "Pilih teman tertentu atau <b>Siapa saja</b> untuk yang paling cepat tersedia.",
        "Pilih hari dan jam, lalu jenis obrolan: <b>Teks</b> atau <b>Suara</b>. Tekan <b>Jadwalkan</b>.",
        "Pengingat dikirim ke surel kampus. Saat waktunya tiba, buka jadwal dari daftar <b>Jadwal kamu</b>.",
        "Sesi berlangsung maksimal 30 menit; sisa waktu tampil di kanan atas.",
        "Setelah sesi, Teman Sejenak mengirim ringkasan singkat. Ringkasan baru tersimpan setelah kamu setujui.",
      ])}
      ${tip("Teman Sejenak adalah mahasiswa terlatih di bawah supervisi dosen BK, bukan psikolog. Mereka tidak menangani krisis.")}
    </div>
  </div>
`, { kicker: "Mahasiswa · Teman Sejenak", color: "#4a3bb3" })}

${page("Saat kamu butuh bantuan sekarang", `
  <div class="cols two-ph">
    ${phone("m11-krisis.png", 232)}
    ${phone("m16-bantuan.png", 232)}
    <div>
      <p class="lede">Ada tiga cara membuka kartu bantuan:</p>
      ${steps([
        "Tekan <b>Bantuan</b> di pojok kanan atas layar mana pun.",
        "Saat menulis di obrolan, kata-kata yang menandakan bahaya membuat SEJENAK <b>menahan pesan itu</b> dan langsung menampilkan kartu bantuan. Pesan tidak diteruskan ke Teman Sejenak.",
        "Tahan <b>tombol kuning di Dok Sejenak</b> selama 1 detik.",
      ])}
      <h3>Isi kartu bantuan</h3>
      <table><tr><th>Jalur</th><th>Cara</th></tr>
        <tr><td>Healing119</td><td>Telepon 119, lalu tekan 8.</td></tr>
        <tr><td>BK kampus</td><td>Minta dihubungi lewat rujukan</td></tr>
        <tr><td>Bahaya langsung</td><td>Hubungi 112 atau orang terdekat</td></tr></table>
      ${tip("Membuka kartu bantuan tidak memberi tahu siapa pun secara otomatis. Kamu yang memilih jalur mana yang dihubungi.", "help")}
    </div>
  </div>
`, { kicker: "Keselamatan", color: "#4f4b05" })}

${page("Rujukan ke BK dan Tinjauan 4 pekan", `
  <div class="cols two-ph">
    ${phone("m12-rujuk.png", 232)}
    ${phone("m13-tinjauan.png", 232)}
    <div>
      <h3 style="margin-top:0">Rujukan</h3>
      ${steps([
        "Buka <b>Saya → Rujukan ke BK</b>, atau dari ringkasan Teman Sejenak.",
        "Baca pratinjau: inilah yang akan dibaca konselor. Tekan <b>Ubah</b> untuk menulis alasan dengan kata-katamu.",
        "Pilih apakah skor pola dan ringkasan Teman Sejenak ikut dikirim.",
        "Nyalakan persetujuan terakhir, lalu tekan <b>Kirim rujukan</b>. BK menghubungi lewat surel kampus dalam 2 hari kerja.",
      ])}
      <h3>Tinjauan</h3>
      ${steps([
        "Grafik menunjukkan skor pola tiap pekan dengan pita warna seimbang, perlu diperhatikan, dan cukup kuat.",
        "Lihat jumlah rehat yang kamu tutup, menit bebas layar di dok, dan rata-rata media sosial per hari.",
        "Tulis refleksi, lalu pilih <b>lanjutkan</b> atau <b>ubah rencana</b>.",
      ])}
    </div>
  </div>
`, { kicker: "Mahasiswa · Rujuk dan Tinjau", color: "#384351" })}

${page("Dok Sejenak: memasang dan memakai", `
  <div class="cols">
    ${phone("m14-dok.png", 270)}
    <div>
      <p class="lede">Dok Sejenak adalah alas ponsel berbasis ESP32. Karena aplikasi web tidak bisa membaca durasi aplikasi lain, dok ini mencatat sisi sebaliknya: kapan ponselmu beristirahat.</p>
      <h3>Memasangkan</h3>
      ${steps([
        "Colokkan dok ke pengisi daya USB. Lampu berkedip kuning pelan saat mencari jaringan.",
        "Buka <b>Saya → Dok Sejenak</b>, ketik kode di stiker bawah dok (contoh <b>DOK-7F3A</b>), tekan <b>Pasangkan</b>.",
        "Status berubah menjadi <b>Tersambung</b> dengan titik hijau.",
      ])}
      <h3>Sehari-hari</h3>
      ${steps([
        "Letakkan ponsel di dok saat belajar atau sebelum tidur. Menit bebas layar mulai dihitung.",
        "Saat ponsel diangkat, menitnya masuk ke catatan hari ini dan layar Rehat terbuka.",
        "Matikan fitur mana pun di <b>Pengaturan dok</b>.",
      ])}
      ${tip("Mode demo memakai <b>Simulator</b>: tekan Letakkan ponsel, Angkat ponsel, atau Tekan tombol bantuan untuk melihat alurnya tanpa perangkat.")}
    </div>
  </div>
`, { kicker: "IoT", color: "#7a5300" })}

${page("Dok Sejenak: cara kerja dan arti lampu", `
  <p class="lede">Dok dan aplikasi berbicara lewat broker MQTT kampus yang terenkripsi TLS. Yang berpindah hanya jenis peristiwa dan waktunya.</p>
  <div class="flow"><div>Sensor IR + tombol</div><i>→</i><div>ESP32 Dok</div><i>→ MQTT TLS →</i><div>Broker kampus</div><i>→ WSS →</i><div>PWA SEJENAK</div><i>→</i><div>Catatan harian</div></div>
  <table>
    <tr><th>Peristiwa dari dok</th><th>Yang terjadi di aplikasi</th></tr>
    <tr><td><code>docked</code> ponsel diletakkan</td><td>Waktu bebas layar mulai dihitung</td></tr>
    <tr><td><code>lifted</code> ponsel diangkat</td><td>Menit ditambahkan ke catatan hari ini; layar Rehat terbuka</td></tr>
    <tr><td><code>help</code> tombol ditahan 1 detik</td><td>Kartu bantuan terbuka di ponsel</td></tr>
    <tr><td><code>heartbeat</code> tiap 60 detik</td><td>Status Tersambung tetap hijau</td></tr>
  </table>
  <table>
    <tr><th>Perintah dari aplikasi</th><th>Yang dilakukan dok</th></tr>
    <tr><td><code>breath</code></td><td>Cincin LED bernapas 4 detik terang, 4 detik redup selama Rehat</td></tr>
    <tr><td><code>config</code></td><td>Mengikuti sakelar di Pengaturan dok</td></tr>
  </table>
  <h3>Arti lampu</h3>
  <table>
    <tr><th>Lampu</th><th>Arti</th></tr>
    <tr><td><span class="dot" style="background:#fdbc22"></span>Kuning redup</td><td>Siap, ponsel tidak di dok</td></tr>
    <tr><td><span class="dot" style="background:#fdbc22"></span>Kuning berkedip pelan</td><td>Mencari Wi-Fi atau broker</td></tr>
    <tr><td><span class="dot" style="background:#2cb1a1"></span>Teal redup</td><td>Ponsel sedang di dok</td></tr>
    <tr><td><span class="dot" style="background:#f89a65"></span>Koral bernapas</td><td>Rehat sedang berlangsung</td></tr>
    <tr><td><span class="dot" style="background:#d1ca1f"></span>Kuning-hijau berkedip</td><td>Tombol bantuan baru ditekan</td></tr>
  </table>
  ${tip("Dok tidak punya kamera, mikrofon, atau GPS. Detail perangkat keras dan firmware ada di folder <b>iot/</b> repositori.", "teal")}
`, { kicker: "IoT", color: "#7a5300" })}

${page("Menu Saya, privasi, dan mode gelap", `
  <div class="cols two-ph">
    ${phone("m15-saya.png", 200)}
    ${phone("m17-gelap.png", 200)}
    <div class="full">
      <table><tr><th>Menu</th><th>Fungsi</th></tr>
        <tr><td>Persetujuan data</td><td>Menyalakan atau mencabut tiga sakelar kapan saja</td></tr>
        <tr><td>Batas pribadi</td><td>Mengubah menit per aplikasi yang memicu Rehat</td></tr>
        <tr><td>Dok Sejenak</td><td>Memasangkan, mengatur, atau melepas dok</td></tr>
        <tr><td>Rujukan ke BK</td><td>Pratinjau, kirim, atau batalkan rujukan</td></tr>
        <tr><td>Tampilan</td><td>Ikuti perangkat, Terang, atau Gelap</td></tr>
        <tr><td>Unduh dataku</td><td>Mengunduh semua datamu dalam berkas JSON</td></tr>
        <tr><td>Hapus akun dan data</td><td>Ketik HAPUS untuk mengonfirmasi; data dihapus dalam 7 hari</td></tr></table>
      <h3>Yang tidak pernah disimpan</h3>
      <p>Isi aplikasi yang kamu buka, isi obrolan di dasbor kampus, lokasi, dan kontak. Identitas dan skor disimpan terpisah dan dienkripsi (UU 27/2022 tentang Pelindungan Data Pribadi).</p>
    </div>
  </div>
`, { kicker: "Mahasiswa · Saya", color: "#0d6b60" })}

${page("Panel Teman Sejenak dan panel BK", `
  <h3 style="margin-top:0">Teman Sejenak</h3>
  <figure class="dk crop" style="--h:66mm"><img src="${S("d05-teman-panel.png")}"></figure>
  ${steps([
    "Pilih nama samaran mahasiswa di antrean untuk melihat topik dan status persetujuan.",
    "Tulis <b>catatan terbatas</b> tanpa identitas, maksimal 400 karakter, lalu <b>Kirim ringkasan</b> untuk disetujui mahasiswa.",
    "Bila ada tanda bahaya atau topik di luar kewenangan, tekan <b>Eskalasi ke penyelia</b> dan pilih alasannya. Panduan lengkap ada di menu <b>Panduan</b>.",
  ])}
  <h3>Konselor BK</h3>
  <figure class="dk crop"><img src="${S("d06-bk.png")}"></figure>
  <p style="margin-top:3mm">Saring rujukan berdasarkan status, baca alasan dalam kata-kata mahasiswa, lalu tekan <b>Jadwalkan temu</b>. Identitas baru terbuka setelah mahasiswa menerima undangan, dan setiap akses tercatat di log audit.</p>
`, { kicker: "Teman Sejenak · BK", color: "#4a3bb3" })}

${page("Dasbor agregat untuk admin kampus", `
  ${desk("d07-dasbor.png")}
  <h3>Membaca dasbor</h3>
  ${steps([
    "Ringkasan atas: jumlah peserta pilot, sesi Teman Sejenak, rujukan ke BK, dan siklus berjalan.",
    "<b>Sebaran pola</b>: proporsi seimbang, perlu diperhatikan, dan cukup kuat.",
    "<b>Per fakultas</b>: saring dengan menu di kanan atas. Kelompok dengan <b>kurang dari 10 peserta disembunyikan</b> agar tidak ada yang bisa dikenali.",
    "<b>Gerbang uji coba</b>: pengguna aktif pekan 4 (≥ 60%), SUS (≥ 68), perubahan skor BSMAS (turun ≥ 0,2 SD), dan insiden data (0). Perluasan hanya bila keempatnya terpenuhi.",
  ])}
  ${tip("Dasbor tidak pernah menampilkan nama, NIM, isi obrolan, atau catatan harian perorangan.", "teal")}
`, { kicker: "Admin kampus", color: "#384351" })}

${page("Pertanyaan umum", `
  <dl class="faq">
    <dt>Apakah SEJENAK membaca aplikasi lain di ponselku?</dt><dd>Tidak. Aplikasi web memang tidak bisa melakukannya. Kamu menyalin angka sendiri, dan Dok Sejenak hanya tahu kapan ponsel diletakkan atau diangkat.</dd>
    <dt>Apakah dosen atau kampus bisa melihat skorku?</dt><dd>Tidak secara perorangan. Kampus hanya melihat angka kelompok berisi 10 orang atau lebih. Konselor BK hanya melihat rujukan yang kamu kirim sendiri.</dd>
    <dt>Bagaimana kalau aku melewati batas terus?</dt><dd>Tidak ada hukuman, streak, atau peringatan merah. Rehat hanya mengajakmu berhenti 10 detik. Kamu boleh memilih lanjut.</dd>
    <dt>Koneksi terputus saat mencatat.</dt><dd>Catatanmu tersimpan di perangkat dan dikirim saat tersambung.</dd>
    <dt>Dok tidak tersambung.</dt><dd>Pastikan dok mendapat daya dan Wi-Fi kampus aktif (lampu kuning berkedip berarti masih mencari). Cabut lalu colok ulang. Bila tetap gagal, lepas pasangan dan pasangkan lagi dengan kode di stiker.</dd>
    <dt>Bagaimana mencabut persetujuan atau menghapus data?</dt><dd>Buka Saya → Persetujuan data untuk mencabut, atau Saya → Hapus akun dan data untuk menghapus semuanya.</dd>
    <dt>Aku ingin menjadi Teman Sejenak.</dt><dd>Hubungi layanan BK kampus. Teman Sejenak mengikuti pelatihan baku dan disupervisi dosen BK.</dd>
  </dl>
  ${tip("Jika kamu atau temanmu dalam bahaya, jangan menunggu jadwal. Telepon Healing119 (119, lalu 8) atau 112.", "help")}
`, { kicker: "Bantuan", color: "#2a2a2c" })}

</body></html>`;

const outDir = path.join(root, "docs");
const tmp = path.join(root, "tools/out"); fs.mkdirSync(tmp, { recursive: true });
const file = path.join(tmp, "panduan.html");
fs.writeFileSync(file, html);
const browser = await chromium.launch();
const p = await browser.newPage();
await p.goto(pathToFileURL(file).href, { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: path.join(outDir, "Panduan-Penggunaan-SEJENAK.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
// pratinjau halaman sebagai PNG untuk pemeriksaan
if (process.argv[2] === "--preview") {
  await p.setViewportSize({ width: 794, height: 1123 });
  const n = await p.locator(".page").count();
  for (let i = 0; i < n; i++) await p.locator(".page").nth(i).screenshot({ path: path.join(tmp, `p${String(i + 1).padStart(2, "0")}.png`) });
}
await browser.close();
console.log("PDF selesai");
