import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import request from '../utils/request';
import { AuthContext } from '../App';
import { LoadingSkeleton } from '../components/Common/Loading';
import Pagination from '../components/Common/Pagination';
import ConfirmModal from '../components/Common/ConfirmModal';
import { toast } from '../components/Common/Toast';
import { Heart, Leaf, Trash2 } from 'lucide-react';

const Favorites = () => {
    const { user, authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 12;

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingHerb, setPendingHerb] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            toast.info('请先登录后查看收藏');
            navigate('/login');
            return;
        }
        fetchFavorites();
    }, [page, user, authLoading]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await request.get('/favorites', {
                params: { page, limit }
            });
            setList(res.data || []);
            setTotal(res.total || 0);
        } catch (err) {
            toast.error(err?.message || '获取收藏列表失败');
        } finally {
            setLoading(false);
        }
    };

    const askRemove = (herb) => {
        setPendingHerb(herb);
        setConfirmOpen(true);
    };

    const handleRemove = async () => {
        if (!pendingHerb) return;
        try {
            await request.delete(`/favorites/${pendingHerb.id}`);
            toast.success('已取消收藏');
            // 当前页删除一项后，若该页变空且不是第一页，则回到上一页
            if (list.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                fetchFavorites();
            }
        } catch (err) {
            toast.error(err?.message || '取消收藏失败');
        } finally {
            setConfirmOpen(false);
            setPendingHerb(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-white via-primary-50 to-stone-50 rounded-3xl shadow-sm border border-stone-100 p-10 relative overflow-hidden">
                <h1 className="text-3xl font-bold font-serif text-primary-900 mb-3 flex items-center gap-3">
                    <Heart className="w-7 h-7 text-rose-500" fill="currentColor" />
                    我的中药收藏
                </h1>
                <p className="text-stone-600 font-serif">
                    共收藏 <span className="font-semibold text-primary-700">{total}</span> 味中药
                </p>
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
            ) : list.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-2">
                    {list.map((herb) => (
                        <div
                            key={herb.favorite_id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-stone-100 hover:border-primary-100 transition-all duration-500 transform hover:-translate-y-1 flex flex-col h-full relative"
                        >
                            <Link to={`/herbs/${herb.id}`} className="block">
                                <div className="h-48 overflow-hidden bg-stone-100 relative">
                                    {herb.image ? (
                                        <img
                                            src={herb.image}
                                            alt={herb.name}
                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary-200">
                                            <Leaf size={40} />
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="p-5 flex-grow flex flex-col">
                                <Link to={`/herbs/${herb.id}`}>
                                    <h3 className="font-bold font-serif text-xl text-stone-900 mb-2 hover:text-primary-700 transition-colors">
                                        {herb.name}
                                    </h3>
                                </Link>
                                {herb.category_name && (
                                    <span className="inline-block self-start text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full mb-3 font-medium">
                                        {herb.category_name}
                                    </span>
                                )}
                                <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed flex-grow" title={herb.efficacy}>
                                    {herb.efficacy}
                                </p>
                                <button
                                    onClick={() => askRemove(herb)}
                                    className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg py-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    取消收藏
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-stone-300" />
                    <p className="mb-4">您还没有收藏任何中药</p>
                    <Link
                        to="/herbs"
                        className="inline-block px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                    >
                        前往中药库
                    </Link>
                </div>
            )}

            <Pagination page={page} total={total} limit={limit} onChange={setPage} />

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setPendingHerb(null); }}
                onConfirm={handleRemove}
                title="取消收藏"
                message={`确定要取消收藏「${pendingHerb?.name || ''}」吗？`}
                isDanger
            />
        </div>
    );
};

export default Favorites;
