import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QUEST_CONFIG } from '../config/questConfig';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  FileText,
  ChevronUp,
  AlertCircle,
  Music,
} from 'lucide-react';

export const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const config = QUEST_CONFIG.audio;

  // Форматирование времени MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Инициализация Web Audio API для визуализатора реального спектра
  const initWebAudio = () => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (e) {
      console.warn('Web Audio API не инициализировался (возможно, ограничение браузера):', e);
    }
  };

  // Отрисовка частотного спектра на канвасе
  const drawSpectrum = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Если аудио играет и есть анализатор — берём реальные байты частот
    if (analyserRef.current && isPlaying) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.9;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#E31E24');
        gradient.addColorStop(1, '#E5A93C');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1.5, barHeight);

        x += barWidth;
      }
    } else {
      // Спокойное состояние (спящая волна)
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      for (let x = 0; x < width; x += 10) {
        ctx.lineTo(x, height / 2 + Math.sin(x * 0.04) * 2);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (document.visibilityState === 'visible') {
      animationFrameRef.current = requestAnimationFrame(drawSpectrum);
    }
  }, [isPlaying]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(drawSpectrum);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawSpectrum]);

  // Обработчик видимости вкладки (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        animationFrameRef.current = requestAnimationFrame(drawSpectrum);
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [drawSpectrum]);

  // Управление воспроизведением
  const togglePlay = async () => {
    if (!audioRef.current) return;
    initWebAudio();

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setAudioError(null);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Ошибка запуска аудио:', err);
        setAudioError('Браузер ожидает взаимодействия для воспроизведения звука.');
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        togglePlay();
      }
    }
  };

  const handleAudioError = () => {
    setAudioError('Аудиофайл пока подготавливается или не найден по указанному пути.');
  };

  return (
    <div className="audio-player-card">
      {/* Скрытый audio элемент */}
      {config.songUrl && (
        <audio
          ref={audioRef}
          src={config.songUrl}
          preload="metadata"
          loop={isLooping}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleAudioError}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="player-header">
        <div className="song-title-group">
          <span className="song-name">{config.title}</span>
          <span className="song-artist">{config.artist}</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {config.songUrl && (
            <a
              href={config.songUrl}
              download="Подарок_ТВГ_ОФК.mp3"
              className="btn-icon"
              title="Скачать песню на память"
              aria-label="Скачать песню"
            >
              <Download size={18} />
            </a>
          )}
          <button
            type="button"
            className="btn-icon"
            onClick={() => setShowLyrics(!showLyrics)}
            title={showLyrics ? 'Скрыть текст' : 'Показать текст песни'}
            aria-label="Показать текст песни"
          >
            <FileText size={18} />
          </button>
        </div>
      </div>

      {/* Канвас визуализатора частот */}
      <div className="visualizer-canvas-container">
        <canvas ref={canvasRef} className="visualizer-canvas" width={560} height={64} />
      </div>

      {/* Ошибка или состояние загрузки */}
      {audioError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fca5a5', fontSize: 13, marginBottom: 14 }}>
          <AlertCircle size={16} />
          <span>{audioError}</span>
        </div>
      )}

      {!config.songUrl && (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-gold)', fontWeight: 600, marginBottom: 4 }}>
            <Music size={18} />
            <span>{config.placeholderMessage}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {config.placeholderSubtext}
          </div>
        </div>
      )}

      {/* Ползунок перемотки */}
      <div className="scrubber-container">
        <span className="time-stamp">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="progress-track"
          style={{ width: '100%' }}
          aria-label="Перемотка трека"
          disabled={!config.songUrl}
        />
        <span className="time-stamp">{formatTime(duration || 222)}</span>
      </div>

      {/* Главные контролы */}
      <div className="player-controls">
        <div className="primary-controls">
          <button
            type="button"
            className="play-pause-btn"
            onClick={togglePlay}
            title={isPlaying ? 'Пауза' : 'Включить песню'}
            aria-label={isPlaying ? 'Пауза' : 'Включить песню'}
            disabled={!config.songUrl}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 3 }} />}
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={handleReplay}
            title="Слушать сначала"
            aria-label="Слушать сначала"
            disabled={!config.songUrl}
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsLooping(!isLooping)}
            style={{
              borderColor: isLooping ? 'var(--accent-gold)' : undefined,
              color: isLooping ? 'var(--accent-gold)' : undefined,
              minHeight: 40,
              fontSize: 13,
              padding: '6px 14px',
            }}
          >
            {isLooping ? 'Повтор: Вкл' : 'Повтор: Выкл'}
          </button>
        </div>
      </div>

      {/* Раскрывающийся текст песни */}
      {showLyrics && (
        <div className="lyrics-drawer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Текст песни</span>
            <button
              type="button"
              onClick={() => setShowLyrics(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <ChevronUp size={18} />
            </button>
          </div>

          <div className="lyrics-content">
            {config.lyrics.map((verse, vIdx) => (
              <div key={vIdx} style={{ marginBottom: 16 }}>
                <div className="lyrics-verse-title">{verse.verse}</div>
                {verse.lines.map((line, lIdx) => (
                  <div key={lIdx}>{line}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
