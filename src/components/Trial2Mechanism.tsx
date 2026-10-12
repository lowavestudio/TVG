import React, { useState } from 'react';
import { useQuest } from '../context/QuestContext';
import { QUEST_CONFIG } from '../config/questConfig';
import { Settings, CheckCircle2, ArrowRight, Award, FastForward, Sliders, Layers, Sparkles } from 'lucide-react';

export const Trial2Mechanism: React.FC = () => {
  const { state, selectPart, attemptInstallPart, goToScene, skipCurrentTrial } = useQuest();
  const { trial2, keys } = state;
  const config = QUEST_CONFIG.trial2_mechanism;

  const [draggedPartId, setDraggedPartId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handlePartClick = (partId: string) => {
    if (trial2.installedParts.includes(partId)) return;
    selectPart(partId);
    setFeedbackMessage('Теперь выберите подходящую посадочную зону на верстаке');
  };

  const handleSlotClick = (slotId: string) => {
    const activePartId = trial2.selectedPartId || draggedPartId;
    if (!activePartId) {
      setFeedbackMessage('Сначала выберите деталь из стойки справа');
      return;
    }

    const success = attemptInstallPart(activePartId, slotId);
    if (success) {
      setFeedbackMessage('Идеальная посадка! Деталь зафиксирована.');
    } else {
      setFeedbackMessage('Эта деталь не подходит к данному узлу. Попробуйте другой паз.');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, partId: string) => {
    e.dataTransfer.setData('text/plain', partId);
    setDraggedPartId(partId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const partId = e.dataTransfer.getData('text/plain') || draggedPartId;
    if (partId) {
      attemptInstallPart(partId, slotId);
      setDraggedPartId(null);
    }
  };

  const isAssembled = trial2.isAssembled || keys.key2;

  return (
    <div className="scene-container">
      <div className="scene-kicker">Испытание II // Секция «Точность»</div>
      <h2 className="scene-title">{config.title}</h2>
      <p className="scene-desc">
        {config.subtitle}
        <br />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Установлено деталей: {trial2.installedParts.length} из {config.parts.length}
        </span>
      </p>

      {/* Интерактивная зона сборки */}
      <div className="mechanism-interactive-area">
        {/* Верстак / Сборочный стенд */}
        <div className="assembly-bench">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-gold-soft)' }}>
                СБОРОЧНЫЙ СТЕНД ОФК // ПРЕЦИЗИОННАЯ СБОРКА
              </span>
              {isAssembled && (
                <span style={{ fontSize: 12, color: '#86efac', fontWeight: 600 }}>● МЕХАНИЗМ АКТИВЕН</span>
              )}
            </div>

            <div className="bench-slots-list" role="region" aria-label="Посадочные места механизма">
              {config.slots.map((slot) => {
                const targetPart = config.parts.find((p) => p.targetSlotId === slot.id);
                const isFilled = targetPart ? trial2.installedParts.includes(targetPart.id) : false;
                const isTargetHighlighted = trial2.selectedPartId && targetPart?.id === trial2.selectedPartId;

                return (
                  <div
                    key={slot.id}
                    className={`bench-slot ${isFilled ? 'filled' : ''} ${isTargetHighlighted ? 'target-highlight' : ''}`}
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slot.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${slot.label}: ${isFilled ? 'установлено' : 'свободно'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSlotClick(slot.id);
                      }
                    }}
                  >
                    <div className="slot-meta">
                      <span className="slot-title">{slot.label}</span>
                      <span className="slot-hint">
                        {isFilled ? `✓ ${targetPart?.name}` : slot.hint}
                      </span>
                    </div>

                    <div className="slot-badge">
                      {isFilled ? 'СМОНТИРОВАНО' : 'ОЖИДАЕТ УСТАНОВКИ'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Подсказка или кинетическое движение */}
          {isAssembled ? (
            <div className="mechanism-active-kinetic">
              <Settings size={34} color="#E5A93C" className="gear-icon" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
                  {config.assembledCaption}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  Все направляющие и демпферы синхронизированы без зазоров.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              {feedbackMessage || 'Нажмите на деталь справа, затем укажите подходящий паз.'}
            </div>
          )}
        </div>

        {/* Стойка деталей */}
        <div className="parts-rack" role="list" aria-label="Детали фурнитуры">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
            КОМПЛЕКТУЮЩИЕ ИЗ КАТАЛОГА:
          </span>

          {config.parts.map((part) => {
            const isInstalled = trial2.installedParts.includes(part.id);
            const isSelected = trial2.selectedPartId === part.id;

            return (
              <div
                key={part.id}
                className={`part-card ${isInstalled ? 'installed' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handlePartClick(part.id)}
                draggable={!isInstalled}
                onDragStart={(e) => handleDragStart(e, part.id)}
                tabIndex={isInstalled ? -1 : 0}
                role="button"
                aria-pressed={isSelected}
                aria-disabled={isInstalled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePartClick(part.id);
                  }
                }}
              >
                <div className="part-icon-box">
                  {part.iconName === 'hinge' && <Sliders size={22} />}
                  {part.iconName === 'slide' && <Layers size={22} />}
                  {part.iconName === 'handle' && <Sparkles size={22} />}
                </div>

                <div className="part-details">
                  <span className="part-name">{part.name}</span>
                  <span className="part-desc">{part.description}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                    [{part.spec}]
                  </span>
                </div>

                {isInstalled && <CheckCircle2 size={20} color="#22c55e" style={{ flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Награда по завершении */}
      {isAssembled && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => goToScene('trial3')}
            autoFocus
          >
            <Award size={18} />
            <span>Получить ключ «Точность» и продолжить</span>
            <ArrowRight size={18} />
          </button>
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
