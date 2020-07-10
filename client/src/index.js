import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import App from './App';

import Login from './screens/Login';
import Register from './screens/Register';
import Activate from './screens/Activate';
import ForgetPassword from './screens/ForgetPassword';
import ResetPassword from './screens/ResetPassword';

import User from './screens/User';
import Admin from './screens/Admin';

import UserRoute from './routes/UserRoute';
import AdminRoute from './routes/AdminRoute';

import 'react-toastify/dist/ReactToastify.css';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path='/' exact render={(props) => <App {...props} />} />
      <Route path='/login' exact render={(props) => <Login {...props} />} />
      <Route
        path='/register'
        exact
        render={(props) => <Register {...props} />}
      />
      <Route
        path='/users/activate/:token'
        exact
        render={(props) => <Activate {...props} />}
      />
      <Route
        path='/users/password/forget'
        exact
        render={(props) => <ForgetPassword {...props} />}
      />
      <Route
        path='/users/password/reset/:token'
        exact
        render={(props) => <ResetPassword {...props} />}
      />
      <UserRoute path='/private' exact passedComponent={User} />
      <AdminRoute path='/admin' exact passedComponent={Admin} />
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);
