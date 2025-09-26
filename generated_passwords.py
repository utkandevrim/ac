#!/usr/bin/env python3
"""
Password Generator for Actor Club Members
Generates secure passwords for all regular members (excluding admin/test users)
"""

import requests
import json
import os
import random
import string
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def generate_password():
    """Generate a secure password following the policy (8-16 chars, letter + special char)"""
    words = ['Actor', 'Stage', 'Drama', 'Movie', 'Scene', 'Play', 'Role', 'Art', 'Show', 'Star']
    years = ['2024', '2025']
    special_chars = ['!', '@', '#', '$', '%', '&', '*']
    
    word = random.choice(words)
    year = random.choice(years)
    special = random.choice(special_chars)
    
    return f"{word}{year}{special}"

def get_all_users_and_generate_passwords():
    """Get all users and generate passwords for regular members"""
    
    print("🔐 ACTOR CLUB - PASSWORD GENERATION")
    print("=" * 50)
    
    # Authenticate as admin
    session = requests.Session()
    admin_creds = {"username": "admin.yonetici", "password": "ActorClub2024!"}
    
    try:
        response = session.post(
            f"{API_BASE}/auth/login",
            json=admin_creds,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            print("❌ Could not authenticate as admin")
            return
        
        admin_token = response.json()['access_token']
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        # Get all users
        users_response = session.get(f"{API_BASE}/users", headers=headers)
        if users_response.status_code != 200:
            print("❌ Could not fetch users")
            return
        
        all_users = users_response.json()
        
        # Filter out admin and test users
        admin_test_usernames = [
            'admin.yonetici', 
            'muzaffer.isgoren', 
            'test.kullanici', 
            'test.kullanıcı'
        ]
        
        regular_members = []
        excluded_users = []
        
        for user in all_users:
            username = user.get('username', '')
            is_admin = user.get('is_admin', False)
            
            if username.lower() in [u.lower() for u in admin_test_usernames] or is_admin:
                excluded_users.append(user)
            else:
                regular_members.append(user)
        
        print(f"📊 USER ANALYSIS")
        print(f"   Total users in database: {len(all_users)}")
        print(f"   Admin/Test users (excluded): {len(excluded_users)}")
        print(f"   Regular members (need passwords): {len(regular_members)}")
        print()
        
        print("🔒 EXCLUDED USERS:")
        for user in excluded_users:
            print(f"   - {user.get('username')} ({user.get('name')} {user.get('surname')})")
        print()
        
        # Generate passwords for regular members
        print("🔑 GENERATED PASSWORDS FOR REGULAR MEMBERS:")
        print("=" * 80)
        print(f"{'USERNAME':<25} {'NAME':<20} {'SURNAME':<15} {'PASSWORD':<15}")
        print("-" * 80)
        
        password_list = []
        
        for user in sorted(regular_members, key=lambda x: x.get('username', '')):
            password = generate_password()
            username = user.get('username', '')
            name = user.get('name', '')
            surname = user.get('surname', '')
            
            print(f"{username:<25} {name:<20} {surname:<15} {password:<15}")
            
            password_list.append({
                'username': username,
                'name': name,
                'surname': surname,
                'password': password
            })
        
        print("-" * 80)
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
        print()
        
        print("🚨 SECURITY NOTES:")
        print("   - These are temporary passwords")
        print("   - Users should change passwords on first login")
        print("   - Distribute securely to each member")
        print("   - Delete this file after distribution")
        
        return password_list
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

if __name__ == "__main__":
    passwords = get_all_users_and_generate_passwords()