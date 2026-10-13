import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { MEDIA_CONFIG } from '../../config/media';
import { soundManager } from '../../utils/soundEffects';
import { DropItem } from '../../types';
import { 
  Volume2, VolumeX, Pause, Play, Trophy, ArrowLeft, ArrowRight, 
  Sparkles, DollarSign, AlertTriangle, ShieldCheck 
} from 'lucide-react';

interface MoneyCatcherProps {
  onComplete: () => void;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
}

export const MoneyCatcher: React.FC<MoneyCatcherProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game state
  const [bagsCaught, setBagsCaught] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [penaltiesCount, setPenaltiesCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [isVictory, setIsVictory] = useState(false);

  // References to keep in loop without stale closures
  const stateRef = useRef({
    bagsCaught: 0,
    totalScore: 0,
    penaltiesCount: 0,
    isPaused: false,
    isVictory: false,
    playerX: 250,
    playerWidth: 90,
    playerHeight: 100,
    playerSpeed: 8,
    isSlowed: false,
    slowTimer: 0,
    keys: { left: false, right: false },
    items: [] as DropItem[],
    floatingTexts: [] as FloatingText[],
    lastSpawnTime: 0,
    bagSpawnInterval: 5000,
    directorImg: null as HTMLImageElement | null,
    canvasWidth: 600,
    canvasHeight: 500,
    gameTime: 0,
  });

  // Preload Director's photo
  useEffect(() => {
    const img = new Image();
    img.src = MEDIA_CONFIG.directorPhoto;
    img.onload = () => {
      stateRef.current.directorImg = img;
    };
  }, []);

  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const togglePause = () => {
    stateRef.current.isPaused = !stateRef.current.isPaused;
    setIsPaused(stateRef.current.isPaused);
  };

  // Trigger grand victory fireworks
  const triggerVictory = useCallback(() => {
    stateRef.current.isVictory = true;
    setIsVictory(true);
    soundManager.playVictoryFanfare();

    // Launch confetti cascades
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#ffd700', '#00ff88', '#ffffff', '#f59e0b', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') {
        stateRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
        stateRef.current.keys.right = true;
      }
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') {
        stateRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
        stateRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let itemIdCounter = 1;
    let floatingIdCounter = 1;

    // Handle responsive canvas sizing
    const updateSize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const targetW = Math.min(rect.width, 700);
      const targetH = Math.min(window.innerHeight * 0.62, 540);

      canvas.width = targetW;
      canvas.height = targetH;
      stateRef.current.canvasWidth = targetW;
      stateRef.current.canvasHeight = targetH;
      
      // keep player in bounds
      if (stateRef.current.playerX > targetW - stateRef.current.playerWidth) {
        stateRef.current.playerX = targetW - stateRef.current.playerWidth - 10;
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Initial player position
    stateRef.current.playerX = (canvas.width - stateRef.current.playerWidth) / 2;

    const spawnItem = (now: number) => {
      const w = stateRef.current.canvasWidth;
      const isBagTime = (now - stateRef.current.lastSpawnTime > 4200) || (Math.random() < 0.22);
      
      let itemType: DropItem['type'];
      let label: string;
      let isPositive: boolean;
      let points: number;
      let isBag = false;

      if (isBagTime) {
        itemType = 'bag';
        label = '💰 МЕШОК';
        isPositive = true;
        points = 100000;
        isBag = true;
        stateRef.current.lastSpawnTime = now;
      } else {
        const rand = Math.random();
        if (rand < 0.28) {
          itemType = 'cash';
          label = '💵 $10,000';
          isPositive = true;
          points = 10000;
        } else if (rand < 0.48) {
          itemType = 'coin';
          label = '🪙 МОНЕТА';
          isPositive = true;
          points = 2500;
        } else if (rand < 0.68) {
          itemType = 'fine_wb';
          label = '⚠️ ШТРАФ WB';
          isPositive = false;
          points = -5000;
        } else if (rand < 0.82) {
          itemType = 'fine_ozon';
          label = '📦 СЧЁТ OZON';
          isPositive = false;
          points = -4000;
        } else {
          itemType = 'return';
          label = '⚡ ВОЗВРАТ';
          isPositive = false;
          points = -3000;
        }
      }

      const itemWidth = isBag ? 52 : 44;
      const itemHeight = isBag ? 52 : 44;
      const x = Math.random() * (w - itemWidth - 20) + 10;
      const speed = isBag ? 2.6 : 3.0 + Math.random() * 2.2;

      stateRef.current.items.push({
        id: itemIdCounter++,
        x,
        y: -50,
        speed,
        type: itemType,
        width: itemWidth,
        height: itemHeight,
        label,
        isPositive,
        points,
        isBag
      });
    };

    let lastTick = performance.now();
    let spawnTimer = 0;

    const gameLoop = (currentTime: number) => {
      const dt = currentTime - lastTick;
      lastTick = currentTime;

      if (!stateRef.current.isPaused && !stateRef.current.isVictory) {
        stateRef.current.gameTime += dt;
        spawnTimer += dt;

        // Spawn items periodically
        if (spawnTimer > 750) {
          spawnItem(currentTime);
          spawnTimer = 0;
        }

        // Handle slow penalty timer
        if (stateRef.current.isSlowed) {
          stateRef.current.slowTimer -= dt;
          if (stateRef.current.slowTimer <= 0) {
            stateRef.current.isSlowed = false;
          }
        }

        // Move player
        const speed = stateRef.current.isSlowed ? stateRef.current.playerSpeed * 0.5 : stateRef.current.playerSpeed;
        if (stateRef.current.keys.left) {
          stateRef.current.playerX = Math.max(10, stateRef.current.playerX - speed);
        }
        if (stateRef.current.keys.right) {
          stateRef.current.playerX = Math.min(
            stateRef.current.canvasWidth - stateRef.current.playerWidth - 10,
            stateRef.current.playerX + speed
          );
        }

        // Update items
        const playerBox = {
          x: stateRef.current.playerX,
          y: stateRef.current.canvasHeight - stateRef.current.playerHeight,
          w: stateRef.current.playerWidth,
          h: stateRef.current.playerHeight,
        };

        const remainingItems: DropItem[] = [];

        for (const item of stateRef.current.items) {
          item.y += item.speed;

          // Check collision with player
          const collides = (
            item.x < playerBox.x + playerBox.w &&
            item.x + item.width > playerBox.x &&
            item.y + item.height > playerBox.y + 20 &&
            item.y < playerBox.y + playerBox.h
          );

          if (collides) {
            if (item.isPositive) {
              if (item.isBag) {
                soundManager.playChaChing();
                stateRef.current.bagsCaught += 1;
                setBagsCaught(stateRef.current.bagsCaught);

                // Add text popup
                stateRef.current.floatingTexts.push({
                  id: floatingIdCounter++,
                  x: item.x,
                  y: item.y,
                  text: '🔥 МЕШОК +1!',
                  color: '#ffd700',
                  opacity: 1
                });

                if (stateRef.current.bagsCaught >= 5) {
                  triggerVictory();
                  break;
                }
              } else {
                soundManager.playCoin();
                stateRef.current.floatingTexts.push({
                  id: floatingIdCounter++,
                  x: item.x,
                  y: item.y,
                  text: item.label,
                  color: '#00ff88',
                  opacity: 1
                });
              }

              stateRef.current.totalScore += item.points;
              setTotalScore(stateRef.current.totalScore);
            } else {
              // Negative item
              soundManager.playPenalty();
              stateRef.current.penaltiesCount += 1;
              setPenaltiesCount(stateRef.current.penaltiesCount);
              stateRef.current.isSlowed = true;
              stateRef.current.slowTimer = 800; // 0.8s slow effect
              stateRef.current.totalScore = Math.max(0, stateRef.current.totalScore + item.points);
              setTotalScore(stateRef.current.totalScore);

              stateRef.current.floatingTexts.push({
                id: floatingIdCounter++,
                x: item.x,
                y: item.y,
                text: item.label,
                color: '#ff4444',
                opacity: 1
              });
            }
          } else if (item.y < stateRef.current.canvasHeight + 40) {
            remainingItems.push(item);
          }
        }

        stateRef.current.items = remainingItems;

        // Update floating texts
        stateRef.current.floatingTexts = stateRef.current.floatingTexts
          .map(ft => ({ ...ft, y: ft.y - 1.2, opacity: ft.opacity - 0.025 }))
          .filter(ft => ft.opacity > 0);
      }

      // RENDER CANVAS
      renderCanvas(ctx);

      if (!stateRef.current.isVictory) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    const renderCanvas = (c: CanvasRenderingContext2D) => {
      const w = stateRef.current.canvasWidth;
      const h = stateRef.current.canvasHeight;

      // Background
      c.fillStyle = '#0b0f14';
      c.fillRect(0, 0, w, h);

      // Cyber Grid floor lines
      c.strokeStyle = 'rgba(0, 255, 136, 0.08)';
      c.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, h);
        c.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(w, y);
        c.stroke();
      }

      // Draw Items
      for (const item of stateRef.current.items) {
        c.save();
        c.translate(item.x + item.width / 2, item.y + item.height / 2);

        if (item.type === 'bag') {
          // Gold glowing bag
          c.shadowColor = '#ffd700';
          c.shadowBlur = 15;
          c.fillStyle = '#b45309';
          c.beginPath();
          c.arc(0, 2, 22, 0, Math.PI * 2);
          c.fill();

          c.fillStyle = '#f59e0b';
          c.beginPath();
          c.arc(0, 0, 19, 0, Math.PI * 2);
          c.fill();

          // Bag tie
          c.fillStyle = '#fef08a';
          c.fillRect(-6, -24, 12, 8);

          // Dollar sign
          c.fillStyle = '#064e3b';
          c.font = 'bold 20px "Montserrat", sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText('$', 0, 2);
        } else if (item.type === 'cash') {
          // Emerald cash stack
          c.shadowColor = '#00ff88';
          c.shadowBlur = 10;
          c.fillStyle = '#065f46';
          c.fillRect(-20, -12, 40, 24);
          c.fillStyle = '#10b981';
          c.fillRect(-18, -10, 36, 20);

          c.fillStyle = '#ffffff';
          c.font = 'bold 12px "Montserrat", sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText('RUB', 0, 0);
        } else if (item.type === 'coin') {
          // Gold coin
          c.shadowColor = '#ffd700';
          c.shadowBlur = 8;
          c.fillStyle = '#d97706';
          c.beginPath();
          c.arc(0, 0, 16, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#fbbf24';
          c.beginPath();
          c.arc(0, 0, 13, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#78350f';
          c.font = 'bold 13px sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText('₽', 0, 0);
        } else {
          // Negative items (Penalties / WB / Ozon / Fee)
          c.shadowColor = '#ef4444';
          c.shadowBlur = 12;
          c.fillStyle = '#7f1d1d';
          c.beginPath();
          c.roundRect(-22, -14, 44, 28, 6);
          c.fill();

          c.fillStyle = '#dc2626';
          c.beginPath();
          c.roundRect(-20, -12, 40, 24, 4);
          c.fill();

          c.fillStyle = '#ffffff';
          c.font = 'bold 10px "Montserrat", sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';

          if (item.type === 'fine_wb') {
            c.fillText('WB ШТРАФ', 0, 0);
          } else if (item.type === 'fine_ozon') {
            c.fillText('OZON СЧЁТ', 0, 0);
          } else {
            c.fillText('ВОЗВРАТ', 0, 0);
          }
        }

        c.restore();
      }

      // Draw Player: Vitaly Gennadievich
      const px = stateRef.current.playerX;
      const py = stateRef.current.canvasHeight - stateRef.current.playerHeight - 8;
      const pw = stateRef.current.playerWidth;
      const ph = stateRef.current.playerHeight;

      c.save();
      // Glowing aura
      if (stateRef.current.isSlowed) {
        c.shadowColor = '#ef4444';
        c.shadowBlur = 15;
      } else {
        c.shadowColor = '#ffd700';
        c.shadowBlur = 18;
      }

      // 1. Executive Gold Cart / Safe at base
      const cartY = py + 48;
      const cartH = 46;
      c.fillStyle = '#1e293b';
      c.beginPath();
      c.roundRect(px, cartY, pw, cartH, 8);
      c.fill();

      // Golden trim
      c.strokeStyle = '#ffd700';
      c.lineWidth = 2.5;
      c.stroke();

      // Safe lock / Director Badge on cart
      c.fillStyle = '#f59e0b';
      c.font = 'bold 11px "Montserrat", sans-serif';
      c.textAlign = 'center';
      c.fillText('★ ОФК БЮДЖЕТ ★', px + pw / 2, cartY + 28);

      // 2. Director Avatar Head / Portrait
      const headRadius = 28;
      const headCenterX = px + pw / 2;
      const headCenterY = py + 26;

      if (stateRef.current.directorImg && stateRef.current.directorImg.complete) {
        // Draw real photo clipped inside circular golden executive frame
        c.save();
        c.beginPath();
        c.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        c.clip();

        // Draw image centered on face
        const img = stateRef.current.directorImg;
        // The portrait image face is located near top center
        const sSize = Math.min(img.width, img.height * 0.7);
        c.drawImage(
          img,
          (img.width - sSize) / 2,
          img.height * 0.05,
          sSize,
          sSize,
          headCenterX - headRadius,
          headCenterY - headRadius,
          headRadius * 2,
          headRadius * 2
        );
        c.restore();

        // Gold ring around portrait
        c.strokeStyle = '#ffd700';
        c.lineWidth = 3;
        c.beginPath();
        c.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        c.stroke();
      } else {
        // Fallback stylized character head
        c.fillStyle = '#f59e0b';
        c.beginPath();
        c.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#0b0f14';
        c.font = 'bold 14px "Montserrat", sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('ТВГ', headCenterX, headCenterY);
      }

      // Sunglasses / Boss glasses reflection
      c.fillStyle = 'rgba(0, 255, 136, 0.8)';
      c.fillRect(headCenterX - 18, headCenterY - 4, 14, 7);
      c.fillRect(headCenterX + 4, headCenterY - 4, 14, 7);

      c.restore();

      // Draw Floating Texts
      for (const ft of stateRef.current.floatingTexts) {
        c.save();
        c.font = 'bold 15px "Montserrat", sans-serif';
        c.fillStyle = ft.color;
        c.globalAlpha = ft.opacity;
        c.shadowColor = ft.color;
        c.shadowBlur = 8;
        c.textAlign = 'center';
        c.fillText(ft.text, ft.x, ft.y);
        c.restore();
      }

      // Draw Pause Overlay if paused
      if (stateRef.current.isPaused) {
        c.fillStyle = 'rgba(11, 15, 20, 0.75)';
        c.fillRect(0, 0, w, h);
        c.fillStyle = '#ffd700';
        c.font = 'bold 24px "Montserrat", sans-serif';
        c.textAlign = 'center';
        c.fillText('ПАУЗА', w / 2, h / 2);
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, [triggerVictory]);

  // Touch and dragging controls
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!canvasRef.current || stateRef.current.isPaused || stateRef.current.isVictory) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const targetX = touchX - stateRef.current.playerWidth / 2;
    stateRef.current.playerX = Math.max(10, Math.min(stateRef.current.canvasWidth - stateRef.current.playerWidth - 10, targetX));
  };

  const handleMoveLeftBtn = (start: boolean) => {
    stateRef.current.keys.left = start;
  };

  const handleMoveRightBtn = (start: boolean) => {
    stateRef.current.keys.right = start;
  };

  return (
    <div className="game-container">
      {/* Top HUD */}
      <div className="game-hud">
        <div className="hud-metric gold-metric">
          <div className="metric-icon">
            <DollarSign size={20} className="gold-text" />
          </div>
          <div className="metric-info">
            <span className="metric-label">МЕШКИ С ДЕНЬГАМИ:</span>
            <span className="metric-value gold-text">{bagsCaught} / 5</span>
          </div>
        </div>

        <div className="hud-metric green-metric">
          <div className="metric-icon">
            <Sparkles size={20} className="text-green" />
          </div>
          <div className="metric-info">
            <span className="metric-label">ОБЩИЙ БЮДЖЕТ:</span>
            <span className="metric-value text-green">{totalScore.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

        <div className="hud-metric red-metric">
          <div className="metric-icon">
            <AlertTriangle size={18} className="text-red" />
          </div>
          <div className="metric-info">
            <span className="metric-label">ОТБИТО ШТРАФОВ:</span>
            <span className="metric-value text-red">{penaltiesCount}</span>
          </div>
        </div>

        <div className="hud-controls">
          <button 
            className="hud-btn" 
            onClick={toggleMute} 
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button 
            className="hud-btn" 
            onClick={togglePause} 
            title={isPaused ? 'Продолжить' : 'Пауза'}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {/* Canvas Game Area */}
      <div 
        ref={containerRef} 
        className="canvas-wrapper"
        onTouchMove={handleTouchMove}
      >
        <canvas ref={canvasRef} className="game-canvas" />
      </div>

      {/* Target reminder banner */}
      <div className="game-target-banner">
        <span>Цель: поймать 5 мешков с деньгами 💰</span>
      </div>

      {/* Bottom Controls for Mobile / Touch / Quick Access */}
      <div className="mobile-touch-controls">
        <button 
          className="touch-btn left"
          onMouseDown={() => handleMoveLeftBtn(true)}
          onMouseUp={() => handleMoveLeftBtn(false)}
          onTouchStart={(e) => { e.preventDefault(); handleMoveLeftBtn(true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleMoveLeftBtn(false); }}
        >
          <ArrowLeft size={24} />
          <span>ВЛЕВО</span>
        </button>

        <button 
          className="touch-btn right"
          onMouseDown={() => handleMoveRightBtn(true)}
          onMouseUp={() => handleMoveRightBtn(false)}
          onTouchStart={(e) => { e.preventDefault(); handleMoveRightBtn(true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleMoveRightBtn(false); }}
        >
          <span>ВПРАВО</span>
          <ArrowRight size={24} />
        </button>
      </div>

      {/* Victory Modal Overlay - Fixed Fullscreen */}
      {isVictory && (
        <div className="victory-overlay fade-in">
          <div className="victory-card">
            <div className="victory-trophy-circle">
              <Trophy size={48} className="gold-icon pulse-glow" />
            </div>

            <div className="victory-badge">
              <ShieldCheck size={16} className="text-green" />
              <span>ГЕНЕРАЛЬНАЯ ПОБЕДА</span>
            </div>

            <h2 className="victory-title gold-text">
              ФИНАНСОВАЯ ИНТУИЦИЯ ГЕНЕРАЛЬНОГО СРАБОТАЛА!
            </h2>

            <p className="victory-text-highlight">
              Штрафы, комиссии и маркетплейсы пытались помешать, но бюджет спасён.
            </p>

            <div className="victory-summary-box">
              <p className="victory-summary">
                Итог: <strong>деньги пойманы</strong>. Авторитет не пострадал.
              </p>
              <div className="victory-stats-row">
                <span>Мешки: <strong>5 / 5</strong></span>
                <span>•</span>
                <span>Капитал: <strong>{totalScore.toLocaleString('ru-RU')} ₽</strong></span>
              </div>
            </div>

            <button 
              className="cyber-button big-gold-button pulse-glow"
              onClick={() => {
                soundManager.playSelect();
                onComplete();
              }}
            >
              <span>ПЕРЕЙТИ К СЕКРЕТНОМУ ПОДАРКУ</span>
              <Sparkles size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
