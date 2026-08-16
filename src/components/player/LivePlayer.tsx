import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { streamUrl: string; streamType: string; title: string };

export function LivePlayer({ streamUrl, streamType, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    setStatus("loading");

    const isHls = streamType === "hls" || streamUrl.includes(".m3u8");

    const setup = async () => {
      if (!isHls || video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      const { default: Hls } = await import("hls.js");
      if (cancelled) return;
      if (!Hls.isSupported()) {
        setStatus("error");
        return;
      }
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setStatus("error");
      });
      destroy = () => hls.destroy();
    };

    void setup();
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [streamUrl, streamType]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
      <video
        ref={videoRef}
        className="size-full"
        controls
        autoPlay
        playsInline
        muted
        controlsList="nodownload"
        title={title}
        onCanPlay={() => setStatus("ready")}
        onPlaying={() => setStatus("ready")}
        onError={() => setStatus("error")}
      />

      {status === "ready" && (
        <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-xs font-semibold text-live-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-live-foreground" /> LIVE
        </span>
      )}

      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center bg-black/60 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center gap-3 bg-black/80 p-6 text-center">
          <AlertTriangle className="mx-auto size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">
            This stream is unavailable right now. Please try again in a moment.
          </p>
          <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}