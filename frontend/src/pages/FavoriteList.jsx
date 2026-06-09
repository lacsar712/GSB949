import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../App';
import request from '../utils/request';
import { LoadingSkeleton } from '../components/Common/Loading';
import Pagination from '../components/Common/Pagination';
import FavoriteButton from '../components/Common/FavoriteButton';
import { toast } from '../components/Common/Toast';
import { Heart, Leaf, BookOpen } from 'lucide-react';

const FavoriteList = () => {
    const { user, authLoading } = useContext(AuthContext);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 12;

    useEffect(() => {
        if (user) {
            fetchFavorites();
        }
    }, [page, user]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await request.get('/favorites', {
                params: { page, limit }
            });
            setFavorites(res.data);
            setTotal(res.total);
        } catch (error) {
            toast.error('获取收藏列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoved = (herbId) => {
        setFavorites(prev => prev.filter(item => item.id !== herbId));
        setTotal(prev => prev - 1);
        if (favorites.length === 1 && page > 1) {
            setPage(prev => prev - 1);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSkeleton count={3} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-red-50 via-white to-primary-50 rounded-3xl shadow-sm border border-stone-100 p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <Heart className="w-8 h-8 text-red-500 fill-current" />
                    </div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 mb-3">我的收藏</h1>
                    <p className="text-stone-600 max-w-md mx-auto">您收藏的中药材都在这里，共 {total} 味</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                             <LoadingSkeleton height="h-40" className="mb-4 rounded-xl" />
                             <LoadingSkeleton count={2} />
                        </div>
                    ))}
                </div>
            ) : favorites.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
                        {favorites.map((herb) => (
                            <div key={herb.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-100 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col h-full relative">
                                <div className="absolute top-3 right-3 z-10">
                                    <FavoriteButton
                                        herbId={herb.id}
                                        isFavorited={true}
                                        size="small"
                                        onToggle={(fav) => !fav && handleRemoved(herb.id)}
                                    />
                                </div>
                                <Link 
                                    to={`/herbs/${herb.id}`}
                                    className="flex flex-col h-full"
                                >
                                    <div className="h-40 overflow-hidden bg-stone-100 relative">
                                        {herb.image ? (
                                            <img 
                                                src={herb.image} 
                                                alt={herb.name} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-primary-200">
                                                 <Leaf size={36} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-grow">
                                        <h3 className="font-bold font-serif text-lg text-stone-900 mb-1.5 group-hover:text-primary-700 transition-colors">{herb.name}</h3>
                                        {herb.category_name && (
                                             <span className="inline-block text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full mb-2 font-medium">
                                                {herb.category_name}
                                             </span>
                                        )}
                                        <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed" title={herb.efficacy}>
                                            {herb.efficacy}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                    <Pagination page={page} total={total} limit={limit} onChange={setPage} />
                </>
            ) : (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-stone-100 rounded-full mb-6">
                        <BookOpen className="w-10 h-10 text-stone-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无收藏</h3>
                    <p className="text-gray-500 mb-6">快去中药库浏览并收藏您感兴趣的药材吧</p>
                    <Link
                        to="/herbs"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors shadow-md"
                    >
                        <Leaf className="w-4 h-4 mr-2" />
                        浏览中药库
                    </Link>
                </div>
            )}
        </div>
    );
};

export default FavoriteList;
