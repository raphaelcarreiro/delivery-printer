import React, { ComponentType } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import Default from 'components/layout/DefaultLayout';

interface PrivateRouteProps extends RouteProps {
  component: ComponentType;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const authenticated = true;

  return (
    <Route
      {...rest}
      render={() =>
        authenticated ? (
          <Default>
            <Component />
          </Default>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
