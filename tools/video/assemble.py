# Menyusun video akhir dari bingkai + narasi. python assemble.py
import json, os, subprocess
import imageio_ffmpeg

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.abspath(os.path.join(here, "..", ".."))
B = os.path.join(here, "build")
FF = imageio_ffmpeg.get_ffmpeg_exe()
meta = json.load(open(os.path.join(B, "audio.json"), encoding="utf8"))
seg_dir = os.path.join(B, "seg"); os.makedirs(seg_dir, exist_ok=True)
out_dir = os.path.join(root, "media"); os.makedirs(out_dir, exist_ok=True)

LEAD, GAP, SCENE_TAIL, FADE = 0.2, 0.45, 0.9, 0.35
segs, srt, t = [], [], 0.0

def ts(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"

for i, m in enumerate(meta):
    last_in_scene = i == len(meta) - 1 or meta[i + 1]["scene"] != m["scene"]
    first_in_scene = m["j"] == 0
    dur = LEAD + m["dur"] + (SCENE_TAIL if last_in_scene else GAP)
    name = f'{m["scene"]:02d}_{m["j"]}'
    png = os.path.join(B, "frames", name + ".png")
    wav = os.path.join(B, "audio", name + ".wav")
    seg = os.path.join(seg_dir, name + ".mp4")
    vf = ["scale=1920:1080", "format=yuv420p"]
    if first_in_scene: vf.append(f"fade=t=in:st=0:d={FADE}")
    if last_in_scene: vf.append(f"fade=t=out:st={dur - FADE:.3f}:d={FADE}")
    delay = int(LEAD * 1000)
    subprocess.run([FF, "-y", "-loglevel", "error", "-loop", "1", "-framerate", "30", "-i", png, "-i", wav,
                    "-filter_complex", f"[0:v]{','.join(vf)}[v];[1:a]adelay={delay}|{delay},apad[a]",
                    "-map", "[v]", "-map", "[a]", "-t", f"{dur:.3f}",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-tune", "stillimage", "-r", "30",
                    "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", seg], check=True)
    segs.append(seg)
    srt.append(f"{len(srt) + 1}\n{ts(t + LEAD)} --> {ts(t + LEAD + m['dur'])}\n{m['text']}\n")
    t += dur
    print(name, round(dur, 2))

lst = os.path.join(B, "list.txt")
with open(lst, "w", encoding="utf8") as f:
    for s in segs: f.write(f"file '{s.replace(os.sep, '/')}'\n")
final = os.path.join(out_dir, "SEJENAK-alur-kerja-dan-IoT.mp4")
subprocess.run([FF, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", final], check=True)
open(os.path.join(out_dir, "SEJENAK-alur-kerja-dan-IoT.srt"), "w", encoding="utf8").write("\n".join(srt))
print("selesai", final, round(t, 1), "detik")
