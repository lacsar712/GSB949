import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import request from '../utils/request';
import { LoadingSkeleton } from '../components/Common/Loading';
import Pagination from '../components/Common/Pagination';
import FavoriteButton from '../components/Common/FavoriteButton';
import { toast } from '../components/Common/Toast';
import { Search, Leaf } from 'lucide-react';

const HerbList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    // Allow URL to drive state
    const keyword = searchParams.get('keyword') || '';
    const [localKeyword, setLocalKeyword] = useState(keyword);

    const [herbs, setHerbs] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 12;

    useEffect(() => {
        setLocalKeyword(keyword);
    }, [keyword]);

    useEffect(() => {
        fetchHerbs();
    }, [page, keyword]); // Re-fetch when URL keyword changes

    const fetchHerbs = async () => {
        setLoading(true);
        try {
            const res = await request.get('/herbs', {
                params: {
                    page,
                    limit,
                    keyword
                }
            });
            setHerbs(res.data);
            setTotal(res.total);
            if (res.data.length > 0) {
                checkFavorites(res.data.map(h => h.id));
            } else {
                setFavoriteIds(new Set());
            }
        } catch (error) {
            toast.error('获取中药列表失败');
        } finally {
            setLoading(false);
        }
    };

    const checkFavorites = async (herbIds) => {
        try {
            const res = await request.get('/favorites', {
                params: { check: 1, herb_ids: herbIds.join(',') }
            });
            setFavoriteIds(new Set(res.favorites));
        } catch (e) {
            setFavoriteIds(new Set());
        }
    };

    const handleFavoriteToggle = (herbId, isFav) => {
        setFavoriteIds(prev => {
            const next = new Set(prev);
            if (isFav) {
                next.add(herbId);
            } else {
                next.delete(herbId);
            }
            return next;
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ keyword: localKeyword }); // Update URL params
        setPage(1);
    };

    return (
        <div className="space-y-12">
            <div className="bg-gradient-to-br from-white via-primary-50 to-stone-50 rounded-3xl shadow-sm border border-stone-100 p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                
                <h1 className="text-4xl font-bold font-serif text-primary-900 mb-6 relative z-10">中药宝库</h1>
                <p className="text-stone-600 mb-10 max-w-xl mx-auto text-lg font-serif relative z-10">在这里搜索和查询中药材的详细信息、功效与用法。</p>
                
                <form onSubmit={handleSearch} className="max-w-xl mx-auto relative z-10">
                    <input
                        type="text"
                        placeholder="输入中药名、别名或功效..."
                        className="w-full pl-12 pr-4 py-4 rounded-full border border-stone-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 focus:outline-none shadow-sm transition-all text-base bg-white/80 backdrop-blur"
                        value={localKeyword}
                        onChange={(e) => setLocalKeyword(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 transform -translate-y-1/2" />
                    <button 
                         type="submit"
                         className="absolute right-2.5 top-2.5 bottom-2.5 px-8 bg-primary-700 text-white rounded-full font-medium hover:bg-primary-800 transition-colors shadow-md hover:shadow-lg"
                    >
                        搜索
                    </button>
                </form>
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
            ) : herbs.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-2">
                    {herbs.map((herb) => (
                        <div 
                            key={herb.id} 
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-stone-100 hover:border-primary-100 transition-all duration-500 transform hover:-translate-y-2 group flex flex-col h-full relative"
                        >
                            <div className="absolute top-3 right-3 z-10">
                                <FavoriteButton
                                    herbId={herb.id}
                                    isFavorited={favoriteIds.has(herb.id)}
                                    size="small"
                                    onToggle={(fav) => handleFavoriteToggle(herb.id, fav)}
                                />
                            </div>
                            <Link 
                                to={`/herbs/${herb.id}`}
                                className="flex flex-col h-full"
                            >
                                <div className="h-48 overflow-hidden bg-stone-100 relative">
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
                <div className="text-center py-12 text-gray-500">
                    未找到相关中药
                </div>
            )}

            <Pagination page={page} total={total} limit={limit} onChange={setPage} />
        </div>
    );
};

export default HerbList;
