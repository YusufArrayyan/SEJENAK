# Dok Sejenak (IoT)

Dok Sejenak adalah alas ponsel berbasis ESP32 yang melengkapi aplikasi SEJENAK. PWA tidak bisa membaca durasi aplikasi lain di ponsel, jadi dok ini menutup celah itu dari sisi sebaliknya: ia mencatat kapan ponsel **tidak** dipakai.

## Apa yang dilakukan

| Kejadian di dok | Yang terjadi di aplikasi |
|---|---|
| Ponsel diletakkan (`docked`) | Waktu bebas layar mulai dihitung |
| Ponsel diangkat (`lifted`) | Menit bebas layar ditambahkan ke catatan hari ini; layar Rehat terbuka (bila diaktifkan) |
| Tombol bantuan ditahan 1 detik (`help`) | Kartu bantuan (BK dan Healing119) terbuka di ponsel. Tidak ada yang dihubungi otomatis |
| Aplikasi membuka Rehat | Dok menerima `breath`, cincin LED bernapas 4 detik tarik, 4 detik hembus |

## Arsitektur

```
[Sensor IR] [Tombol] [Cincin LED WS2812]
        \      |      /
         [ ESP32 Dok Sejenak ]
                 |  MQTT over TLS (8883)
         [ Broker Mosquitto kampus ]  -- hosting dalam negeri, ACL per perangkat
                 |  MQTT over WSS (8884)
         [ PWA SEJENAK di ponsel/laptop ]
                 |
         [ Backend + PostgreSQL ]  -- menyimpan menit bebas layar per hari, bukan peristiwa mentah
```

Topik:

- `sejenak/dok/<DEVICE_ID>/event` (dok ke aplikasi): `{"type":"docked|lifted|help|heartbeat","ts":<ms>}`
- `sejenak/dok/<DEVICE_ID>/cmd` (aplikasi ke dok): `{"type":"breath","seconds":10}`, `{"type":"breath_stop"}`, `{"type":"config",...}`

## Komponen (perkiraan per unit)

| Komponen | Keterangan |
|---|---|
| ESP32 DevKit V1 | Wi-Fi, MQTT |
| Modul sensor IR TCRT5000 | Mendeteksi ponsel di atas alas |
| Cincin LED WS2812 12 piksel | Lampu napas dan status |
| Tombol tekan 12 mm | Tombol bantuan |
| Casing cetak 3D + kabel USB-C | Daya 5 V dari pengisi daya ponsel |

Rangkaian: IR OUT ke GPIO34, tombol ke GPIO27 dan GND, data LED ke GPIO13 (resistor 330 Ω), semua VCC 5 V atau 3,3 V sesuai modul.

## Privasi

- Yang dikirim hanya jenis peristiwa dan waktu. Tidak ada kamera, mikrofon, lokasi, atau isi layar.
- Satu akun MQTT per dok, dibatasi ACL hanya ke topiknya sendiri.
- Broker tidak menyimpan pesan (`persistence false`). Backend hanya menyimpan total menit per hari.
- Pengguna bisa mematikan pencatatan, lampu napas, dan tombol bantuan dari menu Saya → Dok Sejenak, atau melepas pasangan kapan saja.

## Mencoba tanpa perangkat

1. Di aplikasi, buka Saya → Dok Sejenak. Mode **Simulator** sudah aktif pada data contoh.
2. Atau jalankan broker lokal dan simulator MQTT:

```bash
docker run -p 1883:1883 -p 9001:9001 -v "$PWD/broker/mosquitto.dev.conf:/mosquitto/config/mosquitto.conf" eclipse-mosquitto
npm install mqtt && node tools/sim-dok.mjs mqtt://localhost:1883 DOK-7F3A
```

Lalu di aplikasi pilih **Broker MQTT** dengan alamat `ws://localhost:9001` (hanya untuk uji lokal; produksi wajib `wss://`).

## Firmware

Buka `firmware/dok_sejenak/dok_sejenak.ino` di Arduino IDE 2, salin `config.example.h` menjadi `config.h`, isi Wi-Fi dan kredensial broker, lalu unggah ke papan "ESP32 Dev Module".
