import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true // Important for session cookies
});

// Response interceptor
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const isAuthCheck = error.config.url.includes('/auth/profile');
        const isFavoriteCheck = error.config.url.includes('/favorites/check');
        if (!isAuthCheck && !isFavoriteCheck && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: '网络错误，请稍后重试' });
  }
);

export default request;
