import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Heart, 
  Award,
  Calendar,
  CreditCard,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserProfile = ({ user: currentUser }) => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [dues, setDues] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({});
  const [newProject, setNewProject] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const isOwnProfile = !userId || userId === currentUser.id;
  const targetUserId = userId || currentUser.id;

  useEffect(() => {
    fetchUserData();
    if (isOwnProfile) {
      fetchDues();
    }
  }, [targetUserId]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/users/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setEditForm(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Kullanıcı bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchDues = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/dues/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDues(response.data);
    } catch (error) {
      console.error('Error fetching dues:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/users/${targetUserId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(editForm);
      setIsEditing(false);
      toast.success('Profil başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Profil güncellenirken hata oluştu');
    }
  };

  const handleAddProject = () => {
    if (newProject.trim()) {
      const updatedProjects = [...(editForm.projects || []), newProject.trim()];
      setEditForm({ ...editForm, projects: updatedProjects });
      setNewProject('');
    }
  };

  const handleRemoveProject = (index) => {
    const updatedProjects = editForm.projects.filter((_, i) => i !== index);
    setEditForm({ ...editForm, projects: updatedProjects });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/auth/change-password?old_password=${encodeURIComponent(passwordForm.oldPassword)}&new_password=${encodeURIComponent(passwordForm.newPassword)}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Şifre başarıyla değiştirildi');
      setShowPasswordChange(false);
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.detail || 'Şifre değiştirirken hata oluştu');
    }
  };

  const handleDuesClick = (due) => {
    if (!due.is_paid) {
      toast.info(
        <div>
          <p className="font-medium">Aidat Ödeme Bilgileri</p>
          <div className="text-sm mt-2 space-y-1">
            <p><strong>IBAN:</strong> TR15 0001 5001 5800 7314 0364 49</p>
            <p><strong>İsim:</strong> Muzaffer Çağlar İşgören</p>
            <p><strong>Banka:</strong> Vakıfbank İzmir Mersinli Şubesi</p>
            <p><strong>Tutar:</strong> {due.amount} TL</p>
            <p><strong>Ay:</strong> {due.month} {due.year}</p>
            <p className="text-gray-600 italic mt-2">
              Açıklama: "Actor Club aidatı içindir"
            </p>
          </div>
        </div>,
        { duration: 12000 }
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background-gradient)' }}>
        <div className="text-xl font-semibold theme-text-body">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background-gradient)' }}>
        <div className="text-xl font-semibold theme-text-body">Kullanıcı bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-gradient)' }}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold theme-text-h1 mb-2" data-testid="profile-title">
              {isOwnProfile ? 'Profilim' : `${user.name} ${user.surname}`}
            </h1>
            <p className="text-lg theme-text-body">
              {isOwnProfile ? 'Kişisel bilgilerin ve aidat durumun' : 'Üye profil bilgileri'}
            </p>
          </div>
          
          {isOwnProfile && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="btn-primary touch-target" data-testid="save-profile-btn">
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="touch-target" data-testid="cancel-edit-btn">
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)} className="btn-outline touch-target" data-testid="edit-profile-btn">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                  <Button onClick={() => setShowPasswordChange(true)} variant="outline" className="touch-target text-sm" data-testid="change-password-btn">
                    <Lock className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Şifre Değiştir</span>
                    <span className="sm:hidden">Şifre</span>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="card p-6">
              <h2 className="text-2xl font-bold theme-text-h1 mb-6 flex items-center">
                <User className="h-6 w-6 mr-3 text-red-600" />
                Kişisel Bilgiler
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="form-label theme-text-label">Ad</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="form-input"
                      data-testid="edit-name-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-name">{user.name}</p>
                  )}
                </div>

                <div>
                  <Label className="form-label theme-text-label">Soyad</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.surname || ''}
                      onChange={(e) => setEditForm({ ...editForm, surname: e.target.value })}
                      className="form-input"
                      data-testid="edit-surname-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-surname">{user.surname}</p>
                  )}
                </div>

                <div>
                  <Label className="form-label theme-text-label">E-posta</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="form-input"
                      placeholder="email@example.com"
                      data-testid="edit-email"
                    />
                  ) : (
                    <p className="theme-text-h1" data-testid="display-email">{user.email || 'Belirtilmemiş'}</p>
                  )}
                </div>

                <div>
                  <Label className="form-label theme-text-label">Telefon</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="form-input"
                      placeholder="Telefon numarası"
                      data-testid="edit-phone-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-phone">{user.phone || 'Belirtilmemiş'}</p>
                  )}
                </div>

                <div>
                  <Label className="form-label theme-text-label">Doğum Tarihi</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editForm.birth_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                      className="form-input"
                      data-testid="edit-birthdate-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-birthdate">
                      {user.birth_date ? new Date(user.birth_date).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="form-label theme-text-label">Boy</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.height || ''}
                      onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                      className="form-input"
                      placeholder="Örn: 175 cm"
                      data-testid="edit-height-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-height">{user.height || 'Belirtilmemiş'}</p>
                  )}
                </div>

                <div>
                  <Label className="form-label theme-text-label">Kilo</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.weight || ''}
                      onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      className="form-input"
                      placeholder="Örn: 70 kg"
                      data-testid="edit-weight-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-weight">{user.weight || 'Belirtilmemiş'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="form-label theme-text-label">Adres</Label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="form-input resize-none"
                      rows="3"
                      placeholder="Adres bilgileri"
                      data-testid="edit-address-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-address">{user.address || 'Belirtilmemiş'}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Work Info */}
            <Card className="card p-6">
              <h2 className="text-2xl font-bold theme-text-h1 mb-6 flex items-center">
                <Briefcase className="h-6 w-6 mr-3 text-red-600" />
                Çalışma Bilgileri
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="form-label theme-text-label">İş Yeri</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.workplace || ''}
                      onChange={(e) => setEditForm({ ...editForm, workplace: e.target.value })}
                      className="form-input"
                      placeholder="İş yeri"
                      data-testid="edit-workplace-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-workplace">{user.workplace || 'Belirtilmemiş'}</p>
                  )}
                </div>

                <div>
                  <Label className="form-label theme-text-label">Pozisyon</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.job_title || ''}
                      onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                      className="form-input"
                      placeholder="İş unvanı"
                      data-testid="edit-jobtitle-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-jobtitle">{user.job_title || 'Belirtilmemiş'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="form-label theme-text-label">Hobiler</Label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.hobbies || ''}
                      onChange={(e) => setEditForm({ ...editForm, hobbies: e.target.value })}
                      className="form-input resize-none"
                      rows="3"
                      placeholder="Hobiler ve ilgi alanları"
                      data-testid="edit-hobbies-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-hobbies">{user.hobbies || 'Belirtilmemiş'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="form-label theme-text-label">Yetenekler</Label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.skills || ''}
                      onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                      className="form-input resize-none"
                      rows="3"
                      placeholder="Yetenekler ve beceriler"
                      data-testid="edit-skills-input"
                    />
                  ) : (
                    <p className="text-lg theme-text-h1" data-testid="display-skills">{user.skills || 'Belirtilmemiş'}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Projects */}
            <Card className="card p-6">
              <h2 className="text-2xl font-bold theme-text-h1 mb-6 flex items-center">
                <Award className="h-6 w-6 mr-3 text-red-600" />
                Actor Club Projeleri
              </h2>

              {isEditing && (
                <div className="mb-6">
                  <div className="flex space-x-2">
                    <Input
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      placeholder="Yeni proje ekle"
                      className="form-input"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                      data-testid="new-project-input"
                    />
                    <Button onClick={handleAddProject} className="btn-primary" data-testid="add-project-btn">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(editForm.projects || user.projects || []).length > 0 ? (
                  (editForm.projects || user.projects || []).map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`project-${index}`}>
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-red-600 mr-3" />
                        <span className="text-gray-900">{project}</span>
                      </div>
                      {isEditing && (
                        <Button 
                          onClick={() => handleRemoveProject(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          data-testid={`remove-project-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz proje bulunmuyor</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <Card className="card p-6 text-center">
              {user.profile_photo ? (
                <img 
                  src={`${BACKEND_URL}${user.profile_photo}`} 
                  alt={`${user.name} ${user.surname}`}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-red-200"
                  data-testid="profile-photo"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                  {user.name?.[0]}{user.surname?.[0]}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid="profile-name">
                {user.name} {user.surname}
              </h3>
              <Badge variant="secondary" className="mb-4">
                {user.is_admin ? 'Yönetici' : 'Üye'}
              </Badge>
              {user.board_member && (
                <Badge className="bg-red-100 text-red-800">
                  {user.board_member}
                </Badge>
              )}
            </Card>

            {/* Member Status */}
            <Card className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Üyelik Durumu</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Durum</span>
                  <Badge className={user.is_approved ? "status-approved" : "status-pending"}>
                    {user.is_approved ? 'Onaylı' : 'Beklemede'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Üyelik Tarihi</span>
                  <span className="text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Dues Summary - Only for own profile */}
            {isOwnProfile && (
              <Card className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-red-600" />
                  Aidat Özeti
                </h3>
                <div className="space-y-4">
                  {dues.slice(0, 10).map((due) => (
                    <div
                      key={due.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        due.is_paid
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200 hover:bg-red-100'
                      } ${!due.is_paid ? 'pulse-dues' : ''}`}
                      onClick={() => handleDuesClick(due)}
                      data-testid={`sidebar-due-${due.month.toLowerCase()}`}
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">{due.month}</p>
                        <p className="text-xs text-gray-600">{due.amount} TL</p>
                      </div>
                      <Badge 
                        variant={due.is_paid ? "default" : "destructive"}
                        className={`text-xs ${due.is_paid ? "status-paid" : "status-unpaid"}`}
                      >
                        {due.is_paid ? '✓' : '✗'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4">Şifre Değiştir</h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Mevcut Şifre</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  required
                  data-testid="old-password-input"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required
                  data-testid="new-password-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  8-16 karakter, en az 1 harf ve 1 özel karakter içermeli
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required
                  data-testid="confirm-password-input"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="flex-1 text-sm sm:text-base" data-testid="submit-password-change">
                  Şifre Değiştir
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 text-sm sm:text-base"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordForm({
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  data-testid="cancel-password-change"
                >
                  İptal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;