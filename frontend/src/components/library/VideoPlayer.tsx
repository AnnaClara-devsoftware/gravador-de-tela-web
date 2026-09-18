import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Gauge } from 'lucide-react';
import { formatDuration } from '@/lib/format';

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export function VideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, [src]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video) return;
    const value = Number(e.target.value);
    video.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  function setPlaybackSpeed(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = value;
    setSpeed(value);
    setSpeedMenuOpen(false);
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }

  return (
    <div ref={containerRef} className="group relative overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full max-h-[70vh]"
        onClick={togglePlay}
        aria-label="Reprodutor de vídeo da gravação"
      />

      <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/85 to-transparent p-3 pt-8 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Progresso do vídeo"
          className="h-1.5 w-full cursor-pointer accent-[var(--color-accent)]"
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproduzir'} className="text-white">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <div className="hidden items-center gap-1.5 sm:flex">
              <button onClick={toggleMute} aria-label={isMuted ? 'Ativar som' : 'Silenciar'} className="text-white">
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                className="h-1 w-16 cursor-pointer accent-[var(--color-accent)]"
              />
            </div>

            <span className="font-mono text-xs text-white/80">
              {formatDuration(currentTime * 1000)} / {formatDuration((duration || 0) * 1000)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setSpeedMenuOpen((v) => !v)}
                aria-label="Velocidade de reprodução"
                className="flex items-center gap-1 text-xs text-white/80 hover:text-white"
              >
                <Gauge size={15} /> {speed}x
              </button>
              {speedMenuOpen && (
                <div className="absolute bottom-7 right-0 rounded-lg border border-white/10 bg-black/90 py-1 text-xs text-white shadow-xl">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`block w-full px-4 py-1.5 text-left hover:bg-white/10 ${s === speed ? 'text-[var(--color-accent)]' : ''}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleFullscreen} aria-label="Tela cheia" className="text-white">
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
