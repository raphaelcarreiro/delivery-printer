/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch } from 'react-router-dom';
import PublicRoute from 'PublicRoute';
import PrivateRoute from 'PrivateRoute';
import LoginPage from 'containers/Login';
import App from './containers/App';
import HomePage from './containers/HomePage';

export default function Routes() {
  return (
    <App>
      <Switch>
        <PrivateRoute exact path="/" component={HomePage} />
        <PublicRoute exact path="/login" component={LoginPage} />
      </Switch>
    </App>
  );
}
