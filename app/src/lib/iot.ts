// Klien Dok Sejenak (ESP32). Dua mode:
//  - "sim": simulator di dalam aplikasi untuk demo dan uji kegunaan
//  - "mqtt": broker MQTT lewat WebSocket aman (wss://), lihat iot/README.md
//
// Topik:
//   sejenak/dok/{deviceId}/event  (dok -> aplikasi)  {"type":"docked"|"lifted"|"help"|"heartbeat","ts":<ms>}
//   sejenak/dok/{deviceId}/cmd    (aplikasi -> dok)  {"type":"breath","seconds":10} | {"type":"breath_stop"} | {"type":"config",...}
// Yang dikirim hanya jenis peristiwa dan waktu. Tidak ada isi layar, lokasi, atau identitas.

export type DockEventType = "docked" | "lifted" | "help" | "heartbeat";
export interface DockEvent { type: DockEventType; ts: number }
export type DockCmd = { type: "breath"; seconds: number } | { type: "breath_stop" } | { type: "config"; autoLog: boolean; breathLight: boolean; helpButton: boolean };
export type ConnState = "terputus" | "menyambung" | "tersambung";

type MqttLike = { publish: (t: string, p: string) => void; end: (force?: boolean) => void; on: (e: string, cb: (...a: any[]) => void) => void; subscribe: (t: string) => void };

class DockClient extends EventTarget {
  state: ConnState = "terputus";
  mode: "sim" | "mqtt" = "sim";
  deviceId = "";
  lastCmd: DockCmd | null = null;
  private mqtt: MqttLike | null = null;

  private setState(s: ConnState) { this.state = s; this.dispatchEvent(new CustomEvent("state", { detail: s })); }
  private emit(ev: DockEvent) { this.dispatchEvent(new CustomEvent("event", { detail: ev })); }

  async connect(opts: { mode: "sim" | "mqtt"; deviceId: string; brokerUrl?: string }) {
    this.disconnect();
    this.mode = opts.mode; this.deviceId = opts.deviceId;
    this.setState("menyambung");
    if (opts.mode === "sim") {
      setTimeout(() => this.setState("tersambung"), 600);
      return;
    }
    try {
      const { default: mqtt } = await import("mqtt");
      const client = mqtt.connect(opts.brokerUrl!, { connectTimeout: 8000, reconnectPeriod: 4000, clientId: `sejenak-app-${Math.random().toString(16).slice(2, 8)}` }) as unknown as MqttLike;
      this.mqtt = client;
      client.on("connect", () => { client.subscribe(`sejenak/dok/${opts.deviceId}/event`); this.setState("tersambung"); });
      client.on("close", () => this.setState("terputus"));
      client.on("error", () => this.setState("terputus"));
      client.on("message", (_t: string, payload: Uint8Array) => {
        try { const ev = JSON.parse(new TextDecoder().decode(payload)) as DockEvent; if (ev?.type) this.emit(ev); } catch { /* abaikan pesan rusak */ }
      });
    } catch {
      this.setState("terputus");
    }
  }

  disconnect() { this.mqtt?.end(true); this.mqtt = null; this.setState("terputus"); }

  send(cmd: DockCmd) {
    this.lastCmd = cmd;
    this.dispatchEvent(new CustomEvent("cmd", { detail: cmd }));
    if (this.mode === "mqtt" && this.mqtt && this.state === "tersambung") this.mqtt.publish(`sejenak/dok/${this.deviceId}/cmd`, JSON.stringify(cmd));
  }

  // dipakai simulator
  simulate(type: DockEventType) { if (this.mode === "sim" && this.state === "tersambung") this.emit({ type, ts: Date.now() }); }
}

export const dock = new DockClient();
