import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  Image as ImageIcon,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Events = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Etkinlikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create event first
      const eventResponse = await axios.post(`${API}/events`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const eventId = eventResponse.data.id;
      
      // Upload photos if any selected
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileFormData = new FormData();
          fileFormData.append('file', file);
          
          try {
            await axios.post(`${API}/events/${eventId}/upload-photo`, fileFormData, {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            });
          } catch (photoError) {
            console.warn('Error uploading photo:', photoError);
            // Continue with other photos even if one fails
          }
        }
      }
      
      toast.success('Etkinlik başarıyla oluşturuldu');
      setShowCreateDialog(false);
      setFormData({ title: '', description: '', date: '', location: '' });
      setSelectedFiles([]);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Etkinlik oluşturulurken hata oluştu');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Etkinlik başarıyla silindi');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Etkinlik silinirken hata oluştu');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background-gradient)' }}>
        <div className="text-xl font-semibold theme-text-body">Yükleniyor...</div>
      </div>
    );
  }

  const upcomingEvents = events.filter(event => isUpcoming(event.date));
  const pastEvents = events.filter(event => !isUpcoming(event.date));

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-gradient)' }}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold theme-text-h1 mb-2" data-testid="events-title">
              Etkinlikler
            </h1>
            <p className="text-lg theme-text-body">
              Actor Club etkinlikleri ve özel programları
            </p>
          </div>
          
          {user?.is_admin && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="create-event-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Etkinlik Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4" data-testid="create-event-form">
                  <div>
                    <Label htmlFor="title">Etkinlik Başlığı *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Etkinlik başlığı"
                      className="form-input"
                      data-testid="event-title-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Açıklama *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Etkinlik açıklaması"
                      className="form-input resize-none"
                      rows="3"
                      data-testid="event-description-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Tarih ve Saat *</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="form-input"
                      data-testid="event-date-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Konum</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Etkinlik yeri"
                      className="form-input"
                      data-testid="event-location-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="photos">Etkinlik Fotoğrafları</Label>
                    <Input
                      id="photos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                      className="form-input"
                      data-testid="event-photos-input"
                    />
                    {selectedFiles.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedFiles.length} fotoğraf seçildi
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" className="btn-primary flex-1" data-testid="submit-event-btn">
                      Oluştur
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateDialog(false)}
                      className="flex-1"
                      data-testid="cancel-event-btn"
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium theme-text-body">Yaklaşan</p>
                <p className="text-2xl font-bold theme-text-h1" data-testid="upcoming-events-count">{upcomingEvents.length}</p>
              </div>
            </div>
          </Card>

          <Card className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium theme-text-body">Geçmiş</p>
                <p className="text-2xl font-bold theme-text-h1" data-testid="past-events-count">{pastEvents.length}</p>
              </div>
            </div>
          </Card>

          <Card className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium theme-text-body">Toplam</p>
                <p className="text-2xl font-bold theme-text-h1" data-testid="total-events-count">{events.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold theme-text-h1 mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-green-600" />
              Yaklaşan Etkinlikler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isUpcoming={true} 
                  isAdmin={user?.is_admin}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </div>
          </section>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold theme-text-h1 mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-3 theme-text-body" />
              Geçmiş Etkinlikler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isUpcoming={false} 
                  isAdmin={user?.is_admin}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="h-24 w-24 mx-auto theme-text-muted mb-4" />
            <h3 className="text-xl font-semibold theme-text-body mb-2">Henüz etkinlik yok</h3>
            <p className="theme-text-muted mb-6">
              İlk etkinliği oluşturmak için yukarıdaki butonu kullanın
            </p>
            {user?.is_admin && (
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                className="btn-primary"
                data-testid="empty-state-create-btn"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk Etkinliği Oluştur
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, isUpcoming, isAdmin, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="card hover-lift" data-testid={`event-card-${event.id}`}>
      {/* Event Image */}
      <div className="h-48 rounded-t-lg overflow-hidden">
        {event.photos && event.photos.length > 0 ? (
          <img 
            src={event.photos[0]} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="h-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(rgba(139, 38, 53, 0.8), rgba(201, 48, 44, 0.8)), url('https://images.pexels.com/photos/6899936/pexels-photo-6899936.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="text-center text-white">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-80" />
              <p className="text-sm opacity-80">Etkinlik Görseli</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Header with Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid={`event-title-${event.id}`}>
              {event.title}
            </h3>
            <Badge 
              variant={isUpcoming ? "default" : "secondary"}
              className={isUpcoming ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
            >
              {isUpcoming ? 'Yaklaşan' : 'Geçmiş'}
            </Badge>
          </div>
          
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
              data-testid={`delete-event-${event.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-3" />
            <span className="text-sm" data-testid={`event-date-${event.id}`}>
              {formatDate(event.date)}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-3" />
              <span className="text-sm" data-testid={`event-location-${event.id}`}>
                {event.location}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3" data-testid={`event-description-${event.id}`}>
          {event.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500" data-testid={`event-created-${event.id}`}>
            Oluşturulma: {new Date(event.created_at).toLocaleDateString('tr-TR')}
          </span>
          
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
            Detaylar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Events;