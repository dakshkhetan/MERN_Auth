import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

import authSvg from '../assets/auth.svg';
import { authenticate, isAuth } from '../helpers/auth';

const Register = ({ history }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password1: '',
    password2: '',
    textChange: 'Sign Up'
  });

  const { name, email, password1, password2, textChange } = formData;

  const sendGoogleToken = (tokenId) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/googlelogin`, {
        idToken: tokenId
      })
      .then((res) => {
        // console.log(res.data);
        informParent(res);
      })
      .catch((error) => {
        console.log('GOOGLE SIGNIN ERROR', error.response.data.error);
      });
  };

  const sendFacebookToken = (userID, accessToken) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/facebooklogin`, {
        userID,
        accessToken
      })
      .then((res) => {
        console.log(res.data);
        informParent(res);
      })
      .catch((error) => {
        console.log('FACEBOOK SIGNIN ERROR', error.response.data.error);
      });
  };

  const informParent = (response) => {
    authenticate(response, () => {
      isAuth() && isAuth().role === 'admin'
        ? history.push('/admin')
        : history.push('/private');
    });
  };

  const responseGoogle = (response) => {
    console.log('GOOGLE LOGIN RESPONSE', response);
    sendGoogleToken(response.tokenId);
  };

  const responseFacebook = (response) => {
    console.log('FACEBOOK LOGIN RESPONSE', response);
    sendFacebookToken(response.userID, response.accessToken);
  };

  const handleChange = (text) => (e) => {
    setFormData({ ...formData, [text]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && password1) {
      if (password1 === password2) {
        setFormData({ ...formData, textChange: 'Submitting' });

        axios
          .post(`${process.env.REACT_APP_API_URL}/register`, {
            name,
            email,
            password: password1
          })
          .then((res) => {
            setFormData({
              ...formData,
              name: '',
              email: '',
              password1: '',
              password2: '',
              textChange: 'Submitted'
            });

            toast.success(res.data.message);
          })
          .catch((err) => {
            console.log(err.response);

            setFormData({
              ...formData,
              name: '',
              email: '',
              password1: '',
              password2: '',
              textChange: 'Sign Up'
            });

            toast.error(err.response.data.error);
          });
      } else {
        toast.error("Passwords don't match!");
      }
    } else {
      toast.error('Please fill in all fields.');
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 text-gray-900 flex justify-center'>
      {isAuth() ? <Redirect to='/' /> : null}
      <ToastContainer />

      <div
        className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex 
          justify-center flex-1'
      >
        <div className='lg:w-1/2 xl:w-5/12 p-6 sm:p-12'>
          <div className='mt-12 flex flex-col items-center'>
            <h1 className='text-2xl xl:text-3xl font-extrabold'>Sign Up</h1>

            <form
              className='w-full flex-1 mt-8 text-indigo-500'
              onSubmit={handleSubmit}
            >
              <div className='mx-auto max-w-xs relative'>
                <input
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border 
                    border-gray-200 placeholder-gray-500 text-sm focus:outline-none 
                    focus:border-gray-400 focus:bg-white'
                  type='text'
                  placeholder='Name'
                  onChange={handleChange('name')}
                  value={name}
                />

                <input
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border 
                    border-gray-200 placeholder-gray-500 text-sm focus:outline-none 
                    focus:border-gray-400 focus:bg-white mt-5'
                  type='email'
                  placeholder='Email'
                  onChange={handleChange('email')}
                  value={email}
                />

                <input
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border 
                    border-gray-200 placeholder-gray-500 text-sm focus:outline-none 
                    focus:border-gray-400 focus:bg-white mt-5'
                  type='password'
                  placeholder='Password'
                  onChange={handleChange('password1')}
                  value={password1}
                />

                <input
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border 
                    border-gray-200 placeholder-gray-500 text-sm focus:outline-none 
                    focus:border-gray-400 focus:bg-white mt-5'
                  type='password'
                  placeholder='Confirm Password'
                  onChange={handleChange('password2')}
                  value={password2}
                />

                <button
                  type='submit'
                  className='mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full 
                    py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out 
                    flex items-center justify-center focus:shadow-outline focus:outline-none'
                >
                  <i className='fas fa-user-plus fa 1x w-6' />
                  <span className='ml-1'>{textChange}</span>
                </button>
              </div>

              <div className='mt-8 mb-12 border-b text-center'>
                <div
                  className='leading-none px-2 inline-block text-md text-gray-600 
                  tracking-wide font-medium bg-white transform translate-y-1/2'
                >
                  or
                </div>
              </div>

              <div className='flex flex-col items-center'>
                <GoogleLogin
                  clientId={`${process.env.REACT_APP_GOOGLE_CLIENT_ID}`}
                  onSuccess={responseGoogle}
                  onFailure={responseGoogle}
                  cookiePolicy={'single_host_origin'}
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                      className='h-12 w-full max-w-xs font-bold shadow-sm rounded-lg py-3 
                    bg-indigo-100 text-gray-800 flex items-center justify-center 
                    transition-all duration-300 ease-in-out focus:outline-none hover:shadow 
                    focus:shadow-sm focus:shadow-outline'
                    >
                      <div className='p-2 rounded-full'>
                        <i className='fab fa-google text-indigo-500' />
                      </div>
                      <span className='ml-0'>Sign In with Google</span>
                    </button>
                  )}
                />

                <FacebookLogin
                  appId={`${process.env.REACT_APP_FACEBOOK_CLIENT_ID}`}
                  autoLoad={false}
                  callback={responseFacebook}
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      className='h-12 w-full max-w-xs font-bold shadow-sm rounded-lg py-3 
                    bg-indigo-100 text-gray-800 flex items-center justify-center 
                    transition-all duration-300 ease-in-out focus:outline-none hover:shadow 
                    focus:shadow-sm focus:shadow-outline mt-5'
                    >
                      <div className='p-2 rounded-full'>
                        <i className='fab fa-facebook text-lg text-indigo-500' />
                      </div>
                      <span className='ml-0'>Sign In with Facebook</span>
                    </button>
                  )}
                />

                <Link
                  to='/login'
                  className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 
                    text-gray-800 flex items-center justify-center transition-all duration-300 
                    ease-in-out focus:outline-none hover:shadow focus:shadow-sm 
                    focus:shadow-outline mt-5'
                >
                  <i className='fas fa-sign-in-alt fa 1x w-5 text-indigo-500' />
                  <span className='ml-1'>Sign In with Email</span>
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className='flex-1 bg-indigo-100 text-center hidden lg:flex'>
          <div
            className='m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat'
            style={{ backgroundImage: `url(${authSvg})` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Register;
