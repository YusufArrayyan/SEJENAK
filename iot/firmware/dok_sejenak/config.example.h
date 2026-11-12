// Salin berkas ini menjadi config.h lalu isi. config.h tidak ikut di-commit (.gitignore).
#pragma once

#define DEVICE_ID   "DOK-7F3A"            // tertera pada stiker di bawah dok
#define WIFI_SSID   "nama-wifi"
#define WIFI_PASS   "kata-sandi-wifi"

#define MQTT_HOST   "mqtt.sejenak.example.ac.id"
#define MQTT_PORT   8883                  // MQTT over TLS
#define MQTT_USER   "DOK-7F3A"            // sama dengan DEVICE_ID; ACL memakai nama ini
#define MQTT_PASS   "ganti-dengan-token-perangkat"

// Sertifikat CA broker (PEM)
static const char MQTT_CA_CERT[] = R"PEM(
-----BEGIN CERTIFICATE-----
...isi sertifikat CA...
-----END CERTIFICATE-----
)PEM";
