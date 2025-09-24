import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import uuid
from datetime import datetime, timezone
import bcrypt

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# Member data
board_members_data = {
    "Tuğba Çakı": [
        "İkbal Karatepe", "Deniz Duygulu", "Nazlı Sena Eser", "Ergun Acar", "Hatice Dilan Genç",
        "Banu Gümüşkaynak", "Ebru Ateşdağlı", "Hasan Ali Erk", "Mustafa Deniz Özer", "Hüseyin Ertan Sezgin",
        "Afet Bakay", "Cengiz Karakuzu", "Nadir Şimşek", "Melih Ülgentay", "Elif Alıveren",
        "Buğra Han Acar", "Bekir Berk Altınay", "Ceyda Çınar", "Ahmet İşleyen", "Abdullah Baş",
        "Alev Atam", "İzem Karslı", "Özkan Çiğdem", "Berkant Oman", "Beren Karamustafaoğlu",
        "Demet Aslan", "Ece Kılıç", "Hazal Aktaş"
    ],
    "Duygu Asker Aksoy": [
        "Sultan Güleryüz", "Dilek Şahin Taş", "Merve Dür", "Sinan Telli", "Ebru Polat",
        "Fatma Neva Şen", "Meltem Sözüer", "Fethiye Turgut", "Şahin Kul O.", "Ertuğrul Ceyhan",
        "İbrahim Şanlı", "İpek Apaydın", "Aslı Cindaruk", "Yadigar Külice", "Volkan Arslan",
        "Mahir Taşpulat", "Gözde Karadağ", "Rumeysa Nur Öztürk", "Nafiz Selvi", "Elif Kesikçiler",
        "Özge Türkoğlu", "Damla Ongün", "Simay Cihan", "Ece Arısoy", "Şevval Karaboğa",
        "Mehmet Emrah Güven", "Hatice Avcı", "Metin Celil Kuşsever"
    ],
    "Seda Ateş": [
        "Gürhan Aksu", "Hulusi Karabil", "Kökten Ulaş Birant", "Elif Gazel", "Tayyibe Alpay Uyanıker",
        "Eren Özgül", "Gaye Eren", "Şafak Sipahi", "Anıl Özçelik", "Çağla Beril Karayel",
        "Oğuz Serdar Zal", "Sabri Hakan Dokurlar", "Ahmet Rasim Burhanoğlu", "İrem Baysoy", "Abdülmetin Ürünveren",
        "Pelin Baki", "Esra Tür", "Leman Atiker", "Rabia Demir Köse", "Naci Çobanoğlu",
        "Özlem Demir", "Rahime Gözde Narin"
    ],
    "Utkan Devrim Zeyrek": [
        "Saray Kaya", "Ulaş Kesikçiler", "Elif Tortop Doğan", "Zeynep Ermeç", "Gül Nacaroğlu",
        "İrem Ayas", "Kemal Erkilmen", "Senem Ünal", "Serkan Salgın", "Didem Karabil",
        "Ayşe Tumba", "Nur Ayça Öztürk", "Tamer Güleryüz", "Bülent Erdağı", "Ümit Peşeli",
        "Aybike Asena Karakaya", "Deniz Genç", "Azad Burak Süne", "Erdem Kocabay", "Rıdvan Baş",
        "Fulya Ersayan", "Rasim Can Birol", "Dilan Kart", "Sıla Timur", "Amir Karabuğday",
        "Sude Kahraman", "Samet Salık", "Erem Kılıç", "Seda Baykut"
    ]
}

async def populate_members():
    try:
        print("Starting member population...")
        
        # Clear existing members (keep admins)
        await db.users.delete_many({"is_admin": False})
        print("Cleared existing members")
        
        member_count = 0
        
        for board_member, members in board_members_data.items():
            print(f"\nAdding members for {board_member}...")
            
            for member_name in members:
                # Split name into first and last name
                name_parts = member_name.split(' ')
                if len(name_parts) >= 2:
                    first_name = name_parts[0]
                    last_name = ' '.join(name_parts[1:])
                else:
                    first_name = member_name
                    last_name = ""
                
                # Create email from name
                email = f"{first_name.lower().replace(' ', '')}.{last_name.lower().replace(' ', '')}@actorclub.com"
                
                # Member data
                member_data = {
                    "id": str(uuid.uuid4()),
                    "email": email,
                    "password": hash_password("Actor2024!"),
                    "name": first_name,
                    "surname": last_name,
                    "phone": f"0555{member_count:03d}{(member_count % 100):02d}{(member_count % 10):02d}",
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
                    "board_member": board_member,
                    "is_admin": False,
                    "is_approved": True,
                    "created_at": datetime.now(timezone.utc)
                }
                
                await db.users.insert_one(member_data)
                
                # Create dues for the member
                months = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"]
                current_year = datetime.now().year
                
                for month in months:
                    dues_data = {
                        "id": str(uuid.uuid4()),
                        "user_id": member_data["id"],
                        "month": month,
                        "year": current_year,
                        "amount": 1000,
                        "is_paid": member_count % 3 == 0,  # Randomly mark some as paid
                        "payment_date": datetime.now(timezone.utc) if member_count % 3 == 0 else None,
                        "iban": "TR12 3456 7890 1234 5678 9012 34"
                    }
                    await db.dues.insert_one(dues_data)
                
                member_count += 1
                print(f"  Added: {member_name} ({email})")
        
        print(f"\n✅ Successfully added {member_count} members!")
        print("\n📋 Member distribution:")
        for board_member, members in board_members_data.items():
            print(f"  {board_member}: {len(members)} members")
        
        print(f"\n🔑 Default password for all members: Actor2024!")
        print("💳 Default IBAN: TR12 3456 7890 1234 5678 9012 34")
        
    except Exception as e:
        print(f"Error populating members: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(populate_members())