import React from 'react';
import { useQuest } from '../context/QuestContext';
import { QUEST_CONFIG } from '../config/questConfig';
import { VaultCase } from './VaultCase';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';

export const EntranceScene: React.FC = () => {
  const { state, goToScene, toggleSound } = useQuest();

  return (
    <div className="scene-container">
      {QUEST_CONFIG.meta.isDemoMode && (
        <div className="demo-banner">
          <span>
            <strong>Демо-набор материалов активен:</strong> Все цитаты, вопросы и поздравления сотрудников вынесены в <code>questConfig.ts</code> и легко заменяются.
          </span>
          <span style={{ fontSize: 11, opacity: 0.8 }}>ОФК 2026</span>
        </div>
      )}

      <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 24px' }}>
        <div className="scene-kicker">{QUEST_CONFIG.meta.kicker}</div>
        <h1 className="scene-title">
          {QUEST_CONFIG.person.greetingName}, сегодня всё работает на вас.
        </h1>
        <p className="scene-desc" style={{ margin: '0 auto' }}>
          {QUEST_CONFIG.meta.subtitle}
        </p>
      </div>

      {/* Центральный визуальный кейс */}
      <VaultCase />

      {/* Нижняя часть с CTA и переключателем звука */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => goToScene('trial1')}
          autoFocus
        >
          <span>Принять поставку</span>
          <ArrowRight size={18} />
        </button>

        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Три испытания. Один особенный подарок.
        </p>

        <button
          type="button"
          onClick={toggleSound}
          style={{
            background: 'transparent',
            border: 'none',
            color: state.soundEnabled ? 'var(--accent-gold)' : 'var(--text-muted)',
            fontSize: 12.5,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 6,
            padding: '6px 10px',
          }}
        >
          {state.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>{state.soundEnabled ? 'Звуковое сопровождение включено' : 'Звук выключен (нажмите, чтобы включить)'}</span>
        </button>
      </div>
    </div>
  );
};
