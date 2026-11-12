/*
  Dok Sejenak — firmware ESP32
  ------------------------------------------------------------
  Fungsi:
   1. Sensor jarak IR (TCRT5000 / modul IR obstacle) mendeteksi ponsel diletakkan atau diangkat.
   2. Mengirim peristiwa ke broker MQTT (TLS):  sejenak/dok/<ID>/event
        {"type":"docked","ts":...} | {"type":"lifted","ts":...} | {"type":"help","ts":...} | {"type":"heartbeat","ts":...}
   3. Menerima perintah dari aplikasi:          sejenak/dok/<ID>/cmd
        {"type":"breath","seconds":10} -> cincin LED bernapas 4 dtk tarik / 4 dtk hembus
        {"type":"breath_stop"}
        {"type":"config","autoLog":true,"breathLight":true,"helpButton":true}
   4. Tombol bantuan fisik (tekan 1 detik) mengirim peristiwa "help".

  Yang TIDAK dikirim: isi layar, lokasi, suara, atau identitas. Hanya jenis peristiwa + waktu.

  Pustaka (Arduino Library Manager):
   - PubSubClient (Nick O'Leary)
   - ArduinoJson 7.x
   - Adafruit NeoPixel
  Papan: ESP32 Dev Module (arduino-esp32 3.x)
*/

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
#include <time.h>
#include "config.h"   // salin dari config.example.h lalu isi

// ---------- Pin ----------
constexpr int PIN_IR      = 34;   // keluaran digital sensor IR (LOW = ada benda)
constexpr int PIN_BUTTON  = 27;   // tombol bantuan ke GND, pakai pull-up internal
constexpr int PIN_LED     = 13;   // data cincin WS2812 (12 LED)
constexpr int LED_COUNT   = 12;

// ---------- Konstanta perilaku ----------
constexpr uint32_t DEBOUNCE_DOCK_MS = 1500;   // ponsel harus stabil 1,5 dtk sebelum dianggap berubah
constexpr uint32_t HELP_HOLD_MS     = 1000;   // tombol ditahan 1 dtk agar tidak tertekan tak sengaja
constexpr uint32_t HEARTBEAT_MS     = 60000;

Adafruit_NeoPixel ring(LED_COUNT, PIN_LED, NEO_GRB + NEO_KHZ800);
WiFiClientSecure net;
PubSubClient mqtt(net);

String topicEvent, topicCmd;
bool docked = false, lastRaw = false;
uint32_t rawChangedAt = 0, lastBeat = 0, btnDownAt = 0;
bool btnHandled = false;

// pengaturan dari aplikasi
bool cfgAutoLog = true, cfgBreath = true, cfgHelp = true;

// status animasi
enum class Light { Idle, Docked, Breath, Help, Offline };
Light light = Light::Offline;
uint32_t breathUntil = 0, helpUntil = 0;

// Warna (selaras palet SEJENAK)
const uint32_t C_SUN   = Adafruit_NeoPixel::Color(253, 188, 34);
const uint32_t C_CORAL = Adafruit_NeoPixel::Color(248, 154, 101);
const uint32_t C_TEAL  = Adafruit_NeoPixel::Color(44, 177, 161);
const uint32_t C_HELP  = Adafruit_NeoPixel::Color(209, 202, 31);

uint64_t nowMs() {
  struct timeval tv; gettimeofday(&tv, nullptr);
  return (uint64_t)tv.tv_sec * 1000ULL + tv.tv_usec / 1000ULL;
}

void publishEvent(const char* type) {
  JsonDocument doc;
  doc["type"] = type;
  doc["ts"] = nowMs();
  char buf[96];
  size_t n = serializeJson(doc, buf);
  mqtt.publish(topicEvent.c_str(), (const uint8_t*)buf, n, false);
  Serial.printf("[event] %s\n", buf);
}

void onCmd(char* topic, byte* payload, unsigned int len) {
  JsonDocument doc;
  if (deserializeJson(doc, payload, len)) return;
  const char* type = doc["type"] | "";
  if (!strcmp(type, "breath") && cfgBreath) {
    uint32_t sec = doc["seconds"] | 10;
    breathUntil = millis() + sec * 1000UL;
    light = Light::Breath;
  } else if (!strcmp(type, "breath_stop")) {
    breathUntil = 0;
    light = docked ? Light::Docked : Light::Idle;
  } else if (!strcmp(type, "config")) {
    cfgAutoLog = doc["autoLog"] | true;
    cfgBreath  = doc["breathLight"] | true;
    cfgHelp    = doc["helpButton"] | true;
  }
}

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(400); Serial.print('.'); }
  Serial.printf(" ok %s\n", WiFi.localIP().toString().c_str());
  configTime(7 * 3600, 0, "id.pool.ntp.org", "pool.ntp.org");   // WIB
}

void connectMqtt() {
  while (!mqtt.connected()) {
    light = Light::Offline;
    String cid = String("dok-") + DEVICE_ID;
    // Last will: aplikasi tahu dok terputus
    if (mqtt.connect(cid.c_str(), MQTT_USER, MQTT_PASS, topicEvent.c_str(), 0, false, "{\"type\":\"offline\"}")) {
      mqtt.subscribe(topicCmd.c_str(), 1);
      publishEvent("heartbeat");
      light = docked ? Light::Docked : Light::Idle;
    } else {
      Serial.printf("MQTT gagal rc=%d, coba lagi\n", mqtt.state());
      delay(3000);
    }
  }
}

// ---------- Animasi LED ----------
void fill(uint32_t c, float k) {
  uint8_t r = (c >> 16) & 0xFF, g = (c >> 8) & 0xFF, b = c & 0xFF;
  for (int i = 0; i < LED_COUNT; i++) ring.setPixelColor(i, ring.Color(r * k, g * k, b * k));
  ring.show();
}

void renderLight() {
  uint32_t t = millis();
  if (light == Light::Breath && t > breathUntil) light = docked ? Light::Docked : Light::Idle;
  if (light == Light::Help && t > helpUntil) light = docked ? Light::Docked : Light::Idle;

  switch (light) {
    case Light::Breath: {
      // 8 detik per siklus: 4 dtk naik (tarik), 4 dtk turun (hembus)
      float phase = (t % 8000) / 8000.0f;
      float k = phase < 0.5f ? phase * 2 : (1 - phase) * 2;
      fill(C_CORAL, 0.08f + 0.6f * k * k);
      break;
    }
    case Light::Help:    fill(C_HELP, (t / 500) % 2 ? 0.5f : 0.15f); break;
    case Light::Docked:  fill(C_TEAL, 0.06f); break;     // redup: ponsel sedang istirahat
    case Light::Idle:    fill(C_SUN, 0.03f); break;
    case Light::Offline: fill(C_SUN, (t / 1000) % 2 ? 0.08f : 0.0f); break;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_IR, INPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  ring.begin(); ring.setBrightness(120); ring.clear(); ring.show();

  topicEvent = String("sejenak/dok/") + DEVICE_ID + "/event";
  topicCmd   = String("sejenak/dok/") + DEVICE_ID + "/cmd";

  connectWifi();
  net.setCACert(MQTT_CA_CERT);          // TLS dengan sertifikat CA broker kampus
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onCmd);
  mqtt.setKeepAlive(30);
  connectMqtt();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWifi();
  if (!mqtt.connected()) connectMqtt();
  mqtt.loop();

  // --- deteksi ponsel dengan debounce ---
  bool raw = digitalRead(PIN_IR) == LOW;
  if (raw != lastRaw) { lastRaw = raw; rawChangedAt = millis(); }
  if (raw != docked && millis() - rawChangedAt > DEBOUNCE_DOCK_MS) {
    docked = raw;
    if (cfgAutoLog) publishEvent(docked ? "docked" : "lifted");
    if (light != Light::Breath && light != Light::Help) light = docked ? Light::Docked : Light::Idle;
  }

  // --- tombol bantuan (tahan 1 detik) ---
  bool pressed = digitalRead(PIN_BUTTON) == LOW;
  if (pressed && !btnDownAt) { btnDownAt = millis(); btnHandled = false; }
  if (!pressed) btnDownAt = 0;
  if (pressed && !btnHandled && millis() - btnDownAt > HELP_HOLD_MS && cfgHelp) {
    btnHandled = true;
    publishEvent("help");
    helpUntil = millis() + 4000;
    light = Light::Help;
  }

  if (millis() - lastBeat > HEARTBEAT_MS) { lastBeat = millis(); publishEvent("heartbeat"); }
  renderLight();
  delay(20);
}
