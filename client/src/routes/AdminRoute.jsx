import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { isAuth } from '../helpers/auth';

const AdminRoute = ({ passedComponent: Component, ...otherProps }) => (
  <Route
    {...otherProps}
    render={(props) =>
      isAuth() && isAuth().role === 'admin' ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location }
          }}
        />
      )
    }
  ></Route>
);

export default AdminRoute;
