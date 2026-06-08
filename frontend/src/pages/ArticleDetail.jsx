import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import request from '../utils/request';
import { AuthContext } from '../App';
import { LoadingSpinner } from '../components/Common/Loading';
import { toast } from '../components/Common/Toast';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';

const ArticleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, authLoading } = useContext(AuthContext);
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return; // Wait for auth check

        if (!user) {
             toast.error('登录后查看完整内容');
             navigate('/login');
             return;
        }
        
        fetchArticle();
    }, [id, user, authLoading]);

    const fetchArticle = async () => {
        setLoading(true);
        try {
            const res = await request.get(`/articles/${id}`);
            setArticle(res);
        } catch (error) {
            // Error handled by interceptor (redirect if 401)
            if (error.status !== 401) {
                toast.error('无法加载文章详情');
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!article) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <button 
                onClick={() => navigate(-1)} 
                className="mb-6 flex items-center text-gray-500 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回列表
            </button>

            <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {article.thumbnail && (
                    <div className="w-full h-64 sm:h-96 overflow-hidden relative">
                        <img 
                            src={article.thumbnail} 
                            alt={article.title} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white shadow-sm mb-4">
                                {article.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
                                <span className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                    <Tag className="w-4 h-4" />
                                    {article.category_name}
                                </span>
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {article.source}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(article.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                
                {!article.thumbnail && (
                    <div className="p-8 border-b border-gray-100">
                         <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
                         <div className="flex items-center gap-4 text-gray-500 text-sm">
                            <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded">
                                {article.category_name}
                            </span>
                            <span>{article.source}</span>
                            <span>{new Date(article.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                )}

                <div className="p-8 sm:p-12">
                     <div className="prose prose-lg max-w-none prose-primary">
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                     </div>
                </div>
            </article>
        </div>
    );
};

export default ArticleDetail;
