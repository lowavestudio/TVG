import React, { useState } from 'react';
import { useQuest } from '../context/QuestContext';
import { QUEST_CONFIG } from '../config/questConfig';
import { AudioPlayer } from './AudioPlayer';
import { RotateCcw, Heart, Building, Sparkles, Upload } from 'lucide-react';

export const FinaleScene: React.FC = () => {
  const { resetQuest } = useQuest();
  const person = QUEST_CONFIG.person;
  const finale = QUEST_CONFIG.finale;

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(person.photoUrl);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewPhoto(url);
    }
  };

  return (
    <div className="scene-container">
      <div className="finale-section">
        {/* Карточка виновника торжества */}
        <div className="director-hero-card">
          <div className="director-avatar-box">
            {previewPhoto ? (
              <img
                src={previewPhoto}
                alt={person.fullName}
                className="director-avatar-img"
                loading="lazy"
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span className="director-avatar-monogram">{person.initials}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginTop: -2 }}>
                  ОФК
                </span>
              </div>
            )}

            {/* Быстрый загрузчик для тестирования фото прямо в браузере */}
            <label
              title="Загрузить фото для предпросмотра"
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '1px solid var(--metal-border)',
              }}
            >
              <Upload size={12} color="#fff" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="director-info-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="director-role">{person.role}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>•</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{person.companyShort}</span>
            </div>
            <h1>{finale.greetingHeading}</h1>
            <p className="director-message">{finale.teamMessage}</p>
          </div>
        </div>

        {/* Плеер песни-подарка */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sparkles size={20} color="#E5A93C" />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Музыкальный подарок от команды</h2>
          </div>
          <AudioPlayer />
        </div>

        {/* Поздравления сотрудников и отделов */}
        <div className="team-wishes-section">
          <h2 className="wishes-heading">
            <Building size={22} color="#E31E24" />
            <span>Поздравления подразделений ОФК</span>
          </h2>

          <div className="wishes-grid">
            {finale.departmentGreetings.map((greet) => (
              <div key={greet.id} className="wish-card">
                <div>
                  {greet.highlight && <span className="wish-highlight">{greet.highlight}</span>}
                  <p className="wish-text">«{greet.text}»</p>
                </div>
                <div>
                  <div className="wish-author">{greet.author}</div>
                  <div className="wish-dept">
                    {greet.department} {greet.city && `· ${greet.city}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Финальная подпись и перезапуск */}
        <div style={{ textAlign: 'center', padding: '36px 0 16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 20 }}>
            <Heart size={20} fill="#E5A93C" />
            <span>{finale.signature}</span>
          </div>

          <div>
            <button
              type="button"
              className="btn-secondary"
              onClick={resetQuest}
              style={{ minHeight: 46 }}
            >
              <RotateCcw size={16} />
              <span>Пройти приключение заново</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
