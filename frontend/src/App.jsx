import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import HerbList from './pages/HerbList';
import HerbDetail from './pages/HerbDetail';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import ArticleForm from './pages/Admin/ArticleForm';
import HerbForm from './pages/Admin/HerbForm';
import request from './utils/request';

// Context for auth could be added here, but for simplicity passing via props/simple state
export const AuthContext = React.createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check auth status
    setAuthLoading(true);
    request.get('/auth/profile')
      .then(res => {
        if (res.user) setUser(res.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [location.pathname]); // Re-check on nav change might be aggressive, but ensures sync

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading }}>
      <div className="min-h-screen flex flex-col">
        {/* Hide header on auth pages if desired, but specification implies common layout */}
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/herbs" element={<HerbList />} />
            <Route path="/herbs/:id" element={<HerbDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/article/new" element={<ArticleForm />} />
            <Route path="/admin/article/edit/:id" element={<ArticleForm />} />
            <Route path="/admin/herb/new" element={<HerbForm />} />
            <Route path="/admin/herb/edit/:id" element={<HerbForm />} />
          </Routes>
        </main>
        <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} 智慧中医平台. All rights reserved.
        </footer>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
