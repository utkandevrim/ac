import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await onLogin(formData.username, formData.password);
      
      if (result.success) {
        toast.success('Giriş başarılı!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `linear-gradient(rgba(139, 38, 53, 0.9), rgba(201, 48, 44, 0.9)), url('https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2V8ZW58MHx8fHwxNzU4NzMzNzc5fDA&ixlib=rb-4.1.0&q=85')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <img 
            src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
            alt="Actor Club Logo" 
            className="mx-auto h-24 w-auto mb-6 drop-shadow-2xl"
            data-testid="login-logo"
          />
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            Hoş Geldiniz
          </h2>
          <p className="text-lg sm:text-xl text-white opacity-90">
            Actor Club Portal'a giriş yapın
          </p>
        </div>

        <Card className="card-glass p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-2xl border border-white/20">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit} data-testid="login-form">
            <div>
              <Label htmlFor="username" className="form-label text-gray-700">
                Kullanıcı Adı
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="isim.soyisim"
                data-testid="username-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="form-label text-gray-700">
                Şifre
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input pr-10"
                  placeholder="Şifrenizi girin"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg py-3"
              data-testid="login-submit-btn"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-4">Test için hesaplar:</p>
              <div className="space-y-2 text-xs bg-gray-50 p-4 rounded-lg">
                <p><strong>Admin:</strong> admin.yonetici / ActorClub2024!</p>
                <p><strong>Kurucu:</strong> muzaffer.isgoren / Founder123!</p>
                <p><strong>Test Kullanıcı:</strong> test.kullanici / Test567!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;