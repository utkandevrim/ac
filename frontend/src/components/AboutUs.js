import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Info,
  Edit3,
  Save,
  X,
  ImageIcon,
  Plus,
  Users,
  Award,
  Star,
  Upload,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AboutUs = ({ user }) => {
  const [aboutData, setAboutData] = useState({ 
    content: '', 
    photos: [], 
    mission: '', 
    vision: '',
    contact: {
      email: '',
      phone: '',
      address: '',
      website: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editMission, setEditMission] = useState('');
  const [editVision, setEditVision] = useState('');
  const [editContact, setEditContact] = useState({
    email: '',
    phone: '',
    address: '',
    website: ''
  });
  const [leadership, setLeadership] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [editPhotos, setEditPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchAboutData();
    fetchLeadership();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await axios.get(`${API}/about`);
      setAboutData(response.data);
      setEditContent(response.data.content || '');
      setEditMission(response.data.mission || '');
      setEditVision(response.data.vision || '');
      setEditPhotos(response.data.photos || []);
    } catch (error) {
      console.error('Error fetching about data:', error);
      toast.error('İçerik yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadership = async () => {
    try {
      const response = await axios.get(`${API}/leadership`);
      setLeadership(response.data);
    } catch (error) {
      console.error('Error fetching leadership:', error);
    }
  };

  const handleUploadMainPhoto = async (e) => {
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

    setUploadingPhoto(true);
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
      
      // Update aboutData immediately
      setAboutData(prev => ({ ...prev, mainPhoto: photoUrl }));
      
      toast.success('Ana fotoğraf başarıyla yüklendi');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Fotoğraf yüklenirken hata oluştu');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedData = {
        content: editContent,
        mission: editMission,
        vision: editVision,
        contact: editContact,
        photos: editPhotos,
        mainPhoto: aboutData.mainPhoto
      };

      await axios.put(`${API}/about`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAboutData(updatedData);
      setIsEditing(false);
      toast.success('Hakkımızda bilgileri güncellendi');
    } catch (error) {
      console.error('Error updating about data:', error);
      toast.error('Güncelleme sırasında hata oluştu');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(aboutData.content);
    setEditMission(aboutData.mission);
    setEditVision(aboutData.vision);
    setEditContact(aboutData.contact || { email: '', phone: '', address: '', website: '' });
    setEditPhotos(aboutData.photos || []);
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      setEditPhotos([...editPhotos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index) => {
    setEditPhotos(editPhotos.filter((_, i) => i !== index));
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="about-title">
              Hakkımızda
            </h1>
            <p className="text-lg text-gray-600">
              Actor Club ve tiyatro topluluğumuz hakkında
            </p>
          </div>
          
          {user?.is_admin && (
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="btn-primary" data-testid="save-about-btn">
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" data-testid="cancel-about-btn">
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} className="btn-outline" data-testid="edit-about-btn">
                  <Edit3 className="h-4 w-4 mr-2" />
                  İçeriği Düzenle
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Simple Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Actor Club Portal</h2>
          <p className="text-lg text-gray-600">Sahne Tozu Tiyatrosu Üye Portalı</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Info className="h-6 w-6 mr-3 text-red-600" />
                Hakkımızda
              </h2>

              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <Label className="form-label">İçerik</Label>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="form-input resize-none min-h-[200px]"
                      placeholder="Actor Club hakkında genel bilgi ekleyin..."
                      data-testid="edit-about-content"
                    />
                  </div>

                  <div>
                    <Label className="form-label">Misyon</Label>
                    <Textarea
                      value={editMission}
                      onChange={(e) => setEditMission(e.target.value)}
                      className="form-input resize-none min-h-[150px]"
                      placeholder="Misyonumuz hakkında bilgi ekleyin..."
                      data-testid="edit-mission-content"
                    />
                  </div>

                  <div>
                    <Label className="form-label">Vizyon</Label>
                    <Textarea
                      value={editVision}
                      onChange={(e) => setEditVision(e.target.value)}
                      className="form-input resize-none min-h-[150px]"
                      placeholder="Vizyonumuz hakkında bilgi ekleyin..."
                      data-testid="edit-vision-content"
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="border-t pt-6">
                    <Label className="form-label text-lg font-semibold">İletişim Bilgileri</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="form-label">E-posta</Label>
                        <Input
                          type="email"
                          value={editContact.email}
                          onChange={(e) => setEditContact({...editContact, email: e.target.value})}
                          placeholder="info@actorclub.com"
                          className="form-input"
                          data-testid="edit-contact-email"
                        />
                      </div>
                      
                      <div>
                        <Label className="form-label">Telefon</Label>
                        <Input
                          value={editContact.phone}
                          onChange={(e) => setEditContact({...editContact, phone: e.target.value})}
                          placeholder="+90 XXX XXX XX XX"
                          className="form-input"
                          data-testid="edit-contact-phone"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="form-label">Adres</Label>
                        <Input
                          value={editContact.address}
                          onChange={(e) => setEditContact({...editContact, address: e.target.value})}
                          placeholder="İzmir, Türkiye"
                          className="form-input"
                          data-testid="edit-contact-address"
                        />
                      </div>
                      
                      <div>
                        <Label className="form-label">Web Sitesi</Label>
                        <Input
                          value={editContact.website}
                          onChange={(e) => setEditContact({...editContact, website: e.target.value})}
                          placeholder="https://www.actorclub.com"
                          className="form-input"
                          data-testid="edit-contact-website"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Management section removed as requested */}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* About Content */}
                  {aboutData.content ? (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Hakkımızda</h3>
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed" data-testid="about-content">
                        {aboutData.content}
                      </div>
                    </div>
                  ) : null}

                  {/* Mission */}
                  {aboutData.mission ? (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-indigo-600" />
                        Misyonumuz
                      </h3>
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg" data-testid="mission-content">
                        {aboutData.mission}
                      </div>
                    </div>
                  ) : null}

                  {/* Vision */}
                  {aboutData.vision ? (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-indigo-600" />
                        Vizyonumuz
                      </h3>
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg" data-testid="vision-content">
                        {aboutData.vision}
                      </div>
                    </div>
                  ) : null}

                  {/* Empty state */}
                  {!aboutData.content && !aboutData.mission && !aboutData.vision && (
                    <div className="text-center py-16 text-gray-500">
                      <Info className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Henüz içerik eklenmemiş</p>
                      <p className="text-sm">Actor Club hakkında bilgi eklemek için yukarıdaki düzenle butonunu kullanın</p>
                    </div>
                  )}
                </div>
              )}

              {/* Photo Gallery section removed as requested */}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı Bilgiler</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-gray-600">Toplam Üye</span>
                  </div>
                  <span className="font-bold text-gray-900">107+</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-gray-600">Yönetim Kurulu</span>
                  </div>
                  <span className="font-bold text-gray-900">5</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-gray-600">Kuruluş</span>
                  </div>
                  <span className="font-bold text-gray-900">2014</span>
                </div>
              </div>
            </Card>

            {/* Leadership Highlights */}
            <Card className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Yönetim Kadrosu</h3>
              <div className="space-y-4">
                {/* Board Chairman */}
                {leadership.filter(leader => leader.position.includes('Yönetim Kurulu Başkanı')).map((chairman, index) => (
                  <div key={`chairman-${index}`} className="text-center p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-lg">
                    {chairman.photo ? (
                      <img 
                        src={`${BACKEND_URL}${chairman.photo}`} 
                        alt={chairman.name}
                        className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold">
                        {chairman.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <p className="font-semibold text-gray-900">{chairman.name}</p>
                    <p className="text-sm text-red-600">Yönetim Kurulu Başkanı</p>
                  </div>
                ))}

                {/* Board Members Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {leadership
                    .filter(leader => leader.position.includes('Yönetim Kurulu Üyesi'))
                    .map((member, index) => (
                    <div key={`member-${index}`} className="text-center p-3 bg-gray-50 rounded-lg">
                      {member.photo ? (
                        <img 
                          src={`${BACKEND_URL}${member.photo}`} 
                          alt={member.name}
                          className="w-8 h-8 rounded-full mx-auto mb-1 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <p className="text-xs font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-600">YK Üyesi</p>
                    </div>
                  ))}
                </div>
                
                {/* If no leadership data loaded, show loading or empty state */}
                {leadership.length === 0 && (
                  <div className="text-center p-4 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Yönetim kadrosu bilgileri yükleniyor...</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Mission Statement */}
            <Card className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Misyonumuz</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {aboutData.mission || 
                  `Actor Club olarak, sanat ve tiyatro severleri bir araya getirerek, 
                  yeteneklerin keşfedilmesi ve geliştirilmesi için güvenli ve destekleyici 
                  bir platform sunmayı hedefliyoruz.`
                }
              </p>
            </Card>

            {/* Contact Info */}
            <Card className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">İletişim</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-900">Actor Club Portal</p>
                  <p>Sahne Tozu Tiyatrosu</p>
                </div>
                {aboutData.contact?.email && (
                  <div>
                    <p className="font-medium text-gray-900">E-posta</p>
                    <p>{aboutData.contact.email}</p>
                  </div>
                )}
                {aboutData.contact?.phone && (
                  <div>
                    <p className="font-medium text-gray-900">Telefon</p>
                    <p>{aboutData.contact.phone}</p>
                  </div>
                )}
                {aboutData.contact?.address && (
                  <div>
                    <p className="font-medium text-gray-900">Adres</p>
                    <p>{aboutData.contact.address}</p>
                  </div>
                )}
                {aboutData.contact?.website && (
                  <div>
                    <p className="font-medium text-gray-900">Web</p>
                    <p>{aboutData.contact.website}</p>
                  </div>
                )}
                {/* Fallback default contact if no contact data */}
                {(!aboutData.contact || Object.values(aboutData.contact).every(v => !v)) && (
                  <>
                    <div>
                      <p className="font-medium text-gray-900">E-posta</p>
                      <p>info@actorclub.com</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Web</p>
                      <p>www.actorclub.com</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;