import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ActiveEpisode {
  ep_number: string;
  title: string;
  youtubeId: string;
}

interface AppContextType {
  activeEpisode: ActiveEpisode | null;
  setActiveEpisode: (episode: ActiveEpisode | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeEpisode, setActiveEpisode] = useState<ActiveEpisode | null>(null);

  return (
    <AppContext.Provider value={{ activeEpisode, setActiveEpisode }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};