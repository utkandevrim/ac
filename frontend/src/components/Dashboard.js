import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Calendar,
  Users,
  CreditCard,
  User,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user }) => {
  const [dues, setDues] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    upcomingEvents: 0,
    paidDues: 0,
    unpaidDues: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [duesRes, eventsRes, usersRes] = await Promise.all([
        axios.get(`${API}/dues/${user.id}`, { headers }),
        axios.get(`${API}/events`, { headers }),
        user.is_admin ? axios.get(`${API}/users`, { headers }) : Promise.resolve({ data: [] })
      ]);

      setDues(duesRes.data);
      setEvents(eventsRes.data.slice(0, 5)); // Show latest 5 events

      if (user.is_admin) {
        setStats({
          totalMembers: usersRes.data.length,
          upcomingEvents: eventsRes.data.filter(e => new Date(e.date) > new Date()).length,
          paidDues: duesRes.data.filter(d => d.is_paid).length,
          unpaidDues: duesRes.data.filter(d => !d.is_paid).length
        });
      } else {
        setStats({
          totalMembers: 0,
          upcomingEvents: eventsRes.data.filter(e => new Date(e.date) > new Date()).length,
          paidDues: duesRes.data.filter(d => d.is_paid).length,
          unpaidDues: duesRes.data.filter(d => !d.is_paid).length
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDuesClick = (due) => {
    if (!due.is_paid) {
      toast.info(
        <div>
          <p className="font-medium">Ödeme Bilgileri</p>
          <p className="text-sm mt-1">IBAN: {due.iban}</p>
          <p className="text-sm">Tutar: {due.amount} TL</p>
          <p className="text-sm">Ay: {due.month} {due.year}</p>
        </div>,
        { duration: 8000 }
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Yükleniyor...</div>
      </div>
    );
  }

  const unpaidDues = dues.filter(d => !d.is_paid);
  const currentMonth = new Date().toLocaleDateString('tr-TR', { month: 'long' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 text-center">
          <div className="mb-6">
            <img 
              src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
              alt="Actor Club Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Actor Club Portal'a Hoş Geldiniz
            </h1>
            <h2 className="text-3xl font-semibold text-red-700 mb-2" data-testid="dashboard-welcome">
              Merhaba, {user.name}!
            </h2>
            <p className="text-lg text-gray-600">
              Oyuncu kulübümüzün dijital dünyasına hoş geldin
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user.is_admin && (
            <Card className="card hover-lift p-6" data-testid="stats-members">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Üye</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="card hover-lift p-6" data-testid="stats-events">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Yaklaşan Etkinlik</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </Card>

          <Card className="card hover-lift p-6" data-testid="stats-paid-dues">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ödenen Aidat</p>
                <p className="text-2xl font-bold text-gray-900">{stats.paidDues}</p>
              </div>
            </div>
          </Card>

          <Card className="card hover-lift p-6" data-testid="stats-unpaid-dues">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bekleyen Aidat</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unpaidDues}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dues Status */}
          <Card className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <CreditCard className="h-6 w-6 mr-3 text-red-600" />
                Aidat Durumu
              </h2>
              <Link to="/profile">
                <Button variant="outline" size="sm" data-testid="view-all-dues-btn">
                  Tümünü Gör
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {dues.slice(0, 6).map((due) => (
                <div
                  key={due.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    due.is_paid
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200 hover:bg-red-100'
                  } ${!due.is_paid ? 'pulse-dues' : ''}`}
                  onClick={() => handleDuesClick(due)}
                  data-testid={`due-${due.month.toLowerCase()}`}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      due.is_paid ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {due.month} {due.year}
                      </p>
                      <p className="text-sm text-gray-600">{due.amount} TL</p>
                    </div>
                  </div>
                  
                  <Badge 
                    variant={due.is_paid ? "default" : "destructive"}
                    className={due.is_paid ? "status-paid" : "status-unpaid"}
                  >
                    {due.is_paid ? 'Ödendi' : 'Ödenmedi'}
                  </Badge>
                </div>
              ))}
            </div>

            {unpaidDues.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                  <p className="text-sm text-amber-800">
                    <strong>{unpaidDues.length}</strong> adet ödenmemiş aidatınız bulunmaktadır.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Recent Events */}
          <Card className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-6 w-6 mr-3 text-red-600" />
                Son Etkinlikler
              </h2>
              <Link to="/events">
                <Button variant="outline" size="sm" data-testid="view-all-events-btn">
                  Tümünü Gör
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((event) => {
                  const eventDate = new Date(event.date);
                  const isUpcoming = eventDate > new Date();
                  
                  return (
                    <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" data-testid={`event-${event.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {eventDate.toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <Badge 
                          variant={isUpcoming ? "default" : "secondary"}
                          className={isUpcoming ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {isUpcoming ? 'Yaklaşan' : 'Geçmiş'}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz etkinlik bulunmuyor</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/profile" className="block">
            <Card className="card p-6 hover-lift cursor-pointer" data-testid="quick-action-profile">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Profilimi Düzenle</h3>
                <p className="text-gray-600 text-sm">Kişisel bilgilerini ve projelerini güncelle</p>
              </div>
            </Card>
          </Link>

          <Link to="/members" className="block">
            <Card className="card p-6 hover-lift cursor-pointer" data-testid="quick-action-members">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Üyeleri Keşfet</h3>
                <p className="text-gray-600 text-sm">Diğer üyelerle tanış ve iletişime geç</p>
              </div>
            </Card>
          </Link>

          {user.is_admin ? (
            <Link to="/admin" className="block">
              <Card className="card p-6 hover-lift cursor-pointer" data-testid="quick-action-admin">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Paneli</h3>
                  <p className="text-gray-600 text-sm">Üyeleri yönet ve sistemi kontrol et</p>
                </div>
              </Card>
            </Link>
          ) : (
            <Link to="/events" className="block">
              <Card className="card p-6 hover-lift cursor-pointer" data-testid="quick-action-events">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Etkinliklere Katıl</h3>
                  <p className="text-gray-600 text-sm">Yaklaşan etkinlikleri keşfet</p>
                </div>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;