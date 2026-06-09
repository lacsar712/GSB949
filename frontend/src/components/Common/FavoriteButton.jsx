import React, { useState, useEffect, useContext } from 'react';
import { Heart } from 'lucide-react';
import classNames from 'classnames';
import { AuthContext } from '../../App';
import { addFavorite, removeFavorite, checkFavorite } from '../../utils/favorites';
import { toast } from './Toast';

const FavoriteButton = ({ herbId, initialFavorited = false, onToggle, className = '', size = 'default' }) => {
  const { user } = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (herbId && user && !initialFavorited) {
      fetchFavoriteStatus();
    }
  }, [herbId, user]);

  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const fetchFavoriteStatus = async () => {
    try {
      const res = await checkFavorite(herbId);
      setIsFavorited(res.is_favorited);
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info('请先登录');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      if (isFavorited) {
        await removeFavorite(herbId);
        setIsFavorited(false);
        toast.success('已取消收藏');
      } else {
        await addFavorite(herbId);
        setIsFavorited(true);
        toast.success('收藏成功');
      }
      if (onToggle) {
        onToggle(!isFavorited);
      }
    } catch (error) {
      toast.error(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <button
      onClick={handleClick}
      className={classNames(
        'p-2 rounded-full transition-all duration-300 hover:scale-110',
        isFavorited ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-400 bg-white/80 hover:bg-white hover:text-red-400',
        'backdrop-blur-sm shadow-sm border border-gray-100',
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={isFavorited ? '取消收藏' : '收藏'}
    >
      <Heart
        className={classNames(sizeClasses[size], isFavorited ? 'fill-current' : '')}
      />
    </button>
  );
};

export default FavoriteButton;
