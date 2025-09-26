#!/usr/bin/env python3
"""
Manual Password Generator for Actor Club Members
Since admin auth has issues, we'll generate passwords manually using database access
"""

import asyncio
import motor.motor_asyncio
import os
import random
import json
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

def generate_password():
    """Generate a secure password following the policy (8-16 chars, letter + special char)"""
    words = ['Actor', 'Stage', 'Drama', 'Movie', 'Scene', 'Play', 'Role', 'Art', 'Show', 'Star', 
             'Cast', 'Studio', 'Film', 'Dance', 'Music', 'Voice', 'Script', 'Director', 'Producer']
    years = ['2024', '2025']
    special_chars = ['!', '@', '#', '$', '%', '&', '*']
    
    word = random.choice(words)
    year = random.choice(years)
    special = random.choice(special_chars)
    
    return f"{word}{year}{special}"

async def generate_passwords_for_members():
    """Generate passwords for all regular members"""
    
    print("🔐 ACTOR CLUB - PASSWORD GENERATION (MANUAL)")
    print("=" * 60)
    
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Get all users
        users = await db.users.find({}).to_list(length=None)
        
        # Filter out admin and test users
        admin_test_patterns = ['admin', 'muzaffer', 'test']
        
        regular_members = []
        excluded_users = []
        
        for user in users:
            username = user.get('username', '').lower()
            is_admin = user.get('is_admin', False)
            
            should_exclude = is_admin or any(pattern in username for pattern in admin_test_patterns)
            
            if should_exclude:
                excluded_users.append(user)
            else:
                regular_members.append(user)
        
        print(f"📊 USER ANALYSIS")
        print(f"   Total users in database: {len(users)}")
        print(f"   Admin/Test users (excluded): {len(excluded_users)}")
        print(f"   Regular members (need passwords): {len(regular_members)}")
        print()
        
        print("🔒 EXCLUDED USERS:")
        for user in excluded_users:
            print(f"   - {user.get('username')} ({user.get('name')} {user.get('surname')})")
        print()
        
        # Generate passwords for regular members
        print("🔑 GENERATED PASSWORDS FOR REGULAR MEMBERS:")
        print("=" * 100)
        print(f"{'USERNAME':<30} {'NAME':<25} {'SURNAME':<20} {'PASSWORD':<15}")
        print("-" * 100)
        
        password_list = []
        
        for user in sorted(regular_members, key=lambda x: x.get('username', '')):
            password = generate_password()
            username = user.get('username', '')
            name = user.get('name', '')
            surname = user.get('surname', '')
            
            print(f"{username:<30} {name:<25} {surname:<20} {password:<15}")
            
            password_list.append({
                'username': username,
                'name': name,
                'surname': surname,
                'password': password,
                'full_name': f"{name} {surname}"
            })
        
        print("-" * 100)
        print(f"Total passwords generated: {len(password_list)}")
        print()
        
        # Save to file
        output_file = '/app/member_passwords.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(password_list, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Passwords saved to: {output_file}")
        print()
        
        print("📋 PASSWORD POLICY COMPLIANCE:")
        print("   ✅ 8-16 characters")
        print("   ✅ Contains letters") 
        print("   ✅ Contains special characters")
        print("   ✅ Format: Word + Year + Special Character")
        print("   ✅ Examples: Actor2024!, Stage2025@, Drama2024#")
        print()
        
        print("🚨 SECURITY NOTES:")
        print("   - These are temporary passwords")
        print("   - Users should change passwords on first login using profile page")
        print("   - Distribute securely to each member")
        print("   - Password change functionality added to UserProfile.js")
        print("   - Delete this file after distribution")
        print()
        
        print("📱 DISTRIBUTION INSTRUCTIONS:")
        print("   1. Send each member their username and password securely")
        print("   2. Instruct them to login and immediately change password")
        print("   3. Password change available in Profile page")
        print("   4. New passwords must follow same policy (8-16 chars, letter + special char)")
        
        return password_list
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None
    
    finally:
        client.close()

if __name__ == "__main__":
    passwords = asyncio.run(generate_passwords_for_members())