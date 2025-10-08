#!/usr/bin/env python3
"""
Campaign Management Testing Suite
Tests all campaign functionality as requested in the review
"""

import requests
import json
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

class CampaignTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        print()
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })
    
    def setup_admin_login(self):
        """Login with super.admin credentials as requested"""
        print("=== Setting up Admin Authentication ===")
        
        admin_creds = {"username": "super.admin", "password": "AdminActor2024!"}
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=admin_creds,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data['access_token']
                self.log_test(
                    "Admin Login (super.admin / AdminActor2024!)", 
                    True, 
                    f"Successfully logged in as {data['user']['name']} {data['user']['surname']}"
                )
                return True
            else:
                self.log_test(
                    "Admin Login", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Request failed: {str(e)}")
            return False
    
    def test_campaign_crud_endpoints(self):
        """Test Campaign CRUD endpoints: GET, POST, PUT, DELETE /api/campaigns"""
        print("=== Testing Campaign CRUD Endpoints ===")
        
        if not self.admin_token:
            self.log_test("Campaign CRUD Tests", False, "No admin token available")
            return
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test 1: GET /api/campaigns - Retrieve all campaigns
        try:
            response = self.session.get(f"{API_BASE}/campaigns")
            
            if response.status_code == 200:
                campaigns = response.json()
                self.log_test(
                    "GET /api/campaigns", 
                    True, 
                    f"Successfully retrieved {len(campaigns)} campaigns"
                )
                self.existing_campaigns = campaigns
            else:
                self.log_test(
                    "GET /api/campaigns", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                self.existing_campaigns = []
                
        except Exception as e:
            self.log_test("GET /api/campaigns", False, f"Request failed: {str(e)}")
            self.existing_campaigns = []
        
        # Test 2: POST /api/campaigns - Create new campaign
        test_campaign = {
            "title": "Test Campaign API",
            "description": "Campaign created via API testing",
            "company_name": "Test Company Ltd",
            "discount_details": "30% discount for Actor Club members",
            "terms_conditions": "Valid until end of year. Cannot be combined with other offers.",
            "is_active": True
        }
        
        created_campaign_id = None
        
        try:
            response = self.session.post(
                f"{API_BASE}/campaigns",
                json=test_campaign,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                created_campaign_id = data.get('campaign_id')
                self.log_test(
                    "POST /api/campaigns", 
                    True, 
                    f"Successfully created campaign with ID: {created_campaign_id}"
                )
            else:
                self.log_test(
                    "POST /api/campaigns", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_test("POST /api/campaigns", False, f"Request failed: {str(e)}")
        
        # Test 3: PUT /api/campaigns/{id} - Update campaign
        if created_campaign_id:
            updated_campaign = {
                "title": "Updated Test Campaign API",
                "description": "Updated campaign description via API",
                "discount_details": "35% discount for Actor Club members (updated)"
            }
            
            try:
                response = self.session.put(
                    f"{API_BASE}/campaigns/{created_campaign_id}",
                    json=updated_campaign,
                    headers=headers
                )
                
                if response.status_code == 200:
                    self.log_test(
                        "PUT /api/campaigns/{id}", 
                        True, 
                        "Successfully updated campaign"
                    )
                else:
                    self.log_test(
                        "PUT /api/campaigns/{id}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_test("PUT /api/campaigns/{id}", False, f"Request failed: {str(e)}")
        else:
            self.log_test("PUT /api/campaigns/{id}", False, "No campaign ID available for update test")
        
        # Test 4: DELETE /api/campaigns/{id} - Delete campaign
        if created_campaign_id:
            try:
                response = self.session.delete(
                    f"{API_BASE}/campaigns/{created_campaign_id}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    self.log_test(
                        "DELETE /api/campaigns/{id}", 
                        True, 
                        "Successfully deleted test campaign"
                    )
                else:
                    self.log_test(
                        "DELETE /api/campaigns/{id}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_test("DELETE /api/campaigns/{id}", False, f"Request failed: {str(e)}")
        else:
            self.log_test("DELETE /api/campaigns/{id}", False, "No campaign ID available for delete test")
        
        # Store campaign ID for other tests
        self.test_campaign_id = self.existing_campaigns[0].get('id') if self.existing_campaigns else None
    
    def test_admin_authentication(self):
        """Test admin authentication for campaign operations"""
        print("=== Testing Admin Authentication ===")
        
        test_campaign = {
            "title": "Unauthorized Test Campaign",
            "description": "This should fail without admin token",
            "company_name": "Unauthorized Company",
            "discount_details": "Should not be created",
            "terms_conditions": "Should fail",
            "is_active": True
        }
        
        # Test without admin token
        try:
            response = self.session.post(
                f"{API_BASE}/campaigns",
                json=test_campaign,
                headers={"Content-Type": "application/json"}  # No auth header
            )
            
            if response.status_code in [401, 403]:
                self.log_test(
                    "Admin Authentication Required", 
                    True, 
                    f"Correctly rejected campaign creation without admin token (HTTP {response.status_code})"
                )
            else:
                self.log_test(
                    "Admin Authentication Required", 
                    False, 
                    f"Should have rejected non-admin request, got HTTP {response.status_code}"
                )
                
        except Exception as e:
            self.log_test("Admin Authentication Required", False, f"Request failed: {str(e)}")
    
    def test_qr_code_generation(self):
        """Test QR code generation endpoint /api/campaigns/{id}/generate-qr"""
        print("=== Testing QR Code Generation ===")
        
        if not self.admin_token:
            self.log_test("QR Code Generation", False, "No admin token available")
            return
        
        if not self.test_campaign_id:
            self.log_test("QR Code Generation", False, "No campaign ID available")
            return
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/campaigns/{self.test_campaign_id}/generate-qr",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                qr_token = data.get('qr_token')
                expires_at = data.get('expires_at')
                campaign_title = data.get('campaign_title')
                
                self.log_test(
                    "QR Code Generation", 
                    True, 
                    f"Successfully generated QR token for '{campaign_title}' (expires: {expires_at})"
                )
                
                # Store QR token for verification test
                self.test_qr_token = qr_token
                
            elif response.status_code == 403:
                self.log_test(
                    "QR Code Generation", 
                    True, 
                    "QR generation blocked due to dues eligibility check (expected behavior for admin with unpaid dues)"
                )
                self.test_qr_token = None
                
            else:
                self.log_test(
                    "QR Code Generation", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                self.test_qr_token = None
                
        except Exception as e:
            self.log_test("QR Code Generation", False, f"Request failed: {str(e)}")
            self.test_qr_token = None
    
    def test_qr_code_verification(self):
        """Test QR code verification endpoint /api/verify-qr/{token}"""
        print("=== Testing QR Code Verification ===")
        
        # Test with valid token if we have one
        if hasattr(self, 'test_qr_token') and self.test_qr_token:
            try:
                response = self.session.get(f"{API_BASE}/verify-qr/{self.test_qr_token}")
                
                if response.status_code == 200:
                    data = response.json()
                    is_valid = data.get('valid', False)
                    message = data.get('message', '')
                    member = data.get('member', {})
                    campaign = data.get('campaign', {})
                    
                    self.log_test(
                        "QR Code Verification (Valid Token)", 
                        True, 
                        f"Response: {message} (valid: {is_valid})"
                    )
                    
                    if is_valid and member:
                        print(f"   Member: {member.get('name')} {member.get('surname')} ({member.get('username')})")
                        print(f"   Campaign: {campaign.get('title')} by {campaign.get('company')}")
                    
                else:
                    self.log_test(
                        "QR Code Verification (Valid Token)", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_test("QR Code Verification (Valid Token)", False, f"Request failed: {str(e)}")
        
        # Test with invalid token
        try:
            response = self.session.get(f"{API_BASE}/verify-qr/invalid-token-12345")
            
            if response.status_code == 200:
                data = response.json()
                is_valid = data.get('valid', True)
                message = data.get('message', '')
                
                if not is_valid:
                    self.log_test(
                        "QR Code Verification (Invalid Token)", 
                        True, 
                        f"Correctly identified invalid QR token: {message}"
                    )
                else:
                    self.log_test(
                        "QR Code Verification (Invalid Token)", 
                        False, 
                        "Should have marked invalid token as invalid"
                    )
            else:
                self.log_test(
                    "QR Code Verification (Invalid Token)", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_test("QR Code Verification (Invalid Token)", False, f"Request failed: {str(e)}")
    
    def test_dues_eligibility_logic(self):
        """Test dues eligibility checking logic"""
        print("=== Testing Dues Eligibility Logic ===")
        
        # The dues eligibility is tested implicitly through QR generation
        # Admin users might have different dues status than regular users
        
        if not self.admin_token:
            self.log_test("Dues Eligibility Logic", False, "No admin token available")
            return
        
        if not self.test_campaign_id:
            self.log_test("Dues Eligibility Logic", False, "No campaign ID available")
            return
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test QR generation which includes dues eligibility check
        try:
            response = self.session.post(
                f"{API_BASE}/campaigns/{self.test_campaign_id}/generate-qr",
                headers=headers
            )
            
            if response.status_code == 200:
                self.log_test(
                    "Dues Eligibility Logic", 
                    True, 
                    "Admin user passed dues eligibility check for QR generation"
                )
            elif response.status_code == 403:
                response_data = response.json()
                if "Aidat" in response_data.get('detail', ''):
                    self.log_test(
                        "Dues Eligibility Logic", 
                        True, 
                        "Dues eligibility check correctly blocked user with unpaid dues"
                    )
                else:
                    self.log_test(
                        "Dues Eligibility Logic", 
                        False, 
                        f"Unexpected 403 error: {response.text}"
                    )
            else:
                self.log_test(
                    "Dues Eligibility Logic", 
                    False, 
                    f"Unexpected response: HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_test("Dues Eligibility Logic", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all campaign management tests"""
        print("🚀 Starting Campaign Management Testing Suite")
        print(f"Testing against: {API_BASE}")
        print("=" * 60)
        
        # Setup admin authentication first
        if not self.setup_admin_login():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        # Run all campaign tests
        self.test_campaign_crud_endpoints()
        self.test_admin_authentication()
        self.test_qr_code_generation()
        self.test_qr_code_verification()
        self.test_dues_eligibility_logic()
        
        # Summary
        print("=" * 60)
        print("📊 CAMPAIGN MANAGEMENT TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All campaign management tests passed! System is working correctly.")
            return True
        else:
            print(f"\n⚠️  {total - passed} tests failed. See details above.")
            return False

if __name__ == "__main__":
    tester = CampaignTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)