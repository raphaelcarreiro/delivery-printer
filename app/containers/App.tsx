import React, { ReactNode, useEffect, useState, useContext } from 'react';
import { api } from 'services/api';
import { useDispatch } from 'react-redux';
import { useAuth } from 'hooks/auth';
import { setRestaurant } from 'store/modules/restaurant/actions';
import { setUser } from 'store/modules/user/actions';
import { useSelector } from 'store';
import io from 'socket.io-client';

type Props = {
  children: ReactNode;
};

interface AppContextData {
  loading: boolean;
  socket: SocketIOClient.Socket;
}

export const AppContext = React.createContext<AppContextData>(
  {} as AppContextData
);

// const baseUrl = 'http://localhost:3333/admin';
const baseUrl = 'https://api-node.topnfe.com.br/admin';
const socket: SocketIOClient.Socket = io.connect(baseUrl);

export function useApp(): AppContextData {
  const context = useContext(AppContext);
  if (!context) throw new Error('This hook must be in app context component');
  return context;
}

export default function App(props: Props) {
  const { children } = props;
  const dispatch = useDispatch();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);
  const restaurant = useSelector((state) => state.restaurant);

  useEffect(() => {
    if (restaurant.id) {
      if (socket.disconnected) socket.connect();
      socket.emit('register', restaurant.id);

      socket.on('reconnect', () => {
        socket.emit('register', restaurant.id);
      });
    }
  }, [restaurant]);

  useEffect(() => {
    const authenticated = auth.isAuthenticated();
    if (authenticated) {
      if (!user.id) {
        setLoading(true);
        api()
          .get('/users/current')
          .then((response) => {
            dispatch(setRestaurant(response.data.restaurant));
            dispatch(setUser(response.data));
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [user, auth, dispatch]);

  return (
    <AppContext.Provider value={{ loading, socket }}>
      {children}
    </AppContext.Provider>
  );
}
