import axios, { AxiosInstance, CancelTokenSource } from 'axios';
import { history } from 'store';

// const baseURL = 'http://localhost:8000/api/admin/';
const baseURL = 'https://api2.topnfe.com.br/api/admin/';

function getAxiosInstance(): AxiosInstance {
  let instance: AxiosInstance;
  let hastoken = false;

  if (localStorage.getItem('token')) {
    instance = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    hastoken = true;
  } else
    instance = axios.create({
      baseURL,
    });

  if (hastoken)
    instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response) {
          if (error.response.status === 401) {
            localStorage.removeItem('token');
            history.push('/login');
            return;
          }
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );

  return instance;
}

export function getCancelTokenSource(): CancelTokenSource {
  const { CancelToken } = axios;
  const source = CancelToken.source();
  return source;
}

export { getAxiosInstance as api };
