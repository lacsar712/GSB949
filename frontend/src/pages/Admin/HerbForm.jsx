import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import request from '../../utils/request';
import { toast } from '../../components/Common/Toast';
import { LoadingSpinner } from '../../components/Common/Loading';
import { ArrowLeft } from 'lucide-react';

const HerbForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        alias: '',
        image: '',
        summary: '',
        source: '原创',
        efficacy: '',
        pharmacology: '',
        category_id: ''
    });

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchHerb();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await request.get('/categories?type=herb');
            setCategories(res);
            if (!isEdit && res.length > 0) {
                setFormData(prev => ({ ...prev, category_id: res[0].id }));
            }
        } catch (error) {
            toast.error('获取分类失败');
        }
    };

    const fetchHerb = async () => {
        setLoading(true);
        try {
            const res = await request.get(`/herbs/${id}`);
            setFormData({
                name: res.name,
                alias: res.alias || '',
                image: res.image || '',
                summary: res.summary || '',
                source: res.source || '原创',
                efficacy: res.efficacy || '',
                pharmacology: res.pharmacology || '',
                category_id: res.category_id
            });
        } catch (error) {
            toast.error('获取中药失败');
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            if (isEdit) {
                await request.put(`/herbs/${id}`, formData);
                toast.success('更新成功');
            } else {
                await request.post('/herbs', formData);
                toast.success('录入成功');
            }
            navigate('/admin');
        } catch (error) {
            toast.error(error.message || '操作失败');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
             <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/admin')} 
                    className="flex items-center text-gray-500 hover:text-primary-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    返回后台
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{isEdit ? '编辑中药信息' : '录入新中药'}</h1>
                <div className="w-20"></div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">中药名称</label>
                        <input
                             type="text"
                             name="name"
                             required
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                             value={formData.name}
                             onChange={handleChange}
                             placeholder="如：人参"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">别名</label>
                        <input
                             type="text"
                             name="alias"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                             value={formData.alias}
                             onChange={handleChange}
                             placeholder="如：黄参、血参"
                        />
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">所属分类</label>
                       <select
                            name="category_id"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                            value={formData.category_id}
                            onChange={handleChange}
                        >
                            <option value="">请选择分类</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">来源</label>
                        <input
                             type="text"
                             name="source"
                             required
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                             value={formData.source}
                             onChange={handleChange}
                             placeholder="来源信息"
                        />
                     </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
                   <input
                        type="url"
                        name="image"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="https://example.com/herb.jpg"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                   <textarea
                        name="summary"
                        required
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.summary}
                        onChange={handleChange}
                        placeholder="中药的一句话简介"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">功效主治</label>
                   <textarea
                        name="efficacy"
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.efficacy}
                        onChange={handleChange}
                        placeholder="详细描述功效和主治病症"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">药理作用</label>
                   <textarea
                        name="pharmacology"
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.pharmacology}
                        onChange={handleChange}
                        placeholder="描述化学成分及药理研究成果"
                   />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 flex items-center"
                    >
                        {loading && <LoadingSpinner size="small" className="text-white mr-2" />}
                        {isEdit ? '保存修改' : '确认录入'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HerbForm;
