import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../App';
import request from '../../utils/request';
import { Menu, X, Search, User, LogOut, LogIn } from 'lucide-react';
import classNames from 'classnames';

const Header = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const handleLogout = async () => {
    try {
      await request.post('/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      // For simplicity, search redirects to search results page or filters current list
      // Since we don't have a dedicated search page in the requirements but "search box can search terms",
      // We can redirect to a search results page or reuse the list page with query
      // Let's implement a global search by navigating to /herbs or /articles depending on context or a unified search page?
      // Requirement: "application search box: can search TCM articles and herbs".
      // Let's assume a search results page or maybe just filtering. 
      // Plan had "Search API" returning {articles: [], herbs: []}. So maybe a search page.
      // But implementation plan didn't explicitly create a SearchPage.jsx, it listed "Home" with filtering and "HerbList" with search.
      // Let's make it intuitive: if on home, filter articles; if on herbs, filter herbs. 
      // Or better: Global search bar redirects to a search results overlay or page?
      // Let's stick to simple: If on HerbList, search herbs. If on Home, search articles.
      // Or maybe search is just a parameter.
      if (location.pathname.includes('/herbs')) {
        navigate(`/herbs?keyword=${keyword}`);
      } else {
        navigate(`/?keyword=${keyword}`);
      }
      setIsOpen(false);
    }
  };

  const navLinks = [
    { name: '中医科普', path: '/' },
    { name: '中药库', path: '/herbs' },
  ];

  if (user) {
    navLinks.push({ name: '我的收藏', path: '/favorites' });
    navLinks.push({ name: '管理后台', path: '/admin' });
  }

  return (
    <header className="bg-white/80 backdrop-filter backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <span className="text-2xl font-bold font-serif text-primary-700 group-hover:text-primary-800 transition-colors">智慧中医</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={classNames(
                    location.pathname === link.path 
                      ? "border-primary-500 text-gray-900" 
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
             <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="搜索..."
                  className="w-48 pl-10 pr-4 py-1.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-300 focus:w-64"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
             </form>

            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              >
                <LogIn className="w-4 h-4" />
                登录/注册
              </Link>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden absolute w-full bg-white shadow-lg border-b border-gray-100">
          <div className="pt-2 pb-3 space-y-1">
             <form onSubmit={handleSearch} className="px-4 pb-2">
                <div className="relative">
                   <input
                    type="text"
                    placeholder="搜索..."
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
             </form>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={classNames(
                   location.pathname === link.path 
                      ? "bg-primary-50 border-primary-500 text-primary-700" 
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700",
                  "block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200">
            {user ? (
               <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                       <User className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.username}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="ml-auto flex-shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
               </div>
            ) : (
               <div className="px-4">
                 <Link
                   to="/login"
                   className="block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm"
                   onClick={() => setIsOpen(false)}
                 >
                   登录 / 注册
                 </Link>
               </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
