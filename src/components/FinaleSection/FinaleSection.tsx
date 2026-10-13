import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { MEDIA_CONFIG } from '../../config/media';
import { LYRICS_DATA } from '../../config/lyrics';
import { soundManager } from '../../utils/soundEffects';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, 
  Gift, Heart, Music, CheckCircle2, ChevronRight, Sliders
} from 'lucide-react';

export const FinaleSection: React.FC = () => {
  // Steps in Finale: starts automatically with 'video' -> 'unboxing' -> 'music_karaoke' -> 'final_wish'
  const [finaleStep, setFinaleStep] = useState<'announcement' | 'video' | 'unboxing' | 'music_karaoke' | 'final_wish'>('video');

  // Video state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(129); // ~2:09
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0); // Optional manual calibration offset
  const [showOffsetControls, setShowOffsetControls] = useState(false);

  // Autoplay video when finale starts
  useEffect(() => {
    if (finaleStep === 'video' && videoRef.current) {
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
      }).catch(() => {
        // Autoplay may need user interaction on some mobile devices
      });
    }
  }, [finaleStep]);

  // Karaoke active index
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Launch confetti burst on demand
  const launchCelebration = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#00ff88', '#ec4899', '#3b82f6', '#f59e0b']
    });
  }, []);

  // Handle Video End
  const handleVideoEnded = () => {
    soundManager.playSelect();
    setFinaleStep('unboxing');
  };

  // Trigger unboxing animation then transition to music
  const handleStartUnbox = () => {
    soundManager.playChaChing();
    setFinaleStep('unboxing');
    launchCelebration();
    setTimeout(() => {
      setFinaleStep('music_karaoke');
      // Autoplay audio on user interaction
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    }, 2400);
  };

  // Synchronize karaoke to real audio.currentTime
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime + timeOffset;
    setCurrentTime(audioRef.current.currentTime);

    // Find active lyric line based on actual timestamp
    let foundIndex = 0;
    for (let i = 0; i < LYRICS_DATA.length; i++) {
      if (curr >= LYRICS_DATA[i].time) {
        foundIndex = i;
      } else {
        break;
      }
    }
    if (foundIndex !== activeLyricIndex) {
      setActiveLyricIndex(foundIndex);

      // Auto-scroll ONLY inner lyrics container (never scroll window/page)
      if (lyricsContainerRef.current) {
        const container = lyricsContainerRef.current;
        const activeEl = container.querySelector(`.lyric-item-${foundIndex}`) as HTMLElement;
        if (activeEl) {
          const targetTop = activeEl.offsetTop - container.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);
          container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        }
      }
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const toggleAudioMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsAudioMuted(audioRef.current.muted);
  };

  const handleSongEnded = () => {
    setIsPlaying(false);
    soundManager.playVictoryFanfare();
    launchCelebration();
    setFinaleStep('final_wish');
  };

  const handleReplayFinale = () => {
    soundManager.playSelect();
    setFinaleStep('music_karaoke');
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  // Clean up audio & video playback on unmount or navigation
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="finale-container">
      {/* Hidden audio element bound to real state */}
      <audio
        ref={audioRef}
        src={MEDIA_CONFIG.birthdaySong}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={handleSongEnded}
        preload="auto"
      />

      {/* STAGE A: Announcement of Gift */}
      {finaleStep === 'announcement' && (
        <div className="finale-card announcement-card fade-in">
          <div className="secret-asset-icon">
            <Gift size={64} className="gold-icon pulse-glow" />
          </div>

          <div className="cyber-badge gold-badge">
            <Sparkles size={16} />
            <span>ОСОБЫЙ СЕКРЕТНЫЙ РЕЕСТР ОФК</span>
          </div>

          <h2 className="announcement-title gold-text">
            СИСТЕМА ОБНАРУЖИЛА ЕЩЁ ОДИН ФИНАНСОВЫЙ АКТИВ
          </h2>

          <div className="announcement-quotes">
            <p className="quote-item">
              «Виталий Геннадьевич, система обнаружила ещё один финансовый актив».
            </p>
            <p className="quote-item highlight">
              «Он не подлежит продаже, возврату или согласованию».
            </p>
            <p className="quote-item">
              «Для получения требуется открыть подарок».
            </p>
          </div>

          <button 
            className="cyber-button big-gold-button pulse-glow"
            onClick={() => {
              soundManager.playSelect();
              setFinaleStep('video');
            }}
          >
            <Gift size={22} />
            <span>ОТКРЫТЬ ПОДАРОК</span>
            <ChevronRight size={22} />
          </button>
        </div>
      )}

      {/* STAGE B: Team Video */}
      {finaleStep === 'video' && (
        <div className="finale-card video-card fade-in">
          <div className="video-header">
            <div className="video-title-wrap">
              <span className="live-pill">OFFICIAL OFK TAPE</span>
              <h2 className="video-heading">ПОЗДРАВЛЕНИЕ ОТ КОЛЛЕКТИВА ОФК</h2>
            </div>
            <p className="video-subheading">
              Команда OZON, WB и всего ОФК в сборе!
            </p>
          </div>

          <div className="video-player-wrapper">
            <div className="video-frame-border">
              <video
                ref={videoRef}
                src={MEDIA_CONFIG.teamVideo}
                className="team-video-element"
                controls
                playsInline
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={handleVideoEnded}
              />
            </div>
          </div>

          <div className="video-actions">
            <button 
              className="cyber-button secondary"
              onClick={handleStartUnbox}
            >
              <span>ПЕРЕЙТИ К ГЛАВНОМУ ПОДАРКУ</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* STAGE C: Unboxing Animation */}
      {finaleStep === 'unboxing' && (
        <div className="finale-card unboxing-card fade-in">
          <div className="vault-opening-animation">
            <div className="vault-door">
              <Gift size={80} className="gold-icon bounce-animated" />
            </div>
            <div className="vault-glow-beam"></div>
          </div>
          <h2 className="unboxing-title gold-text">
            РАСПАКОВКА СЕКРЕТНОГО ТРЕКА...
          </h2>
          <p className="unboxing-desc">
            Инициализация эксклюзивного подарка генерального уровня
          </p>
        </div>
      )}

      {/* STAGE D: Track Cover, Player & Karaoke */}
      {finaleStep === 'music_karaoke' && (
        <div className="finale-card music-screen fade-in">
          {/* Top Track Header */}
          <div className="track-showcase-grid">
            {/* Left/Top: Official Track Cover */}
            <div className="cover-container">
              <div className="cover-glow-ring">
                <img 
                  src={MEDIA_CONFIG.directorCover} 
                  alt="TVG - King of Trap Обложка" 
                  className="track-cover-img"
                />
              </div>

              <div className="track-badges">
                <span className="badge-pill gold">ГЕНЕРАЛЬНЫЙ ХИТ</span>
                <span className="badge-pill purple">SPECIAL BIRTHDAY EDITION</span>
              </div>

              <div className="track-meta">
                <h3 className="track-song-title">TVG — KING OF TRAP</h3>
                <p className="track-artist">Исполнитель: коллектив ОФК</p>
              </div>

              {/* Audio Controls */}
              <div className="audio-player-controls">
                <div className="scrubber-row">
                  <span className="time-display">{formatTime(currentTime)}</span>
                  <input 
                    type="range"
                    min={0}
                    max={duration || 129}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="audio-seeker"
                  />
                  <span className="time-display">{formatTime(duration)}</span>
                </div>

                <div className="player-buttons-row">
                  <button 
                    className="player-btn play-main-btn"
                    onClick={toggleAudioPlay}
                    title={isPlaying ? 'Пауза' : 'Воспроизведение'}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                  </button>

                  <button 
                    className="player-btn icon-btn"
                    onClick={toggleAudioMute}
                    title={isAudioMuted ? 'Включить звук' : 'Выключить звук'}
                  >
                    {isAudioMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>

                  <button 
                    className="player-btn icon-btn"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play();
                        setIsPlaying(true);
                      }
                    }}
                    title="В начало"
                  >
                    <RotateCcw size={18} />
                  </button>

                  <button 
                    className="player-btn icon-btn"
                    onClick={() => setShowOffsetControls(prev => !prev)}
                    title="Настройка тайминга караоке"
                  >
                    <Sliders size={18} />
                  </button>

                  <button 
                    className="finish-early-btn"
                    onClick={() => {
                      soundManager.playVictoryFanfare();
                      launchCelebration();
                      setFinaleStep('final_wish');
                    }}
                  >
                    <span>ФИНАЛЬНОЕ ПОЗДРАВЛЕНИЕ</span>
                    <Heart size={16} className="text-pink" />
                  </button>
                </div>

                {/* Optional Calibration offset panel */}
                {showOffsetControls && (
                  <div className="offset-panel fade-in">
                    <span className="offset-label">Сдвиг: {timeOffset > 0 ? `+${timeOffset.toFixed(1)}` : `${timeOffset.toFixed(1)}`}с</span>
                    <button className="offset-btn" onClick={() => setTimeOffset(t => Math.max(-5, parseFloat((t - 0.5).toFixed(1))))}>-0.5с</button>
                    <button className="offset-btn" onClick={() => setTimeOffset(t => Math.max(-5, parseFloat((t - 0.2).toFixed(1))))}>-0.2с</button>
                    <button className="offset-btn" onClick={() => setTimeOffset(0)}>0.0</button>
                    <button className="offset-btn" onClick={() => setTimeOffset(t => Math.min(5, parseFloat((t + 0.2).toFixed(1))))}>+0.2с</button>
                    <button className="offset-btn" onClick={() => setTimeOffset(t => Math.min(5, parseFloat((t + 0.5).toFixed(1))))}>+0.5с</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right/Bottom: Synchronized Karaoke */}
            <div className="karaoke-container">
              <div className="karaoke-header">
                <Music size={18} className="gold-text" />
                <span className="karaoke-title">СИНХРОНИЗИРОВАННЫЙ ТЕКСТ ТРЕКА</span>
                <span className="karaoke-live-indicator">
                  <span className="live-dot animate-ping"></span> LIVE
                </span>
              </div>

              {/* Karaoke Active Highlight Banner */}
              <div className="karaoke-active-banner">
                <span className="active-marker">СЕЙЧАС ПОЁТ:</span>
                <p className="active-lyric-main">
                  {LYRICS_DATA[activeLyricIndex]?.text || '...'}
                </p>
                {activeLyricIndex < LYRICS_DATA.length - 1 && (
                  <p className="next-lyric-preview">
                    Далее: {LYRICS_DATA[activeLyricIndex + 1]?.text}
                  </p>
                )}
              </div>

              {/* Scrollable Full Lyrics with active focus */}
              <div ref={lyricsContainerRef} className="lyrics-scroller">
                {LYRICS_DATA.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  const isPast = idx < activeLyricIndex;
                  return (
                    <div 
                      key={line.id}
                      className={`lyric-line lyric-item-${idx} ${isActive ? 'active-line' : isPast ? 'past-line' : 'future-line'}`}
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = line.time;
                          setCurrentTime(line.time);
                          if (!isPlaying) {
                            audioRef.current.play();
                            setIsPlaying(true);
                          }
                        }
                      }}
                      title="Кликните, чтобы перейти к этой строке"
                    >
                      <span className="line-timestamp">{formatTime(line.time)}</span>
                      <span className="line-content">{line.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE E: Final Wishes & Replay */}
      {finaleStep === 'final_wish' && (
        <div className="finale-card grand-wishes-card fade-in">
          <div className="wishes-gold-stars">
            <Sparkles size={48} className="gold-icon pulse-glow" />
          </div>

          <h1 className="grand-birthday-title gold-text">
            С ДНЁМ РОЖДЕНИЯ,
            <br />
            ВИТАЛИЙ ГЕННАДЬЕВИЧ!
          </h1>

          <div className="grand-wishes-body">
            <p className="wishes-main-quote">
              «Пусть деньги ловятся, решения работают, а поводов для штрафов будет меньше, чем причин для генеральной уверенности».
            </p>
          </div>

          <div className="grand-footer-signature">
            <img 
              src={MEDIA_CONFIG.logo} 
              alt="ОФК Логотип" 
              className="signature-logo" 
            />
            <p className="signature-text">
              С уважением и любовью, <strong>ваш коллектив ОФК</strong>
            </p>
          </div>

          <div className="wishes-actions-row">
            <button 
              className="cyber-button primary pulse-glow"
              onClick={handleReplayFinale}
            >
              <RotateCcw size={20} />
              <span>ПРОСМОТРЕТЬ ЕЩЁ РАЗ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
