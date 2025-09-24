import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
              alt="Actor Club Logo" 
              className="h-12 w-auto logo-modern"
              data-testid="actor-club-logo"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Actor Club Üye Portalı
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Yönetim Kadromuz Section */}
      <section className="py-20 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 fade-in-up">
              Yönetim Kadromuz
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto fade-in-up" style={{animationDelay: '0.2s'}}>
              Actor Club'ı yönlendiren deneyimli ve tutkulu ekibimiz
            </p>
          </div>

          {/* Kurucu & Onursal Başkan */}
          <div className="text-center mb-16 fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="card hover-lift max-w-md mx-auto artistic-accent" data-testid="founder-card">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg float-animation">
                MÇI
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Muzaffer Çağlar İşgören</h3>
              <p className="text-indigo-600 font-bold text-lg">Kurucu / Onursal Başkan</p>
            </div>
          </div>

          {/* Onursal Başkanlar */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center card hover-lift" data-testid="honorary-president-1">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                GK
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Göksel Kortay</h3>
              <p className="text-indigo-600 font-medium">Onursal Başkan</p>
            </div>

            <div className="text-center card hover-lift" data-testid="honorary-president-2">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                KUB
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kökten Ulaş Birand</h3>
              <p className="text-indigo-600 font-medium">Onursal Başkan</p>
            </div>

            <div className="text-center card hover-lift" data-testid="honorary-president-3">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                CK
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cengiz Karakuzu</h3>
              <p className="text-indigo-600 font-medium">Onursal Başkan</p>
            </div>
          </div>

          {/* Yönetim Kurulu Başkanı */}
          <div className="text-center mb-16">
            <div className="card hover-lift max-w-md mx-auto" data-testid="board-chairman-card">
              <div className="w-28 h-28 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                ET
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Emre Turgut</h3>
              <p className="text-amber-600 font-bold text-lg">Yönetim Kurulu Başkanı</p>
            </div>
          </div>

          {/* Yönetim Kurulu Üyeleri */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Yönetim Kurulu Üyeleri</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center card hover-lift" data-testid="board-member-1">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                TÇ
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tuğba Çakı</h3>
              <p className="text-indigo-600 font-medium mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-3">
                <p className="text-sm font-bold text-indigo-800">Diyojen - Tuğba Çakı</p>
                <p className="text-xs text-indigo-600">28 Üye</p>
              </div>
            </div>

            <div className="text-center card hover-lift" data-testid="board-member-2">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                DAA
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Duygu Asker Aksoy</h3>
              <p className="text-indigo-600 font-medium mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-3">
                <p className="text-sm font-bold text-indigo-800">Hypatia - Duygu Asker Aksoy</p>
                <p className="text-xs text-indigo-600">28 Üye</p>
              </div>
            </div>

            <div className="text-center card hover-lift" data-testid="board-member-3">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                SA
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seda Ateş</h3>
              <p className="text-indigo-600 font-medium mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-3">
                <p className="text-sm font-bold text-indigo-800">Hermes - Seda Ateş</p>
                <p className="text-xs text-indigo-600">22 Üye</p>
              </div>
            </div>

            <div className="text-center card hover-lift" data-testid="board-member-4">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                UDZ
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Utkan Devrim Zeyrek</h3>
              <p className="text-indigo-600 font-medium mb-2">Yönetim Kurulu Üyesi</p>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-3">
                <p className="text-sm font-bold text-indigo-800">Artemis - Utkan Devrim Zeyrek</p>
                <p className="text-xs text-indigo-600">29 Üye</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Üye Girişi Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-6">
          <h2 className="text-5xl font-bold text-white mb-6 fade-in-up">
            Üye Girişi
          </h2>
          <p className="text-xl text-indigo-100 mb-8 opacity-90 fade-in-up" style={{animationDelay: '0.2s'}}>
            Actor Club ailesine giriş yapın ve özel içeriklere erişin
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="btn-secondary text-lg px-10 py-4 hover-glow fade-in-up"
            style={{animationDelay: '0.4s'}}
            data-testid="login-redirect-btn"
          >
            Giriş Yap
          </Button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl"></div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
              alt="Actor Club Logo" 
              className="mx-auto h-16 w-auto mb-6 opacity-90 logo-modern"
            />
          </div>
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Actor Club Üye Portalı
          </h3>
          <p className="text-gray-400 mb-6">
            Sanatın gücüne inanan, yaratıcılığı destekleyen profesyonel tiyatro topluluğu
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