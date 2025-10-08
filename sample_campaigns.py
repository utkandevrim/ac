#!/usr/bin/env python3
"""
Sample campaign data for Actor Club
"""

import asyncio
import motor.motor_asyncio
import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

sample_campaigns = [
    {
        "id": str(uuid.uuid4()),
        "title": "Kafe İndirim Kampanyası",
        "description": "Tiyatro binası yakınındaki partnr kafemizde tüm içecekler ve atıştırmalıklarda özel indirim fırsatı.",
        "company_name": "Sanat Café",
        "discount_details": "%25 indirim - Tüm içecekler ve hafif yemekler",
        "terms_conditions": "Geçerli çalışma saatleri: 09:00-22:00. Alkol hariç tüm ürünlerde geçerlidir.",
        "image_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "expires_at": None
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Kitap Mağazası İndirimi",
        "description": "Oyunculuk, tiyatro ve sanat kitaplarında özel Actor Club üye indirimi.",
        "company_name": "Kitap Dünyası",
        "discount_details": "%20 indirim - Sanat ve tiyatro kitapları",
        "terms_conditions": "Sadece sanat, tiyatro, oyunculuk kategorisindeki kitaplarda geçerlidir. Diğer kampanyalarla birleştirilemez.",
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "expires_at": None
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Spor Salonu Üyeliği",
        "description": "Oyuncular için fiziksel form ve sahne hazırlığı destekli özel spor salonu üyelik indirimi.",
        "company_name": "Actor Fitness",
        "discount_details": "%30 indirim - 3 aylık üyelik",
        "terms_conditions": "Minimum 3 ay üyelik gereklidir. Sadece yeni üyeler için geçerlidir.",
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "expires_at": None
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Fotoğraf Stüdyosu",
        "description": "Profesyonel oyuncu portfolyo çekimi için özel indirimli fotoğraf hizmeti.",
        "company_name": "Pro Photo Studio",
        "discount_details": "%40 indirim - Portfolyo çekimi paketleri",
        "terms_conditions": "Rezervasyon zorunludur. Hafta içi çekimler için geçerlidir.",
        "image_url": "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "expires_at": None
    }
]

async def create_sample_campaigns():
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🎁 ÖRNEK KAMPANYALAR OLUŞTURULUYOR")
    print("=" * 50)
    
    try:
        # Check if campaigns already exist
        existing = await db.campaigns.count_documents({})
        if existing > 0:
            print(f"⚠️  Zaten {existing} kampanya mevcut. Yeniden oluşturuluyor...")
            await db.campaigns.delete_many({})
        
        # Insert sample campaigns
        await db.campaigns.insert_many(sample_campaigns)
        
        print(f"✅ {len(sample_campaigns)} örnek kampanya başarıyla oluşturuldu:")
        for i, campaign in enumerate(sample_campaigns, 1):
            print(f"{i:2d}. {campaign['title']} - {campaign['company_name']}")
        
        print(f"\n📊 KAMPANYA ÖZETİ:")
        print(f"   - Toplam kampanya sayısı: {len(sample_campaigns)}")
        print(f"   - Aktif kampanya sayısı: {len([c for c in sample_campaigns if c['is_active']])}")
        
        print(f"\n🎯 KULLANIM:")
        print(f"   1. /campaigns sayfasını ziyaret edin")
        print(f"   2. Üye girişi yapın") 
        print(f"   3. Aidat ödemeleriniz güncel ise QR kod oluşturun")
        print(f"   4. QR kodu kampanya ortağına gösterin")
        
    except Exception as e:
        print(f"❌ Hata: {str(e)}")
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_sample_campaigns())