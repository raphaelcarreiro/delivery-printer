import React from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import AuthProvider from 'providers/auth';
import MessagingProvider from 'providers/messaging';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { theme } from 'theme/theme';
import Routes from './routes/Routes';
import { store } from 'store/__index';

// const store = configuredStore();

const Root = () => (
  <Provider store={store}>
    <AuthProvider>
      <MuiThemeProvider theme={theme}>
        <MessagingProvider>
          <Routes />
        </MessagingProvider>
      </MuiThemeProvider>
    </AuthProvider>
  </Provider>
);

export default hot(Root);
