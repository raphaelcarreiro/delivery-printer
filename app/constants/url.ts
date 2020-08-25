export default process.env.NODE_ENV === 'production'
  ? {
      BASE_URL: 'https://api2.topnfe.com.br/api/admin/',
      // BASE_URL: 'https://api3.topnfe.com.br/api/admin/',
      WS_BASE_URL: 'https://api-node.topnfe.com.br/admin',
      // WS_BASE_URL: 'https://delivery-api-node-test.herokuapp.com/admin',
      TOKEN: 'KkAUmBJBpKLI6SMjSYSX8vqkwehE6H5a0D6mfnJiIq3UdRvkxwvtsC0cnmZpgG9Y',
    }
  : {
      BASE_URL: 'http://localhost:8000/api/admin/',
      WS_BASE_URL: 'http://localhost:3333/admin',
      TOKEN: 'KkAUmBJBpKLI6SMjSYSX8vqkwehE6H5a0D6mfnJiIq3UdRvkxwvtsC0cnmZpgG9Y',
    };
