import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="navbar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
                alt="Actor Club Logo" 
                className="h-10 w-auto logo-clean"
                data-testid="actor-club-logo"
              />
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Ana Sayfa</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => navigate('/members')}>Üyelerimiz</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => navigate('/events')}>Etkinlikler</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => navigate('/about')}>Hakkımızda</a>
              <Button 
                onClick={() => navigate('/login')}
                className="btn-primary"
                data-testid="login-nav-btn"
              >
                Üye Girişi
              </Button>
            </nav>

            {/* Mobile Menu Button */}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Actor Club Üye Portalı
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tiyatro sanatına tutkuyla bağlı olan sanatçılar için özel olarak tasarlanmış
            üye platformuna hoş geldiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/login')}
              className="btn-primary px-8 py-3"
              data-testid="hero-login-btn"
            >
              Üyelik Girişi
            </Button>
            <Button 
              className="btn-outline px-8 py-3"
              onClick={() => navigate('/about')}
              data-testid="hero-info-btn"
            >
              Daha Fazla Bilgi
            </Button>
          </div>
        </section>

        {/* Founder Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kurucu</h2>
          </div>
          
          <div className="flex justify-center">
            <div className="card-clean max-w-sm text-center" data-testid="founder-card">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                MÇI
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Muzaffer Çağlar İşgören</h3>
              <p className="text-blue-600 font-medium">Kurucu / Onursal Başkan</p>
              <p className="text-gray-600 text-sm mt-2">
                Actor Club'ın kurucusu ve vizyoner lideri
              </p>
            </div>
          </div>
        </section>

        {/* Honorary Presidents Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Onursal Başkanlar</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card-clean text-center hover-card" data-testid="honorary-president-1">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-lg font-bold">
                GK
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Göksel Kortay</h3>
              <p className="text-blue-600 font-medium text-sm">Onursal Başkan</p>
            </div>

            <div className="card-clean text-center hover-card" data-testid="honorary-president-2">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-lg font-bold">
                KUB
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Kökten Ulaş Birand</h3>
              <p className="text-blue-600 font-medium text-sm">Onursal Başkan</p>
            </div>

            <div className="card-clean text-center hover-card" data-testid="honorary-president-3">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-lg font-bold">
                CK
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Cengiz Karakuzu</h3>
              <p className="text-blue-600 font-medium text-sm">Onursal Başkan</p>
            </div>
          </div>
        </section>

        {/* Board Chairman Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Yönetim Kurulu Başkanı</h2>
          </div>
          
          <div className="flex justify-center">
            <div className="card-clean max-w-sm text-center" data-testid="board-chairman-card">
              <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                ET
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Emre Turgut</h3>
              <p className="text-amber-600 font-medium">Yönetim Kurulu Başkanı</p>
              <p className="text-gray-600 text-sm mt-2">
                Actor Club yönetim kurulunu başarıyla yöneten lider
              </p>
            </div>
          </div>
        </section>

        {/* Board Members Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Yönetim Kurulu Üyeleri</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-clean text-center hover-card" data-testid="board-member-1">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-lg font-bold">
                TÇ
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Tuğba Çakı</h3>
              <p className="text-blue-600 font-medium text-sm mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-bold text-gray-700">Diyojen - Tuğba Çakı</p>
                <p className="text-xs text-gray-500">28 Üye</p>
              </div>
            </div>

            <div className="card-clean text-center hover-card" data-testid="board-member-2">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-lg font-bold">
                DAA
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Duygu Asker Aksoy</h3>
              <p className="text-blue-600 font-medium text-sm mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-bold text-gray-700">Hypatia - Duygu Asker Aksoy</p>
                <p className="text-xs text-gray-500">28 Üye</p>
              </div>
            </div>

            <div className="card-clean text-center hover-card" data-testid="board-member-3">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-lg font-bold">
                SA
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Seda Ateş</h3>
              <p className="text-blue-600 font-medium text-sm mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-bold text-gray-700">Hermes - Seda Ateş</p>
                <p className="text-xs text-gray-500">22 Üye</p>
              </div>
            </div>

            <div className="card-clean text-center hover-card" data-testid="board-member-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-lg font-bold">
                UDZ
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Utkan Devrim Zeyrek</h3>
              <p className="text-blue-600 font-medium text-sm mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-bold text-gray-700">Artemis - Utkan Devrim Zeyrek</p>
                <p className="text-xs text-gray-500">29 Üye</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gray-50 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Actor Club Ailesine Katılın
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Tiyatro sanatına olan tutkumuzu paylaşıyorsanız, Actor Club ailesinin bir parçası olun.
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="btn-primary px-8 py-3 text-lg"
            data-testid="cta-join-btn"
          >
            Hemen Üye Girişi Yapın
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-6">
            <img 
              src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
              alt="Actor Club Logo" 
              className="mx-auto h-12 w-auto mb-4 opacity-90 logo-clean"
            />
          </div>
          <h3 className="text-xl font-bold mb-4">Actor Club Üye Portalı</h3>
          <p className="text-gray-400 mb-4">
            Tiyatro sanatına tutkuyla bağlı sanatçılar için özel platform
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 Actor Club Üye Portalı. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;