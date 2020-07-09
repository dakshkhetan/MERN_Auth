import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

import resetPassSvg from '../assets/reset.svg';

const ResetPassword = ({ match }) => {
  const [formData, setFormData] = useState({
    password1: '',
    password2: '',
    token: '',
    textChange: 'Submit'
  });

  const { password1, password2, token } = formData;

  useEffect(() => {
    let token = match.params.token;
    if (token) {
      setFormData((formData) => ({
        ...formData,
        token
      }));
    }
  }, [match.params.token]);

  const handleChange = (text) => (e) => {
    setFormData({ ...formData, [text]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password1 && password2) {
      if (password1 === password2) {
        setFormData({
          ...formData,
          textChange: 'Submitting'
        });

        axios
          .put(`${process.env.REACT_APP_API_URL}/resetpassword`, {
            newPassword: password1,
            resetPasswordToken: token
          })
          .then((response) => {
            setFormData({
              ...formData,
              password1: '',
              password2: '',
              textChange: 'Submitted'
            });

            toast.success(response.data.message);
          })
          .catch((err) => {
            console.log(err.response.data);
            toast.error(err.response.data.error);
          });
      } else {
        toast.error("Passwords don't match.");
      }
    } else {
      toast.error('Please fill in all fields.');
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 text-gray-900 flex justify-center'>
      <ToastContainer />

      <div
        className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex 
        justify-center flex-1'
      >
        <div className='lg:w-1/2 xl:w-5/12 p-6 sm:p-12'>
          <div className='mt-12 flex flex-col items-center'>
            <h1 className='text-2xl xl:text-3xl font-extrabold'>
              Reset Your Password
            </h1>

            <div className='w-full flex-1 mt-8 text-indigo-500'>
              <form
                className='mx-auto max-w-xs relative'
                onSubmit={handleSubmit}
              >
                <input
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border 
                    border-gray-200 placeholder-gray-500 text-sm focus:outline-none 
                    focus:border-gray-400 focus:bg-white'
                  type='password'
                  placeholder='New Password'
                  onChange={handleChange('password1')}
                  value={password1}
                />

                <input
                  className='w-full mt-5 px-8 py-4 rounded-lg font-medium bg-gray-100 border 
                    border-gray-200 placeholder-gray-500 text-sm focus:outline-none 
                    focus:border-gray-400 focus:bg-white'
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
                  <i className='fas fa-sign-in-alt w-5 -ml-2' />
                  <span className='ml-1'>Submit</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className='flex-1 bg-indigo-100 text-center hidden lg:flex'>
          <div
            className='m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat'
            style={{ backgroundImage: `url(${resetPassSvg})` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
