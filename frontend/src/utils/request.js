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
        // Redirect to login if checking auth status fails or api requires auth
        // But don't redirect if it's just a check-auth call that's expected to fail for guests
        const isAuthCheck = error.config.url.includes('/auth/profile');
        if (!isAuthCheck && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: '网络错误，请稍后重试' });
  }
);

export default request;
