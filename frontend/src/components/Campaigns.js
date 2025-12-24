import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Gift,
  QrCode,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Campaigns = ({ user }) => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    setIsAdmin(user?.is_admin || false);
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API}/campaigns`);
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Kampanyalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async (campaignId, campaignTitle) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/campaigns/${campaignId}/generate-qr`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { qr_token, expires_at } = response.data;
      const qrUrl = `${BACKEND_URL}/api/verify-qr/${qr_token}`;
      
      // Generate QR code image
      const qrImage = await generateQRCodeImage(qrUrl);
      
      setQrModal({
        campaignTitle,
        qrUrl,
        qrImage,
        expiresAt: new Date(expires_at),
        token: qr_token
      });

    } catch (error) {
      console.error('Error generating QR:', error);
      if (error.response?.status === 403) {
        toast.error('Aidat ödemeleriniz eksik. Kampanyaya katılamıyorsunuz.');
      } else {
        toast.error('QR kod oluşturulurken hata oluştu');
      }
    }
  };

  // Generate QR Code using qrcode library
  const generateQRCodeImage = async (text) => {
    try {
      return await QRCode.toDataURL(text, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8" style={{ background: 'var(--background-gradient)' }}>
        <div className="container-modern">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 theme-text-body">Kampanyalar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--background-gradient)' }}>
      <div className="container-modern">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="title-section">Kampanyalar</h1>
          </div>
          <p className="subtitle-section max-w-2xl mx-auto">
            Üyelerimize özel indirimler ve avantajlar. Kampanyalardan yararlanmak için aidatlarınızın güncel olması gerekmektedir.
          </p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-8 flex justify-end">
            <Button 
              onClick={() => navigate('/admin')}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Kampanya Ekle
            </Button>
          </div>
        )}

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <Card className="card p-12 text-center">
            <Gift className="h-16 w-16 theme-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold theme-text-h1 mb-2">Henüz Kampanya Yok</h3>
            <p className="theme-text-body">Şu anda aktif kampanya bulunmamaktadır. Yakında yeni kampanyalar eklenecektir.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="card p-6 hover:shadow-lg transition-shadow">
                {/* Campaign Image */}
                {campaign.image_url && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Campaign Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold theme-text-h1 mb-2">{campaign.title}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-2">{campaign.company_name}</p>
                    <p className="theme-text-body text-sm">{campaign.description}</p>
                  </div>

                  {/* Discount Details */}
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-800 font-semibold text-sm">
                      🎁 {campaign.discount_details}
                    </p>
                  </div>

                  {/* Terms */}
                  {campaign.terms_conditions && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 text-xs">
                        <strong>Şartlar:</strong> {campaign.terms_conditions}
                      </p>
                    </div>
                  )}

                  {/* QR Generate Button */}
                  {user && !isAdmin && (
                    <Button
                      onClick={() => generateQR(campaign.id, campaign.title)}
                      className="w-full btn-primary touch-target"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Kod Oluştur
                    </Button>
                  )}

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 touch-target"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 touch-target text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Sil
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Box */}
        <Card className="card p-6 mt-8 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Kampanyalara Katılım Şartları</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Bu ay hariç, geçmişe dönük tüm aidatlarınızın ödenmiş olması gerekmektedir.</li>
                <li>• QR kodları 15 dakika süreyle geçerlidir ve tek kullanımlıktır.</li>
                <li>• Kampanya şartlarına uymayan üyelikler geçersiz sayılacaktır.</li>
                <li>• QR kodunuzu kampanya ortağına göstererek indirimden yararlanabilirsiniz.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">QR Kod</h3>
              <button
                onClick={() => setQrModal(null)}
                className="text-gray-400 hover:text-gray-600 touch-target"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">{qrModal.campaignTitle}</p>
              
              {/* QR Code Display */}
              <div className="bg-gray-100 p-4 rounded-lg">
                {qrModal.qrImage ? (
                  <img 
                    src={qrModal.qrImage}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto bg-gray-200 rounded flex items-center justify-center">
                    <p className="text-gray-500">QR kod oluşturuluyor...</p>
                  </div>
                )}
              </div>

              {/* Expiry Info */}
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center justify-center text-orange-800">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    15 dakika süreyle geçerli
                  </span>
                </div>
                <p className="text-xs text-orange-700 mt-1">
                  Bitiş: {qrModal.expiresAt.toLocaleTimeString()}
                </p>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                <p>Bu QR kodu kampanya ortağına göstererek indirimden yararlanabilirsiniz.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;