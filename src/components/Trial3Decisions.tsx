import React, { useState } from 'react';
import { useQuest } from '../context/QuestContext';
import { QUEST_CONFIG } from '../config/questConfig';
import { Check, ArrowRight, FastForward, HeartHandshake, Sparkles } from 'lucide-react';

export const Trial3Decisions: React.FC = () => {
  const { state, answerTrial3, nextTrial3Situation, goToScene, skipCurrentTrial } = useQuest();
  const { trial3, keys } = state;
  const config = QUEST_CONFIG.trial3_decisions;
  const currentSit = config.situations[trial3.currentSituationIndex];

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ reaction: string; verdict: string } | null>(null);

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    const result = answerTrial3(optionId);
    setFeedback({
      reaction: result.reaction,
      verdict: result.verdict,
    });
  };

  const handleNext = () => {
    setSelectedOptionId(null);
    setFeedback(null);
    if (trial3.currentSituationIndex + 1 >= config.situations.length || keys.key3) {
      goToScene('opening');
    } else {
      nextTrial3Situation();
    }
  };

  const isLast = trial3.currentSituationIndex + 1 >= config.situations.length;

  return (
    <div className="scene-container">
      <div className="scene-kicker">Испытание III // Секция «Команда»</div>
      <h2 className="scene-title">{config.title}</h2>
      <p className="scene-desc">
        {config.subtitle}
        <br />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Ситуация {Math.min(trial3.currentSituationIndex + 1, config.situations.length)} из {config.situations.length}
        </span>
      </p>

      {/* Если этап уже завершен */}
      {keys.key3 && !feedback ? (
        <div className="situation-card" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 18, background: 'rgba(229, 169, 60, 0.15)', borderRadius: '50%', marginBottom: 16 }}>
            <HeartHandshake size={48} color="#E5A93C" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            Третий ключ разблокирован: «{QUEST_CONFIG.keys.key3.name}»
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 24px' }}>
            {QUEST_CONFIG.keys.key3.desc}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => goToScene('opening')}
            autoFocus
          >
            <span>Перейти к открытию подарка</span>
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="situation-card">
          <div className="situation-header">
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', display: 'block', marginBottom: 8 }}>
              {currentSit?.title}
            </span>
            <div className="situation-narrative">{currentSit?.situation}</div>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            {config.hint}
          </div>

          <div className="quiz-options-list" role="radiogroup" aria-label="Варианты решений директора">
            {currentSit?.options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              const letter = ['А', 'Б', 'В'][idx] || String(idx + 1);

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`quiz-option-button ${isSelected ? 'correct' : ''}`}
                  onClick={() => handleSelectOption(opt.id)}
                  aria-pressed={isSelected}
                >
                  <span className="quiz-option-letter">{letter}</span>
                  <span style={{ flex: 1 }}>{opt.text}</span>
                  {isSelected && <Check size={20} color="#22c55e" />}
                </button>
              );
            })}
          </div>

          {/* Реакция команды и вердикт */}
          {feedback && (
            <div className="verdict-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sparkles size={18} color="#E5A93C" />
                <span className="verdict-text">{feedback.verdict}</span>
              </div>
              <div className="verdict-reaction">{feedback.reaction}</div>

              <div style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                  style={{ minHeight: 44, padding: '10px 22px', fontSize: 14 }}
                  autoFocus
                >
                  <span>{isLast ? 'Забрать третий ключ «Команда»' : 'Следующая ситуация'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Кнопка пропуска */}
      <button
        type="button"
        className="btn-director-skip"
        onClick={skipCurrentTrial}
        title="Пропустить этап полномочиями руководителя"
      >
        <FastForward size={14} />
        Полномочия директора: пропустить
      </button>
    </div>
  );
};
