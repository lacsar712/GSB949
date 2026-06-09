import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import request from '../utils/request';
import { LoadingSkeleton, LoadingSpinner } from '../components/Common/Loading';
import Pagination from '../components/Common/Pagination';
import { toast } from '../components/Common/Toast';
import { Heart, Leaf, Trash2, ArrowLeft } from 'lucide-react';

const FavoriteList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [user, page]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await request.get('/favorites/list', {
                params: { page, limit }
            });
            setFavorites(res.data);
            setTotal(res.total);
        } catch (err) {
            toast.error('获取收藏列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (herbId, herbName) => {
        try {
            await request.delete('/favorites', {
                data: { herb_id: herbId }
            });
            toast.success(`已取消收藏「${herbName}」`);
            fetchFavorites();
        } catch (err) {
            toast.error('取消收藏失败');
        }
    };

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 space-y-4">
                <Heart className="w-16 h-16" />
                <p className="text-lg">请先登录后查看收藏列表</p>
                <Link
                    to="/login"
                    className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                >
                    去登录
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回
            </button>

            <div className="flex items-center gap-3 mb-2">
                <Heart className="w-7 h-7 text-red-500 fill-current" />
                <h1 className="text-3xl font-bold font-serif text-gray-900">我的收藏</h1>
                <span className="text-sm text-gray-400 ml-2">共 {total} 味中药</span>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <LoadingSkeleton count={2} />
                        </div>
                    ))}
                </div>
            ) : favorites.length > 0 ? (
                <div className="space-y-4">
                    {favorites.map((item) => (
                        <div
                            key={item.favorite_id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary-100 transition-all duration-300 overflow-hidden"
                        >
                            <div className="flex items-center p-4 gap-4">
                                <Link
                                    to={`/herbs/${item.herb_id}`}
                                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-stone-100"
                                >
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary-200">
                                            <Leaf size={28} />
                                        </div>
                                    )}
                                </Link>

                                <Link
                                    to={`/herbs/${item.herb_id}`}
                                    className="flex-grow min-w-0"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-gray-900 hover:text-primary-700 transition-colors">
                                            {item.name}
                                        </h3>
                                        {item.category_name && (
                                            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                                                {item.category_name}
                                            </span>
                                        )}
                                    </div>
                                    {item.alias && (
                                        <p className="text-xs text-gray-400 mb-1">别名：{item.alias}</p>
                                    )}
                                    <p className="text-sm text-gray-500 truncate">{item.efficacy || '暂无功效信息'}</p>
                                    <p className="text-xs text-gray-300 mt-1">收藏于 {item.favorited_at}</p>
                                </Link>

                                <button
                                    onClick={() => handleRemove(item.herb_id, item.name)}
                                    className="flex-shrink-0 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    title="取消收藏"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400 space-y-4">
                    <Heart className="w-16 h-16 mx-auto" />
                    <p className="text-lg">还没有收藏任何中药</p>
                    <Link
                        to="/herbs"
                        className="inline-block px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                    >
                        去中药库逛逛
                    </Link>
                </div>
            )}

            <Pagination page={page} total={total} limit={limit} onChange={setPage} />
        </div>
    );
};

export default FavoriteList;
