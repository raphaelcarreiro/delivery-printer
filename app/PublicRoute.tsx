import React from 'react';
import { RouteProps, Route } from 'react-router-dom';
import Default from 'components/layout/Default';

interface PublicRouteProps extends RouteProps {
  component: React.ComponentType;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  component: Component,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={() => (
        <Default>
          <Component />
        </Default>
      )}
    />
  );
};

export default PublicRoute;
