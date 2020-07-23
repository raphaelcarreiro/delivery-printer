import axios from 'axios';

const apiOrders = axios.create({
  baseURL: 'https://api2.topnfe.com.br/api/admin/orders/',
  headers: {
    key: '55ad99b84c3aaccd084b169df2893207',
  },
});

const api = axios.create({
  baseURL: 'https://api2.topnfe.com.br/api/client/',
  headers: {
    restaurantId: 1,
  },
});

export { apiOrders, api };
