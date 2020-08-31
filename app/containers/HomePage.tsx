import React, { useState, useCallback, useContext, useEffect } from 'react';
import { api } from 'services/api';
import { RestaurantConfigs } from 'store/modules/restaurant/reducer';
import { useSelector } from 'store';
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

  const restaurant = useSelector((state) => state.restaurant);

  useEffect(() => {
    if (!restaurant.id) return;
    setRealTime(restaurant.configs.realtime_print);
  }, [restaurant]);

  const handleSetRealTime = useCallback(() => {
    api()
      .put('/realtimePrint')
      .then((response) => {
        const configs: RestaurantConfigs = response.data;
        setRealTime(configs.realtime_print);
      });
  }, []);

  return (
    <HomePageContext.Provider value={{ realTime, handleSetRealTime }}>
      <Home />
    </HomePageContext.Provider>
  );
}
