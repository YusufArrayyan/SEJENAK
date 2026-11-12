# PRD SEJENAK: Platform Kebiasaan Digital Sehat Mahasiswa

Versi 1.0 | Status: rancangan untuk uji coba 12 bulan | Penulis: Muhammad Yusuf Arrayyan (Universitas Bengkulu)

> Dokumen ini menjabarkan sistem di balik esai "SEJENAK". Semua target adalah target uji coba, bukan hasil. SEJENAK tidak mendiagnosis dan tidak menggantikan layanan profesional.

## 1. Ringkasan

**SEJENAK** (berhenti sebentar untuk memeriksa kebiasaan sendiri) adalah aplikasi web progresif (PWA) yang membantu mahasiswa mengenali pola penggunaan media sosial, memberi rehat reflektif saat batas pribadi terlewati, menghubungkan mahasiswa dengan konselor sebaya, dan merujuk ke layanan Bimbingan dan Konseling (BK) kampus atas persetujuan.

**Siklus empat langkah**

| No | Langkah | Fungsi |
|---|---|---|
| 01 | Cek Pola | Skrining singkat berbasis BSMAS dan catatan durasi per aplikasi (manual) |
| 02 | Rehat | Jeda 10 detik dan pertanyaan tujuan sebelum lanjut |
| 03 | Teman Sejenak | Obrolan terjadwal dengan konselor sebaya di bawah supervisi dosen BK |
| 04 | Rujuk dan Tinjau | Rujukan ke BK atas persetujuan, tinjauan hasil tiap 4 pekan |

## 2. Latar masalah dan tujuan

- Penetrasi internet 79,5% (APJII, 2024); prevalensi kecanduan media sosial mahasiswa 18,4% (Salari et al.); hanya 2,6% remaja bermasalah mental yang mengakses layanan (I-NAMHS 2022).
- Alat waktu layar memantau tetapi tidak mendampingi.

**Tujuan produk**
1. Mahasiswa mengenali pola penggunaan dalam kurang dari 3 menit pertama.
2. Mahasiswa yang membutuhkan pendampingan dapat berbicara dengan manusia dalam 48 jam.
3. BK kampus melihat gambaran agregat tanpa identitas.
4. Nol kebocoran data pribadi.

**Bukan tujuan (non-goals)**: diagnosis, penanganan krisis oleh konselor sebaya, pembacaan otomatis durasi aplikasi lain (tidak mungkin pada PWA), pemantauan tanpa persetujuan.

## 3. Pengguna dan peran

| Peran | Kebutuhan utama | Hak akses |
|---|---|---|
| Mahasiswa | Memahami pola, mendapat dukungan tanpa stigma | Data sendiri |
| Teman Sejenak (konselor sebaya, sekitar 20 orang pilot) | Daftar pendampingan, panduan percakapan, eskalasi | Ringkasan yang disetujui mahasiswa |
| Konselor BK / dosen penyelia | Menerima rujukan, supervisi, tinjau kasus | Rujukan bersetuju, catatan supervisi |
| Admin kampus | Dasbor agregat, kelola cohort | Angka agregat dengan batas minimal k = 10 |
| Peneliti | Data evaluasi pilot | Data teranonimkan, sesuai persetujuan etik |

**Persona**
- *Raka, semester 3*: tugas serba daring, sering gulir malam hari, malu bertemu konselor. Butuh jalur ringan dan anonim di awal.
- *Dewi, konselor sebaya*: relawan organisasi mahasiswa. Butuh panduan jelas dan batas tugas yang tegas.
- *Bu Sari, dosen BK*: waktu terbatas. Butuh rujukan terstruktur, bukan obrolan mentah.

## 4. Ruang lingkup

**MVP (bulan 3 sampai 4)**: akun kampus (SSO), skrining BSMAS, pencatatan durasi manual, rehat, obrolan terjadwal dengan Teman Sejenak, rujukan ke BK, dasbor agregat, persetujuan data.
**Tahap 2**: pengingat adaptif, modul literasi, ekspor laporan untuk BK.
**Di luar cakupan**: konten konsultasi medis, integrasi pembayaran, pembacaan data sistem operasi.

## 5. Kebutuhan fungsional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| F-01 | Masuk dengan akun kampus; peran ditetapkan admin | Wajib |
| F-02 | Persetujuan eksplisit berlapis (pakai aplikasi, bagikan ke konselor sebaya, bagikan ke BK); dapat dicabut | Wajib |
| F-03 | Skrining BSMAS 6 butir dan hasil dengan bahasa non-diagnostik | Wajib |
| F-04 | Catat durasi per aplikasi secara manual (cepat, kurang dari 30 detik) dan tetapkan batas pribadi | Wajib |
| F-05 | Rehat: layar 10 detik, napas, pertanyaan tujuan, pilihan "lanjut" atau "tutup" | Wajib |
| F-06 | Jadwalkan obrolan dengan Teman Sejenak; teks atau suara; batas 30 menit | Wajib |
| F-07 | Kata kunci krisis memicu kartu bantuan: BK dan Healing119 (119 ekstensi 8); Teman Sejenak tidak menangani krisis | Wajib |
| F-08 | Rujukan ke BK dengan ringkasan yang bisa dibuka mahasiswa sebelum dikirim | Wajib |
| F-09 | Tinjauan tiap 4 pekan: grafik skor dan catatan refleksi | Wajib |
| F-10 | Dasbor agregat (sebaran risiko, beban layanan) tanpa identitas, k minimal 10 | Wajib |
| F-11 | Panel Teman Sejenak: antrean, catatan terbatas, tombol eskalasi | Wajib |
| F-12 | Hapus akun dan data atas permintaan | Wajib |
| F-13 | Pengingat lembut dan undangan lewat surel kampus | Seharusnya |
| F-14 | Modul literasi kebiasaan digital | Dapat ditunda |

**Kisah pengguna (contoh)**
- Sebagai mahasiswa, saya ingin tahu pola saya tanpa dihakimi, supaya saya bisa memutuskan sendiri apa yang perlu diubah.
- Sebagai Teman Sejenak, saya ingin tahu kapan harus eskalasi, supaya saya tidak menangani hal di luar kewenangan.
- Sebagai konselor BK, saya ingin menerima rujukan beserta alasan dan persetujuan, supaya saya dapat langsung bertindak.

## 6. Kebutuhan non-fungsional

- **Privasi**: data kesehatan = data pribadi spesifik; persetujuan eksplisit (UU 27/2022 Pasal 4 dan 20). Data pribadi pada akun mahasiswa, enkripsi saat transit dan saat disimpan, pemisahan identitas dan skor.
- **Keamanan**: RBAC, log akses, audit tahunan, tanpa pelacak pihak ketiga.
- **Kinerja**: halaman utama dimuat kurang dari 2,5 detik pada 4G; PWA dapat dipasang dan bekerja luring untuk pencatatan.
- **Aksesibilitas**: WCAG 2.2 AA, target sentuh minimal 44 px, dukungan pembaca layar, kontras teks minimal 4,5:1, hormati `prefers-reduced-motion`.
- **Ketersediaan**: 99% pada jam kampus; jalur krisis tetap tampil walau fitur lain gagal.
- **Bahasa**: Bahasa Indonesia baku yang hangat, tanpa istilah klinis berat.

## 7. Arsitektur informasi

```
Beranda
├── Cek Pola      (skrining, catatan harian)
├── Rehat         (pengaturan batas, latihan napas)
├── Teman Sejenak   (jadwal, obrolan)
├── Tinjauan      (grafik 4 pekan, refleksi)
└── Saya          (persetujuan, privasi, bantuan, keluar)
Panel Teman Sejenak  (antrean, panduan, eskalasi)
Panel BK           (rujukan, supervisi)
Dasbor Agregat     (admin kampus)
```

Navigasi mahasiswa: 4 tab bawah (Beranda, Teman Sejenak, Tinjauan, Saya); Cek Pola dan Rehat diakses dari Beranda.

## 8. Alur pengguna utama

1. **Onboarding**: Masuk SSO → pilih apa yang dibagikan (3 sakelar, semua mati bawaan) → skrining 6 butir → hasil "pola Anda" → atur batas pribadi.
2. **Rehat**: Batas terlewati → layar rehat 10 detik → pertanyaan "Untuk apa kamu membuka ini?" → lanjut atau tutup → tercatat tanpa konten.
3. **Teman Sejenak**: Pilih waktu → pilih teman (atau acak) → obrolan → ringkas catatan → eskalasi jika perlu.
4. **Rujuk**: Mahasiswa atau Teman Sejenak mengusulkan rujukan → pratinjau ringkasan → persetujuan → BK menerima → jadwal temu.
5. **Tinjauan 4 pekan**: Skor BSMAS, jumlah rehat, refleksi → keputusan lanjut atau ubah rencana.
6. **Krisis**: Kata kunci atau tombol "Saya butuh bantuan sekarang" → kartu bantuan BK dan Healing119 → tidak diteruskan ke antrean sebaya.

## 9. Spesifikasi layar utama

| Layar | Elemen kunci | Microcopy |
|---|---|---|
| Beranda | Sapaan, kartu "Pola hari ini", tombol catat, kartu Teman Sejenak | "Selamat sore, Raka. Mau lihat pola hari ini?" |
| Skrining | 1 pertanyaan per layar, bilah progres, skala 5 poin | "Tidak ada jawaban benar atau salah." |
| Hasil | Skor dalam bahasa deskriptif, tombol "Bicara dengan Teman Sejenak" | "Pola ini bukan diagnosis. Ini gambaran untuk membantumu memutuskan." |
| Rehat | Lingkaran napas 10 detik, pertanyaan tujuan, dua tombol setara | "Sebentar. Untuk apa kamu membuka ini?" |
| Obrolan | Gelembung teks, pengingat batas 30 menit, tombol bantuan tetap | "Teman Sejenak bukan psikolog. Untuk hal mendesak, tekan Bantuan." |
| Rujukan | Pratinjau ringkasan, sakelar persetujuan | "Ini yang akan dibaca konselor BK. Kamu bisa mengubahnya." |
| Tinjauan | Grafik skor 4 pekan, refleksi tertulis | "Apa yang berubah bagimu bulan ini?" |
| Dasbor | Sebaran risiko, beban layanan, filter fakultas; grup kecil disembunyikan | "Data kurang dari 10 orang tidak ditampilkan." |

Pesan galat: sebut masalah, solusi, dan jalur bantuan. Contoh: "Koneksi terputus. Catatanmu tersimpan di perangkat dan akan dikirim saat tersambung."

## 10. Desain visual

Acuan: sistem desain Notion (hangat, tenang, tipografi bersih, banyak ruang putih), dipadukan dengan palet Canva dari figur esai. Hanya satu acuan merek agar tidak bercampur.

**Prinsip**
1. Tenang, bukan memicu. Tanpa merah alarm, tanpa hitung mundur agresif, tanpa gamifikasi streak yang menghukum.
2. Satu tindakan utama per layar.
3. Tutup selalu semudah lanjut (dua tombol berbobot visual sama pada Rehat).
4. Bahasa orang pertama yang hangat, bukan perintah.

**Token warna**

| Token | Nilai | Pemakaian |
|---|---|---|
| `--sejenak-teal` | #2CB1A1 | Aksi utama, Cek Pola |
| `--sejenak-coral` | #F89A65 | Rehat, sorotan hangat |
| `--sejenak-violet` | #9889F5 | Teman Sejenak |
| `--sejenak-slate` | #384351 | Teks dan Rujuk |
| `--paper` | #FFFFFF / #F7F6F3 | Latar |
| `--ink` | #1F2933 | Teks utama |
| `--line` | #E7E5E0 | Garis halus |
| `--info` | #286181 | Tautan, informasi |
| `--help` | #D1CA1F | Kartu bantuan krisis (dengan ikon dan teks, bukan warna saja) |

Mode gelap: latar #14181C, teks #F2F4F5; kecerahan aksen diturunkan agar kontras 4,5:1 tetap terpenuhi.

**Tipografi**: Inter (UI) dan Source Serif 4 (judul refleksi); skala 14/16/20/28/36; tinggi baris 1,5 untuk isi; maksimal 66 karakter per baris.
**Jarak dan bentuk**: kelipatan 4 px; sudut 12 px untuk kartu, 999 px untuk tombol pil; bayangan sangat tipis; ikon garis 1,5 px.
**Gerak**: 150 sampai 250 ms, easing lembut; lingkaran napas 4 detik tarik, 4 detik hembus (ditiadakan bila reduced-motion).
**Komponen**: Tombol (utama, sekunder, teks), Kartu pola, Sakelar persetujuan dengan penjelasan satu baris, Lingkaran napas, Gelembung obrolan, Kartu bantuan, Bagan skor garis, Banner "bukan diagnosis".

**Yang dihindari**: gradien ungu-biru generik, ilustrasi 3D mengambang, avatar maskot lucu pada konteks kesehatan mental, notifikasi bertubi-tubi.

## 11. Model data (ringkas)

| Entitas | Kolom kunci |
|---|---|
| User | id, peran, fakultas (grup), dibuat |
| Consent | user_id, cakupan (app/peer/bk), status, waktu |
| Screening | user_id, tanggal, skor_bsmas (dienkripsi) |
| UsageLog | user_id, tanggal, aplikasi, menit (manual) |
| Pause | user_id, waktu, pilihan (lanjut/tutup) |
| Session | mahasiswa_id, peer_id, jadwal, ringkasan_disetujui |
| Referral | user_id, ke, ringkasan, persetujuan_id, status |
| AggregateView | cohort, periode, metrik, n (hanya jika n ≥ 10) |

Retensi: data aktif sampai akhir studi atau hingga dihapus pengguna; data evaluasi dianonimkan.

## 12. Privasi dan etika

- Persetujuan eksplisit dan dapat dicabut (UU 27/2022 Pasal 20).
- Minimisasi: tidak menyimpan isi percakapan di dasbor atau konten aplikasi yang dibuka.
- Teman Sejenak dilatih, disupervisi, dan dilarang menangani krisis.
- Izin etik penelitian diurus sebelum evaluasi dengan data manusia.
- Insiden data: pemberitahuan sesuai ketentuan, tinjau dalam 72 jam.
- Catatan hukum: pasal-pasal dibaca dari pasal.id dan perlu dicek ulang dengan salinan resmi BPK sebelum dirujuk dalam dokumen formal.

## 13. Metrik dan gerbang uji coba

| Gerbang | Indikator | Ambang (target) |
|---|---|---|
| Keterlibatan | Pengguna aktif pada pekan 4 | ≥ 60% |
| Kebergunaan | System Usability Scale | ≥ 68 |
| Perubahan skor | BSMAS vs kelompok pembanding | turun ≥ 0,2 SD |
| Keamanan | Insiden kebocoran data | 0 |

Metrik pendukung: waktu hingga obrolan pertama (≤ 48 jam), proporsi rehat yang ditutup, rujukan selesai, kepuasan Teman Sejenak. Perluasan hanya jika keempat gerbang terpenuhi.

## 14. Teknologi

PWA (React atau Svelte), basis data PostgreSQL dengan enkripsi kolom, autentikasi SSO kampus (OIDC), notifikasi web push terbatas, hosting di dalam negeri, CI dengan pemindaian dependensi. Keterbatasan: PWA tidak dapat membaca durasi aplikasi lain, sehingga pencatatan manual atau izin opsional; versi native dipertimbangkan setelah gerbang terpenuhi.

## 15. Rencana rilis (12 bulan)

| Bulan | Fase | Hasil |
|---|---|---|
| 1 sampai 2 | Persiapan | Survei awal, izin etik, rekrut dan latih Teman Sejenak |
| 3 sampai 4 | Pengembangan MVP | MVP, uji kegunaan, kesepakatan dengan BK |
| 5 sampai 10 | Uji coba pilot | 6 siklus 4 pekan di satu fakultas |
| 11 sampai 12 | Evaluasi | Analisis gerbang, laporan, keputusan perluasan |

## 16. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Keterlibatan rendah | Pengingat lembut, iterasi tiap siklus |
| Teman Sejenak tidak berlanjut | Pelatihan baku, supervisi, pengakuan kegiatan |
| Kekhawatiran privasi | Persetujuan berlapis, dasbor k ≥ 10 |
| Krisis pada peserta | Kartu bantuan, rujukan segera, Healing119 |
| Efek belum terbukti di Indonesia | Desain acak berkelompok, gerbang keputusan |

## 17. Keterkaitan dengan SDG

SDG 3 (target 3.4), SDG 4 (4.4 dan 4.7), SDG 9 (9.c), SDG 17 (17.17).

## 18. Pertanyaan terbuka

1. Siapa pemilik data pada tingkat kampus dan bagaimana perjanjian pemrosesannya?
2. Batas skor BSMAS yang valid untuk mahasiswa Indonesia?
3. Insentif yang berkelanjutan untuk Teman Sejenak?
