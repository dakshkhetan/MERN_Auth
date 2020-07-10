import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { isAuth } from '../helpers/auth';

const UserRoute = ({ passedComponent: Component, ...otherProps }) => (
  <Route
    {...otherProps}
    render={(props) =>
      isAuth() && isAuth().role === 'subscriber' ? (
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

export default UserRoute;
