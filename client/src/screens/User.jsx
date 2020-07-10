import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { isAuth, getCookie, updateUser, signout } from '../helpers/auth';
import updateUserSvg from '../assets/update.svg';

const User = ({ history }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    textChange: 'Update'
  });

  const { name, email, password, role, textChange } = formData;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const token = getCookie('token');

    axios
      .get(`${process.env.REACT_APP_API_URL}/user/${isAuth()._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        const user = response.data;
        const { role, name, email } = user;

        setFormData({
          ...formData,
          name,
          email,
          role
        });
      })
      .catch((err) => {
        toast.error(`Error To Your Information ${err.response.statusText}`);

        if (err.response.status === 401) {
          signout(() => {
            history.push('/login');
          });
        }
      });
  };

  const handleChange = (text) => (e) => {
    setFormData({ ...formData, [text]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = getCookie('token');
    console.log(token);

    setFormData({
      ...formData,
      textChange: 'Updating'
    });

    axios
      .put(
        `${process.env.REACT_APP_API_URL}/user/update`,
        {
          name,
          email,
          password
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((res) => {
        updateUser(res, () => {
          setFormData({
            ...formData,
            textChange: 'Updated'
          });

          toast.success('Profile Updated Successfully!');
        });
      })
      .catch((err) => {
        console.log(err.response);
      });
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
              Profile Update
            </h1>

            <form
              className='w-full flex-1 mt-8 text-indigo-500'
              onSubmit={handleSubmit}
            >
              <div className='mx-auto max-w-xs relative'>
                <input
                  disabled
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border 
                    border-gray-200 placeholder-gray-500 text-sm focus:outline-none 
                    focus:border-gray-400 focus:bg-white'
                  type='text'
                  placeholder='Role'
                  value={role}
                />

                <input
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border   
                    border-gray-200 placeholder-gray-500 text-sm focus:outline-none 
                    focus:border-gray-400 focus:bg-white mt-5'
                  type='email'
                  placeholder='Email'
                  disabled
                  value={email}
                />

                <input
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border 
                    border-gray-200 placeholder-gray-500 text-sm focus:outline-none 
                    focus:border-gray-400 focus:bg-white mt-5'
                  type='text'
                  placeholder='Name'
                  onChange={handleChange('name')}
                  value={name}
                />

                <input
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border   
                    border-gray-200 placeholder-gray-500 text-sm focus:outline-none 
                    focus:border-gray-400 focus:bg-white mt-5'
                  type='password'
                  placeholder='Password'
                  onChange={handleChange('password')}
                  value={password}
                />

                <button
                  type='submit'
                  className='mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full 
                    py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out 
                    flex items-center justify-center focus:shadow-outline focus:outline-none'
                >
                  <i className='fas fa-user-plus fa 1x w-6  -ml-2' />
                  <span className='ml-3'>{textChange}</span>
                </button>
              </div>

              <div className='my-12 border-b text-center'>
                <div
                  className='leading-none px-2 inline-block text-sm text-gray-600  
                  tracking-wide font-medium bg-white transform translate-y-1/2'
                >
                  Go To Home
                </div>
              </div>

              <div className='flex flex-col items-center'>
                <Link
                  to='/'
                  className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3 
                    bg-indigo-100 text-gray-800 flex items-center justify-center transition-all 
                    duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm 
                    focus:shadow-outline mt-5'
                >
                  <i className='fas fa-sign-in-alt fa 1x w-6 -ml-2 text-indigo-500' />
                  <span className='ml-4'>Home</span>
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className='flex-1 bg-indigo-100 text-center hidden lg:flex'>
          <div
            className='m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat'
            style={{ backgroundImage: `url(${updateUserSvg})` }}
          />
        </div>
      </div>
    </div>
  );
};

export default User;
