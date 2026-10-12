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
          <span className="vault-tag">ОФК // СЕКРЕТНАЯ ПОСТАВКА № 2026-ТВГ</span>
          <div className="vault-status-indicator">
            <span className="vault-status-pulse" />
            <span>{allUnlocked ? 'ДОСТУП ОТКРЫТ' : 'ЗАБЛОКИРОВАНО (3 СЕКЦИИ)'}</span>
          </div>
        </div>

        <div className="vault-chambers-grid">
          {/* Ключ 1: Авторитет */}
          <div className={`chamber-cell ${keys.key1 ? 'unlocked' : ''}`} tabIndex={0} aria-label="Секция 1: Авторитет">
            <div className="chamber-icon">
              {keys.key1 ? <CheckCircle2 size={26} color="#E5A93C" /> : <ShieldCheck size={26} />}
            </div>
            <span className="chamber-label">{QUEST_CONFIG.keys.key1.name}</span>
            <span className="chamber-state-text">
              {keys.key1 ? 'КЛЮЧ ПОЛУЧЕН' : 'БЛОК 1'}
            </span>
          </div>

          {/* Ключ 2: Точность */}
          <div className={`chamber-cell ${keys.key2 ? 'unlocked' : ''}`} tabIndex={0} aria-label="Секция 2: Точность">
            <div className="chamber-icon">
              {keys.key2 ? <CheckCircle2 size={26} color="#E5A93C" /> : <Cpu size={26} />}
            </div>
            <span className="chamber-label">{QUEST_CONFIG.keys.key2.name}</span>
            <span className="chamber-state-text">
              {keys.key2 ? 'КЛЮЧ ПОЛУЧЕН' : 'БЛОК 2'}
            </span>
          </div>

          {/* Ключ 3: Команда */}
          <div className={`chamber-cell ${keys.key3 ? 'unlocked' : ''}`} tabIndex={0} aria-label="Секция 3: Команда">
            <div className="chamber-icon">
              {keys.key3 ? <CheckCircle2 size={26} color="#E5A93C" /> : <Users size={26} />}
            </div>
            <span className="chamber-label">{QUEST_CONFIG.keys.key3.name}</span>
            <span className="chamber-state-text">
              {keys.key3 ? 'КЛЮЧ ПОЛУЧЕН' : 'БЛОК 3'}
            </span>
          </div>
        </div>

        {interactive && allUnlocked && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenClick}
              autoFocus
            >
              <Lock size={18} />
              Открыть защищённый кейс
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
