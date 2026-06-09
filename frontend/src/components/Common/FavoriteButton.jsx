import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../App';
import request from '../../utils/request';
import { toast } from '../Common/Toast';
import { Heart } from 'lucide-react';
import classNames from 'classnames';

const FavoriteButton = ({ herbId, size = 'default' }) => {
    const { user } = useContext(AuthContext);
    const [favorited, setFavorited] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && herbId) {
            checkFavorite();
        }
    }, [user, herbId]);

    const checkFavorite = async () => {
        try {
            const res = await request.get('/favorites/check', {
                params: { herb_id: herbId }
            });
            setFavorited(res.favorited);
        } catch (e) {
            // ignore
        }
    };

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.info('请先登录后再收藏');
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const res = await request.post('/favorites/toggle', {
                herb_id: herbId
            });
            setFavorited(res.favorited);
            toast.success(res.message);
        } catch (err) {
            if (err && err.message) {
                toast.error(err.message);
            } else {
                toast.error('操作失败，请稍后重试');
            }
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = {
        small: 'w-8 h-8',
        default: 'w-10 h-10',
        large: 'w-12 h-12'
    };

    const iconSizes = {
        small: 'w-4 h-4',
        default: 'w-5 h-5',
        large: 'w-6 h-6'
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={classNames(
                "inline-flex items-center justify-center rounded-full transition-all duration-300",
                sizeClasses[size],
                favorited
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-400",
                loading && "opacity-50 cursor-not-allowed"
            )}
            title={favorited ? '取消收藏' : '收藏'}
        >
            <Heart
                className={classNames(
                    iconSizes[size],
                    "transition-transform duration-300",
                    favorited && "fill-current scale-110"
                )}
            />
        </button>
    );
};

export default FavoriteButton;
