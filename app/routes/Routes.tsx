import React from 'react';
import { Switch, Router } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import { history } from 'services/history';
import MainScreen from 'screens/MainScreen';
import LoginScreen from 'screens/LoginScreen';

const Routes: React.FC = () => {
  return (
    <Router history={history}>
      <Switch>
        <PrivateRoute exact path="/" component={MainScreen} />
        <PublicRoute exact path="/login" component={LoginScreen} />
      </Switch>
    </Router>
  );
};

export default Routes;
