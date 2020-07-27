import React, { useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { setRestaurant } from 'store/modules/restaurant/actions';
import { setUser } from 'store/modules/user/actions';
import { api } from 'services/api';
import jwt from 'jsonwebtoken';
import { RestaurantState } from 'store/modules/restaurant/reducer';
import constants from 'constants/url';

type AuthenticatedData = {
  data: string | null | object; // eslint-disable-line
  status: boolean;
};

interface User {
  name: string;
}

interface AuthContextData {
  login(email: string, password: string): Promise<boolean>;
  logout(): Promise<boolean>;
  isAuthenticated(): boolean;
  isAuthenticatedWithData(): AuthenticatedData;
  checkEmail(email: string): Promise<User>;
}

const AuthContext = React.createContext({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  const dispatch = useDispatch();

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        api()
          .post('/login', { email, password })
          .then((_response) => {
            const response = _response.data.data;
            localStorage.setItem('token', response.token);
            dispatch(setRestaurant(response.restaurant));
            dispatch(setUser(response.user));
            resolve(true);
          })
          .catch((err) => {
            if (err.response) {
              if (err.response.status === 401)
                reject(new Error('Usuário ou senha incorretos'));
            } else reject(new Error(err.message));
          });
      });
    },
    [dispatch]
  );

  const checkEmail = useCallback((email: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      api()
        .get(`/user/show/${email}`)
        .then((response) => {
          resolve(response.data.data);
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.status === 401)
              reject(new Error('E-mail não encontrado'));
          } else reject(new Error(err.message));
        });
    });
  }, []);

  const logout = useCallback((): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      api()
        .post('/logout')
        .then(() => {
          localStorage.removeItem('token');
          dispatch(setRestaurant({} as RestaurantState));
          resolve(true);
        })
        .catch((err) => {
          reject(new Error(err));
        });
    });
  }, [dispatch]);

  const isAuthenticated = useCallback((): boolean => {
    let authenticated = false;

    const token = localStorage.getItem('token');
    const secret: jwt.Secret = constants.TOKEN;

    if (token) {
      try {
        jwt.verify(token, secret, {
          ignoreNotBefore: true,
        });

        authenticated = true;
      } catch (e) {
        console.log(e);
      }
    }

    return authenticated;
  }, []);

  const isAuthenticatedWithData = useCallback((): AuthenticatedData => {
    let authenticated: AuthenticatedData = {
      data: null,
      status: false,
    };

    const token = localStorage.getItem('token');
    const secret: jwt.Secret = constants.TOKEN;

    if (token) {
      try {
        const decoded = jwt.verify(token, secret, {
          ignoreNotBefore: true,
        });

        authenticated = {
          data: decoded,
          status: true,
        };
      } catch (e) {
        console.log(e);
      }
    }

    return authenticated;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isAuthenticated,
        isAuthenticatedWithData,
        checkEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) throw new Error('This hook must be in Auth Context Component');

  return context;
}

export default AuthProvider;
