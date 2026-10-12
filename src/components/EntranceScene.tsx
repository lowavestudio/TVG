import React from 'react';
import { useQuest } from '../context/QuestContext';
import { QUEST_CONFIG } from '../config/questConfig';
import { VaultCase } from './VaultCase';
import { ArrowRight, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

export const EntranceScene: React.FC = () => {
  const { state, goToScene, toggleSound } = useQuest();

  return (
    <div className="scene-container">
      {QUEST_CONFIG.meta.isDemoMode && (
        <div className="demo-banner">
          <span>
            <strong>Режим поздравления:</strong> Все тексты и испытания синхронизированы с историей ОФК и настраиваются в <code>questConfig.ts</code>.
          </span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>ОФК · ОЗЁРСК · 2026</span>
        </div>
      )}

      <div style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <img
            src="./assets/ofk-logo.webp"
            alt="ОФК - Озёрская фурнитурная компания"
            style={{ height: 68, width: 'auto', filter: 'drop-shadow(0 4px 16px rgba(227, 30, 36, 0.45))' }}
          />
        </div>

        <div className="scene-kicker">
          <ShieldCheck size={14} color="#E5A93C" />
          <span>{QUEST_CONFIG.meta.kicker}</span>
        </div>

        <h1 className="scene-title">
          {QUEST_CONFIG.person.greetingName},<br />
          сегодня всё работает на вас
        </h1>

        <p className="scene-desc" style={{ margin: '0 auto' }}>
          {QUEST_CONFIG.meta.subtitle}
        </p>
      </div>

      {/* Центральный визуальный кейс с ключами */}
      <VaultCase />

      {/* Главная кнопка действия */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => goToScene('trial1')}
          autoFocus
        >
          <span>Принять поставку</span>
          <ArrowRight size={20} />
        </button>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          ТРИ ИСПЫТАНИЯ. ОДИН ОСОБЕННЫЙ ПОДАРОК.
        </p>

        <button
          type="button"
          onClick={toggleSound}
          style={{
            background: 'transparent',
            border: 'none',
            color: state.soundEnabled ? 'var(--accent-gold)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            marginTop: 4,
            padding: '6px 12px',
          }}
        >
          {state.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{state.soundEnabled ? 'Звуковое сопровождение активно' : 'Звук выключен (нажмите для включения)'}</span>
        </button>
      </div>
    </div>
  );
};
