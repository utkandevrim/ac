import React, { useState, useEffect, createContext } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { ThemeProvider } from "./contexts/ThemeContext";

// Import components
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/UserProfile";
import MembersList from "./components/MembersList";
import Events from "./components/Events";
import AdminPanel from "./components/AdminPanel";
import AboutUs from "./components/AboutUs";
import HomePage from "./components/HomePage";
import Navbar from "./components/Navbar";
import Campaigns from "./components/Campaigns";
import QRVerification from "./components/QRVerification";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { username, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Giriş yapılamadı' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-red-100">
        <div className="text-2xl font-semibold text-gray-700">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, user, requireAdmin = false }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !user.is_admin) {
    toast.error("Bu sayfaya erişim yetkiniz yok");
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

const AppContent = () => {
  const { user, login, logout } = React.useContext(AuthContext);

  return (
    <>
      <Toaster position="top-right" />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLogin={login} />
          } 
        />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <>
                <Navbar user={user} onLogout={logout} />
                <Dashboard user={user} />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile/:userId?"
          element={
            <ProtectedRoute user={user}>
              <>
                <Navbar user={user} onLogout={logout} />
                <UserProfile user={user} />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/members"
          element={
            <ProtectedRoute user={user}>
              <>
                <Navbar user={user} onLogout={logout} />
                <MembersList user={user} />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/events"
          element={
            <ProtectedRoute user={user}>
              <>
                <Navbar user={user} onLogout={logout} />
                <Events user={user} />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/about"
          element={
            <ProtectedRoute user={user}>
              <>
                <Navbar user={user} onLogout={logout} />
                <AboutUs user={user} />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} requireAdmin={true}>
              <>
                <Navbar user={user} onLogout={logout} />
                <AdminPanel user={user} />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute user={user}>
              <>
                <Navbar user={user} onLogout={logout} />
                <Campaigns user={user} />
              </>
            </ProtectedRoute>
          }
        />

        {/* Public QR Verification Route */}
        <Route
          path="/verify-qr/:qrToken"
          element={<QRVerification />}
        />
      </Routes>
    </>
  );
};

export default App;