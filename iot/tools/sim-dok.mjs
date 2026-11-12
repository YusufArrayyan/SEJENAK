// Simulator Dok Sejenak lewat MQTT sungguhan (tanpa perangkat keras).
// Pakai: node sim-dok.mjs <brokerUrl> <DEVICE_ID> [username] [password]
// Contoh: node sim-dok.mjs mqtt://localhost:1883 DOK-7F3A
// Ketik: d = letakkan ponsel, l = angkat ponsel, h = tombol bantuan, q = keluar
import mqtt from "mqtt";
import readline from "node:readline";

const [url = "mqtt://localhost:1883", id = "DOK-7F3A", username, password] = process.argv.slice(2);
const client = mqtt.connect(url, { username, password });
const ev = `sejenak/dok/${id}/event`, cmd = `sejenak/dok/${id}/cmd`;

client.on("connect", () => {
  console.log(`Tersambung ke ${url} sebagai ${id}. Ketik d / l / h / q.`);
  client.subscribe(cmd);
});
client.on("message", (_t, p) => console.log("[perintah dari aplikasi]", p.toString()));
const send = (type) => { const m = JSON.stringify({ type, ts: Date.now() }); client.publish(ev, m); console.log("[peristiwa]", m); };

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode?.(true);
process.stdin.on("keypress", (_s, k) => {
  if (k.name === "d") send("docked");
  if (k.name === "l") send("lifted");
  if (k.name === "h") send("help");
  if (k.name === "q" || (k.ctrl && k.name === "c")) { client.end(); process.exit(0); }
});
setInterval(() => client.connected && send("heartbeat"), 60000);
