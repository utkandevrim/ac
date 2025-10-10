#!/usr/bin/env python3
"""
Quick test for QR code verification fix
"""

import requests
import json
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def test_qr_fix():
    print("🔍 Testing QR Code Verification Fix")
    print("=" * 50)
    
    session = requests.Session()
    
    # Login as super admin
    super_admin_creds = {"username": "super.admin", "password": "AdminActor2024!"}
    
    try:
        response = session.post(
            f"{API_BASE}/auth/login",
            json=super_admin_creds,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            admin_token = data['access_token']
            print(f"✅ Logged in as {data['user']['name']} {data['user']['surname']}")
        else:
            print(f"❌ Login failed: HTTP {response.status_code}")
            return
            
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return
    
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    # Get a regular user
    try:
        users_response = session.get(f"{API_BASE}/users", headers=headers)
        if users_response.status_code == 200:
            users = users_response.json()
            regular_user = next((u for u in users if not u.get('is_admin', False)), None)
            
            if regular_user:
                user_id = regular_user['id']
                username = regular_user['username']
                print(f"🧪 Testing with user: {username}")
                
                # Check user's dues status
                dues_response = session.get(f"{API_BASE}/dues/{user_id}", headers=headers)
                if dues_response.status_code == 200:
                    dues_list = dues_response.json()
                    
                    # Current month logic
                    current_month_num = datetime.now().month
                    current_year = datetime.now().year
                    
                    month_names = {
                        9: "Eylül", 10: "Ekim", 11: "Kasım", 12: "Aralık",
                        1: "Ocak", 2: "Şubat", 3: "Mart", 4: "Nisan", 5: "Mayıs", 6: "Haziran"
                    }
                    current_month_name = month_names.get(current_month_num)
                    
                    print(f"📅 Current month: {current_month_num} ({current_month_name}), Year: {current_year}")
                    print(f"📋 User has {len(dues_list)} dues:")
                    
                    eligible_dues = 0
                    paid_dues = 0
                    
                    for due in dues_list:
                        due_month = due.get('month')
                        due_year = due.get('year')
                        is_paid = due.get('is_paid', False)
                        
                        # Check if this is current month (should be excluded)
                        is_current_month = (due_year == current_year and due_month == current_month_name)
                        
                        if is_current_month:
                            print(f"   ⏭️  {due_month}/{due_year} - {'PAID' if is_paid else 'UNPAID'} (CURRENT MONTH - EXCLUDED)")
                        else:
                            eligible_dues += 1
                            if is_paid:
                                paid_dues += 1
                                print(f"   ✅ {due_month}/{due_year} - PAID")
                            else:
                                print(f"   ❌ {due_month}/{due_year} - UNPAID")
                    
                    print(f"📊 Eligibility: {paid_dues}/{eligible_dues} eligible dues are paid")
                    
                    # If user doesn't have all dues paid, mark some as paid for testing
                    if paid_dues < eligible_dues:
                        print("🔧 Marking all eligible dues as paid for testing...")
                        for due in dues_list:
                            due_month = due.get('month')
                            due_year = due.get('year')
                            is_current_month = (due_year == current_year and due_month == current_month_name)
                            
                            if not is_current_month and not due.get('is_paid', False):
                                pay_response = session.put(f"{API_BASE}/dues/{due['id']}/pay", headers=headers)
                                if pay_response.status_code == 200:
                                    print(f"   ✅ Marked {due_month}/{due_year} as paid")
                    
                    # Get campaigns
                    campaigns_response = session.get(f"{API_BASE}/campaigns")
                    if campaigns_response.status_code == 200:
                        campaigns = campaigns_response.json()
                        if campaigns:
                            campaign_id = campaigns[0]['id']
                            campaign_title = campaigns[0]['title']
                            print(f"🎯 Using campaign: {campaign_title}")
                            
                            # Try to generate QR code
                            print("🔄 Generating QR code...")
                            qr_response = session.post(
                                f"{API_BASE}/campaigns/{campaign_id}/generate-qr",
                                headers=headers
                            )
                            
                            print(f"📡 QR Generation Response: HTTP {qr_response.status_code}")
                            
                            if qr_response.status_code == 200:
                                qr_data = qr_response.json()
                                qr_token = qr_data.get('qr_token')
                                print(f"✅ QR Code generated successfully!")
                                print(f"🎫 Token: {qr_token[:20]}...")
                                print(f"⏰ Expires: {qr_data.get('expires_at')}")
                                
                                # Verify QR code
                                print("🔍 Verifying QR code...")
                                verify_response = session.get(f"{API_BASE}/verify-qr/{qr_token}")
                                
                                if verify_response.status_code == 200:
                                    verify_data = verify_response.json()
                                    is_valid = verify_data.get('valid', False)
                                    message = verify_data.get('message', '')
                                    
                                    if is_valid:
                                        print(f"✅ QR VERIFICATION SUCCESS!")
                                        print(f"📝 Message: '{message}'")
                                        member_info = verify_data.get('member', {})
                                        print(f"👤 Member: {member_info.get('name')} {member_info.get('surname')}")
                                        print("🎉 BUG FIXED! QR code verification is now working correctly!")
                                    else:
                                        print(f"❌ QR VERIFICATION FAILED!")
                                        print(f"📝 Message: '{message}'")
                                        print(f"🔍 Reason: '{verify_data.get('reason', '')}'")
                                        print("🐛 Bug still exists - QR verification failing for eligible users")
                                else:
                                    print(f"❌ QR Verification request failed: HTTP {verify_response.status_code}")
                                    
                            elif qr_response.status_code == 403:
                                print(f"❌ QR Generation blocked: {qr_response.text}")
                                print("🐛 Bug still exists - eligible user blocked from QR generation")
                            else:
                                print(f"❌ QR Generation failed: HTTP {qr_response.status_code}: {qr_response.text}")
                        else:
                            print("❌ No campaigns found")
                    else:
                        print(f"❌ Failed to get campaigns: HTTP {campaigns_response.status_code}")
                else:
                    print(f"❌ Failed to get user dues: HTTP {dues_response.status_code}")
            else:
                print("❌ No regular user found")
        else:
            print(f"❌ Failed to get users: HTTP {users_response.status_code}")
            
    except Exception as e:
        print(f"❌ Test error: {str(e)}")

if __name__ == "__main__":
    test_qr_fix()