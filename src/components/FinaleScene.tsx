import React from 'react';
import { useQuest } from '../context/QuestContext';
import { QUEST_CONFIG } from '../config/questConfig';
import { AudioPlayer } from './AudioPlayer';
import { RotateCcw, Heart, Building, Sparkles, Award } from 'lucide-react';

export const FinaleScene: React.FC = () => {
  const { resetQuest } = useQuest();
  const person = QUEST_CONFIG.person;
  const finale = QUEST_CONFIG.finale;

  return (
    <div className="scene-container">
      <div className="finale-section">
        {/* Представительская гербовая карточка генерального директора (без фото) */}
        <div className="director-seal-card">
          {/* Геральдическая печать руководителя ОФК */}
          <div className="executive-seal">
            <span className="seal-monogram">{person.initials}</span>
            <span className="seal-subtext">ОФК · ОЗЁРСК</span>
          </div>

          <div className="director-dedication-box">
            <div className="director-title-pill">
              <Award size={14} color="#E5A93C" />
              <span>{person.role} · {person.companyShort}</span>
            </div>

            <h1>{finale.greetingHeading}</h1>
            <p className="director-manifesto">{finale.teamMessage}</p>
          </div>
        </div>

        {/* Плеер музыкального подарка команды */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Sparkles size={22} color="#E5A93C" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.04em', color: '#fff', textTransform: 'uppercase' }}>
              Главный подарок: Музыкальное посвящение
            </h2>
          </div>
          <AudioPlayer />
        </div>

        {/* Поздравления от подразделений компании */}
        <div className="team-wishes-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h2 className="wishes-heading">
              <Building size={26} color="#E31E24" />
              <span>Послания подразделений компании</span>
            </h2>
            <img
              src="./assets/ofk-logo.webp"
              alt="ОФК"
              style={{ height: 32, width: 'auto', opacity: 0.8 }}
            />
          </div>

          <div className="wishes-grid">
            {finale.departmentGreetings.map((greet) => (
              <div key={greet.id} className="wish-card">
                <div>
                  {greet.highlight && <span className="wish-highlight">{greet.highlight}</span>}
                  <p className="wish-text">«{greet.text}»</p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                  <div className="wish-author">{greet.author}</div>
                  <div className="wish-dept">
                    {greet.department} {greet.city && `· ${greet.city}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Финальная подпись и перезапуск квеста */}
        <div style={{ textAlign: 'center', padding: '36px 0 16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-heading)', fontSize: 20, color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: 20 }}>
            <Heart size={22} fill="#E5A93C" />
            <span>{finale.signature}</span>
          </div>

          <div>
            <button
              type="button"
              className="btn-secondary"
              onClick={resetQuest}
              style={{ minHeight: 48 }}
            >
              <RotateCcw size={16} />
              <span>Пройти испытание заново</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
