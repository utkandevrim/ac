#!/usr/bin/env python3
"""
Final member cleanup script - Create ONLY the members from the provided list
Total should be: 107 members + 2 admins + 1 test user = 110 users
"""

import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
import uuid
from datetime import datetime, timezone
import bcrypt

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

# Load environment
from dotenv import load_dotenv
load_dotenv()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def final_cleanup():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🧹 Final member cleanup başlatılıyor...")
    
    # Step 1: Delete ALL users except essential admins
    print("\n1. Tüm kullanıcıları temizleniyor...")
    result = await db.users.delete_many({})
    print(f"   Silinen kullanıcı sayısı: {result.deleted_count}")
    
    # Step 2: Delete all dues
    print("\n2. Tüm aidat kayıtları temizleniyor...")
    result = await db.dues.delete_many({})
    print(f"   Silinen aidat kaydı sayısı: {result.deleted_count}")
    
    # Step 3: Create clean admin structure
    admin_users = [
        {
            "id": str(uuid.uuid4()),
            "username": "admin.yonetici",
            "email": "admin1@actorclub.com",
            "password": hash_password("ActorClub2024!"),
            "name": "Admin",
            "surname": "Yönetici",
            "phone": None,
            "birth_date": None,
            "address": None,
            "workplace": None,
            "job_title": None,
            "hobbies": None,
            "skills": None,
            "height": None,
            "weight": None,
            "profile_photo": None,
            "projects": [],
            "board_member": None,
            "is_admin": True,
            "is_approved": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "username": "muzaffer.isgoren",
            "email": "muzaffer@actorclub.com", 
            "password": hash_password("Founder123!"),
            "name": "Muzaffer",
            "surname": "İşgören",
            "phone": None,
            "birth_date": None,
            "address": None,
            "workplace": None,
            "job_title": None,
            "hobbies": None,
            "skills": None,
            "height": None,
            "weight": None,
            "profile_photo": None,
            "projects": [],
            "board_member": None,
            "is_admin": True,
            "is_approved": True,
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    print("\n3. Admin kullanıcıları oluşturuluyor...")
    for admin_data in admin_users:
        await db.users.insert_one(admin_data)
        print(f"   ✅ Admin oluşturuldu: {admin_data['username']}")
    
    # Step 4: Create EXACT members list from user specification
    # TUĞBA ÇAKI (28 kişi)
    tugba_team = [
        "İkbal Karatepe", "Deniz Duygulu", "Nazlı Sena Eser", "Ergun Acar",
        "Hatice Dilan Genç", "Banu Gümüşkaynak", "Ebru Ateşdağlı", "Hasan Ali Erk",
        "Mustafa Deniz Özer", "Hüseyin Ertan Sezgin", "Afet Bakay", "Cengiz Karakuzu",
        "Nadir Şimşek", "Melih Ülgentay", "Elif Alıveren", "Buğra Han Acar",
        "Bekir Berk Altınay", "Ceyda Çınar", "Ahmet İşleyen", "Abdullah Baş",
        "Alev Atam", "İzem Karslı", "Özkan Çiğdem", "Berkant Oman",
        "Beren Karamustafaoğlu", "Demet Aslan", "Ece Kılıç", "Hazal Aktaş"
    ]
    
    # DUYGU ASKER AKSOY (28 kişi)
    duygu_team = [
        "Sultan Güleryüz", "Dilek Şahin Taş", "Merve Dür", "Sinan Telli",
        "Ebru Polat", "Fatma Neva Şen", "Meltem Sözüer", "Fethiye Turgut",
        "Şahin Kul O.", "Ertuğrul Ceyhan", "İbrahim Şanlı", "İpek Apaydın",
        "Aslı Cindaruk", "Yadigar Külice", "Volkan Arslan", "Mahir Taşpulat",
        "Gözde Karadağ", "Rumeysa Nur Öztürk", "Nafiz Selvi", "Elif Kesikçiler",
        "Özge Türkoğlu", "Damla Ongün", "Simay Cihan", "Ece Arısoy",
        "Şevval Karaboğa", "Mehmet Emrah Güven", "Hatice Avcı", "Metin Celil Kuşsever"
    ]
    
    # SEDA ATEŞ (22 kişi)
    seda_team = [
        "Gürhan Aksu", "Hulusi Karabil", "Kökten Ulaş Birant", "Elif Gazel",
        "Tayyibe Alpay Uyanıker", "Eren Özgül", "Gaye Eren", "Şafak Sipahi",
        "Anıl Özçelik", "Çağla Beril Karayel", "Oğuz Serdar Zal", "Sabri Hakan Dokurlar",
        "Ahmet Rasim Burhanoğlu", "İrem Baysoy", "Abdülmetin Ürünveren", "Pelin Baki",
        "Esra Tür", "Leman Atiker", "Rabia Demir Köse", "Naci Çobanoğlu",
        "Özlem Demir", "Rahime Gözde Narin"
    ]
    
    # UTKAN DEVRİM ZEYREK (29 kişi)
    utkan_team = [
        "Saray Kaya", "Ulaş Kesikçiler", "Elif Tortop Doğan", "Zeynep Ermeç",
        "Gül Nacaroğlu", "İrem Ayas", "Kemal Erkilmen", "Senem Ünal",
        "Serkan Salgın", "Didem Karabil", "Ayşe Tumba", "Nur Ayça Öztürk",
        "Tamer Güleryüz", "Bülent Erdağı", "Ümit Peşeli", "Aybike Asena Karakaya",
        "Deniz Genç", "Azad Burak Süne", "Erdem Kocabay", "Rıdvan Baş",
        "Fulya Ersayan", "Rasim Can Birol", "Dilan Kart", "Sıla Timur",
        "Amir Karabuğday", "Sude Kahraman", "Samet Salık", "Erem Kılıç", "Seda Baykut"
    ]
    
    # Test kullanıcısı
    test_user = [("Test", "Kullanıcı", None)]
    
    # Combine all members with team assignments
    all_members = []
    
    # Parse team members
    for name in tugba_team:
        name_parts = name.split()
        first_name = " ".join(name_parts[:-1])
        last_name = name_parts[-1]
        all_members.append((first_name, last_name, "Tuğba Çakı"))
    
    for name in duygu_team:
        name_parts = name.split()
        first_name = " ".join(name_parts[:-1])
        last_name = name_parts[-1]
        all_members.append((first_name, last_name, "Duygu Asker Aksoy"))
    
    for name in seda_team:
        name_parts = name.split()
        first_name = " ".join(name_parts[:-1])
        last_name = name_parts[-1]
        all_members.append((first_name, last_name, "Seda Ateş"))
    
    for name in utkan_team:
        name_parts = name.split()
        first_name = " ".join(name_parts[:-1])
        last_name = name_parts[-1]
        all_members.append((first_name, last_name, "Utkan Devrim Zeyrek"))
    
    # Add test user
    all_members.extend(test_user)
    
    print(f"\n4. {len(all_members)} üye oluşturuluyor...")
    print(f"   Tuğba Çakı takımı: {len(tugba_team)} kişi")
    print(f"   Duygu Asker Aksoy takımı: {len(duygu_team)} kişi")
    print(f"   Seda Ateş takımı: {len(seda_team)} kişi") 
    print(f"   Utkan Devrim Zeyrek takımı: {len(utkan_team)} kişi")
    print(f"   Test kullanıcısı: 1 kişi")
    
    # Generate passwords and create users
    import random
    import string
    
    def generate_password():
        # Generate 8-16 char password with at least 1 letter and 1 special char
        length = random.randint(8, 16)
        letters = string.ascii_letters
        special_chars = "!@#$%^&*"
        
        # Ensure at least 1 letter and 1 special char
        password = random.choice(letters) + random.choice(special_chars)
        
        # Fill the rest
        remaining_chars = letters + string.digits + special_chars
        for _ in range(length - 2):
            password += random.choice(remaining_chars)
        
        # Shuffle the password
        password_list = list(password)
        random.shuffle(password_list)
        return ''.join(password_list)
    
    created_count = 0
    
    for first_name, last_name, team in all_members:
        # Create username in lowercase format
        name_parts = first_name.lower().split()
        surname_parts = last_name.lower().split()
        
        # Handle Turkish characters
        turkish_map = {'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'}
        name_clean = name_parts[0]  # Use only first part of name
        surname_clean = surname_parts[0]  # Use only first part of surname
        
        for turkish, ascii_char in turkish_map.items():
            name_clean = name_clean.replace(turkish, ascii_char)
            surname_clean = surname_clean.replace(turkish, ascii_char)
        
        username = f"{name_clean}.{surname_clean}"
        
        # Use specific password for test user
        if first_name == "Test" and last_name == "Kullanıcı":
            password = "Test567!"
        else:
            password = generate_password()
        
        user_dict = {
            "id": str(uuid.uuid4()),
            "username": username,
            "email": f"{username}@actorclub.com",
            "password": hash_password(password),
            "name": first_name,
            "surname": last_name,
            "phone": None,
            "birth_date": None,
            "address": None,
            "workplace": None,
            "job_title": None,
            "hobbies": None,
            "skills": None,
            "height": None,
            "weight": None,
            "profile_photo": None,
            "projects": [],
            "board_member": team,
            "is_admin": False,
            "is_approved": True,
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.users.insert_one(user_dict)
        
        # Create dues for the current year
        months = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"]
        current_year = datetime.now().year
        for month in months:
            dues_dict = {
                "user_id": user_dict["id"],
                "month": month,
                "year": current_year,
                "amount": 1000,
                "is_paid": False,
                "payment_date": None,
                "iban": "TR15 0001 5001 5800 7314 0364 49"
            }
            await db.dues.insert_one(dues_dict)
            
        created_count += 1
        if created_count % 25 == 0:
            print(f"   İlerleme: {created_count}/{len(all_members)} üye oluşturuldu...")
    
    print(f"\n✅ Final cleanup tamamlandı!")
    print(f"   Toplam kullanıcı sayısı: {2 + len(all_members)} (2 admin + {len(all_members)} üye)")
    print(f"   Kesin üye sayısı: {len(all_members) - 1} normal üye + 1 test kullanıcı")
    
    # Verify counts
    total_users = await db.users.count_documents({})
    admin_count = await db.users.count_documents({"is_admin": True})
    member_count = await db.users.count_documents({"is_admin": False})
    
    print(f"\n📊 Doğrulama:")
    print(f"   Toplam kullanıcı: {total_users}")
    print(f"   Admin sayısı: {admin_count}")
    print(f"   Üye sayısı: {member_count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(final_cleanup())