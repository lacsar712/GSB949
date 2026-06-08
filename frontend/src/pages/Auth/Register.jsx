import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import request from '../../utils/request';
import { toast } from '../../components/Common/Toast';
import { LoadingSpinner } from '../../components/Common/Loading';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    address: ''
  });
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    // Username: First char must be a letter
    if (!/^[a-zA-Z]/.test(formData.username)) {
      newErrors.username = '用户名首字母必须为字母';
    }
    
    // Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }
    
    // Password: 6-8 chars
    if (formData.password.length < 6 || formData.password.length > 8) {
      newErrors.password = '密码长度必须为6-8位';
    }
    
    // Confirm Password
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = '两次密码输入不一致';
    }

    if (!formData.address) {
        newErrors.address = '请输入常用地址';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await request.post('/auth/register', formData);
      toast.success('注册成功，请登录');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for that field
    if (errors[e.target.name]) {
        setErrors({ ...errors, [e.target.name]: null });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg transform transition-all hover:shadow-xl">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 border-b-4 border-primary-500 inline-block pb-1">
            创建账号
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            加入智慧中医平台，开启健康之旅
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                name="username"
                type="text"
                required
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors`}
                placeholder="首字母必须为字母"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                name="email"
                type="email"
                required
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors`}
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleChange}
              />
               {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors`}
                    placeholder="6-8位字符"
                    value={formData.password}
                    onChange={handleChange}
                  />
                   {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                  <input
                    name="confirm_password"
                    type="password"
                    required
                    className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors`}
                    placeholder="重复密码"
                    value={formData.confirm_password}
                    onChange={handleChange}
                  />
                   {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password}</p>}
               </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">常用地址</label>
              <textarea
                name="address"
                required
                rows="2"
                className={`appearance-none rounded-lg relative block w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors`}
                placeholder="请输入您的常用地址"
                value={formData.address}
                onChange={handleChange}
              />
               {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
           </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {loading ? <LoadingSpinner size="small" className="text-white" /> : '立即注册'}
            </button>
          </div>
          
           <div className="flex items-center justify-center">
              <div className="text-sm">
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  已有账号？去登录
                </Link>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
