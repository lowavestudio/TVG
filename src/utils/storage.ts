import { type QuestState, INITIAL_QUEST_STATE } from '../types/quest';

const STORAGE_KEY = 'ofk_birthday_quest_state_v1';

export function loadSavedState(): QuestState {
  if (typeof window === 'undefined') {
    return { ...INITIAL_QUEST_STATE };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_QUEST_STATE };

    const parsed = JSON.parse(raw) as Partial<QuestState>;
    if (parsed.version !== INITIAL_QUEST_STATE.version) {
      // Версия устарела — мягко сбрасываем на начальное
      return { ...INITIAL_QUEST_STATE };
    }

    return {
      ...INITIAL_QUEST_STATE,
      ...parsed,
      keys: {
        ...INITIAL_QUEST_STATE.keys,
        ...(parsed.keys || {}),
      },
      trial1: {
        ...INITIAL_QUEST_STATE.trial1,
        ...(parsed.trial1 || {}),
      },
      trial2: {
        ...INITIAL_QUEST_STATE.trial2,
        ...(parsed.trial2 || {}),
        selectedPartId: null, // Сбрасываем временное выделение
      },
      trial3: {
        ...INITIAL_QUEST_STATE.trial3,
        ...(parsed.trial3 || {}),
      },
    };
  } catch (error) {
    console.warn('Ошибка чтения localStorage, используется начальное состояние:', error);
    return { ...INITIAL_QUEST_STATE };
  }
}

export function persistState(state: QuestState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Не удалось сохранить состояние в localStorage:', error);
  }
}

export function clearSavedState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
