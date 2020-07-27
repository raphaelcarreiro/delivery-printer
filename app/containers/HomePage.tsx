import React, { useState, useCallback, useContext } from 'react';
import HomeWs from '../components/home/HomeWs';
import Home from '../components/home/Home';

interface HomePageContextData {
  realTime: boolean;
  handleSetRealTime(): void;
}

const HomePageContext = React.createContext<HomePageContextData>(
  {} as HomePageContextData
);

export function useHomePage() {
  const context = useContext(HomePageContext);

  return context;
}

export default function HomePage() {
  const [realTime, setRealTime] = useState(false);

  const handleSetRealTime = useCallback(() => {
    setRealTime((oldRealTime) => !oldRealTime);
  }, []);

  return (
    <HomePageContext.Provider value={{ realTime, handleSetRealTime }}>
      {realTime ? <HomeWs /> : <Home />}
    </HomePageContext.Provider>
  );
}
