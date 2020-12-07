import React from 'react';
import { RouteProps, Route } from 'react-router-dom';
import AuthLayout from 'components/layout/AuthLayout';

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
        <AuthLayout>
          <Component />
        </AuthLayout>
      )}
    />
  );
};

export default PublicRoute;
