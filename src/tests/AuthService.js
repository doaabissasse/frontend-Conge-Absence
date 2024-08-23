import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

const login = async (username, password) => {
  const response = await axios.post(API_URL + 'signin', {
    username,
    password,
  });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? user.role : null;
};

const signout = async () => {
  try {
    await axios.post(`${API_URL}signout`, {}, {
      headers: {
        Authorization: `Bearer ${getCurrentUserToken()}`
      }
    });
  } catch (error) {
    console.error('Error during signout:', error);
  }
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const getUserDetails = () => {
  const user = getCurrentUser();
  if (user && user.token) {
    return axios.get('/api/me', {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  }
  return Promise.reject('No user token found');
};

const getCurrentUserToken = () => {
  const user = getCurrentUser();
  return user ? user.token : null;
};

const AuthService = {
  login,
  logout,
  signout,
  getCurrentUser,
  getUserDetails,
  getCurrentUserRole,
  getCurrentUserToken,
};

export default AuthService;
