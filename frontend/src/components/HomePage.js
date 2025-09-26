import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import axios from 'axios';
import { AuthContext } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homepageContent, setHomepageContent] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState({});
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    fetchLeadership();
    fetchHomepageContent();
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

  const fetchHomepageContent = async () => {
    try {
      const response = await axios.get(`${API}/homepage-content`);
      setHomepageContent(response.data);
      setEditContent(response.data);
    } catch (error) {
      console.error('Error fetching homepage content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const updateHomepageContent = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/homepage-content`, editContent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHomepageContent(editContent);
      setIsEditing(false);
      console.log('Homepage content updated successfully!');
    } catch (error) {
      console.error('Error updating homepage content:', error);
      console.error('Failed to update content');
    }
  };

  const handleInputChange = (field, value) => {
    setEditContent(prev => ({ ...prev, [field]: value }));
  };

  // Group leadership by position
  const founder = leadership.find(l => l.position.includes('Kurucu'));
  const honorary = leadership.filter(l => l.position.includes('Onursal Başkan') && !l.position.includes('Kurucu'));
  const chairman = leadership.find(l => l.position.includes('Yönetim Kurulu Başkanı'));
  const boardMembers = leadership.filter(l => l.position.includes('Yönetim Kurulu Üyesi'));
  
  // Filter honorary presidents to exclude the first one (Göksel Kortay) since it's in hero
  const remainingHonorary = honorary.slice(1);

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
      {/* Admin Edit Button */}
      {user && user.is_admin && (
        <div className="fixed top-20 right-4 z-50">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Homepage'}
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h2 className="text-2xl font-bold mb-6">Edit Homepage Content</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Hero Title</label>
                <input
                  type="text"
                  value={editContent.hero_title || ''}
                  onChange={(e) => handleInputChange('hero_title', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                <textarea
                  value={editContent.hero_subtitle || ''}
                  onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
                  className="w-full p-3 border rounded-lg h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hero Quote</label>
                <textarea
                  value={editContent.hero_quote || ''}
                  onChange={(e) => handleInputChange('hero_quote', e.target.value)}
                  className="w-full p-3 border rounded-lg h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Honorary Presidents Section Title</label>
                <input
                  type="text"
                  value={editContent.honorary_section_title || ''}
                  onChange={(e) => handleInputChange('honorary_section_title', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Honorary Presidents Section Subtitle</label>
                <input
                  type="text"
                  value={editContent.honorary_section_subtitle || ''}
                  onChange={(e) => handleInputChange('honorary_section_subtitle', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Management Section Title</label>
                <input
                  type="text"
                  value={editContent.management_section_title || ''}
                  onChange={(e) => handleInputChange('management_section_title', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Management Section Subtitle</label>
                <input
                  type="text"
                  value={editContent.management_section_subtitle || ''}
                  onChange={(e) => handleInputChange('management_section_subtitle', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={updateHomepageContent}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg text-sm sm:text-base"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            
            {/* Login Button / User Info */}
            {user ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <span className="text-gray-700 font-medium text-center sm:text-left text-sm sm:text-base">
                  {user.name} {user.surname}
                </span>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="btn-modern-secondary text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="btn-modern-primary text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                data-testid="member-login-btn"
              >
                Üye Girişi
              </button>
            )}
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
                {homepageContent.hero_title?.split(' ').slice(0, -2).join(' ')}<br />
                <span style={{ color: 'var(--primary-blue)' }}>
                  {homepageContent.hero_title?.split(' ').slice(-2).join(' ') || 'Hoş Geldiniz'}
                </span>
              </h1>
              <p className="subtitle">
                {homepageContent.hero_subtitle || 'Profesyonel oyunculuk dünyasında yeteneklerinizi geliştirin, deneyimli mentorlardan öğrenin ve sanat camiasının bir parçası olun.'}
              </p>
              {/* Üyelik başvurusu ve daha fazla bilgi butonları kaldırıldı */}
            </div>
            
            {/* Right Content - Founder Cards Side by Side */}
            <div className="animate-slide-up-delay">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Muzaffer Çağlar İşgören */}
                <div className="modern-card modern-card-lg">
                  {founder && founder.photo ? (
                    <img 
                      src={`${BACKEND_URL}${founder.photo}`} 
                      alt={founder.name}
                      className="avatar-modern avatar-lg mx-auto mb-4"
                    />
                  ) : founder ? (
                    <div className="avatar-placeholder avatar-lg mx-auto mb-4">
                      {founder.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  ) : (
                    <div className="avatar-placeholder avatar-lg mx-auto mb-4">
                      MÇİ
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Muzaffer Çağlar İşgören
                    </h3>
                    <p className="font-semibold mb-3" style={{ color: 'var(--primary-blue)' }}>
                      Kurucu-Onursal Başkan
                    </p>
                  </div>
                </div>

                {/* Göksel Kortay */}
                <div className="modern-card modern-card-lg">
                  {honorary.length > 0 && honorary[0].photo ? (
                    <img 
                      src={`${BACKEND_URL}${honorary[0].photo}`} 
                      alt={honorary[0].name}
                      className="avatar-modern avatar-lg mx-auto mb-4"
                    />
                  ) : honorary.length > 0 ? (
                    <div className="avatar-placeholder avatar-lg mx-auto mb-4">
                      {honorary[0].name.split(' ').map(n => n[0]).join('')}
                    </div>
                  ) : (
                    <div className="avatar-placeholder avatar-lg mx-auto mb-4">
                      GK
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {honorary.length > 0 ? honorary[0].name : 'Göksel Kortay'}
                    </h3>
                    <p className="font-semibold mb-3" style={{ color: 'var(--primary-blue)' }}>
                      Kurucu-Onursal Başkan
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote Section Below Cards */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm leading-relaxed max-w-2xl mx-auto">
                  {homepageContent.hero_quote || '"Actor Club, oyunculuk tutkusunu profesyonel becerilerle buluşturan bir platform olarak kurulmuştur. Amacımız, yetenekli bireyleri sanat dünyasında desteklemektir."'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honorary Presidents Section */}
      <section className="section-modern-sm" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
        <div className="container-modern">
          <div className="text-center mb-16">
            <h2 className="title-section">{homepageContent.honorary_section_title || 'Onursal Başkanlarımız'}</h2>
            <p className="subtitle-section">
              {homepageContent.honorary_section_subtitle || 'Deneyimleri ve vizyonlarıyla kulübümüze yön veren değerli isimler'}
            </p>
          </div>
          
          <div className="grid-modern-3">
            {remainingHonorary.map((president, index) => (
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
            <h2 className="title-section">{homepageContent.management_section_title || 'Yönetim Kurulumuz'}</h2>
            <p className="subtitle-section">
              {homepageContent.management_section_subtitle || 'Actor Club\'ın geleceğini şekillendiren deneyimli yöneticilerimiz'}
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
              <p className="font-semibold" style={{ color: 'var(--primary-blue)' }}>Yönetim Kurulu Başkanı</p>
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