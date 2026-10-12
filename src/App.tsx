import React from 'react';
import { QuestProvider, useQuest } from './context/QuestContext';
import { TopNav } from './components/TopNav';
import { EntranceScene } from './components/EntranceScene';
import { Trial1Quotes } from './components/Trial1Quotes';
import { Trial2Mechanism } from './components/Trial2Mechanism';
import { Trial3Decisions } from './components/Trial3Decisions';
import { OpeningScene } from './components/OpeningScene';
import { FinaleScene } from './components/FinaleScene';
import { QUEST_CONFIG } from './config/questConfig';
import './styles/quest.css';

const QuestRouter: React.FC = () => {
  const { state } = useQuest();

  return (
    <main className="main-stage" id="main-content">
      {state.currentScene === 'entrance' && <EntranceScene />}
      {state.currentScene === 'trial1' && <Trial1Quotes />}
      {state.currentScene === 'trial2' && <Trial2Mechanism />}
      {state.currentScene === 'trial3' && <Trial3Decisions />}
      {state.currentScene === 'opening' && <OpeningScene />}
      {state.currentScene === 'finale' && <FinaleScene />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <QuestProvider>
      <div className="quest-app">
        <TopNav />
        <QuestRouter />
        <footer className="quest-footer" role="contentinfo">
          <div>
            © {new Date().getFullYear()} {QUEST_CONFIG.person.company}
          </div>
          <div>
            <a
              href={QUEST_CONFIG.person.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Перейти на официальный сайт ОФК"
            >
              www.ofk-ozersk.ru
            </a>
            {' · '}
            <span>Специальный проект ко дню рождения</span>
          </div>
        </footer>
      </div>
    </QuestProvider>
  );
};

export default App;
