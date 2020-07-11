import cookie from 'js-cookie';

// set cookie
export const setCookie = (key, value) => {
  if (window !== 'undefined') {
    cookie.set(key, value, {
      // 1 Day
      expires: 1
    });
  }
};

// remove cookie
export const removeCookie = (key) => {
  if (window !== 'undefined') {
    cookie.remove(key, {
      expires: 1
    });
  }
};

// get cookie from stored token
// will be useful when we need to make request to server with token
export const getCookie = (key) => {
  if (window !== 'undefined') {
    return cookie.get(key);
  }
};

// set key in localstorage
export const setLocalStorage = (key, value) => {
  if (window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// remove key from localstorage
export const removeLocalStorage = (key) => {
  if (window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

// authenticate user by passing data to cookie & local-storage during sign-in
export const authenticate = (response, next) => {
  console.log('USER AUTHENTICATION RESPONSE', response.data);
  const { data } = response;
  setCookie('token', data.token);
  setLocalStorage('user', data.user);
  next();
};

// access user info from localstorage
export const isAuth = () => {
  if (window !== 'undefined') {
    const cookieChecked = getCookie('token');
    if (cookieChecked && localStorage.getItem('user')) {
      return JSON.parse(localStorage.getItem('user'));
    } else {
      return false;
    }
  }
};

// sign-out
export const signout = (next) => {
  removeCookie('token');
  removeLocalStorage('user');
  next();
};

export const updateUser = (response, next) => {
  // console.log('UPDATE USER IN LOCALSTORAGE RESPONSE', response);
  if (typeof window !== 'undefined') {
    const updatedUser = response.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  next();
};
