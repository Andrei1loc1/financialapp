import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Background from './components/Background';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import History from './components/History';
import Simulator from './components/Simulator';
import Settings from './components/Settings';
import OnboardingPage from './components/OnboardingPage';
import { Screen } from './types';
import { ONBOARDING_COMPLETED_KEY } from './types/onboarding';
import { signInAnon, onAuthChange } from './lib/firebase';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('dash');
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Handle authentication and onboarding check
  useEffect(() => {
    const initAuth = async () => {
      // Listen for auth state changes
      const unsubscribe = onAuthChange(async (user) => {
        if (user) {
          // User is authenticated (anonymous or otherwise)
          const isCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
          setShowOnboarding(isCompleted !== 'true');
        } else {
          // No user, try to sign in anonymously
          try {
            await signInAnon();
          } catch (error) {
            console.error('Failed to sign in anonymously:', error);
            // Continue anyway - might work with default_user fallback
            const isCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
            setShowOnboarding(isCompleted !== 'true');
          }
        }
        setIsAuthReady(true);
      });

      return unsubscribe;
    };

    initAuth();
  }, []);

  // Show loading while checking auth and onboarding status
  if (!isAuthReady || showOnboarding === null) {
    return (
      <div className="relative min-h-screen bg-bg text-text-primary font-syne overflow-x-hidden">
        <Background />
        <div className="relative z-10 max-w-[420px] mx-auto min-h-screen flex items-center justify-center">
          <div className="text-text-muted">Se încarcă...</div>
        </div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (showOnboarding) {
    return <OnboardingPage />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dash':
        return <Dashboard key="dash" onNavigateToHistory={() => setActiveScreen('history')} />;
      case 'add':
        return <AddExpense key="add" onAdd={(amount, cat) => console.log('Added:', amount, cat)} />;
      case 'history':
        return <History key="history" />;
      case 'whatif':
        return <Simulator key="whatif" />;
      case 'settings':
        return <Settings key="settings" />;
      default:
        return <Dashboard key="dash" onNavigateToHistory={() => setActiveScreen('history')} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-bg text-text-primary font-syne overflow-x-hidden">
      <Background />

      <main className="relative z-10 max-w-[420px] mx-auto min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>

      <Navigation
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
      />
    </div>
  );
};

export default App;
