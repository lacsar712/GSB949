import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import request from '../utils/request';
import { LoadingSpinner } from '../components/Common/Loading';
import FavoriteButton from '../components/Common/FavoriteButton';
import { toast } from '../components/Common/Toast';
import { ArrowLeft, Leaf, Activity, Beaker } from 'lucide-react';

const HerbDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [herb, setHerb] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHerb();
    }, [id]);

    const fetchHerb = async () => {
        setLoading(true);
        try {
            const res = await request.get(`/herbs/${id}`);
            setHerb(res);
            checkFavoriteStatus(parseInt(id));
        } catch (error) {
            toast.error('无法加载中药详情');
            navigate('/herbs');
        } finally {
            setLoading(false);
        }
    };

    const checkFavoriteStatus = async (herbId) => {
        try {
            const res = await request.get('/favorites', {
                params: { check: 1, herb_id: herbId }
            });
            setIsFavorited(res.favorites.includes(herbId));
        } catch (e) {
            setIsFavorited(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!herb) return null;

    const sections = [
        { title: '功效主治', icon: <Activity className="w-5 h-5 text-primary-500" />, content: herb.efficacy },
        { title: '药理作用', icon: <Beaker className="w-5 h-5 text-secondary-500" />, content: herb.pharmacology },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-gray-500 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回中药库
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/3 h-64 md:h-auto overflow-hidden relative bg-gray-100">
                        {herb.image ? (
                            <img 
                                src={herb.image} 
                                alt={herb.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Leaf size={64} />
                            </div>
                        )}
                    </div>
                    
                    <div className="p-8 md:w-2/3">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex flex-wrap items-baseline gap-4">
                                <h1 className="text-3xl font-bold text-gray-900">{herb.name}</h1>
                                {herb.alias && (
                                    <span className="text-gray-500 text-sm">别名：{herb.alias}</span>
                                )}
                            </div>
                            <FavoriteButton
                                herbId={parseInt(id)}
                                isFavorited={isFavorited}
                                size="large"
                                onToggle={(fav) => setIsFavorited(fav)}
                            />
                        </div>
                        
                        {herb.category_name && (
                             <div className="mb-6">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700">
                                    <Leaf className="w-3 h-3 mr-1" />
                                    {herb.category_name}
                                </span>
                             </div>
                        )}
                        
                        <div className="prose prose-sm text-gray-600">
                             <h4 className="font-semibold text-gray-800 mb-2">简介</h4>
                             <p>{herb.efficacy?.substring(0, 100)}...</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {sections.map((section, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
                            {section.icon}
                            {section.title}
                        </h2>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {section.content || '暂无详细信息'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HerbDetail;
