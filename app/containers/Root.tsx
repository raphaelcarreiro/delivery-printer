import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import AuthProvider from 'hooks/auth';
import MessagingProvider from 'hooks/messaging';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { theme } from 'theme';
import { Store } from '../store';
import Routes from '../Routes';

type Props = {
  store: Store;
  history: History;
};

const Root = ({ store, history }: Props) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <AuthProvider>
        <MuiThemeProvider theme={theme}>
          <MessagingProvider>
            <Routes />
          </MessagingProvider>
        </MuiThemeProvider>
      </AuthProvider>
    </ConnectedRouter>
  </Provider>
);

export default hot(Root);
