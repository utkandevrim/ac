import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeadership();
  }, []);

  const fetchLeadership = async () => {
    try {
      const response = await axios.get(`${API}/leadership`);
      setLeadership(response.data);
    } catch (error) {
      console.error('Error fetching leadership:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group leadership by position
  const founder = leadership.find(l => l.position.includes('Kurucu'));
  const honorary = leadership.filter(l => l.position.includes('Onursal Başkan') && !l.position.includes('Kurucu'));
  const chairman = leadership.find(l => l.position.includes('Yönetim Kurulu Başkanı'));
  const boardMembers = leadership.filter(l => l.position.includes('Yönetim Kurulu Üyesi'));

  const renderPersonCard = (person, testId, size = 'normal') => {
    if (!person) return <div className="card-person" data-testid={testId}>Yükleniyor...</div>;
    
    const avatarSize = size === 'large' ? 'w-32 h-32 text-4xl' : 'w-24 h-24 text-2xl';
    
    return (
      <div className="card-person" data-testid={testId}>
        {person.photo ? (
          <img 
            src={`${BACKEND_URL}${person.photo}`} 
            alt={person.name}
            className={`${avatarSize} rounded-full object-cover border-4 border-red-200 mx-auto mb-4`}
          />
        ) : (
          <div className={`${avatarSize} bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4`}>
            {person.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-1">{person.name}</h3>
        <p className="text-blue-600 font-semibold">{person.position}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
              alt="Actor Club Logo" 
              className="logo"
              data-testid="actor-club-logo"
            />
          </div>
          
          <ul className="nav-links hidden md:flex">
            <li><a href="#" className="nav-link">Ana Sayfa</a></li>
            <li><a href="#" className="nav-link" onClick={() => navigate('/members')}>Üyelerimiz</a></li>
            <li><a href="#" className="nav-link" onClick={() => navigate('/events')}>Etkinlikler</a></li>
            <li><a href="#" className="nav-link" onClick={() => navigate('/about')}>Hakkımızda</a></li>
            <li>
              <Button 
                onClick={() => navigate('/login')}
                className="btn-primary"
                data-testid="login-nav-btn"
              >
                Üye Girişi
              </Button>
            </li>
          </ul>

          <div className="md:hidden">
            <Button 
              onClick={() => navigate('/login')}
              className="btn-primary"
              data-testid="mobile-login-btn"
            >
              Giriş
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Actor Club Portal'a Hoş Geldiniz
          </h1>
          <p className="hero-subtitle">
            Profesyonel oyunculuk dünyasında yeteneklerinizi geliştirin,
            deneyimli mentorlardan öğrenin ve sanat camiasının bir parçası olun.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => navigate('/login')}
              className="btn-primary text-lg"
              data-testid="hero-login-btn"
            >
              Üyelik Başvurusu
            </Button>
            <Button 
              onClick={() => navigate('/about')}
              className="btn-secondary text-lg"
              data-testid="hero-info-btn"
            >
              Daha Fazla Bilgi
            </Button>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="section">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <div className="card-person mx-auto max-w-lg" data-testid="founder-card">
              <div className="avatar avatar-lg avatar-placeholder mx-auto">
                MÇI
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Muzaffer Çağlar İşgören</h3>
              <p className="text-lg font-semibold text-blue-600 mb-4">Kurucu / Onursal Başkan</p>
              <p className="text-gray-600 italic leading-relaxed">
                "Actor Club, oyunculuk tutkusunu profesyonel becerilerle buluşturan 
                bir platform olarak kurulmuştur. Amacımız, yetenekli bireyleri 
                sanat dünyasında desteklemektir."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Honorary Presidents Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Onursal Başkanlarımız</h2>
            <p className="lead-text max-w-2xl mx-auto">
              Deneyimleri ve vizyonlarıyla kulübümüze yön veren değerli isimler
            </p>
          </div>
          
          <div className="grid grid-3">
            <div className="card-person" data-testid="honorary-president-1">
              <div className="avatar avatar-placeholder">
                GK
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Göksel Kortay</h3>
              <p className="text-blue-600 font-semibold">Onursal Başkan</p>
            </div>

            <div className="card-person" data-testid="honorary-president-2">
              <div className="avatar avatar-placeholder">
                KUB
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Kökten Ulaş Birand</h3>
              <p className="text-blue-600 font-semibold">Onursal Başkan</p>
            </div>

            <div className="card-person" data-testid="honorary-president-3">
              <div className="avatar avatar-placeholder">
                CK
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Cengiz Karakuzu</h3>
              <p className="text-blue-600 font-semibold">Onursal Başkan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Board Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Yönetim Kurulu</h2>
            <p className="lead-text max-w-2xl mx-auto">
              Kulübümüzün yönetiminden sorumlu dinamik ekibimiz
            </p>
          </div>

          {/* Board Chairman */}
          <div className="text-center mb-16">
            <div className="card-person mx-auto max-w-lg" data-testid="board-chairman-card">
              <div className="avatar avatar-lg" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700'}}>
                ET
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Emre Turgut</h3>
              <p className="text-lg font-semibold text-orange-600">Başkan</p>
            </div>
          </div>

          {/* Board Members */}
          <div className="grid grid-4">
            <div className="card-person" data-testid="board-member-1">
              <div className="avatar avatar-md avatar-placeholder">
                DAA
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Duygu Asker Aksoy</h4>
              <p className="text-blue-600 font-semibold text-sm mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gray-50 rounded-lg p-2 mt-3">
                <p className="text-xs font-bold text-gray-700">Hypatia - Duygu Asker Aksoy</p>
                <p className="text-xs text-gray-500">28 Üye</p>
              </div>
            </div>

            <div className="card-person" data-testid="board-member-2">
              <div className="avatar avatar-md avatar-placeholder">
                TÇ
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Tuğba Çakı</h4>
              <p className="text-blue-600 font-semibold text-sm mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gray-50 rounded-lg p-2 mt-3">
                <p className="text-xs font-bold text-gray-700">Diyojen - Tuğba Çakı</p>
                <p className="text-xs text-gray-500">28 Üye</p>
              </div>
            </div>

            <div className="card-person" data-testid="board-member-3">
              <div className="avatar avatar-md avatar-placeholder">
                UDZ
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Utkan Devrim Zeyrek</h4>
              <p className="text-blue-600 font-semibold text-sm mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gray-50 rounded-lg p-2 mt-3">
                <p className="text-xs font-bold text-gray-700">Artemis - Utkan Devrim Zeyrek</p>
                <p className="text-xs text-gray-500">29 Üye</p>
              </div>
            </div>

            <div className="card-person" data-testid="board-member-4">
              <div className="avatar avatar-md avatar-placeholder">
                SA
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Seda Ateş</h4>
              <p className="text-blue-600 font-semibold text-sm mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gray-50 rounded-lg p-2 mt-3">
                <p className="text-xs font-bold text-gray-700">Hermes - Seda Ateş</p>
                <p className="text-xs text-gray-500">22 Üye</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Actor Club Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Neden Actor Club?</h2>
          </div>
          
          <div className="grid grid-3">
            <div className="card-feature">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Profesyonel Eğitim</h3>
              <p className="text-gray-600 leading-relaxed">
                Deneyimli eğitmenlerden oyunculuk tekniklerini öğrenin ve yeteneklerinizi geliştirin.
              </p>
            </div>

            <div className="card-feature">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Güçlü Topluluk</h3>
              <p className="text-gray-600 leading-relaxed">
                Aynı tutkuyu paylaşan kişilerle tanışın ve birlikte projeler geliştirin.
              </p>
            </div>

            <div className="card-feature">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Kariyer Fırsatları</h3>
              <p className="text-gray-600 leading-relaxed">
                Sektördeki bağlantılarımız sayesinde kariyer fırsatlarına erişim sağlayın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section">
        <div className="container">
          <div className="card text-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '80px 40px'}}>
            <h2 className="text-4xl font-bold mb-6">Hemen Başlayın</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Actor Club ailesine katılın ve oyunculuk yolculuğunuza bugün başlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/login')}
                className="btn-secondary text-lg"
                data-testid="cta-join-btn"
              >
                Üyelik Başvurusu Yap
              </Button>
              <Button 
                onClick={() => navigate('/about')}
                className="btn-outline text-lg"
                style={{borderColor: 'white', color: 'white'}}
                data-testid="cta-contact-btn"
              >
                İletişime Geç
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background: '#1e293b', color: 'white', padding: '60px 0 40px 0'}}>
        <div className="container text-center">
          <div className="mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
              alt="Actor Club Logo" 
              className="logo mx-auto mb-6 opacity-90"
              style={{filter: 'brightness(0) invert(1)'}}
            />
          </div>
          <h3 className="text-2xl font-bold mb-4">Actor Club Üye Portalı</h3>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Tiyatro sanatına tutkuyla bağlı sanatçılar için özel olarak tasarlanmış 
            profesyonel platform.
          </p>
          <p className="text-gray-400 text-sm">
            © 2025 Actor Club Üye Portalı. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;