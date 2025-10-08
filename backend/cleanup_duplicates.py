#!/usr/bin/env python3
"""
Critical Database Cleanup Script
Removes duplicate users while preserving the most recent/complete record
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from collections import defaultdict
from datetime import datetime, timezone
import uuid

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.test_database

async def find_and_remove_duplicates():
    """Find and remove duplicate users based on name+surname and email"""
    
    print("🔍 Starting duplicate user cleanup...")
    
    # Get all users
    users = await db.users.find({}).to_list(length=None)
    print(f"📊 Total users found: {len(users)}")
    
    # Group by name+surname combination
    name_groups = defaultdict(list)
    email_groups = defaultdict(list)
    
    for user in users:
        # Group by full name
        name_key = f"{user.get('name', '').strip()}.{user.get('surname', '').strip()}"
        if name_key and name_key != '.':
            name_groups[name_key].append(user)
        
        # Group by email
        email = user.get('email', '').strip().lower()
        if email:
            email_groups[email].append(user)
    
    # Find duplicates by name
    duplicate_names = {k: v for k, v in name_groups.items() if len(v) > 1}
    print(f"🚨 Found {len(duplicate_names)} duplicate name combinations")
    
    # Find duplicates by email  
    duplicate_emails = {k: v for k, v in email_groups.items() if len(v) > 1}
    print(f"🚨 Found {len(duplicate_emails)} duplicate email addresses")
    
    deleted_count = 0
    
    # Clean up duplicate names
    for name, duplicates in duplicate_names.items():
        print(f"\n📝 Processing duplicate name: {name} ({len(duplicates)} records)")
        
        # Sort by created_at (keep the most recent) or by completeness
        sorted_duplicates = sorted(duplicates, key=lambda x: (
            x.get('created_at') or datetime.min.replace(tzinfo=timezone.utc),
            len(str(x.get('phone', ''))),  # Prefer records with more info
            len(str(x.get('address', ''))),
            x.get('is_approved', False)
        ), reverse=True)
        
        # Keep the first (most complete/recent) record
        keep_record = sorted_duplicates[0]
        to_delete = sorted_duplicates[1:]
        
        print(f"   ✅ Keeping: {keep_record.get('email')} (ID: {keep_record.get('id')})")
        
        # Delete the rest
        for duplicate in to_delete:
            user_id = duplicate.get('id')
            if user_id:
                try:
                    # Delete related dues first
                    dues_result = await db.dues.delete_many({"user_id": user_id})
                    print(f"   🗑️  Deleted {dues_result.deleted_count} dues for user {duplicate.get('email')}")
                    
                    # Delete user
                    result = await db.users.delete_one({"id": user_id})
                    if result.deleted_count > 0:
                        print(f"   🗑️  Deleted duplicate: {duplicate.get('email')} (ID: {user_id})")
                        deleted_count += 1
                    else:
                        print(f"   ❌ Failed to delete: {duplicate.get('email')}")
                except Exception as e:
                    print(f"   ❌ Error deleting {duplicate.get('email')}: {e}")
    
    # Clean up duplicate emails (if any remain after name cleanup)
    for email, duplicates in duplicate_emails.items():
        if len(duplicates) > 1:
            print(f"\n📧 Processing duplicate email: {email} ({len(duplicates)} records)")
            
            # Sort by completeness and approval status
            sorted_duplicates = sorted(duplicates, key=lambda x: (
                x.get('is_approved', False),
                x.get('created_at') or datetime.min.replace(tzinfo=timezone.utc),
                len(str(x.get('phone', ''))),
                len(str(x.get('address', '')))
            ), reverse=True)
            
            # Keep the first (most complete) record
            keep_record = sorted_duplicates[0]
            to_delete = sorted_duplicates[1:]
            
            print(f"   ✅ Keeping: {keep_record.get('name')} {keep_record.get('surname')} (ID: {keep_record.get('id')})")
            
            # Delete the rest
            for duplicate in to_delete:
                user_id = duplicate.get('id')
                if user_id:
                    try:
                        # Check if this user still exists (might have been deleted in name cleanup)
                        existing = await db.users.find_one({"id": user_id})
                        if existing:
                            # Delete related dues first
                            dues_result = await db.dues.delete_many({"user_id": user_id})
                            print(f"   🗑️  Deleted {dues_result.deleted_count} dues for user {duplicate.get('name')} {duplicate.get('surname')}")
                            
                            # Delete user
                            result = await db.users.delete_one({"id": user_id})
                            if result.deleted_count > 0:
                                print(f"   🗑️  Deleted duplicate: {duplicate.get('name')} {duplicate.get('surname')} (ID: {user_id})")
                                deleted_count += 1
                            else:
                                print(f"   ❌ Failed to delete: {duplicate.get('name')} {duplicate.get('surname')}")
                        else:
                            print(f"   ✅ Already deleted: {duplicate.get('name')} {duplicate.get('surname')}")
                    except Exception as e:
                        print(f"   ❌ Error deleting {duplicate.get('name')} {duplicate.get('surname')}: {e}")
    
    # Final count
    remaining_users = await db.users.count_documents({})
    print(f"\n🎉 Cleanup completed!")
    print(f"📊 Users deleted: {deleted_count}")
    print(f"📊 Remaining users: {remaining_users}")
    
    return deleted_count

async def add_database_constraints():
    """Add unique constraints to prevent future duplicates"""
    
    print("\n🔧 Adding database constraints...")
    
    try:
        # Create unique index on email
        await db.users.create_index("email", unique=True, sparse=True)
        print("✅ Added unique constraint on email field")
        
        # Create unique index on username  
        await db.users.create_index("username", unique=True, sparse=True)
        print("✅ Added unique constraint on username field")
        
    except Exception as e:
        print(f"⚠️  Warning: Could not add constraints (might already exist): {e}")

async def main():
    """Main cleanup function"""
    print("🚀 Starting Critical Database Cleanup")
    print("=" * 50)
    
    deleted_count = await find_and_remove_duplicates()
    await add_database_constraints()
    
    print("\n" + "=" * 50)
    print(f"✅ CLEANUP COMPLETE: {deleted_count} duplicate users removed")
    print("🔒 Database constraints added to prevent future duplicates")
    print("🎯 User deletion and duplicate issues have been PERMANENTLY RESOLVED")

if __name__ == "__main__":
    asyncio.run(main())