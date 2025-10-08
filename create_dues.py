#!/usr/bin/env python3

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from bson import ObjectId
import uuid

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.actorclub

async def create_dues_for_users():
    """Create dues for all users who don't have dues"""
    
    # Get all users
    users = await db.users.find({}).to_list(length=None)
    print(f"Found {len(users)} users")
    
    months = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"]
    current_year = datetime.now().year
    
    created_count = 0
    
    for user in users:
        user_id = user.get('id')
        if not user_id:
            continue
            
        # Check if user already has dues
        existing_dues = await db.dues.find_one({"user_id": user_id})
        if existing_dues:
            print(f"User {user.get('name', 'Unknown')} {user.get('surname', '')} already has dues")
            continue
        
        # Create dues for this user
        for month in months:
            dues_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "month": month,
                "year": current_year,
                "amount": 1000,
                "is_paid": False,
                "payment_date": None,
                "created_at": datetime.now(timezone.utc)
            }
            
            await db.dues.insert_one(dues_data)
        
        print(f"Created dues for {user.get('name', 'Unknown')} {user.get('surname', '')}")
        created_count += 1
    
    print(f"Created dues for {created_count} users")

if __name__ == "__main__":
    asyncio.run(create_dues_for_users())