# Narasi per kalimat dengan edge-tts, lalu ubah ke WAV dan catat durasinya.
import asyncio, json, os, subprocess, sys, wave
import edge_tts, imageio_ffmpeg
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, "build", "audio"); os.makedirs(out, exist_ok=True)
FF = imageio_ffmpeg.get_ffmpeg_exe()
VOICE = "id-ID-GadisNeural"
scenes = json.load(open(os.path.join(here, "scenes.json"), encoding="utf8"))

async def one(text, mp3):
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, VOICE, rate="-6%", pitch="-2Hz").save(mp3); return
        except Exception as e:
            print("ulang", e); await asyncio.sleep(2)
    raise SystemExit("TTS gagal")

async def main():
    meta = []
    for si, sc in enumerate(scenes):
        for j, text in enumerate(sc["s"]):
            base = os.path.join(out, f"{si:02d}_{j}")
            if not os.path.exists(base + ".wav"):
                await one(text, base + ".mp3")
                subprocess.run([FF, "-y", "-loglevel", "error", "-i", base + ".mp3", "-ar", "48000", "-ac", "2", base + ".wav"], check=True)
            with wave.open(base + ".wav") as w: dur = w.getnframes() / w.getframerate()
            meta.append({"scene": si, "id": sc["id"], "j": j, "text": text, "dur": round(dur, 3)})
            print(si, j, round(dur, 2))
    json.dump(meta, open(os.path.join(here, "build", "audio.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print("total", round(sum(m["dur"] for m in meta), 1), "detik")
asyncio.run(main())
