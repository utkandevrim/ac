#!/usr/bin/env python3
"""
Comprehensive cleanup script for Actor Club Portal
- Remove duplicate users
- Clean up admin structure 
- Ensure correct member counts
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

async def cleanup_database():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🧹 Starting comprehensive cleanup...")
    
    # Step 1: Delete ALL users except essential admins
    print("\n1. Cleaning all users...")
    result = await db.users.delete_many({})
    print(f"   Deleted {result.deleted_count} users")
    
    # Step 2: Delete all dues
    print("\n2. Cleaning dues...")
    result = await db.dues.delete_many({})
    print(f"   Deleted {result.deleted_count} dues records")
    
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
    
    print("\n3. Creating admin users...")
    for admin_data in admin_users:
        await db.users.insert_one(admin_data)
        print(f"   Created admin: {admin_data['username']}")
    
    # Step 4: Create UNIQUE members based on original list
    members_data = [
        # TUĞBA ÇAKI Takımı (28 kişi)
        {"name": "İkbal", "surname": "Karatepe", "team": "Tuğba Çakı"},
        {"name": "Deniz", "surname": "Duygulu", "team": "Tuğba Çakı"},
        {"name": "Nazlı Sena", "surname": "Eser", "team": "Tuğba Çakı"},
        {"name": "Ergun", "surname": "Acar", "team": "Tuğba Çakı"},
        {"name": "Hatice Dilan", "surname": "Genç", "team": "Tuğba Çakı"},
        {"name": "Banu", "surname": "Gümüşkaynak", "team": "Tuğba Çakı"},
        {"name": "Ebru", "surname": "Ateşdağlı", "team": "Tuğba Çakı"},
        {"name": "Hasan Ali", "surname": "Erk", "team": "Tuğba Çakı"},
        {"name": "Mustafa Deniz", "surname": "Özer", "team": "Tuğba Çakı"},
        {"name": "Hüseyin Ertan", "surname": "Sezgin", "team": "Tuğba Çakı"},
        {"name": "Afet", "surname": "Bakay", "team": "Tuğba Çakı"},
        {"name": "Cengiz", "surname": "Karakuzu", "team": "Tuğba Çakı"},
        {"name": "Nadir", "surname": "Şimşek", "team": "Tuğba Çakı"},
        {"name": "Melih", "surname": "Ülgentay", "team": "Tuğba Çakı"},
        {"name": "Elif", "surname": "Alıveren", "team": "Tuğba Çakı"},
        {"name": "Buğra Han", "surname": "Acar", "team": "Tuğba Çakı"},
        {"name": "Bekir Berk", "surname": "Altınay", "team": "Tuğba Çakı"},
        {"name": "Ceyda", "surname": "Çınar", "team": "Tuğba Çakı"},
        {"name": "Ahmet", "surname": "İşleyen", "team": "Tuğba Çakı"},
        {"name": "Abdullah", "surname": "Baş", "team": "Tuğba Çakı"},
        {"name": "Alev", "surname": "Atam", "team": "Tuğba Çakı"},
        {"name": "İzem", "surname": "Karslı", "team": "Tuğba Çakı"},
        {"name": "Özkan", "surname": "Çiğdem", "team": "Tuğba Çakı"},
        {"name": "Berkant", "surname": "Oman", "team": "Tuğba Çakı"},
        {"name": "Beren", "surname": "Karamustafaoğlu", "team": "Tuğba Çakı"},
        {"name": "Demet", "surname": "Aslan", "team": "Tuğba Çakı"},
        {"name": "Ece", "surname": "Kılıç", "team": "Tuğba Çakı"},
        {"name": "Hazal", "surname": "Aktaş", "team": "Tuğba Çakı"},
        
        # DUYGU ASKER AKSOY Takımı (28 kişi)
        {"name": "Sultan", "surname": "Güleryüz", "team": "Duygu Asker Aksoy"},
        {"name": "Dilek", "surname": "Şahin Taş", "team": "Duygu Asker Aksoy"},
        {"name": "Merve", "surname": "Dür", "team": "Duygu Asker Aksoy"},
        {"name": "Sinan", "surname": "Telli", "team": "Duygu Asker Aksoy"},
        {"name": "Ebru", "surname": "Polat", "team": "Duygu Asker Aksoy"},
        {"name": "Fatma Neva", "surname": "Şen", "team": "Duygu Asker Aksoy"},
        {"name": "Meltem", "surname": "Sözüer", "team": "Duygu Asker Aksoy"},
        {"name": "Fethiye", "surname": "Turgut", "team": "Duygu Asker Aksoy"},
        {"name": "Şahin Kul", "surname": "O.", "team": "Duygu Asker Aksoy"},
        {"name": "Ertuğrul", "surname": "Ceyhan", "team": "Duygu Asker Aksoy"},
        {"name": "İbrahim", "surname": "Şanlı", "team": "Duygu Asker Aksoy"},
        {"name": "İpek", "surname": "Apaydın", "team": "Duygu Asker Aksoy"},
        {"name": "Aslı", "surname": "Cindaruk", "team": "Duygu Asker Aksoy"},
        {"name": "Yadigar", "surname": "Külice", "team": "Duygu Asker Aksoy"},
        {"name": "Volkan", "surname": "Arslan", "team": "Duygu Asker Aksoy"},
        {"name": "Mahir", "surname": "Taşpulat", "team": "Duygu Asker Aksoy"},
        {"name": "Gözde", "surname": "Karadağ", "team": "Duygu Asker Aksoy"},
        {"name": "Rumeysa Nur", "surname": "Öztürk", "team": "Duygu Asker Aksoy"},
        {"name": "Nafiz", "surname": "Selvi", "team": "Duygu Asker Aksoy"},
        {"name": "Elif", "surname": "Kesikçiler", "team": "Duygu Asker Aksoy"},
        {"name": "Özge", "surname": "Türkoğlu", "team": "Duygu Asker Aksoy"},
        {"name": "Damla", "surname": "Ongün", "team": "Duygu Asker Aksoy"},
        {"name": "Simay", "surname": "Cihan", "team": "Duygu Asker Aksoy"},
        {"name": "Ece", "surname": "Arısoy", "team": "Duygu Asker Aksoy"},
        {"name": "Şevval", "surname": "Karaboğa", "team": "Duygu Asker Aksoy"},
        {"name": "Mehmet Emrah", "surname": "Güven", "team": "Duygu Asker Aksoy"},
        {"name": "Hatice", "surname": "Avcı", "team": "Duygu Asker Aksoy"},
        {"name": "Metin Celil", "surname": "Kuşsever", "team": "Duygu Asker Aksoy"},
        
        # SEDA ATEŞ Takımı (22 kişi)
        {"name": "Gürhan", "surname": "Aksu", "team": "Seda Ateş"},
        {"name": "Hulusi", "surname": "Karabil", "team": "Seda Ateş"},
        {"name": "Kökten Ulaş", "surname": "Birant", "team": "Seda Ateş"},
        {"name": "Elif", "surname": "Gazel", "team": "Seda Ateş"},
        {"name": "Tayyibe Alpay", "surname": "Uyanıker", "team": "Seda Ateş"},
        {"name": "Eren", "surname": "Özgül", "team": "Seda Ateş"},
        {"name": "Gaye", "surname": "Eren", "team": "Seda Ateş"},
        {"name": "Şafak", "surname": "Sipahi", "team": "Seda Ateş"},
        {"name": "Anıl", "surname": "Özçelik", "team": "Seda Ateş"},
        {"name": "Çağla Beril", "surname": "Karayel", "team": "Seda Ateş"},
        {"name": "Oğuz Serdar", "surname": "Zal", "team": "Seda Ateş"},
        {"name": "Sabri Hakan", "surname": "Dokurlar", "team": "Seda Ateş"},
        {"name": "Ahmet Rasim", "surname": "Burhanoğlu", "team": "Seda Ateş"},
        {"name": "İrem", "surname": "Baysoy", "team": "Seda Ateş"},
        {"name": "Abdülmetin", "surname": "Ürünveren", "team": "Seda Ateş"},
        {"name": "Pelin", "surname": "Baki", "team": "Seda Ateş"},
        {"name": "Esra", "surname": "Tür", "team": "Seda Ateş"},
        {"name": "Leman", "surname": "Atiker", "team": "Seda Ateş"},
        {"name": "Rabia Demir", "surname": "Köse", "team": "Seda Ateş"},
        {"name": "Naci", "surname": "Çobanoğlu", "team": "Seda Ateş"},
        {"name": "Özlem", "surname": "Demir", "team": "Seda Ateş"},
        {"name": "Rahime Gözde", "surname": "Narin", "team": "Seda Ateş"},
        
        # UTKAN DEVRİM ZEYREK Takımı (29 kişi)
        {"name": "Saray", "surname": "Kaya", "team": "Utkan Devrim Zeyrek"},
        {"name": "Ulaş", "surname": "Kesikçiler", "team": "Utkan Devrim Zeyrek"},
        {"name": "Elif Tortop", "surname": "Doğan", "team": "Utkan Devrim Zeyrek"},
        {"name": "Zeynep", "surname": "Ermeç", "team": "Utkan Devrim Zeyrek"},
        {"name": "Gül", "surname": "Nacaroğlu", "team": "Utkan Devrim Zeyrek"},
        {"name": "İrem", "surname": "Ayas", "team": "Utkan Devrim Zeyrek"},
        {"name": "Kemal", "surname": "Erkilmen", "team": "Utkan Devrim Zeyrek"},
        {"name": "Senem", "surname": "Ünal", "team": "Utkan Devrim Zeyrek"},
        {"name": "Serkan", "surname": "Salgın", "team": "Utkan Devrim Zeyrek"},
        {"name": "Didem", "surname": "Karabil", "team": "Utkan Devrim Zeyrek"},
        {"name": "Ayşe", "surname": "Tumba", "team": "Utkan Devrim Zeyrek"},
        {"name": "Nur Ayça", "surname": "Öztürk", "team": "Utkan Devrim Zeyrek"},
        {"name": "Tamer", "surname": "Güleryüz", "team": "Utkan Devrim Zeyrek"},
        {"name": "Bülent", "surname": "Erdağı", "team": "Utkan Devrim Zeyrek"},
        {"name": "Ümit", "surname": "Peşeli", "team": "Utkan Devrim Zeyrek"},
        {"name": "Aybike Asena", "surname": "Karakaya", "team": "Utkan Devrim Zeyrek"},
        {"name": "Deniz", "surname": "Genç", "team": "Utkan Devrim Zeyrek"},
        {"name": "Azad Burak", "surname": "Süne", "team": "Utkan Devrim Zeyrek"},
        {"name": "Erdem", "surname": "Kocabay", "team": "Utkan Devrim Zeyrek"},
        {"name": "Rıdvan", "surname": "Baş", "team": "Utkan Devrim Zeyrek"},
        {"name": "Fulya", "surname": "Ersayan", "team": "Utkan Devrim Zeyrek"},
        {"name": "Rasim Can", "surname": "Birol", "team": "Utkan Devrim Zeyrek"},
        {"name": "Dilan", "surname": "Kart", "team": "Utkan Devrim Zeyrek"},
        {"name": "Sıla", "surname": "Timur", "team": "Utkan Devrim Zeyrek"},
        {"name": "Amir", "surname": "Karabuğday", "team": "Utkan Devrim Zeyrek"},
        {"name": "Sude", "surname": "Kahraman", "team": "Utkan Devrim Zeyrek"},
        {"name": "Samet", "surname": "Salık", "team": "Utkan Devrim Zeyrek"},
        {"name": "Erem", "surname": "Kılıç", "team": "Utkan Devrim Zeyrek"},
        {"name": "Seda", "surname": "Baykut", "team": "Utkan Devrim Zeyrek"},
        
        # Test kullanıcısı
        {"name": "Test", "surname": "Kullanıcı", "team": None, "password": "Test567!"}
    ]
    
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
    
    print(f"\n4. Creating {len(members_data)} unique members...")
    created_count = 0
    
    for member_data in members_data:
        # Create username in lowercase format
        name_parts = member_data["name"].lower().split()
        surname_parts = member_data["surname"].lower().split()
        
        # Handle Turkish characters
        turkish_map = {'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'}
        name_clean = name_parts[0]  # Use only first part of name
        surname_clean = surname_parts[0]  # Use only first part of surname
        
        for turkish, ascii_char in turkish_map.items():
            name_clean = name_clean.replace(turkish, ascii_char)
            surname_clean = surname_clean.replace(turkish, ascii_char)
        
        username = f"{name_clean}.{surname_clean}"
        
        # Use custom password if provided, otherwise generate one
        password = member_data.get("password", generate_password())
        
        user_dict = {
            "id": str(uuid.uuid4()),
            "username": username,
            "email": f"{username}@actorclub.com",
            "password": hash_password(password),
            "name": member_data["name"],
            "surname": member_data["surname"],
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
            "board_member": member_data.get("team"),
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
                "iban": "TR12 3456 7890 1234 5678 9012 34"
            }
            await db.dues.insert_one(dues_dict)
            
        created_count += 1
        if created_count % 20 == 0:
            print(f"   Created {created_count}/{len(members_data)} members...")
    
    print(f"\n✅ Cleanup completed successfully!")
    print(f"   Total users: {2 + len(members_data)} (2 admins + {len(members_data)} members)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_database())