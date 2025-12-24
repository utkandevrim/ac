#!/usr/bin/env python3
"""
Script to update team assignments for all members in the Actor Club database.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'actor_club')

# Team assignments based on user-provided data
TEAM_ASSIGNMENTS = {
    "Tuğba Çakı": [
        "İkbal Karatepe",
        "Deniz Duygulu",
        "Nazlı Sena Eser",
        "Ergun Acar",
        "Hatice Dilan Genç",
        "Banu Gümüşkaynak",
        "Ebru Ateşdağlı",
        "Hasan Ali Erk",
        "Mustafa Deniz Özer",
        "Hüseyin Ertan Sezgin",
        "Afet Bakay",
        "Cengiz Karakuzu",
        "Nadir Şimşek",
        "Melih Ülgentay",
        "Elif Alıveren",
        "Buğra Han Acar",
        "Bekir Berk Altınay",
        "Ceyda Çınar",
        "Ahmet İşleyen",
        "Abdullah Baş",
        "Alev Atam",
        "İzem Karslı",
        "Özkan Çiğdem",
        "Berkant Oman",
        "Beren Karamustafaoğlu",
        "Demet Aslan",
        "Ece Kılıç",
        "Hazal Aktaş"
    ],
    "Duygu Asker Aksoy": [
        "Sultan Güleryüz",
        "Dilek Şahin Taş",
        "Merve Dür",
        "Sinan Telli",
        "Ebru Polat",
        "Fatma Neva Şen",
        "Meltem Sözüer",
        "Fethiye Turgut",
        "Şahin Kul O.",
        "Ertuğrul Ceyhan",
        "İbrahim Şanlı",
        "İpek Apaydın",
        "Aslı Cindaruk",
        "Yadigar Külice",
        "Volkan Arslan",
        "Mahir Taşpulat",
        "Gözde Karadağ",
        "Rumeysa Nur Öztürk",
        "Nafiz Selvi",
        "Elif Kesikçiler",
        "Özge Türkoğlu",
        "Damla Ongün",
        "Simay Cihan",
        "Ece Arısoy",
        "Şevval Karaboğa",
        "Mehmet Emrah Güven",
        "Hatice Avcı",
        "Metin Celil Kuşsever"
    ],
    "Seda Ateş": [
        "Gürhan Aksu",
        "Hulusi Karabil",
        "Kökten Ulaş Birant",
        "Elif Gazel",
        "Tayyibe Alpay Uyanıker",
        "Eren Özgül",
        "Gaye Eren",
        "Şafak Sipahi",
        "Anıl Özçelik",
        "Çağla Beril Karayel",
        "Oğuz Serdar Zal",
        "Sabri Hakan Dokurlar",
        "Ahmet Rasim Burhanoğlu",
        "İrem Baysoy",
        "Abdülmetin Ürünveren",
        "Pelin Baki",
        "Esra Tür",
        "Leman Atiker",
        "Rabia Demir Köse",
        "Naci Çobanoğlu",
        "Özlem Demir",
        "Rahime Gözde Narin"
    ],
    "Utkan Devrim Zeyrek": [
        "Saray Kaya",
        "Ulaş Kesikçiler",
        "Elif Tortop Doğan",
        "Zeynep Ermeç",
        "Gül Nacaroğlu",
        "İrem Ayas",
        "Kemal Erkilmen",
        "Senem Ünal",
        "Serkan Salgın",
        "Didem Karabil",
        "Ayşe Tumba",
        "Nur Ayça Öztürk",
        "Tamer Güleryüz",
        "Bülent Erdağı",
        "Ümit Peşeli",
        "Aybike Asena Karakaya",
        "Deniz Genç",
        "Azad Burak Süne",
        "Erdem Kocabay",
        "Rıdvan Baş",
        "Fulya Ersayan",
        "Rasim Can Birol",
        "Dilan Kart",
        "Sıla Timur",
        "Amir Karabuğday",
        "Sude Kahraman",
        "Samet Salık",
        "Erem Kılıç",
        "Seda Baykut"
    ]
}

def normalize_name(name):
    """Normalize name for comparison"""
    return name.lower().strip().replace(".", "").replace("  ", " ")

def create_name_variants(name):
    """Create possible name variants for matching"""
    variants = [name]
    parts = name.split()
    
    # Full name
    variants.append(name)
    
    # Without middle parts
    if len(parts) > 2:
        variants.append(f"{parts[0]} {parts[-1]}")
    
    # First name + surname variations
    if len(parts) >= 2:
        variants.append(f"{parts[0]} {parts[1]}")
    
    return [normalize_name(v) for v in variants]

async def update_teams():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Connecting to database...")
    
    # Get all users
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    print(f"Found {len(users)} users in database")
    
    # Create a lookup dict for quick matching
    updates_made = 0
    not_found = []
    
    for team_leader, members in TEAM_ASSIGNMENTS.items():
        print(f"\n=== Processing team: {team_leader} ===")
        print(f"Team has {len(members)} members")
        
        for member_name in members:
            member_variants = create_name_variants(member_name)
            found = False
            
            for user in users:
                full_name = f"{user.get('name', '')} {user.get('surname', '')}".strip()
                user_name_normalized = normalize_name(full_name)
                
                # Check if any variant matches
                if any(variant in user_name_normalized or user_name_normalized in variant for variant in member_variants):
                    # Update this user's team
                    result = await db.users.update_one(
                        {"id": user["id"]},
                        {"$set": {"board_member": team_leader}}
                    )
                    if result.modified_count > 0:
                        print(f"  ✓ Updated: {full_name} -> {team_leader}")
                        updates_made += 1
                    else:
                        print(f"  - Already assigned: {full_name}")
                    found = True
                    break
            
            if not found:
                not_found.append(f"{member_name} ({team_leader})")
    
    print(f"\n=== Summary ===")
    print(f"Total updates made: {updates_made}")
    
    if not_found:
        print(f"\nMembers not found in database ({len(not_found)}):")
        for name in not_found:
            print(f"  - {name}")
    
    # Show final team counts
    print("\n=== Final Team Counts ===")
    for team_leader in TEAM_ASSIGNMENTS.keys():
        count = await db.users.count_documents({"board_member": team_leader})
        print(f"  {team_leader}: {count} members")
    
    client.close()
    print("\nDone!")

if __name__ == "__main__":
    asyncio.run(update_teams())
