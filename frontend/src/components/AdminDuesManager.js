import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  CheckCircle, 
  XCircle, 
  Search,
  Calendar,
  CreditCard,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDuesManager = () => {
  const [users, setUsers] = useState([]);
  const [allDues, setAllDues] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  const months = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"];

  useEffect(() => {
    fetchUsersAndDues();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsersAndDues = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch all users
      const usersResponse = await axios.get(`${API}/users`, { headers });
      const allUsers = usersResponse.data;
      
      // Fetch dues for each user
      const duesPromises = allUsers.map(user => 
        axios.get(`${API}/dues/${user.id}`, { headers }).catch(() => ({ data: [] }))
      );
      
      const duesResponses = await Promise.all(duesPromises);
      
      // Organize dues by user ID
      const duesMap = {};
      allUsers.forEach((user, index) => {
        duesMap[user.id] = duesResponses[index].data;
      });
      
      setUsers(allUsers);
      setAllDues(duesMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleMarkDueAsPaid = async (dueId, userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/dues/${dueId}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setAllDues(prev => ({
        ...prev,
        [userId]: prev[userId].map(due =>
          due.id === dueId
            ? { ...due, is_paid: true, payment_date: new Date().toISOString() }
            : due
        )
      }));
      
      toast.success('Aidat ödendi olarak işaretlendi');
    } catch (error) {
      console.error('Error marking due as paid:', error);
      toast.error('İşlem sırasında hata oluştu');
    }
  };

  const handleMarkDueAsUnpaid = async (dueId, userId) => {
    try {
      const token = localStorage.getItem('token');
      // Create endpoint to mark as unpaid
      await axios.put(`${API}/dues/${dueId}/unpay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setAllDues(prev => ({
        ...prev,
        [userId]: prev[userId].map(due =>
          due.id === dueId
            ? { ...due, is_paid: false, payment_date: null }
            : due
        )
      }));
      
      toast.success('Aidat ödenmedi olarak işaretlendi');
    } catch (error) {
      console.error('Error marking due as unpaid:', error);
      toast.error('İşlem sırasında hata oluştu');
    }
  };

  const getUserStats = (userId) => {
    const userDues = allDues[userId] || [];
    const paidCount = userDues.filter(due => due.is_paid).length;
    const unpaidCount = userDues.filter(due => !due.is_paid).length;
    return { paidCount, unpaidCount, total: userDues.length };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg font-semibold text-gray-700">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Aidat Yönetimi</h2>
        <p className="text-gray-600">Tüm üyelerin aidat durumunu görüntüleyin ve yönetin</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Üye ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 form-input"
          data-testid="dues-search-input"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Toplam Üye</p>
              <p className="text-xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>

        <Card className="card p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Bu Ay Ödenen</p>
              <p className="text-xl font-bold text-gray-900">
                {Object.values(allDues).flat().filter(due => 
                  due.month === months[new Date().getMonth()] && due.is_paid
                ).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="card p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Bu Ay Ödenmemiş</p>
              <p className="text-xl font-bold text-gray-900">
                {Object.values(allDues).flat().filter(due => 
                  due.month === months[new Date().getMonth()] && !due.is_paid
                ).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="card p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Toplam Aidat</p>
              <p className="text-xl font-bold text-gray-900">
                {Object.values(allDues).flat().length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const userDues = allDues[user.id] || [];
          const stats = getUserStats(user.id);
          
          return (
            <Card key={user.id} className="card p-6" data-testid={`dues-user-${user.id}`}>
              {/* User Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4">
                    {user.name?.[0]}{user.surname?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900" data-testid={`dues-user-name-${user.id}`}>
                      {user.name} {user.surname}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.board_member && (
                      <Badge className="bg-blue-100 text-blue-800 mt-1">{user.board_member}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Aidat Durumu</p>
                  <p className="text-lg font-bold">
                    <span className="text-green-600">{stats.paidCount}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-red-600">{stats.unpaidCount}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-900">{stats.total}</span>
                  </p>
                </div>
              </div>

              {/* Dues Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                {months.map((month) => {
                  const due = userDues.find(d => d.month === month);
                  
                  if (!due) {
                    return (
                      <div key={month} className="p-2 bg-gray-100 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">{month}</p>
                        <p className="text-xs text-gray-400">Veri Yok</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div 
                      key={due.id} 
                      className={`p-2 rounded-lg text-center cursor-pointer transition-all ${
                        due.is_paid 
                          ? 'bg-green-100 hover:bg-green-200' 
                          : 'bg-red-100 hover:bg-red-200'
                      }`}
                      data-testid={`due-${user.id}-${month.toLowerCase()}`}
                    >
                      <p className="text-xs font-medium text-gray-700 mb-1">{month}</p>
                      <div className="flex items-center justify-center space-x-1">
                        {due.is_paid ? (
                          <button
                            onClick={() => handleMarkDueAsUnpaid(due.id, user.id)}
                            className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                            data-testid={`mark-unpaid-${due.id}`}
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkDueAsPaid(due.id, user.id)}
                            className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                            data-testid={`mark-paid-${due.id}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{due.amount} TL</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Üye bulunamadı</h3>
          <p className="text-gray-500">
            {searchTerm ? `"${searchTerm}" araması için sonuç bulunamadı` : 'Henüz üye bulunmuyor'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDuesManager;