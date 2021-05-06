import React, { ComponentType } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from 'hooks/auth';
import Default from 'components/layout/Default';

interface PrivateRouteProps extends RouteProps {
  component: ComponentType;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const auth = useAuth();

  return (
    <Route
      {...rest}
      render={() =>
        auth.isAuthenticated() ? (
          <Default>
            <Component />{' '}
          </Default>
        ) : (
          <Redirect to="/login" />
        )
      } // eslint-disable-line
    />
  );
};

export default PrivateRoute;
