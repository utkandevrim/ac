import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import AdminDuesManager from './AdminDuesManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2,
  Settings,
  CreditCard,
  Calendar,
  Info,
  Lock,
  Save,
  X,
  Clock,
  Upload,
  Camera,
  Image
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [leadership, setLeadership] = useState([]);
  const [allDues, setAllDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showPhotoUploadDialog, setShowPhotoUploadDialog] = useState(false);
  const [photoUploadTarget, setPhotoUploadTarget] = useState(null); // { type: 'user', id: 'user_id', name: 'John Doe' } or { type: 'leader', id: 'leader_id', name: 'Leader Name' }
  const [uploading, setUploading] = useState(false);
  const [photoSearchTerm, setPhotoSearchTerm] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // User form data
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    surname: '',
    phone: '',
    birth_date: '',
    address: '',
    workplace: '',
    job_title: '',
    hobbies: '',
    skills: '',
    height: '',
    weight: '',
    projects: [],
    board_member: 'none'
  });

  const boardMembers = [
    'Diyojen',
    'Hypatia',
    'Artemis', 
    'Hermes'
  ];

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
      fetchPendingUsers();
    } else if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'photos') {
      fetchUsers();
      fetchLeadership();
    }
  }, [activeTab]);

  const fetchLeadership = async () => {
    try {
      const response = await axios.get(`${API}/leadership`);
      setLeadership(response.data);
    } catch (error) {
      console.error('Error fetching leadership:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/users/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen sadece resim dosyası seçin');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Dosya boyutu 5MB\'den küçük olmalıdır');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post(`${API}/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const photoUrl = uploadResponse.data.file_url;

      if (photoUploadTarget.type === 'user') {
        // Update user profile photo
        await axios.put(`${API}/users/${photoUploadTarget.id}`, {
          profile_photo: photoUrl
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('Kullanıcı fotoğrafı başarıyla güncellendi');
        fetchUsers();
      } else if (photoUploadTarget.type === 'leader') {
        // Update leadership photo
        await axios.put(`${API}/leadership/${photoUploadTarget.id}`, null, {
          params: { photo_url: photoUrl },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('Yönetim fotoğrafı başarıyla güncellendi');
        fetchLeadership();
      }

      setShowPhotoUploadDialog(false);
      setPhotoUploadTarget(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Fotoğraf yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const openPhotoUploadDialog = (target) => {
    setPhotoUploadTarget(target);
    setShowPhotoUploadDialog(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!userForm.username || !userForm.email || !userForm.password || !userForm.name || !userForm.surname) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = { ...userForm };
      // Convert "none" back to empty string for board_member
      if (formData.board_member === 'none') {
        formData.board_member = '';
      }
      await axios.post(`${API}/users`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Kullanıcı başarıyla oluşturuldu');
      setShowCreateUserDialog(false);
      setUserForm({
        username: '', email: '', password: '', name: '', surname: '', phone: '',
        birth_date: '', address: '', workplace: '', job_title: '',
        hobbies: '', skills: '', height: '', weight: '', projects: [], board_member: 'none'
      });
      fetchUsers();
      fetchPendingUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.detail || 'Kullanıcı oluşturulurken hata oluştu');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/users/${userId}`, { is_approved: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Kullanıcı onaylandı');
      fetchUsers();
      fetchPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Kullanıcı onaylanırken hata oluştu');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Kullanıcı silindi');
      fetchUsers();
      fetchPendingUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Kullanıcı silinirken hata oluştu');
    }
  };

  const handleMarkDueAsPaid = async (dueId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/dues/${dueId}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Aidat ödendi olarak işaretlendi');
    } catch (error) {
      console.error('Error marking due as paid:', error);
      toast.error('İşlem sırasında hata oluştu');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/auth/change-password`, {
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Şifre başarıyla değiştirildi');
      setShowChangePasswordDialog(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.detail || 'Şifre değiştirilirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="admin-panel-title">
              Admin Paneli
            </h1>
            <p className="text-lg text-gray-600">
              Sistem yönetimi ve kullanıcı operasyonları
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowChangePasswordDialog(true)} 
              variant="outline"
              data-testid="change-password-btn"
            >
              <Lock className="h-4 w-4 mr-2" />
              Şifre Değiştir
            </Button>
            <Button 
              onClick={() => setShowCreateUserDialog(true)} 
              className="btn-primary"
              data-testid="create-user-btn"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Kullanıcı Ekle
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users" className="flex items-center" data-testid="users-tab">
              <Users className="h-4 w-4 mr-2" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center" data-testid="pending-tab">
              <CheckCircle className="h-4 w-4 mr-2" />
              Bekleyenler ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center" data-testid="photos-tab">
              <Camera className="h-4 w-4 mr-2" />
              Fotoğraf Yönetimi
            </TabsTrigger>
            <TabsTrigger value="dues" className="flex items-center" data-testid="dues-tab">
              <CreditCard className="h-4 w-4 mr-2" />
              Aidat Yönetimi
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center" data-testid="events-tab">
              <Calendar className="h-4 w-4 mr-2" />
              Etkinlikler
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center" data-testid="settings-tab">
              <Settings className="h-4 w-4 mr-2" />
              Ayarlar
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Onaylı Kullanıcılar ({users.length})</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grup
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} data-testid={`user-row-${user.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4">
                              {user.name?.[0]}{user.surname?.[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900" data-testid={`user-name-${user.id}`}>
                                {user.name} {user.surname}
                              </div>
                              <div className="text-sm text-gray-500" data-testid={`user-email-${user.id}`}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.board_member ? (
                            <Badge className="bg-amber-100 text-amber-800">{user.board_member}</Badge>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={user.is_admin ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                            {user.is_admin ? 'Admin' : 'Üye'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openPhotoUploadDialog({
                                type: 'user',
                                id: user.id,
                                name: `${user.name} ${user.surname}`
                              })}
                              className="text-blue-600 hover:text-blue-800"
                              data-testid={`upload-photo-user-${user.id}`}
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-800"
                              data-testid={`delete-user-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Pending Users Tab */}
          <TabsContent value="pending" className="mt-6">
            <Card className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Onay Bekleyen Kullanıcılar ({pendingUsers.length})</h2>
              
              {pendingUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingUsers.map((user) => (
                    <Card key={user.id} className="p-6 border border-orange-200 bg-orange-50" data-testid={`pending-user-${user.id}`}>
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4">
                          {user.name?.[0]}{user.surname?.[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900" data-testid={`pending-user-name-${user.id}`}>
                            {user.name} {user.surname}
                          </h3>
                          <p className="text-gray-600" data-testid={`pending-user-email-${user.id}`}>{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4 text-sm">
                        {user.phone && <p><strong>Telefon:</strong> {user.phone}</p>}
                        {user.workplace && <p><strong>İş Yeri:</strong> {user.workplace}</p>}
                        {user.board_member && <p><strong>Grup:</strong> {user.board_member}</p>}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleApproveUser(user.id)}
                          className="btn-primary flex-1"
                          data-testid={`approve-user-${user.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Onayla
                        </Button>
                        <Button 
                          onClick={() => handleDeleteUser(user.id)}
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          data-testid={`reject-user-${user.id}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Onay bekleyen kullanıcı yok</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Photo Management Tab */}
          <TabsContent value="photos" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users Photo Management */}
              <Card className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Üye Fotoğrafları</h2>
                
                {/* Search Bar */}
                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="Üye ara (isim, soyisim veya kullanıcı adı)..."
                    value={photoSearchTerm}
                    onChange={(e) => setPhotoSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        {user.profile_photo ? (
                          <img 
                            src={`${BACKEND_URL}${user.profile_photo}`} 
                            alt={`${user.name} ${user.surname}`}
                            className="w-12 h-12 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                            {user.name?.[0]}{user.surname?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.name} {user.surname}</p>
                          <p className="text-sm text-gray-500">{user.username}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPhotoUploadDialog({
                          type: 'user',
                          id: user.id,
                          name: `${user.name} ${user.surname}`
                        })}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {user.profile_photo ? 'Değiştir' : 'Ekle'}
                      </Button>
                    </div>
                  ))}
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Toplam {users.length} üye
                  </p>
                </div>
              </Card>

              {/* Leadership Photo Management */}
              <Card className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Yönetim Ekibi Fotoğrafları</h2>
                <div className="space-y-4">
                  {leadership.map((leader) => (
                    <div key={leader.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        {leader.photo ? (
                          <img 
                            src={`${BACKEND_URL}${leader.photo}`} 
                            alt={leader.name}
                            className="w-12 h-12 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                            {leader.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{leader.name}</p>
                          <p className="text-sm text-gray-500">{leader.position}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPhotoUploadDialog({
                          type: 'leader',
                          id: leader.id,
                          name: leader.name
                        })}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {leader.photo ? 'Değiştir' : 'Ekle'}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Dues Management Tab */}
          <TabsContent value="dues" className="mt-6">
            <Card className="card p-6">
              <AdminDuesManager />
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6">
            <Card className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Etkinlik Yönetimi</h2>
              <p className="text-gray-600 mb-6">
                Etkinlik oluşturma ve düzenleme işlemleri için <strong>Etkinlikler</strong> sayfasını kullanın.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-gray-900">{events.filter(e => new Date(e.date) > new Date()).length}</p>
                  <p className="text-gray-600">Yaklaşan Etkinlik</p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-gray-900">{events.filter(e => new Date(e.date) < new Date()).length}</p>
                  <p className="text-gray-600">Geçmiş Etkinlik</p>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                  <p className="text-gray-600">Toplam Etkinlik</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sistem Bilgileri</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-medium">Actor Club Portal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sürüm:</span>
                    <span className="font-medium">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Kullanıcı:</span>
                    <span className="font-medium">{users.length + pendingUsers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aktif Kullanıcı:</span>
                    <span className="font-medium">{users.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bekleyen Onay:</span>
                    <span className="font-medium">{pendingUsers.length}</span>
                  </div>
                </div>
              </Card>

              <Card className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Güvenlik</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Admin hesabınızın güvenliği için düzenli olarak şifrenizi değiştirin.
                  </p>
                  <Button 
                    onClick={() => setShowChangePasswordDialog(true)}
                    className="btn-primary w-full"
                    data-testid="settings-change-password"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Şifre Değiştir
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create User Dialog */}
        <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCreateUser} className="space-y-4" data-testid="create-user-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Kullanıcı Adı *</Label>
                  <Input
                    id="username"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="isim.soyisim"
                    className="form-input"
                    data-testid="create-user-username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="form-input"
                    data-testid="create-user-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Ad *</Label>
                  <Input
                    id="name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Ad"
                    className="form-input"
                    data-testid="create-user-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="surname">Soyad *</Label>
                  <Input
                    id="surname"
                    value={userForm.surname}
                    onChange={(e) => setUserForm({ ...userForm, surname: e.target.value })}
                    placeholder="Soyad"
                    className="form-input"
                    data-testid="create-user-surname"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Şifre *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Min 8 karakter, 1 harf, 1 özel simge"
                    className="form-input"
                    data-testid="create-user-password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="Telefon numarası"
                    className="form-input"
                    data-testid="create-user-phone"
                  />
                </div>
                
                <div>
                  <Label htmlFor="board_member">Takım</Label>
                  <Select 
                    value={userForm.board_member} 
                    onValueChange={(value) => setUserForm({ ...userForm, board_member: value })}
                  >
                    <SelectTrigger data-testid="create-user-board-member">
                      <SelectValue placeholder="Takım seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Takım Seçilmemiş</SelectItem>
                      {boardMembers.map((member) => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="workplace">İş Yeri</Label>
                  <Input
                    id="workplace"
                    value={userForm.workplace}
                    onChange={(e) => setUserForm({ ...userForm, workplace: e.target.value })}
                    placeholder="İş yeri"
                    className="form-input"
                    data-testid="create-user-workplace"
                  />
                </div>
                
                <div>
                  <Label htmlFor="job_title">Pozisyon</Label>
                  <Input
                    id="job_title"
                    value={userForm.job_title}
                    onChange={(e) => setUserForm({ ...userForm, job_title: e.target.value })}
                    placeholder="İş unvanı"
                    className="form-input"
                    data-testid="create-user-jobtitle"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="btn-primary flex-1" data-testid="submit-create-user">
                  Kullanıcı Oluştur
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateUserDialog(false)}
                  className="flex-1"
                  data-testid="cancel-create-user"
                >
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Photo Upload Dialog */}
        <Dialog open={showPhotoUploadDialog} onOpenChange={setShowPhotoUploadDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                <Camera className="h-5 w-5 inline mr-2" />
                Fotoğraf Yükle
              </DialogTitle>
            </DialogHeader>
            
            {photoUploadTarget && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">
                    {photoUploadTarget.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {photoUploadTarget.type === 'user' ? 'Kullanıcı Profil Fotoğrafı' : 'Yönetim Ekibi Fotoğrafı'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="photo-upload" className="block text-center">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 cursor-pointer">
                        <Image className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Fotoğraf seçmek için tıklayın
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          JPG, PNG, GIF (Maks. 5MB)
                        </p>
                      </div>
                    </Label>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowPhotoUploadDialog(false)}
                      className="flex-1"
                      disabled={uploading}
                    >
                      İptal
                    </Button>
                  </div>

                  {uploading && (
                    <div className="text-center text-sm text-gray-600">
                      <div className="animate-spin h-5 w-5 mx-auto mb-2 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      Fotoğraf yükleniyor...
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Şifre Değiştir</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleChangePassword} className="space-y-4" data-testid="change-password-form">
              <div>
                <Label htmlFor="oldPassword">Mevcut Şifre</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  placeholder="Mevcut şifreniz"
                  className="form-input"
                  data-testid="old-password-input"
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Yeni şifreniz"
                  className="form-input"
                  data-testid="new-password-input"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Yeni şifrenizi tekrar girin"
                  className="form-input"
                  data-testid="confirm-password-input"
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="btn-primary flex-1" data-testid="submit-password-change">
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowChangePasswordDialog(false)}
                  className="flex-1"
                  data-testid="cancel-password-change"
                >
                  <X className="h-4 w-4 mr-2" />
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;