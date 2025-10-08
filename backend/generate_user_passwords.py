#!/usr/bin/env python3
"""
User Password Generator Script
Generates secure passwords for all non-admin users
"""

import asyncio
import os
import secrets
import string
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from datetime import datetime

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.test_database

def generate_secure_password(length=10):
    """Generate a secure password with mixed characters"""
    # Define character sets
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase  
    digits = string.digits
    special_chars = "!@#$%^&*"
    
    # Ensure at least one character from each set
    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits),
        secrets.choice(special_chars)
    ]
    
    # Fill the rest with random characters from all sets
    all_chars = lowercase + uppercase + digits + special_chars
    for _ in range(length - 4):
        password.append(secrets.choice(all_chars))
    
    # Shuffle to avoid predictable patterns
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

async def generate_passwords_for_users():
    """Generate passwords for all non-admin users"""
    
    print("🔐 Starting password generation for all non-admin users...")
    print("=" * 60)
    
    # Get all non-admin users
    users = await db.users.find({
        "is_admin": {"$ne": True}  # Not admin users
    }).to_list(length=None)
    
    print(f"📊 Found {len(users)} non-admin users")
    
    # Store password data
    password_data = []
    updated_count = 0
    
    print("\n🔑 Generating and updating passwords:")
    print("-" * 60)
    
    for user in users:
        try:
            # Generate secure password
            new_password = generate_secure_password(10)
            
            # Hash the password
            hashed_password = hash_password(new_password)
            
            # Update user password in database
            result = await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"password": hashed_password}}
            )
            
            if result.modified_count > 0:
                # Store for output
                password_data.append({
                    "name": f"{user.get('name', '')} {user.get('surname', '')}".strip(),
                    "username": user.get("username", user.get("email", "")),
                    "email": user.get("email", ""),
                    "password": new_password
                })
                
                print(f"✅ {user.get('name', '')} {user.get('surname', ''):<20} | {user.get('username', ''):<25} | {new_password}")
                updated_count += 1
            else:
                print(f"❌ Failed to update: {user.get('name', '')} {user.get('surname', '')}")
                
        except Exception as e:
            print(f"❌ Error processing {user.get('name', '')} {user.get('surname', '')}: {e}")
    
    print("\n" + "=" * 60)
    print(f"✅ Password generation completed!")
    print(f"📊 Users updated: {updated_count}")
    print(f"📊 Total passwords generated: {len(password_data)}")
    
    # Save to file for user
    output_file = "/app/backend/user_passwords.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("ACTOR CLUB - USER PASSWORDS\n")
        f.write("=" * 50 + "\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total Users: {len(password_data)}\n")
        f.write("=" * 50 + "\n\n")
        
        f.write(f"{'NAME':<25} | {'USERNAME':<25} | {'EMAIL':<30} | {'PASSWORD':<12}\n")
        f.write("-" * 95 + "\n")
        
        for data in sorted(password_data, key=lambda x: x['name']):
            f.write(f"{data['name']:<25} | {data['username']:<25} | {data['email']:<30} | {data['password']:<12}\n")
    
    print(f"💾 Password list saved to: {output_file}")
    
    return password_data

async def main():
    """Main function"""
    print("🚀 Actor Club Password Generator")
    print("Generating secure passwords for all non-admin users...")
    print()
    
    password_data = await generate_passwords_for_users()
    
    print("\n" + "🎯 SUMMARY")
    print("=" * 30)
    print(f"✅ {len(password_data)} users updated with new passwords")
    print("💾 Password file created: /app/backend/user_passwords.txt")
    print("🔐 All passwords are 10 characters with mixed case, numbers, and symbols")
    print("⚠️  Please share passwords securely with users")

if __name__ == "__main__":
    asyncio.run(main())