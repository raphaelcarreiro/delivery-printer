import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setRestaurant } from 'store/modules/restaurant/actions';
import { setUser } from 'store/modules/user/actions';
import { api } from 'services/api';
import jwt from 'jsonwebtoken';
import constants from 'constants/constants';
import { User } from 'types/user';

interface AuthContextData {
  login(email: string, password: string): Promise<boolean>;
  logout(): Promise<boolean>;
  isAuthenticated: boolean;
  checkEmail(email: string): Promise<User>;
  checkAuth(): boolean;
  loading: boolean;
}

const AuthContext = React.createContext({} as AuthContextData);

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  return context;
}

const AuthProvider: React.FC = ({ children }) => {
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload: any = jwt.decode(token);

      if (payload) setIsAuthenticated(true);

      setLoading(true);
      api
        .get('/users/current')
        .then(response => {
          dispatch(setRestaurant(response.data.restaurant));
          dispatch(setUser(response.data));
        })
        .catch(err => console.error(err))
        .finally(() => {
          setLoading(false);
        });
    }
  }, [dispatch]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        api
          .post('/login', { email, password })
          .then(_response => {
            const response = _response.data.data;
            localStorage.setItem('token', response.token);
            dispatch(setRestaurant(response.restaurant));
            dispatch(setUser(response.user));
            resolve(true);
          })
          .catch(err => {
            if (err.response) {
              if (err.response.status === 401) reject(new Error('Usuário ou senha incorretos'));
            } else reject(new Error(err.message));
          });
      });
    },
    [dispatch],
  );

  const checkEmail = useCallback((email: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      api
        .get(`/user/show/${email}`)
        .then(response => {
          resolve(response.data.data);
        })
        .catch(err => {
          if (err.response) {
            if (err.response.status === 401) reject(new Error('E-mail não encontrado'));
          } else reject(new Error(err.message));
        });
    });
  }, []);

  const logout = useCallback((): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      api
        .post('/logout')
        .then(() => {
          localStorage.removeItem('token');
          dispatch(setRestaurant(null));
          resolve(true);
        })
        .catch(err => {
          reject(new Error(err));
        });
    });
  }, [dispatch]);

  const checkAuth = useCallback((): boolean => {
    const token = localStorage.getItem('token');
    const secret: jwt.Secret = constants.TOKEN;

    if (token) {
      try {
        jwt.verify(token, secret, {
          ignoreNotBefore: true,
        });

        return true;
      } catch (e) {
        console.log(e);
        localStorage.removeItem('h2i@token');
        setIsAuthenticated(false);
        dispatch(setUser({} as User));
      }
    }

    return false;
  }, [dispatch]);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        loading,
        isAuthenticated,
        checkEmail,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
