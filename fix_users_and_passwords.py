#!/usr/bin/env python3
"""
Fix user passwords and usernames for Actor Club Members
1. Update usernames to English characters
2. Generate and set new passwords
3. Create password list for distribution
"""

import asyncio
import motor.motor_asyncio
import os
import bcrypt
import random
import json
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

def generate_password():
    """Generate a secure password following the policy"""
    words = ['Actor', 'Stage', 'Drama', 'Movie', 'Scene', 'Play', 'Role', 'Art', 'Show', 'Star', 
             'Cast', 'Studio', 'Film', 'Dance', 'Music', 'Voice', 'Script', 'Director', 'Producer']
    years = ['2024', '2025']
    special_chars = ['!', '@', '#', '$', '%', '&', '*']
    
    word = random.choice(words)
    year = random.choice(years)
    special = random.choice(special_chars)
    
    return f"{word}{year}{special}"

def fix_turkish_characters(username):
    """Convert Turkish characters to English"""
    replacements = {
        'ç': 'c', 'Ç': 'C',
        'ğ': 'g', 'Ğ': 'G', 
        'ı': 'i', 'I': 'I',
        'İ': 'I', 'i̇': 'i',
        'ö': 'o', 'Ö': 'O',
        'ş': 's', 'Ş': 'S',
        'ü': 'u', 'Ü': 'U'
    }
    
    for tr_char, en_char in replacements.items():
        username = username.replace(tr_char, en_char)
    
    return username

async def fix_users_and_passwords():
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print('🔧 KULLANICI ADLARI VE ŞİFRELER DÜZELTİLİYOR')
    print('=' * 60)
    
    try:
        # Get all users
        users = await db.users.find({}).to_list(length=None)
        
        # Filter regular users
        admin_test_patterns = ['admin', 'muzaffer', 'test', 'super']
        regular_users = []
        admin_users = []
        
        for user in users:
            username = user.get('username', '').lower()
            is_admin = user.get('is_admin', False)
            
            should_exclude = is_admin or any(pattern in username for pattern in admin_test_patterns)
            
            if should_exclude:
                admin_users.append(user)
            else:
                regular_users.append(user)
        
        print(f'Toplam kullanıcı: {len(users)}')
        print(f'Admin/Test kullanıcıları: {len(admin_users)}')
        print(f'Düzeltilecek regular üyeler: {len(regular_users)}')
        print()
        
        # Fix users and generate passwords
        password_list = []
        fixed_count = 0
        
        print('🔄 KULLANICILAR DÜZELTİLİYOR...')
        print('=' * 80)
        print(f'{'#':<3} {'ESKİ USERNAME':<30} {'YENİ USERNAME':<30} {'PASSWORD':<15}')
        print('-' * 80)
        
        for i, user in enumerate(sorted(regular_users, key=lambda x: x.get('username', '')), 1):
            old_username = user.get('username', '')
            name = user.get('name', '')
            surname = user.get('surname', '')
            
            # Fix username - convert Turkish characters
            new_username = fix_turkish_characters(old_username)
            
            # Generate new password
            new_password = generate_password()
            password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Update user in database
            await db.users.update_one(
                {'_id': user['_id']},
                {
                    '$set': {
                        'username': new_username,
                        'password': password_hash
                    }
                }
            )
            
            print(f'{i:<3} {old_username:<30} {new_username:<30} {new_password:<15}')
            
            password_list.append({
                'username': new_username,
                'name': name,
                'surname': surname,
                'password': new_password,
                'full_name': f"{name} {surname}",
                'old_username': old_username
            })
            
            fixed_count += 1
        
        print('-' * 80)
        print(f'✅ {fixed_count} kullanıcı başarıyla düzeltildi!')
        print()
        
        # Save password list
        output_file = '/app/fixed_member_passwords.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(password_list, f, ensure_ascii=False, indent=2)
        
        print(f'💾 Şifreler kaydedildi: {output_file}')
        print()
        
        print('📋 ÖZEİT:')
        print(f'  - Toplam düzeltilen üye: {len(password_list)}')
        print(f'  - Tüm kullanıcı adları İngilizce karakterlere çevrildi')
        print(f'  - Tüm üyeler için yeni güvenli şifreler oluşturuldu')
        print(f'  - Şifre politikası: 8-16 karakter, harf + özel karakter')
        print(f'  - Format: Kelime + Yıl + Özel Karakter')
        print()
        
        print('🔐 ŞİFRE TEST EDİLİYOR...')
        
        # Test first 3 passwords
        test_users = password_list[:3]
        for test_user in test_users:
            username = test_user['username']
            password = test_user['password']
            
            # Get user from database
            db_user = await db.users.find_one({'username': username})
            if db_user:
                password_hash = db_user.get('password', '')
                if bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
                    print(f'✅ {username} -> {password} (ÇALIŞIYOR)')
                else:
                    print(f'❌ {username} -> {password} (ÇALIŞMIYOR)')
        
        print()
        print('🚨 GÜVENLİK UYARILARI:')
        print('  - Bu şifreler geçicidir')
        print('  - Üyeler ilk girişte değiştirmelidir')
        print('  - Güvenli şekilde dağıtın')
        print('  - Dağıtım sonrası bu dosyaları silin')
        
        return password_list
        
    except Exception as e:
        print(f'❌ Hata: {str(e)}')
        return None
    
    finally:
        client.close()

if __name__ == "__main__":
    passwords = asyncio.run(fix_users_and_passwords())
    if passwords:
        print(f'\\n🎉 İşlem tamamlandı! {len(passwords)} üye için şifreler hazır.')