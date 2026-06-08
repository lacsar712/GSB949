import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import { AuthContext } from '../../App';
import { toast } from '../../components/Common/Toast';
import ConfirmModal from '../../components/Common/ConfirmModal';
import Pagination from '../../components/Common/Pagination';
import { Plus, Edit, Trash2, FileText, Leaf, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('articles');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [modalOpen, setModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (user === null) {
             // Let request interceptor handle, or rely on effect inside App/request
        } else if (user) {
             fetchData();
        }
    }, [activeTab, page, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'articles' ? '/articles' : '/herbs';
            const res = await request.get(endpoint, {
                params: { page, limit }
            });
            setData(res.data);
            setTotal(res.total);
        } catch (error) {
            toast.error(`获取${activeTab === 'articles' ? '文章' : '中药'}列表失败`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const endpoint = activeTab === 'articles' ?  `/articles/${itemToDelete.id}` : `/herbs/${itemToDelete.id}`;
            await request.delete(endpoint);
            toast.success('删除成功');
            fetchData();
        } catch (error) {
            toast.error('删除失败');
        } finally {
            setModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(1);
    };

    if (!user) {
         return (
             <div className="text-center py-20">
                 <p>请登录后访问管理后台</p>
                 <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">去登录</Link>
             </div>
         );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                     <h1 className="text-2xl font-bold text-gray-900">内容管理后台</h1>
                     <p className="text-gray-500 mt-1">欢迎回来，{user.username}</p>
                </div>
                <Link
                    to={activeTab === 'articles' ? '/admin/article/new' : '/admin/herb/new'}
                    className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5 mr-1" />
                    {activeTab === 'articles' ? '发布文章' : '录入中药'}
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => handleTabChange('articles')}
                            className={`w-1/2 sm:w-auto px-8 py-4 text-center border-b-2 font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-colors ${
                                activeTab === 'articles'
                                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            中医科普
                        </button>
                        <button
                            onClick={() => handleTabChange('herbs')}
                            className={`w-1/2 sm:w-auto px-8 py-4 text-center border-b-2 font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-colors ${
                                activeTab === 'herbs'
                                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Leaf className="w-4 h-4" />
                            中药库
                        </button>
                    </nav>
                </div>

                <div className="p-0">
                    {loading ? (
                         <div className="flex justify-center items-center py-20">
                             <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
                         </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {activeTab === 'articles' ? '标题' : '名称'}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                            {activeTab === 'articles' ? '发布时间' : '别名'}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{item.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={item.title || item.name}>
                                                    {item.title || item.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {item.category_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                                {activeTab === 'articles' 
                                                    ? new Date(item.created_at).toLocaleDateString()
                                                    : (item.alias || '-')
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(activeTab === 'articles' ? `/admin/article/edit/${item.id}` : `/admin/herb/edit/${item.id}`)}
                                                    className="text-primary-600 hover:text-primary-900 mr-4 inline-flex items-center"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    删除
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                暂无数据
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                {data.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                         <Pagination page={page} total={total} limit={limit} onChange={setPage} />
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmDelete}
                title="确认删除"
                message={`您确定要删除 "${itemToDelete?.title || itemToDelete?.name}" 吗？此操作无法撤销。`}
                isDanger={true}
            />
        </div>
    );
};

export default AdminDashboard;
