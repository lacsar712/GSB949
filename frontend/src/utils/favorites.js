import request from './request';

export const addFavorite = (herbId) => {
  return request.post('/favorites', { herb_id: herbId });
};

export const removeFavorite = (herbId) => {
  return request.delete(`/favorites/${herbId}`);
};

export const checkFavorite = (herbId) => {
  return request.get(`/favorites/check/${herbId}`);
};

export const getFavorites = (params = {}) => {
  return request.get('/favorites', { params });
};
