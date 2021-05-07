import axios, { CancelTokenSource, AxiosError } from 'axios';
import constants from 'constants/constants';
import { history } from './history';

const api = axios.create({
  baseURL: constants.BASE_URL,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (err: AxiosError) => {
    return Promise.reject(err);
  },
);

api.interceptors.response.use(
  config => {
    return config;
  },
  err => {
    const token = localStorage.getItem('token');
    if (token)
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        history.push('/login');
        return;
      }
    return Promise.reject(err);
  },
);

export function getCancelTokenSource(): CancelTokenSource {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  return source;
}

export { api };
