import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { TerminalAuth } from './components/TerminalAuth/TerminalAuth';
import { MoneyCatcher } from './components/MoneyCatcher/MoneyCatcher';
import { FinaleSection } from './components/FinaleSection/FinaleSection';

export const App: React.FC = () => {
  const [currentBlock, setCurrentBlock] = useState<'auth' | 'game' | 'finale'>('auth');

  return (
    <div className="app-viewport">
      {/* Top terminal status header */}
      <Header currentStage={currentBlock} />

      {/* Main interactive area */}
      <main className="app-main-content">
        {currentBlock === 'auth' && (
          <TerminalAuth onComplete={() => setCurrentBlock('game')} />
        )}

        {currentBlock === 'game' && (
          <MoneyCatcher onComplete={() => setCurrentBlock('finale')} />
        )}

        {currentBlock === 'finale' && (
          <FinaleSection />
        )}
      </main>
    </div>
  );
};

export default App;
