import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import request from '../../utils/request';
import { toast } from '../../components/Common/Toast';
import { LoadingSpinner } from '../../components/Common/Loading';
import { ArrowLeft } from 'lucide-react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const ArticleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        thumbnail: '',
        summary: '',
        content: '',
        source: '原创',
        category_id: ''
    });

    const [quill, setQuill] = useState(null);

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchArticle();
        }
    }, [id]);

    useEffect(() => {
        if (!quill) {
             const q = new Quill('#editor', {
                theme: 'snow',
                 modules: {
                     toolbar: [
                         [{ 'header': [1, 2, 3, false] }],
                         ['bold', 'italic', 'underline', 'strike'],
                         [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                         ['link', 'image'],
                         ['clean']
                     ]
                 }
             });
             q.on('text-change', () => {
                 setFormData(prev => ({ ...prev, content: q.root.innerHTML }));
             });
             setQuill(q);
        }
    }, []);

    // Set content to quill when data loaded
    useEffect(() => {
        if (quill && formData.content && quill.root.innerHTML !== formData.content) {
             // Avoid loop if content matches
             // But valid initial load needs this
             if (quill.getText().trim().length === 0 && !formData.content.includes('<p><br></p>')) {
                 quill.root.innerHTML = formData.content;
             }
        }
    }, [quill, formData.content]);

    const fetchCategories = async () => {
        try {
            const res = await request.get('/categories?type=article');
            setCategories(res);
            if (!isEdit && res.length > 0) {
                setFormData(prev => ({ ...prev, category_id: res[0].id }));
            }
        } catch (error) {
            toast.error('获取分类失败');
        }
    };

    const fetchArticle = async () => {
        setLoading(true);
        try {
            const res = await request.get(`/articles/${id}`);
            setFormData({
                title: res.title,
                thumbnail: res.thumbnail || '',
                summary: res.summary || '',
                content: res.content || '',
                source: res.source || '原创',
                category_id: res.category_id
            });
            if (quill) {
                quill.root.innerHTML = res.content || '';
            }
        } catch (error) {
            toast.error('获取文章失败');
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Manual validation for content
        if (!formData.content || formData.content === '<p><br></p>') {
            toast.error('请输入文章内容');
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                await request.put(`/articles/${id}`, formData);
                toast.success('更新成功');
            } else {
                await request.post('/articles', formData);
                toast.success('发布成功');
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
                <h1 className="text-2xl font-bold text-gray-900">{isEdit ? '编辑文章' : '发布新文章'}</h1>
                <div className="w-20"></div> {/* Spacer for center alignment visual */}
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">文章标题</label>
                   <input
                        type="text"
                        name="title"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="请输入引人注目的标题"
                   />
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={formData.source}
                            onChange={handleChange}
                            required
                            placeholder="原创、转载出处等"
                        />
                     </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">缩略图 URL</label>
                   <input
                        type="url"
                        name="thumbnail"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={formData.thumbnail}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                   />
                   <p className="mt-1 text-xs text-gray-500">请输入完整的图片链接地址</p>
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
                        placeholder="简要描述文章内容（用于列表展示）"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">详细内容</label>
                   <div className="prose-editor-container border border-gray-300 rounded-lg overflow-hidden">
                       <div id="editor" className="h-[400px] bg-white"></div>
                   </div>
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
                        {isEdit ? '保存修改' : '立即发布'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ArticleForm;
