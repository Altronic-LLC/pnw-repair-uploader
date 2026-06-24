import { Camera, RotateCcw, Check, X, Image as ImageIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  /** Called with a captured/selected image blob and a suggested file name. */
  onCapture: (blob: Blob, suggestedName: string) => void;
  onClose: () => void;
}

/**
 * Full-screen camera capture for the kiosk.
 *
 * Primary path: getUserMedia live preview → snapshot to a canvas → JPEG blob.
 * This gives an in-app shutter button and review/retake step, which reads as
 * "the app launched the camera" rather than handing off to the OS.
 *
 * Fallback path: a hidden <input type="file" accept="image/*" capture> that
 * launches the native camera — used when getUserMedia is unavailable or denied
 * (older locked-down browsers, no HTTPS, permission blocked).
 */
export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<{ blob: Blob; url: string } | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Start the live camera on mount. Prefer the rear ("environment") camera.
  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Live camera not available on this device.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch {
        setError("Could not access the camera. Use 'Choose file' instead.");
      }
    }
    void start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setSnapshot({ blob, url: URL.createObjectURL(blob) });
        stopStream();
      },
      "image/jpeg",
      0.9,
    );
  }

  function retake() {
    if (snapshot) URL.revokeObjectURL(snapshot.url);
    setSnapshot(null);
    setError(null);
    // Re-trigger the start effect by reloading the stream.
    void navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
      })
      .catch(() => setError("Could not access the camera."));
  }

  function confirm() {
    if (!snapshot) return;
    const name = `photo-${stamp()}.jpg`;
    onCapture(snapshot.blob, name);
    URL.revokeObjectURL(snapshot.url);
    setSnapshot(null);
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onCapture(file, file.name || `photo-${stamp()}.jpg`);
    e.target.value = "";
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-3">
        <span className="text-sm font-medium text-white/80">Camera</span>
        <button onClick={onClose} aria-label="Close camera" className="rounded-full p-2 text-white/80">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {snapshot ? (
          <img src={snapshot.url} alt="Captured preview" className="max-h-full max-w-full" />
        ) : (
          <video ref={videoRef} playsInline muted className="max-h-full max-w-full" />
        )}
        <canvas ref={canvasRef} className="hidden" />
        {error && (
          <div className="absolute inset-x-0 bottom-24 px-6 text-center text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-8 p-6">
        {snapshot ? (
          <>
            <button
              onClick={retake}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-4 text-white"
            >
              <RotateCcw className="h-6 w-6" /> Retake
            </button>
            <button
              onClick={confirm}
              className="flex items-center gap-2 rounded-xl bg-accent px-8 py-4 font-semibold text-white"
            >
              <Check className="h-6 w-6" /> Use photo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-4 text-white"
            >
              <ImageIcon className="h-6 w-6" /> Choose file
            </button>
            <button
              onClick={takePhoto}
              disabled={!!error}
              aria-label="Take photo"
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black disabled:opacity-40"
            >
              <Camera className="h-9 w-9" />
            </button>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFilePicked}
        className="hidden"
      />
    </div>
  );
}

/** A filename-safe timestamp without using Date.now() in shared data code. */
function stamp(): string {
  // Local, UI-only timestamp is fine here (not pure data layer).
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
