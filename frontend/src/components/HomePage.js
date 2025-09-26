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

  const renderPersonCard = (person, testId) => {
    if (!person) return (
      <div className="person-card-modern" data-testid={testId}>
        <div className="loading-modern">Yükleniyor...</div>
      </div>
    );
    
    return (
      <div className="person-card-modern animate-slide-up" data-testid={testId}>
        {person.photo ? (
          <img 
            src={`${BACKEND_URL}${person.photo}`} 
            alt={person.name}
            className="avatar-modern avatar-lg mx-auto"
          />
        ) : (
          <div className="avatar-placeholder avatar-lg mx-auto">
            {person.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        <h3>{person.name}</h3>
        <p>{person.position}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-gradient)' }}>
      {/* Modern Navigation */}
      <nav className="modern-nav">
        <div className="container-modern">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
                alt="Actor Club Logo" 
                className="h-10 w-auto"
              />
              <span className="ml-3 text-xl font-bold text-gray-900">Actor Club</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <a href="/" className="nav-link active">Ana Sayfa</a>
              <a href="/members" className="nav-link">Üyelerimiz</a>
              <a href="/events" className="nav-link">Etkinlikler</a>
              <a href="/about" className="nav-link">Biz Kimiz</a>
            </div>
            
            {/* Login Button */}
            <button 
              onClick={() => navigate('/login')}
              className="btn-modern-primary"
              data-testid="member-login-btn"
            >
              Üye Girişi
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-modern">
        <div className="container-modern">
          <div className="hero-modern">
            {/* Left Content */}
            <div className="animate-slide-up">
              <h1 className="title-hero">
                Actor Club Portal'a<br />
                <span style={{ color: 'var(--primary-blue)' }}>Hoş Geldiniz</span>
              </h1>
              <p className="subtitle">
                Profesyonel oyunculuk dünyasında yeteneklerinizi geliştirin, 
                deneyimli mentorlardan öğrenin ve sanat camiasının bir parçası olun.
              </p>
              {/* Üyelik başvurusu ve daha fazla bilgi butonları kaldırıldı */}
            </div>
            
            {/* Right Content - Founder Card */}
            <div className="animate-slide-up-delay">
              <div className="modern-card modern-card-lg max-w-sm">
                {founder && founder.photo ? (
                  <img 
                    src={`${BACKEND_URL}${founder.photo}`} 
                    alt={founder.name}
                    className="avatar-modern avatar-xl mx-auto mb-6"
                  />
                ) : founder ? (
                  <div className="avatar-placeholder avatar-xl mx-auto mb-6">
                    {founder.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ) : (
                  <div className="avatar-placeholder avatar-xl mx-auto mb-6">
                    MÇİ
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {founder ? founder.name : 'Muzaffer Çağlar İşgören'}
                  </h3>
                  <p className="font-semibold mb-4" style={{ color: 'var(--primary-blue)' }}>
                    Kurucu
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    "Actor Club, oyunculuk tutkusunu profesyonel becerilerle buluşturan 
                    bir platform olarak kurulmuştur. Amacımız, yetenekli bireyleri sanat 
                    dünyasında desteklemektir."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honorary Presidents Section */}
      <section className="section-modern-sm" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
        <div className="container-modern">
          <div className="text-center mb-16">
            <h2 className="title-section">Onursal Başkanlarımız</h2>
            <p className="subtitle-section">
              Deneyimleri ve vizyonlarıyla kulübümüze yön veren değerli isimler
            </p>
          </div>
          
          <div className="grid-modern-3">
            {honorary.map((president, index) => (
              renderPersonCard(president, `honorary-president-${index + 1}`)
            ))}
            {/* Fallback for loading state */}
            {loading && (
              <>
                <div className="person-card-modern">
                  <div className="loading-modern">
                    <div className="spinner-modern"></div>
                  </div>
                </div>
                <div className="person-card-modern">
                  <div className="loading-modern">
                    <div className="spinner-modern"></div>
                  </div>
                </div>
                <div className="person-card-modern">
                  <div className="loading-modern">
                    <div className="spinner-modern"></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Management Board Section */}
      <section className="section-modern">
        <div className="container-modern">
          <div className="text-center mb-16">
            <h2 className="title-section">Yönetim Kurulumuz</h2>
            <p className="subtitle-section">
              Actor Club'ın geleceğini şekillendiren deneyimli yöneticilerimiz
            </p>
          </div>

          {/* Board Chairman */}
          <div className="text-center mb-16">
            <div className="max-w-md mx-auto">
              {chairman && chairman.photo ? (
                <img 
                  src={`${BACKEND_URL}${chairman.photo}`} 
                  alt={chairman.name}
                  className="avatar-modern avatar-xl mx-auto mb-6"
                />
              ) : chairman ? (
                <div className="avatar-placeholder avatar-xl mx-auto mb-6">
                  {chairman.name.split(' ').map(n => n[0]).join('')}
                </div>
              ) : (
                <div className="avatar-placeholder avatar-xl mx-auto mb-6">
                  ET
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {chairman ? chairman.name : 'Emre Turgut'}
              </h3>
              <p className="font-semibold" style={{ color: 'var(--primary-blue)' }}>Başkan</p>
            </div>
          </div>

          {/* Board Members */}
          <div className="grid-modern-4">
            {boardMembers.map((member, index) => (
              <div key={member.id} className="person-card-modern animate-slide-up" data-testid={`board-member-${index + 1}`}>
                {member.photo ? (
                  <img 
                    src={`${BACKEND_URL}${member.photo}`} 
                    alt={member.name}
                    className="avatar-modern avatar-md mx-auto"
                  />
                ) : (
                  <div className="avatar-placeholder avatar-md mx-auto">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <h4 className="text-lg font-bold text-gray-900 mt-4 mb-1">{member.name}</h4>
                <p className="font-semibold text-sm mb-3" style={{ color: 'var(--primary-blue)' }}>
                  Yönetim Kurulu Üyesi
                </p>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-700">{member.name} Ekibi</p>
                  <p className="text-xs text-gray-500">Üyeler</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--text-dark)', color: 'white', padding: '60px 0 40px 0' }}>
        <div className="container-modern text-center">
          <div className="mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
              alt="Actor Club Logo" 
              className="h-12 w-auto mx-auto mb-6 opacity-90"
              style={{ filter: 'brightness(0) invert(1)' }}
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