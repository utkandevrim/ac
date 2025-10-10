import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card } from './ui/card';
import { 
  CheckCircle,
  XCircle,
  User,
  Clock,
  AlertTriangle,
  Gift
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QRVerification = () => {
  const { qrToken } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (qrToken) {
      verifyQRCode();
    }
  }, [qrToken]);

  const verifyQRCode = async () => {
    try {
      const response = await axios.get(`${API}/verify-qr/${qrToken}`);
      setVerification(response.data);
    } catch (error) {
      console.error('Error verifying QR code:', error);
      setVerification({
        valid: false,
        message: "Kampanya Geçersiz",
        reason: "Sistem hatası"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="card p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">QR kod doğrulanıyor...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="card p-8 max-w-md w-full">
        {verification?.valid ? (
          // Valid Campaign
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black text-green-600 mb-4 leading-tight">
                {verification.message}
              </h1>
              <div className="text-2xl font-bold text-green-500 mb-6 animate-pulse">
                ✅ ONAYLANDI ✅
              </div>
              
              {verification.campaign && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Gift className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">
                      {verification.campaign.title}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {verification.campaign.company}
                  </p>
                </div>
              )}
            </div>

            {/* Member Info */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center space-x-4">
                {/* Member Photo */}
                <div className="flex-shrink-0">
                  {verification.member.photo ? (
                    <img 
                      src={`${BACKEND_URL}${verification.member.photo}`}
                      alt={`${verification.member.name} ${verification.member.surname}`}
                      className="w-16 h-16 rounded-full object-cover border-4 border-green-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center border-4 border-green-200">
                      <span className="text-white font-bold text-lg">
                        {verification.member.name?.[0]}{verification.member.surname?.[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Member Details */}
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-gray-900">
                    {verification.member.name} {verification.member.surname}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <User className="h-4 w-4 mr-1" />
                    {verification.member.username}
                  </p>
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aidat Durumu: Güncel
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-6 rounded-xl shadow-lg border-4 border-green-300">
              <p className="text-xl font-black text-center mb-2">
                🎉 KAMPANYAYA KATILABİLİR 🎉
              </p>
              <p className="text-green-100 font-semibold text-center">
                Aidat ödemeleri güncel ve şartları sağlıyor
              </p>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <Clock className="h-3 w-3 mr-1" />
              Doğrulama zamanı: {new Date().toLocaleString('tr-TR')}
            </div>
          </div>
        ) : (
          // Invalid Campaign
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-red-100 rounded-full p-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-red-800 mb-2">
                {verification?.message || "Kampanya Geçersiz"}
              </h1>
            </div>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-semibold text-red-800">Geçersizlik Nedeni</span>
              </div>
              <p className="text-red-700 text-sm">
                {verification?.reason || "Bilinmeyen hata"}
              </p>
            </div>

            {/* Common Reasons */}
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-gray-800 mb-2">Olası Nedenler:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• QR kod süresi dolmuş olabilir (15 dakika)</li>
                <li>• QR kod daha önce kullanılmış olabilir</li>
                <li>• Üyenin aidat ödemeleri eksik olabilir</li>
                <li>• Kampanya artık aktif olmayabilir</li>
                <li>• Geçersiz veya bozuk QR kod</li>
              </ul>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <Clock className="h-3 w-3 mr-1" />
              Kontrol zamanı: {new Date().toLocaleString('tr-TR')}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_actorclub/artifacts/4gypiwpr_ac%20logo.png" 
              alt="Actor Club Logo" 
              className="h-8 w-auto mx-auto mb-2"
            />
            <p className="text-xs text-gray-500">Actor Club Üye Portalı</p>
            <p className="text-xs text-gray-400">Kampanya Doğrulama Sistemi</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QRVerification;