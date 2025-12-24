import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Users, Calendar, CreditCard, CheckCircle, ArrowRight, Clock, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    upcomingEvents: 0,
    paidDues: 0,
    unpaidDues: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [myDues, setMyDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, eventsRes, duesRes] = await Promise.all([
        axios.get(`${API}/users`, { headers }),
        axios.get(`${API}/events`, { headers }),
        user.is_admin ? 
          axios.get(`${API}/dues/all`, { headers }) : 
          axios.get(`${API}/dues`, { headers })
      ]);

      // Calculate stats
      if (user.is_admin) {
        setStats({
          totalMembers: usersRes.data.filter(member => !member.is_admin && !member.username.includes('test.') && member.name !== 'Test').length,
          upcomingEvents: eventsRes.data.filter(e => new Date(e.date) > new Date()).length,
          paidDues: duesRes.data.filter(d => d.is_paid).length,
          unpaidDues: duesRes.data.filter(d => !d.is_paid).length
        });
      } else {
        setStats({
          totalMembers: usersRes.data.length,
          upcomingEvents: eventsRes.data.filter(e => new Date(e.date) > new Date()).length,
          paidDues: duesRes.data.filter(d => d.is_paid).length,
          unpaidDues: duesRes.data.filter(d => !d.is_paid).length
        });
      }

      // Set recent events
      setRecentEvents(eventsRes.data.slice(0, 3));
      
      // Set user dues
      if (!user.is_admin) {
        setMyDues(duesRes.data.slice(0, 5));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background-gradient)' }}>
        <div className="container-modern py-8">
          <div className="loading-modern">
            <div className="spinner-modern"></div>
            <p className="mt-4">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-gradient)' }}>
      <div className="container-modern py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <img 
            src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
            alt="Actor Club Logo" 
            className="mx-auto h-16 w-auto mb-4"
          />
          <h1 className="title-hero">
            Actor Club Portal'a<br />
            <span style={{ color: 'var(--primary-blue)' }}>Hoş Geldiniz</span>
          </h1>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-dark)' }} data-testid="dashboard-welcome">
            Merhaba, {user.name}!
          </h2>
          <p className="subtitle">
            Oyuncu kulübümüzün dijital dünyasına hoş geldin
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-modern mb-12">
          <div className="stat-card-modern" data-testid="stats-members">
            <Users className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--primary-blue)' }} />
            <div className="stat-number">{stats.totalMembers}</div>
            <div className="stat-label">Toplam Üye</div>
          </div>
          
          <div className="stat-card-modern" data-testid="stats-events">
            <Calendar className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--primary-blue)' }} />
            <div className="stat-number">{stats.upcomingEvents}</div>
            <div className="stat-label">Yaklaşan Etkinlik</div>
          </div>
          
          <div className="stat-card-modern" data-testid="stats-paid-dues">
            <CheckCircle className="w-8 h-8 mx-auto mb-4 text-green-500" />
            <div className="stat-number text-green-500">{stats.paidDues}</div>
            <div className="stat-label">Ödenen Aidat</div>
          </div>
          
          <div className="stat-card-modern" data-testid="stats-unpaid-dues">
            <Clock className="w-8 h-8 mx-auto mb-4 text-orange-500" />
            <div className="stat-number text-orange-500">{stats.unpaidDues}</div>
            <div className="stat-label">Bekleyen Aidat</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid-modern-2 mb-12">
          {/* Recent Events */}
          <div className="modern-card modern-card-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text-h1">Son Etkinlikler</h3>
              <Calendar className="w-5 h-5" style={{ color: 'var(--primary-blue)' }} />
            </div>
            
            {recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:theme-bg-secondary transition-colors">
                    <Calendar className="w-4 h-4 mt-1" style={{ color: 'var(--primary-blue)' }} />
                    <div className="flex-1">
                      <h4 className="font-semibold theme-text-h1">{event.title}</h4>
                      <p className="text-sm theme-text-body">{event.description}</p>
                      <p className="text-xs theme-text-muted mt-1">
                        {new Date(event.date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 theme-text-muted">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz etkinlik bulunmuyor</p>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Button
                onClick={() => navigate('/events')}
                className="btn-modern-secondary w-full"
              >
                Tüm Etkinlikler
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="modern-card modern-card-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text-h1">Hızlı Erişim</h3>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary-blue)' }} />
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/members')}
                className="btn-modern-secondary w-full justify-start"
                data-testid="quick-members"
              >
                <Users className="w-4 h-4" />
                Üyeleri Keşfet
              </Button>
              
              <Button
                onClick={() => navigate('/profile')}
                className="btn-modern-secondary w-full justify-start"
                data-testid="quick-profile"
              >
                <Users className="w-4 h-4" />
                Profilimi Düzenle
              </Button>
              
              <Button
                onClick={() => navigate('/events')}
                className="btn-modern-secondary w-full justify-start"
                data-testid="quick-events"
              >
                <Calendar className="w-4 h-4" />
                Etkinlikler
              </Button>

              <Button
                onClick={() => navigate('/about')}
                className="btn-modern-secondary w-full justify-start"
                data-testid="quick-about"
              >
                <Users className="w-4 h-4" />
                Hakkımızda
              </Button>
              
              {user.is_admin && (
                <Button
                  onClick={() => navigate('/admin')}
                  className="btn-modern-primary w-full justify-start"
                  data-testid="quick-admin"
                >
                  <Users className="w-4 h-4" />
                  Admin Paneli
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* User Dues Section (Non-Admin) */}
        {!user.is_admin && myDues.length > 0 && (
          <div className="modern-card modern-card-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text-h1">Aidat Durumum</h3>
              <CreditCard className="w-5 h-5" style={{ color: 'var(--primary-blue)' }} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {myDues.map((due) => (
                <div
                  key={`${due.month}-${due.year}`}
                  className={`p-3 rounded-lg text-center text-sm font-semibold transition-colors cursor-pointer ${
                    due.is_paid
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                  }`}
                  data-testid={due.is_paid ? `due-paid-${due.month}` : `due-unpaid-${due.month}`}
                >
                  <div className="text-xs opacity-75">{due.year}</div>
                  <div>{due.month}</div>
                  <div className="text-xs mt-1">
                    {due.is_paid ? '✓ Ödendi' : `${due.amount} TL`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;