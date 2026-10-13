import React, { useState, useEffect } from 'react';
import { QUESTIONS_DATA } from '../../config/questions';
import { MEDIA_CONFIG } from '../../config/media';
import { soundManager } from '../../utils/soundEffects';
import { ShieldAlert, CheckCircle2, ChevronRight, Terminal, Award, Lock, Sparkles } from 'lucide-react';

interface TerminalAuthProps {
  onComplete: () => void;
}

export const TerminalAuth: React.FC<TerminalAuthProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'quiz' | 'confirmed'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [reactionText, setReactionText] = useState<string | null>(null);
  const [typingEffect, setTypingEffect] = useState(true);

  // Terminal clock and status line
  const [terminalTime, setTerminalTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTerminalTime(d.toLocaleTimeString('ru-RU'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartAuth = () => {
    soundManager.playTerminalBlip();
    setStep('quiz');
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setReactionText(null);
  };

  const handleSelectOption = (optionId: string, reaction: string) => {
    soundManager.playSelect();
    setSelectedOptionId(optionId);
    setReactionText(reaction);
    setTypingEffect(true);
  };

  const handleNextQuestion = () => {
    soundManager.playTerminalBlip();
    if (currentQuestionIndex < QUESTIONS_DATA.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setReactionText(null);
    } else {
      soundManager.playAccessGranted();
      setStep('confirmed');
    }
  };

  const currentQ = QUESTIONS_DATA[currentQuestionIndex];

  return (
    <div className="terminal-container">
      {/* Background terminal scanlines and grid */}
      <div className="scanlines"></div>
      <div className="terminal-glow-bg"></div>

      {/* Terminal Header Bar */}
      <div className="terminal-topbar">
        <div className="topbar-left">
          <span className="terminal-dot red"></span>
          <span className="terminal-dot yellow"></span>
          <span className="terminal-dot green"></span>
          <span className="topbar-title">OFK-SYS-TERMINAL // ROOT_ACCESS</span>
        </div>
        <div className="topbar-right">
          <span className="live-clock">{terminalTime}</span>
          <span className="status-badge online">ONLINE</span>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="terminal-main-card">
        {/* State 1: Welcome / Start Authorization */}
        {step === 'welcome' && (
          <div className="welcome-screen">
            <div className="logo-wrapper">
              <img 
                src={MEDIA_CONFIG.logo} 
                alt="Логотип ОФК" 
                className="ofk-logo animate-pulse-subtle"
                onError={(e) => {
                  // Fallback styling if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="cyber-badge">
              <Lock size={14} className="icon-pulse" />
              <span>СИСТЕМА ПРОВЕРКИ ГЕНЕРАЛЬНЫХ ПОЛНОМОЧИЙ</span>
            </div>

            <h1 className="cyber-title">
              <span className="gold-text">ТЕТЕРЕВЕНКОВ SIMULATOR:</span>
              <br />
              <span className="neon-text">ГЕНЕРАЛЬНЫЙ УРОВЕНЬ</span>
            </h1>

            <p className="cyber-subtitle">
              «Виталий Геннадьевич. Доступ к финансовым потокам разрешён»
            </p>

            <div className="terminal-system-specs">
              <div className="spec-row">
                <span className="spec-label">СУБЪЕКТ:</span>
                <span className="spec-val">ТЕТЕРЕВЕНКОВ ВИТАЛИЙ ГЕННАДЬЕВИЧ</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">ОРГАНИЗАЦИЯ:</span>
                <span className="spec-val">ОЗЕРСКАЯ ФУРНИТУРНАЯ КОМПАНИЯ (ОФК)</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">ПРОТОКОЛ:</span>
                <span className="spec-val highlight-green">ГОС_ПРОВЕРКА_146%_SUCCESS</span>
              </div>
            </div>

            <button 
              className="cyber-button primary pulse-glow"
              onClick={handleStartAuth}
              onMouseEnter={() => soundManager.playTerminalBlip()}
            >
              <span>НАЧАТЬ ПРОВЕРКУ</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* State 2: 4 Comic Questions */}
        {step === 'quiz' && (
          <div className="quiz-screen">
            <div className="quiz-progress-bar">
              {QUESTIONS_DATA.map((q, idx) => (
                <div 
                  key={q.id} 
                  className={`progress-step ${idx === currentQuestionIndex ? 'active' : idx < currentQuestionIndex ? 'completed' : ''}`}
                >
                  <span className="step-num">0{idx + 1}</span>
                </div>
              ))}
            </div>

            <div className="quiz-header">
              <span className="quiz-step-tag">
                КОНТРОЛЬНЫЙ ВОПРОС {currentQuestionIndex + 1} / {QUESTIONS_DATA.length}
              </span>
              <h2 className="quiz-question-text">
                {currentQ.question}
              </h2>
            </div>

            <div className="quiz-options-list">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(opt.id, opt.reaction)}
                    onMouseEnter={() => soundManager.playTerminalBlip()}
                  >
                    <div className="opt-indicator">
                      {isSelected ? <CheckCircle2 size={18} className="text-green" /> : <div className="opt-radio"></div>}
                    </div>
                    <span className="opt-text">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Comic Reaction Output */}
            {reactionText && (
              <div className="system-reaction-box fade-in">
                <div className="reaction-header">
                  <Terminal size={16} />
                  <span>РЕАКЦИЯ СИСТЕМЫ:</span>
                </div>
                <div className="reaction-body">
                  <span className="reaction-prompt">&gt; </span>
                  <span className="reaction-text">{reactionText}</span>
                </div>

                <div className="reaction-action">
                  <button 
                    className="cyber-button secondary"
                    onClick={handleNextQuestion}
                    onMouseEnter={() => soundManager.playTerminalBlip()}
                  >
                    <span>{currentQuestionIndex < QUESTIONS_DATA.length - 1 ? 'СЛЕДУЮЩИЙ ВОПРОС' : 'ПОДТВЕРДИТЬ ПОЛНОМОЧИЯ'}</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State 3: Final Authorization Banner */}
        {step === 'confirmed' && (
          <div className="confirmed-screen fade-in">
            <div className="confirmed-scanner">
              <div className="scanner-circle">
                <Award size={64} className="gold-icon pulse-glow" />
              </div>
              <div className="radar-sweep"></div>
            </div>

            <div className="confirmed-badge">
              <CheckCircle2 size={20} className="text-green" />
              <span>ВЕРИФИКАЦИЯ УСПЕШНА</span>
            </div>

            <h2 className="confirmed-title neon-text">
              ЛИЧНОСТЬ ПОДТВЕРЖДЕНА
            </h2>

            <div className="confirmed-stats">
              <div className="c-stat-card">
                <span className="c-stat-label">Уровень полномочий:</span>
                <span className="c-stat-val gold-text">ГЕНЕРАЛЬНЫЙ</span>
              </div>
              <div className="c-stat-card">
                <span className="c-stat-label">Статус доступа:</span>
                <span className="c-stat-val text-green">РАЗРЕШЁН (146%)</span>
              </div>
            </div>

            <div className="financial-access-alert">
              <Sparkles size={20} className="gold-text" />
              <p>«Доступ к финансовым потокам разрешён»</p>
            </div>

            <button 
              className="cyber-button big-gold-button pulse-glow"
              onClick={() => {
                soundManager.playChaChing();
                onComplete();
              }}
              onMouseEnter={() => soundManager.playTerminalBlip()}
            >
              <span>ЗАБРАТЬ СВОЁ</span>
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      <div className="terminal-footer">
        <span>ОФК TERMINAL OS v7.7.0</span>
        <span>•</span>
        <span>SECURITY LEVEL: MAXIMUM</span>
        <span>•</span>
        <span>ВИТАЛИЙ ГЕННАДЬЕВИЧ ТЕТЕРЕВЕНКОВ</span>
      </div>
    </div>
  );
};
