import React, { useState } from 'react';
import { MEDIA_CONFIG } from '../../config/media';
import { soundManager } from '../../utils/soundEffects';
import { Volume2, VolumeX, Shield } from 'lucide-react';

interface HeaderProps {
  currentStage: 'auth' | 'game' | 'finale';
}

export const Header: React.FC<HeaderProps> = ({ currentStage }) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="global-header">
      <div className="header-left">
        <img 
          src={MEDIA_CONFIG.logo} 
          alt="ОФК" 
          className="header-logo"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="header-title-group">
          <span className="header-system-title">ТЕТЕРЕВЕНКОВ SIMULATOR</span>
          <span className="header-badge">ГЕНЕРАЛЬНЫЙ УРОВЕНЬ</span>
        </div>
      </div>

      <div className="header-center">
        <div className="stage-steps-pill">
          <div className={`step-item ${currentStage === 'auth' ? 'active' : 'completed'}`}>
            <span className="step-num">1</span>
            <span className="step-text">Авторизация</span>
          </div>
          <div className="step-divider">›</div>
          <div className={`step-item ${currentStage === 'game' ? 'active' : currentStage === 'finale' ? 'completed' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-text">Поймай Деньги</span>
          </div>
          <div className="step-divider">›</div>
          <div className={`step-item ${currentStage === 'finale' ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-text">Секретный Подарок</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <button 
          className="sound-toggle-btn"
          onClick={handleToggleSound}
          title={isMuted ? 'Включить звук эффектов' : 'Выключить звук эффектов'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span className="sound-label">{isMuted ? 'ЗВУК ВЫКЛ' : 'ЗВУК ВКЛ'}</span>
        </button>
      </div>
    </header>
  );
};
