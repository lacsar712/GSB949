import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import request from '../utils/request';
import { LoadingSkeleton } from '../components/Common/Loading';
import Pagination from '../components/Common/Pagination';
import { Calendar, User, BookOpen } from 'lucide-react';
import { toast } from '../components/Common/Toast';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(null);
  const limit = 9;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [page, activeCategory, keyword]);

  const fetchCategories = async () => {
    try {
      const res = await request.get('/categories?type=article');
      setCategories(res);
    } catch (error) {
      toast.error('获取分类失败');
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        keyword
      };
      if (activeCategory) {
        params.category_id = activeCategory;
      }
      const res = await request.get('/articles', { params });
      setArticles(res.data);
      setTotal(res.total);
    } catch (error) {
      toast.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setPage(1);
    setSearchParams({}); // Clear keyword when changing category for better UX? Or keep it?
    // Let's clear searching when filtering by category usually
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-20 bg-gradient-to-br from-primary-50 via-stone-50 to-secondary-50 rounded-3xl mb-12 shadow-inner border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/chinese-cloud.png')]"></div>
        <h1 className="text-5xl font-bold font-serif text-primary-800 mb-6 relative z-10 tracking-wide">探索中医智慧</h1>
        <p className="text-stone-600 max-w-2xl mx-auto text-lg leading-relaxed relative z-10 font-serif">
          传承千年文化，守护身心健康。浏览丰富的科普文章，了解中医药理。
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        <button
          onClick={() => handleCategoryChange(null)}
          className={`px-6 py-2.5 rounded-full text-base font-serif transition-all duration-300 shadow-sm ${
            activeCategory === null
              ? 'bg-primary-700 text-white shadow-primary-200 ring-4 ring-primary-50'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200 hover:border-primary-200 hover:text-primary-700'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-6 py-2.5 rounded-full text-base font-serif transition-all duration-300 shadow-sm ${
              activeCategory === cat.id
                ? 'bg-primary-700 text-white shadow-primary-200 ring-4 ring-primary-50'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200 hover:border-primary-200 hover:text-primary-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Article List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 p-4">
              <LoadingSkeleton height="h-56" className="mb-4 rounded-xl" />
              <LoadingSkeleton count={2} />
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
          {articles.map((article) => (
            <Link 
              key={article.id} 
              to={`/article/${article.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-stone-100 hover:border-primary-100 transition-all duration-500 transform hover:-translate-y-2 block h-full flex flex-col"
            >
              <div className="relative h-56 overflow-hidden bg-stone-100">
                {article.thumbnail ? (
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-200">
                    <BookOpen size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-sm px-3 py-1.5 rounded-full text-xs font-bold font-serif text-primary-800 tracking-wider">
                  {article.category_name}
                </div>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 bg-opacity-50 flex-grow">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50 mt-auto">
                   <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{article.source}</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          <p>暂无相关内容</p>
        </div>
      )}

      <Pagination page={page} total={total} limit={limit} onChange={handlePageChange} />
    </div>
  );
};

export default Home;
