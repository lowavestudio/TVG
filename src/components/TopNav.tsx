import React from 'react';
import { useQuest } from '../context/QuestContext';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { state, toggleSound, resetQuest } = useQuest();
  const { keys, soundEnabled, currentScene } = state;

  return (
    <header className="top-nav" role="banner">
      <div className="top-brand">
        <img
          src="./assets/ofk-logo.webp"
          alt="ОФК - Озёрская фурнитурная компания"
          className="brand-logo-img"
        />
        <div className="brand-title-box">
          <span className="brand-title-main">Озёрская фурнитурная компания</span>
          <span className="brand-title-sub">Особая поставка // 2026-ТВГ</span>
        </div>
      </div>

      <div className="top-actions">
        {/* Индикатор собранных ключей */}
        <div className="keys-tracker" title="Статус символических ключей">
          <div className={`key-pill ${keys.key1 ? 'active' : ''}`} title="Ключ 1: Авторитет">
            <span className="key-dot" />
            <span>I. АВТОРИТЕТ</span>
          </div>
          <div className={`key-pill ${keys.key2 ? 'active' : ''}`} title="Ключ 2: Точность">
            <span className="key-dot" />
            <span>II. ТОЧНОСТЬ</span>
          </div>
          <div className={`key-pill ${keys.key3 ? 'active' : ''}`} title="Ключ 3: Команда">
            <span className="key-dot" />
            <span>III. КОМАНДА</span>
          </div>
        </div>

        {/* Переключатель звука */}
        <button
          type="button"
          className="btn-icon"
          onClick={toggleSound}
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
          aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        >
          {soundEnabled ? <Volume2 size={18} color="#E5A93C" /> : <VolumeX size={18} />}
        </button>

        {/* Сброс/Рестарт квеста при необходимости */}
        {currentScene === 'finale' && (
          <button
            type="button"
            className="btn-icon"
            onClick={resetQuest}
            title="Пройти квест заново"
            aria-label="Пройти квест заново"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
