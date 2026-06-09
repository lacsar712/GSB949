import React, { useContext, useState } from 'react';
import { Heart } from 'lucide-react';
import { AuthContext } from '../../App';
import request from '../../utils/request';
import { toast } from './Toast';
import classNames from 'classnames';

const FavoriteButton = ({ herbId, isFavorited: initialFavorited = false, size = 'default', onToggle, className }) => {
  const { user } = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 16,
    default: 20,
    large: 24
  };

  const handleToggle = async (e) => {
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
        await request.delete(`/favorites/${herbId}`);
        setIsFavorited(false);
        toast.success('已取消收藏');
      } else {
        await request.post('/favorites', { herb_id: herbId });
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

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={classNames(
        sizeClasses[size],
        'flex items-center justify-center rounded-full transition-all duration-300 shadow-sm',
        isFavorited
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50',
        loading ? 'opacity-50 cursor-wait' : 'cursor-pointer',
        className
      )}
      title={isFavorited ? '取消收藏' : '收藏'}
    >
      <Heart
        size={iconSizes[size]}
        className={classNames(
          'transition-all duration-300',
          isFavorited ? 'fill-current' : ''
        )}
      />
    </button>
  );
};

export default FavoriteButton;
