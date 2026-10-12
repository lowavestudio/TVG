import React from 'react';
import { useQuest } from '../context/QuestContext';
import { QUEST_CONFIG } from '../config/questConfig';
import { ShieldCheck, Cpu, Users, Lock, CheckCircle2 } from 'lucide-react';

interface VaultCaseProps {
  interactive?: boolean;
  onOpenClick?: () => void;
}

export const VaultCase: React.FC<VaultCaseProps> = ({ interactive = false, onOpenClick }) => {
  const { state } = useQuest();
  const { keys } = state;
  const allUnlocked = keys.key1 && keys.key2 && keys.key3;

  return (
    <div className="vault-case-wrapper">
      <div className="vault-case">
        <div className="vault-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="./assets/ofk-logo.webp"
              alt="ОФК"
              style={{ height: 26, width: 'auto', filter: 'brightness(1.1)' }}
            />
            <span className="vault-tag">КЕЙС № 2026-ТВГ // СПЕЦПОСТАВКА</span>
          </div>
          <div className="vault-status-indicator">
            <span className="vault-status-pulse" />
            <span>{allUnlocked ? 'ДОСТУП ПОЛУЧЕН' : 'БЛОКИРОВКА (3 СЕКЦИИ)'}</span>
          </div>
        </div>

        <div className="vault-chambers-grid">
          {/* Ключ 1: Авторитет */}
          <div
            className={`chamber-cell ${keys.key1 ? 'unlocked' : ''}`}
            tabIndex={0}
            role="status"
            aria-label="Секция 1: Авторитет"
          >
            <div className="chamber-icon">
              {keys.key1 ? <CheckCircle2 size={28} color="#E5A93C" /> : <ShieldCheck size={28} />}
            </div>
            <span className="chamber-label">{QUEST_CONFIG.keys.key1.name}</span>
            <span className="chamber-state-text">
              {keys.key1 ? 'КЛЮЧ АКТИВИРОВАН' : 'СЕКТОР I'}
            </span>
          </div>

          {/* Ключ 2: Точность */}
          <div
            className={`chamber-cell ${keys.key2 ? 'unlocked' : ''}`}
            tabIndex={0}
            role="status"
            aria-label="Секция 2: Точность"
          >
            <div className="chamber-icon">
              {keys.key2 ? <CheckCircle2 size={28} color="#E5A93C" /> : <Cpu size={28} />}
            </div>
            <span className="chamber-label">{QUEST_CONFIG.keys.key2.name}</span>
            <span className="chamber-state-text">
              {keys.key2 ? 'КЛЮЧ АКТИВИРОВАН' : 'СЕКТОР II'}
            </span>
          </div>

          {/* Ключ 3: Команда */}
          <div
            className={`chamber-cell ${keys.key3 ? 'unlocked' : ''}`}
            tabIndex={0}
            role="status"
            aria-label="Секция 3: Команда"
          >
            <div className="chamber-icon">
              {keys.key3 ? <CheckCircle2 size={28} color="#E5A93C" /> : <Users size={28} />}
            </div>
            <span className="chamber-label">{QUEST_CONFIG.keys.key3.name}</span>
            <span className="chamber-state-text">
              {keys.key3 ? 'КЛЮЧ АКТИВИРОВАН' : 'СЕКТОР III'}
            </span>
          </div>
        </div>

        {interactive && allUnlocked && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenClick}
              autoFocus
            >
              <Lock size={18} />
              <span>Открыть защищённый кейс</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
