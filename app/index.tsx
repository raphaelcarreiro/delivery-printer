import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import 'app.global.css';

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  const App = require('./App').default;
  render(
    <AppContainer>
      <App />
    </AppContainer>,
    document.getElementById('root'),
  );
});
