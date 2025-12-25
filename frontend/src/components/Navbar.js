import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Users, 
  Calendar,
  Info,
  User,
  Settings, 
  LogOut,
  Home,
  Menu,
  X,
  Gift
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png');

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      if (response.data.logo_url) {
        setLogoUrl(response.data.logo_url);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const navigationItems = [
    { name: 'Anasayfa', href: '/', icon: Home },
    { name: 'Üyelerimiz', href: '/members', icon: Users },
    { name: 'Kampanyalar', href: '/campaigns', icon: Gift },
    { name: 'Etkinlikler', href: '/events', icon: Calendar },
    { name: 'Biz Kimiz', href: '/about', icon: Info },
    { name: 'Profilim', href: '/profile', icon: User },
  ];

  const isActive = (href) => {
    if (href === '/' && location.pathname === '/dashboard') return true;
    return location.pathname === href;
  };

  return (
    <nav className="modern-nav">
      <div className="container-modern">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoUrl}
              alt="Actor Club Logo" 
              className="h-10 w-auto"
              onError={(e) => {
                e.target.src = 'https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png';
              }}
            />
            <span className="ml-3 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Actor Club
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
            
            {/* Admin Panel Link */}
            {user?.is_admin && (
              <Link
                to="/admin"
                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* User Menu / Login Button */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-3 p-2 rounded-xl transition-colors" style={{ background: 'transparent' }}>
                      <div className="text-right">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name} {user.surname}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {user.is_admin ? 'Yönetici' : 'Üye'}
                        </p>
                      </div>
                      {user.profile_photo ? (
                        <img 
                          src={`${process.env.REACT_APP_BACKEND_URL}${user.profile_photo}`}
                          alt={`${user.name} ${user.surname}`}
                          className="avatar-modern avatar-sm"
                        />
                      ) : (
                        <div className="avatar-placeholder avatar-sm text-sm">
                          {user.name?.[0]}{user.surname?.[0]}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name} {user.surname}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </DropdownMenuItem>
                    {user.is_admin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Çıkış Yap
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="btn-modern-primary"
              >
                Üye Girişi
              </button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-slide-up" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              
              {/* Admin Panel Link - Mobile */}
              {user?.is_admin && (
                <Link
                  to="/admin"
                  className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}

              {/* Logout - Mobile */}
              {user && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="nav-link text-left w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;