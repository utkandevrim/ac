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
    vision: '' 
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editMission, setEditMission] = useState('');
  const [editVision, setEditVision] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [editPhotos, setEditPhotos] = useState([]);

  useEffect(() => {
    fetchAboutData();
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

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/about`, 
        { 
          content: editContent,
          photos: editPhotos
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setAboutData({ content: editContent, photos: editPhotos });
      setIsEditing(false);
      toast.success('İçerik başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating about:', error);
      toast.error('İçerik güncellenirken hata oluştu');
    }
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
              Biz Kimiz?
            </h1>
            <p className="text-lg text-gray-600">
              Actor Club ve Sahne Tozu Tiyatrosu hakkında
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
                <Button onClick={() => setIsEditing(true)} className="btn-outline" data-testid="edit-about-btn">
                  <Edit3 className="h-4 w-4 mr-2" />
                  İçeriği Düzenle
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div 
          className="relative h-64 md:h-80 rounded-2xl mb-12 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 38, 53, 0.6), rgba(201, 48, 44, 0.6)), url('https://images.unsplash.com/photo-1592854899481-f78db4baccb6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxhY3RvcnMlMjBkcmFtYXxlbnwwfHx8fDE3NTg3MzM3ODV8MA&ixlib=rb-4.1.0&q=85')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <img 
                src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
                alt="Actor Club Logo" 
                className="mx-auto h-20 w-auto mb-4 drop-shadow-2xl"
              />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Actor Club Portal</h2>
              <p className="text-lg md:text-xl opacity-90">Sahne Tozu Tiyatrosu Üye Portalı</p>
            </div>
          </div>
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
                      className="form-input resize-none min-h-[300px]"
                      placeholder="Actor Club ve Sahne Tozu Tiyatrosu hakkında bilgi ekleyin..."
                      data-testid="edit-about-content"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Metin formatını kullanabilirsiniz.
                    </p>
                  </div>

                  {/* Photo Management */}
                  <div>
                    <Label className="form-label">Fotoğraf Yönetimi</Label>
                    
                    {/* Add new photo */}
                    <div className="flex space-x-2 mb-4">
                      <Input
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="Fotoğraf URL'si girin"
                        className="form-input"
                        data-testid="new-photo-url"
                      />
                      <Button onClick={handleAddPhoto} className="btn-primary" data-testid="add-photo-btn">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Current photos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {editPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={photo} 
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/200x150?text=Hata';
                            }}
                          />
                          <button
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`remove-photo-${index}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  {aboutData.content ? (
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed" data-testid="about-content">
                      {aboutData.content}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <Info className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Henüz içerik eklenmemiş</p>
                      <p className="text-sm">Actor Club hakkında bilgi eklemek için yukarıdaki düzenle butonunu kullanın</p>
                    </div>
                  )}
                </div>
              )}

              {/* Photos Section */}
              {(aboutData.photos && aboutData.photos.length > 0) && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Fotoğraf Galerisi
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {aboutData.photos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                        <img 
                          src={photo} 
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=Görsel+Yüklenemedi';
                          }}
                          onClick={() => window.open(photo, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  <span className="font-bold text-gray-900">2024</span>
                </div>
              </div>
            </Card>

            {/* Leadership Highlights */}
            <Card className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Yönetim Kadrosu</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold">
                    ÇI
                  </div>
                  <p className="font-semibold text-gray-900">Çağlar İşgören</p>
                  <p className="text-sm text-red-600">Kurucu</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold">
                    ET
                  </div>
                  <p className="font-semibold text-gray-900">Emre Turgut</p>
                  <p className="text-sm text-red-600">Yönetim Kurulu Başkanı</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold">
                      TÇ
                    </div>
                    <p className="text-xs font-medium text-gray-900">Tuğba Çakı</p>
                    <p className="text-xs text-gray-600">YK Üyesi</p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold">
                      DAA
                    </div>
                    <p className="text-xs font-medium text-gray-900">Duygu A. Aksoy</p>
                    <p className="text-xs text-gray-600">YK Üyesi</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Mission Statement */}
            <Card className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Misyonumuz</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Actor Club olarak, sanat ve tiyatro severleri bir araya getirerek, 
                yeteneklerin keşfedilmesi ve geliştirilmesi için güvenli ve destekleyici 
                bir platform sunmayı hedefliyoruz.
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
                <div>
                  <p className="font-medium text-gray-900">E-posta</p>
                  <p>info@actorclub.com</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Web</p>
                  <p>www.actorclub.com</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;