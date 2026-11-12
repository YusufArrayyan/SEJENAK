# PRODUCT.md: SEJENAK

## Register
product

## Platform
web (PWA, mobile-first, juga dipakai di laptop)

## Purpose
SEJENAK membantu mahasiswa mengenali pola penggunaan media sosial, memberi jeda reflektif saat batas pribadi terlewati, menghubungkan dengan konselor sebaya (Teman Sejenak), dan merujuk ke BK kampus atas persetujuan. Detail lengkap ada di `PRD_SEJENAK.md`.

## Users
- Mahasiswa (utama). Sering membuka aplikasi di kamar pada malam hari, dengan ponsel, sambil lelah. Malu bertemu konselor.
- Teman Sejenak (konselor sebaya, relawan, perlu batas tugas yang tegas).
- Konselor BK dan dosen penyelia (waktu terbatas, butuh rujukan terstruktur).
- Admin kampus (dasbor agregat, k minimal 10).

## Companion device
Dok Sejenak: dok ponsel ESP32 yang mendeteksi ponsel diletakkan, menyalakan lampu napas saat Rehat, dan punya tombol bantuan fisik. Terhubung lewat MQTT. Lihat `iot/README.md`.

## Brand personality
Tenang, hangat, jujur. Seperti teman yang mengajak berhenti sebentar, bukan aplikasi yang mengawasi.

## Anti-references
Gamifikasi streak yang menghukum, merah alarm, hitung mundur agresif, maskot lucu, gradien ungu-biru, ilustrasi 3D mengambang, neumorfisme, bahasa klinis.

## Accessibility
WCAG 2.2 AA, target sentuh 44 px, kontras 4,5:1, pembaca layar, prefers-reduced-motion, mode gelap.
