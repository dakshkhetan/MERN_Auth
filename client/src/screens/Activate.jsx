import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Link, Redirect } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import welcomeSvg from '../assets/welcome.svg';
import { isAuth } from '../helpers/auth';

const Activate = ({ match }) => {
  const [formData, setFormData] = useState({
    name: '',
    token: '',
    show: true
  });

  useEffect(() => {
    let token = match.params.token;
    if (token) {
      try {
        // we are also decoding token on front-end
        // in order to display the user name on page
        let { name } = jwt.decode(token);
        setFormData((formData) => ({
          ...formData,
          name,
          token
        }));
      } catch (error) {
        // console.log(error.message);
        toast.error('Invalid link!');
      }
    }
  }, [match.params.token]);

  const { name, token } = formData;

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(`${process.env.REACT_APP_API_URL}/activation`, {
        token: token
      })
      .then((res) => {
        setFormData({
          ...formData,
          show: false
        });

        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.error);
      });
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
            <h1 className='text-2xl xl:text-3xl font-extrabold'>
              Welcome {name}
            </h1>

            <form
              className='w-full flex-1 mt-8 text-indigo-500'
              onSubmit={handleSubmit}
            >
              <div className='mx-auto max-w-xs relative'>
                <button
                  type='submit'
                  className='mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full 
                    px-8 py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out 
                    flex items-center justify-center focus:shadow-outline focus:outline-none'
                >
                  <i className='fas fa-user-plus fa 1x w-6 -ml-2' />
                  <span className='ml-2'>Activate your account</span>
                </button>
              </div>

              <div className='mt-12 mb-10 border-b text-center'>
                <div
                  className='leading-none px-2 inline-block text-sm text-gray-600 
                    tracking-wide font-medium bg-white transform translate-y-1/2'
                >
                  Or sign up again
                </div>
              </div>

              <div className='flex flex-col items-center'>
                <Link
                  to='/register'
                  className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3 
                    bg-indigo-100 text-gray-800 flex items-center justify-center transition-all 
                    duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm 
                    focus:shadow-outline mt-5'
                >
                  <i className='fas fa-sign-in-alt fa 1x w-5 -ml-2 text-indigo-500' />
                  <span className='ml-1'>Sign Up</span>
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className='flex-1 bg-indigo-100 text-center hidden lg:flex'>
          <div
            className='m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat'
            style={{ backgroundImage: `url(${welcomeSvg})` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Activate;
