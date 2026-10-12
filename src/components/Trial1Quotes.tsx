import React, { useState } from 'react';
import { useQuest } from '../context/QuestContext';
import { QUEST_CONFIG } from '../config/questConfig';
import { Check, AlertCircle, ArrowRight, Award, FastForward } from 'lucide-react';

export const Trial1Quotes: React.FC = () => {
  const { state, answerTrial1, retryTrial1Question, goToScene, skipCurrentTrial } = useQuest();
  const { trial1, keys } = state;
  const questions = QUEST_CONFIG.trial1_quotes.questions;
  const currentQ = questions[trial1.currentQuestionIndex];

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    const result = answerTrial1(optionId);
    setFeedback({
      isCorrect: result.isCorrect,
      text: result.feedback,
    });
  };

  const handleNextAfterCorrect = () => {
    setSelectedOptionId(null);
    setFeedback(null);
    if (trial1.completed || keys.key1) {
      goToScene('trial2');
    }
  };

  const handleTryAgain = () => {
    setSelectedOptionId(null);
    setFeedback(null);
    retryTrial1Question();
  };

  return (
    <div className="scene-container">
      <div className="scene-kicker">Испытание I // Секция «Авторитет»</div>
      <h2 className="scene-title">{QUEST_CONFIG.trial1_quotes.title}</h2>
      <p className="scene-desc">
        {QUEST_CONFIG.trial1_quotes.subtitle}
        <br />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Вопрос {Math.min(trial1.currentQuestionIndex + 1, questions.length)} из {questions.length}
        </span>
      </p>

      {/* Если этап уже завершен */}
      {keys.key1 && !feedback ? (
        <div className="quiz-card" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 18, background: 'rgba(229, 169, 60, 0.15)', borderRadius: '50%', marginBottom: 16 }}>
            <Award size={48} color="#E5A93C" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            Первый ключ разблокирован: «{QUEST_CONFIG.keys.key1.name}»
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 24px' }}>
            {QUEST_CONFIG.keys.key1.desc}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => goToScene('trial2')}
            autoFocus
          >
            <span>Перейти ко второму испытанию</span>
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="quiz-card">
          <div className="quiz-prompt-box">
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold-soft)', display: 'block', marginBottom: 6 }}>
              {QUEST_CONFIG.trial1_quotes.hint}
            </span>
            <div className="quiz-quote-text">{currentQ?.quotePrompt}</div>
          </div>

          <div className="quiz-options-list" role="radiogroup" aria-label="Варианты ответа">
            {currentQ?.options.map((opt, idx) => {
              const letter = ['А', 'Б', 'В'][idx] || String(idx + 1);
              const isSelected = selectedOptionId === opt.id;
              let statusClass = '';
              if (isSelected && feedback) {
                statusClass = feedback.isCorrect ? 'correct' : 'incorrect';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`quiz-option-button ${statusClass}`}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={feedback?.isCorrect}
                  aria-pressed={isSelected}
                >
                  <span className="quiz-option-letter">{letter}</span>
                  <span style={{ flex: 1 }}>{opt.text}</span>
                  {isSelected && feedback?.isCorrect && <Check size={20} color="#22c55e" />}
                </button>
              );
            })}
          </div>

          {/* Обратная связь */}
          {feedback && (
            <div className={`quiz-feedback-box ${feedback.isCorrect ? 'correct' : 'incorrect'}`} role="status">
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                {feedback.isCorrect ? <Check size={20} /> : <AlertCircle size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14.5 }}>{feedback.text}</p>
                <div style={{ marginTop: 14 }}>
                  {feedback.isCorrect ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleNextAfterCorrect}
                      style={{ minHeight: 42, padding: '8px 18px', fontSize: 14 }}
                      autoFocus
                    >
                      <span>
                        {trial1.currentQuestionIndex + 1 >= questions.length
                          ? 'Получить ключ «Авторитет»'
                          : 'Следующий вопрос'}
                      </span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleTryAgain}
                      style={{ minHeight: 40, padding: '8px 16px', fontSize: 13.5 }}
                      autoFocus
                    >
                      Попробовать ещё раз
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Кнопка пропуска полномочиями директора */}
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
