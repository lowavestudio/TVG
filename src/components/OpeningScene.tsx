import React, { useState } from 'react';
import { useQuest } from '../context/QuestContext';
import { QUEST_CONFIG } from '../config/questConfig';
import { VaultCase } from './VaultCase';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, CheckCircle2 } from 'lucide-react';

export const OpeningScene: React.FC = () => {
  const { openGiftAction } = useQuest();
  const [isOpening, setIsOpening] = useState(false);
  const config = QUEST_CONFIG.opening;

  const handleOpenGift = () => {
    setIsOpening(true);

    // Конфетти салют
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E31E24', '#E5A93C', '#FFFFFF', '#D9B98A'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#E31E24', '#E5A93C'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#E31E24', '#E5A93C'],
        });
      }, 400);
    } catch {}

    // Визуальный переход 1.2 секунды
    setTimeout(() => {
      openGiftAction();
    }, 1200);
  };

  return (
    <div className={`scene-container ${isOpening ? 'scene-transition-opening' : ''}`}>
      <div className="opening-stage">
        <div className="open-case-visual">
          <div className="open-case-core">
            <Gift size={84} color="#E5A93C" style={{ filter: 'drop-shadow(0 0 16px rgba(229,169,60,0.5))' }} />
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#86efac', fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 12 }}>
          <CheckCircle2 size={18} />
          <span>{config.accessGrantedText}</span>
        </div>

        <div className="epigraph-box">
          <div className="epigraph-line1">{config.epigraphLine1}</div>
          <div className="epigraph-line2">{config.epigraphLine2}</div>
        </div>

        {/* Кейс с уже установленными тремя ключами */}
        <div style={{ width: '100%', maxWidth: 540, marginBottom: 28 }}>
          <VaultCase />
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleOpenGift}
          disabled={isOpening}
          style={{ minHeight: 56, padding: '16px 36px', fontSize: 17 }}
          autoFocus
        >
          <Sparkles size={20} />
          <span>{isOpening ? 'Раскрытие подарка...' : config.openGiftButton}</span>
        </button>
      </div>
    </div>
  );
};
