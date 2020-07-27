import axios, { AxiosInstance, CancelTokenSource } from 'axios';
import { history } from 'store';
import constants from 'constants/url';

function getAxiosInstance(): AxiosInstance {
  let instance: AxiosInstance;
  let hastoken = false;

  if (localStorage.getItem('token')) {
    instance = axios.create({
      baseURL: constants.BASE_URL,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    hastoken = true;
  } else
    instance = axios.create({
      baseURL: constants.BASE_URL,
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
