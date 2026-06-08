import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../App';
import request from '../../utils/request';
import { toast } from '../../components/Common/Toast';
import { LoadingSpinner } from '../../components/Common/Loading';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const res = await request.post('/auth/login', formData);
      toast.success('登录成功');
      setUser(res.user);
      navigate('/');
    } catch (err) {
      toast.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg transform transition-all hover:shadow-xl">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 border-b-4 border-primary-500 inline-block pb-1">
            欢迎回来
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            登录您的智慧中医平台账号
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">用户名</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="用户名"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">密码</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="密码"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {loading ? <LoadingSpinner size="small" className="text-white" /> : '登录'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  没有账号？立即注册
                </Link>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
