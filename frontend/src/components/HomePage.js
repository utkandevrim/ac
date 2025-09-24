import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-screen flex items-center justify-center theater-curtain"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 38, 53, 0.7), rgba(139, 38, 53, 0.7)), url('https://images.unsplash.com/photo-1503095396549-807759245b35?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2V8ZW58MHx8fHwxNzU4NzMzNzc5fDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="spotlight">
          <div className="text-center text-white z-10 relative px-6">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
                alt="Actor Club Logo" 
                className="mx-auto h-32 w-auto mb-6 drop-shadow-2xl"
                data-testid="actor-club-logo"
              />
            </div>
            
            <h1 className="hero-title text-6xl md:text-7xl mb-6 fade-in-up">
              ACTOR CLUB PORTAL
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light opacity-90 fade-in-up" style={{animationDelay: '0.2s'}}>
              Sahne Tozu Tiyatrosu Üye Portalı
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="btn-secondary text-lg px-8 py-4 hover-lift fade-in-up"
              style={{animationDelay: '0.4s'}}
              data-testid="login-redirect-btn"
            >
              Üye Girişi
            </Button>
          </div>
        </div>
      </div>

      {/* Leadership Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-red-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Yönetim Kadromuz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Actor Club'ı yönlendiren deneyimli ve tutkulu ekibimiz
            </p>
          </div>

          {/* Founders and Honorary Presidents */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Founder */}
            <div className="text-center card hover-lift" data-testid="founder-card">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                ÇI
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Çağlar İşgören</h3>
              <p className="text-red-600 font-medium">Kurucu</p>
            </div>

            {/* Honorary Presidents */}
            <div className="text-center card hover-lift" data-testid="honorary-president-1">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                GK
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Göksel Kortay</h3>
              <p className="text-red-600 font-medium">Onursal Başkan</p>
            </div>

            <div className="text-center card hover-lift" data-testid="honorary-president-2">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                KUB
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Kökten Ulaş Birand</h3>
              <p className="text-red-600 font-medium">Onursal Başkan</p>
            </div>

            <div className="text-center card hover-lift" data-testid="honorary-president-3">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                CK
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Cengiz Karakuzu</h3>
              <p className="text-red-600 font-medium">Onursal Başkan</p>
            </div>
          </div>

          {/* Board Chairman */}
          <div className="text-center mb-16">
            <div className="card hover-lift max-w-md mx-auto" data-testid="board-chairman-card">
              <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-amber-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold">
                ET
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Emre Turgut</h3>
              <p className="text-red-600 font-bold text-lg">Yönetim Kurulu Başkanı</p>
            </div>
          </div>

          {/* Board Members */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-8">Yönetim Kurulu Üyeleri</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center card hover-lift" data-testid="board-member-1">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                TÇ
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Tuğba Çakı</h3>
              <p className="text-red-600 font-medium">Yönetim Kurulu Üyesi</p>
              <p className="text-sm text-gray-500 mt-2">28 Üye</p>
            </div>

            <div className="text-center card hover-lift" data-testid="board-member-2">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                DAA
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Duygu Asker Aksoy</h3>
              <p className="text-red-600 font-medium">Yönetim Kurulu Üyesi</p>
              <p className="text-sm text-gray-500 mt-2">28 Üye</p>
            </div>

            <div className="text-center card hover-lift" data-testid="board-member-3">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                SA
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Seda Ateş</h3>
              <p className="text-red-600 font-medium">Yönetim Kurulu Üyesi</p>
              <p className="text-sm text-gray-500 mt-2">22 Üye</p>
            </div>

            <div className="text-center card hover-lift" data-testid="board-member-4">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                UDZ
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Utkan Devrim Zeyrek</h3>
              <p className="text-red-600 font-medium">Yönetim Kurulu Üyesi</p>
              <p className="text-sm text-gray-500 mt-2">29 Üye</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Portal Özellikleri
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Üye deneyimini zenginleştiren gelişmiş özellikler
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card hover-lift text-center" data-testid="feature-profile">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl">
                👤
              </div>
              <h3 className="text-xl font-semibold mb-4">Kişisel Profil</h3>
              <p className="text-gray-600">Detaylı profil bilgileri, projeler ve kişisel gelişim takibi</p>
            </div>

            <div className="card hover-lift text-center" data-testid="feature-dues">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl">
                💳
              </div>
              <h3 className="text-xl font-semibold mb-4">Aidat Takibi</h3>
              <p className="text-gray-600">Aylık aidat durumu ve ödeme bilgileri takip sistemi</p>
            </div>

            <div className="card hover-lift text-center" data-testid="feature-events">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl">
                🎭
              </div>
              <h3 className="text-xl font-semibold mb-4">Etkinlikler</h3>
              <p className="text-gray-600">Tiyatro etkinlikleri, provalar ve özel programlar</p>
            </div>

            <div className="card hover-lift text-center" data-testid="feature-search">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl">
                🔍
              </div>
              <h3 className="text-xl font-semibold mb-4">Üye Arama</h3>
              <p className="text-gray-600">Diğer üyeleri keşfet, iletişime geç ve işbirliği yap</p>
            </div>

            <div className="card hover-lift text-center" data-testid="feature-projects">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl">
                🎪
              </div>
              <h3 className="text-xl font-semibold mb-4">Proje Takibi</h3>
              <p className="text-gray-600">Katıldığın projeler ve başarı hikayelerin</p>
            </div>

            <div className="card hover-lift text-center" data-testid="feature-community">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-amber-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl">
                🤝
              </div>
              <h3 className="text-xl font-semibold mb-4">Topluluk</h3>
              <p className="text-gray-600">Aktif bir sanat topluluğunun parçası ol</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 38, 53, 0.8), rgba(201, 48, 44, 0.8)), url('https://images.unsplash.com/photo-1574195632302-30bc5d48e6b1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2V8ZW58MHx8fHwxNzU4NzMzNzc5fDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sahnede Yerini Al
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Actor Club ailesi olarak seni de aramızda görmekten mutluluk duyarız
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="btn-secondary text-lg px-8 py-4 hover-lift"
            data-testid="cta-login-btn"
          >
            Hemen Giriş Yap
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-6">
            <img 
              src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
              alt="Actor Club Logo" 
              className="mx-auto h-16 w-auto mb-4 opacity-90"
            />
          </div>
          <h3 className="text-2xl font-bold mb-4">Actor Club Portal</h3>
          <p className="text-lg mb-6 opacity-90">Sahne Tozu Tiyatrosu</p>
          <p className="opacity-75">
            © 2024 Actor Club Portal. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;