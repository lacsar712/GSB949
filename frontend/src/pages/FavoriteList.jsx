import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { getFavorites, removeFavorite } from '../utils/favorites';
import { LoadingSkeleton } from '../components/Common/Loading';
import Pagination from '../components/Common/Pagination';
import FavoriteButton from '../components/Common/FavoriteButton';
import { toast } from '../components/Common/Toast';
import { Heart, Leaf, ArrowLeft } from 'lucide-react';

const FavoriteList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 12;

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [page, user]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await getFavorites({ page, limit });
            setFavorites(res.data);
            setTotal(res.total);
        } catch (error) {
            toast.error('获取收藏列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (herbId) => {
        try {
            await removeFavorite(herbId);
            toast.success('已取消收藏');
            setFavorites(favorites.filter(item => item.id !== herbId));
            setTotal(total - 1);
            if (favorites.length === 1 && page > 1) {
                setPage(page - 1);
            }
        } catch (error) {
            toast.error(error.message || '取消收藏失败');
        }
    };

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                <div className="text-center space-y-4">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-700">我的收藏</h2>
                    <p className="text-gray-500">请先登录后查看您的收藏</p>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    去登录
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-gray-500 hover:text-primary-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    返回
                </button>
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 flex items-center gap-2">
                        <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                        我的收藏
                    </h1>
                    <p className="text-gray-500 mt-1">共收藏 {total} 味中药</p>
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-2">
                    {favorites.map((herb) => (
                        <div 
                            key={herb.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-stone-100 hover:border-primary-100 transition-all duration-500 transform hover:-translate-y-2 group flex flex-col h-full relative"
                        >
                            <div className="absolute top-3 right-3 z-10">
                                <FavoriteButton 
                                    herbId={herb.id} 
                                    initialFavorited={true}
                                    size="small"
                                    onToggle={(isFavorited) => {
                                        if (!isFavorited) {
                                            handleRemoveFavorite(herb.id);
                                        }
                                    }}
                                />
                            </div>
                            <Link to={`/herbs/${herb.id}`} className="flex flex-col h-full">
                                <div className="h-48 overflow-hidden bg-stone-100">
                                    {herb.image ? (
                                        <img 
                                            src={herb.image} 
                                            alt={herb.name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary-200">
                                             <Leaf size={40} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex-grow">
                                    <h3 className="font-bold font-serif text-xl text-stone-900 mb-2 group-hover:text-primary-700 transition-colors">{herb.name}</h3>
                                    {herb.category_name && (
                                         <span className="inline-block text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full mb-3 font-medium">
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
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
                    <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">暂无收藏</h3>
                    <p className="text-gray-400 mb-6">去中药库发现更多优质中药材吧</p>
                    <Link 
                        to="/herbs"
                        className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        去逛逛
                    </Link>
                </div>
            )}

            <Pagination page={page} total={total} limit={limit} onChange={setPage} />
        </div>
    );
};

export default FavoriteList;
