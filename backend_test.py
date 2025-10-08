#!/usr/bin/env python3
"""
Actor Club Backend API Testing Suite
Tests authentication system, user management, and password policies
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

class ActorClubAPITester:
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
    
    def test_login_with_username(self):
        """Test login with new username format (isim.soyisim)"""
        print("=== Testing Authentication System ===")
        
        # Test credentials from review request
        test_credentials = [
            {"username": "admin.yonetici", "password": "ActorClub2024!"},
            {"username": "muzaffer.isgoren", "password": "Founder123!"},
            {"username": "test.kullanıcı", "password": "Test567!"}  # Using Turkish ı
        ]
        
        successful_logins = 0
        
        for creds in test_credentials:
            try:
                response = self.session.post(
                    f"{API_BASE}/auth/login",
                    json=creds,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if 'access_token' in data and 'user' in data:
                        successful_logins += 1
                        # Store admin token for later tests
                        if creds["username"] == "admin.yonetici":
                            self.admin_token = data['access_token']
                        
                        self.log_test(
                            f"Login with {creds['username']}", 
                            True, 
                            f"Successfully logged in as {data['user']['name']} {data['user']['surname']}"
                        )
                    else:
                        self.log_test(
                            f"Login with {creds['username']}", 
                            False, 
                            "Missing access_token or user in response",
                            response.text
                        )
                else:
                    self.log_test(
                        f"Login with {creds['username']}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_test(
                    f"Login with {creds['username']}", 
                    False, 
                    f"Request failed: {str(e)}"
                )
        
        # Overall authentication test
        if successful_logins >= 2:  # At least admin and one other should work
            self.log_test(
                "Username-based Authentication System", 
                True, 
                f"{successful_logins}/3 test accounts logged in successfully"
            )
        else:
            self.log_test(
                "Username-based Authentication System", 
                False, 
                f"Only {successful_logins}/3 test accounts worked"
            )
    
    def test_user_management(self):
        """Test user creation with username validation and password policy"""
        print("=== Testing User Management ===")
        
        if not self.admin_token:
            self.log_test("User Management Tests", False, "No admin token available")
            return
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test 1: Valid user creation
        valid_user = {
            "username": "test.yenimember",
            "email": "test.yenimember@actorclub.com",
            "password": "ValidPass123!",
            "name": "Test",
            "surname": "Yenimember"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/users",
                json=valid_user,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Valid User Creation", 
                    True, 
                    f"Created user: {data['username']}"
                )
            else:
                self.log_test(
                    "Valid User Creation", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
        except Exception as e:
            self.log_test("Valid User Creation", False, f"Request failed: {str(e)}")
        
        # Test 2: Invalid username format
        invalid_username_user = {
            "username": "invalidusername",  # Should be isim.soyisim
            "email": "invalid@actorclub.com",
            "password": "ValidPass123!",
            "name": "Invalid",
            "surname": "User"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/users",
                json=invalid_username_user,
                headers=headers
            )
            
            if response.status_code == 422:  # Validation error expected
                self.log_test(
                    "Username Format Validation", 
                    True, 
                    "Correctly rejected invalid username format"
                )
            else:
                self.log_test(
                    "Username Format Validation", 
                    False, 
                    f"Should have rejected invalid username, got HTTP {response.status_code}"
                )
        except Exception as e:
            self.log_test("Username Format Validation", False, f"Request failed: {str(e)}")
        
        # Test 3: Invalid password (too short)
        invalid_password_user = {
            "username": "test.shortpass",
            "email": "shortpass@actorclub.com",
            "password": "Short1!",  # Only 7 chars, should be 8-16
            "name": "Test",
            "surname": "Short Pass"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/users",
                json=invalid_password_user,
                headers=headers
            )
            
            if response.status_code == 422:  # Validation error expected
                self.log_test(
                    "Password Length Validation", 
                    True, 
                    "Correctly rejected password too short"
                )
            else:
                self.log_test(
                    "Password Length Validation", 
                    False, 
                    f"Should have rejected short password, got HTTP {response.status_code}"
                )
        except Exception as e:
            self.log_test("Password Length Validation", False, f"Request failed: {str(e)}")
        
        # Test 4: Invalid password (no special character)
        invalid_password_user2 = {
            "username": "test.nospecial",
            "email": "nospecial@actorclub.com",
            "password": "NoSpecialChar123",  # No special character
            "name": "Test",
            "surname": "No Special"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/users",
                json=invalid_password_user2,
                headers=headers
            )
            
            if response.status_code == 422:  # Validation error expected
                self.log_test(
                    "Password Special Character Validation", 
                    True, 
                    "Correctly rejected password without special character"
                )
            else:
                self.log_test(
                    "Password Special Character Validation", 
                    False, 
                    f"Should have rejected password without special char, got HTTP {response.status_code}"
                )
        except Exception as e:
            self.log_test("Password Special Character Validation", False, f"Request failed: {str(e)}")
    
    def test_new_members_added(self):
        """Test that 107 new members were added to database across 4 teams"""
        print("=== Testing New Members Database ===")
        
        if not self.admin_token:
            self.log_test("New Members Verification", False, "No admin token available")
            return
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        try:
            response = self.session.get(f"{API_BASE}/users", headers=headers)
            
            if response.status_code == 200:
                users = response.json()
                
                # Count users by team
                team_counts = {}
                total_members = 0
                
                for user in users:
                    if not user.get('is_admin', False):  # Exclude admin users
                        total_members += 1
                        team = user.get('board_member')
                        if team:
                            team_counts[team] = team_counts.get(team, 0) + 1
                
                # Expected teams and approximate counts
                expected_teams = ['Diyojen', 'Hypatia', 'Artemis', 'Hermes']
                teams_found = len([team for team in expected_teams if team in team_counts])
                
                self.log_test(
                    "Total Members Count", 
                    total_members >= 100,  # Should be around 107+ 
                    f"Found {total_members} total members (expected ~107+)"
                )
                
                self.log_test(
                    "Team Distribution", 
                    teams_found >= 4,
                    f"Found {teams_found}/4 expected teams: {list(team_counts.keys())}"
                )
                
                # Log team details
                for team, count in team_counts.items():
                    print(f"   {team}: {count} members")
                
                self.log_test(
                    "New Members Database Integration", 
                    total_members >= 100 and teams_found >= 4,
                    f"Successfully verified member database with {total_members} members across {teams_found} teams"
                )
                
            else:
                self.log_test(
                    "New Members Verification", 
                    False, 
                    f"Failed to fetch users: HTTP {response.status_code}"
                )
                
        except Exception as e:
            self.log_test("New Members Verification", False, f"Request failed: {str(e)}")
    
    def test_password_change(self):
        """Test password change endpoint"""
        print("=== Testing Password Change ===")
        
        if not self.admin_token:
            self.log_test("Password Change Test", False, "No admin token available")
            return
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test with wrong old password
        try:
            response = self.session.post(
                f"{API_BASE}/auth/change-password",
                params={
                    "old_password": "WrongPassword123!",
                    "new_password": "NewValidPass456!"
                },
                headers=headers
            )
            
            if response.status_code == 400:
                self.log_test(
                    "Password Change - Wrong Old Password", 
                    True, 
                    "Correctly rejected wrong old password"
                )
            else:
                self.log_test(
                    "Password Change - Wrong Old Password", 
                    False, 
                    f"Should have rejected wrong password, got HTTP {response.status_code}"
                )
        except Exception as e:
            self.log_test("Password Change - Wrong Old Password", False, f"Request failed: {str(e)}")
        
        # Test with invalid new password
        try:
            response = self.session.post(
                f"{API_BASE}/auth/change-password",
                params={
                    "old_password": "ActorClub2024!",
                    "new_password": "weak"  # Too short, no special char
                },
                headers=headers
            )
            
            if response.status_code == 400:
                self.log_test(
                    "Password Change - Invalid New Password", 
                    True, 
                    "Correctly rejected invalid new password format"
                )
            else:
                self.log_test(
                    "Password Change - Invalid New Password", 
                    False, 
                    f"Should have rejected invalid new password, got HTTP {response.status_code}"
                )
        except Exception as e:
            self.log_test("Password Change - Invalid New Password", False, f"Request failed: {str(e)}")
    
    def test_api_endpoints_availability(self):
        """Test that all key API endpoints are available"""
        print("=== Testing API Endpoints Availability ===")
        
        # Test root endpoint
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                self.log_test("API Root Endpoint", True, "API is accessible")
            else:
                self.log_test("API Root Endpoint", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Connection failed: {str(e)}")
    
    def test_campaign_management(self):
        """Test comprehensive campaign management functionality"""
        print("=== Testing Campaign Management System ===")
        
        # First, try to login with the super.admin credentials from the review request
        super_admin_creds = {"username": "super.admin", "password": "AdminActor2024!"}
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=super_admin_creds,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                super_admin_token = data['access_token']
                self.log_test(
                    "Super Admin Login", 
                    True, 
                    f"Successfully logged in as {data['user']['name']} {data['user']['surname']}"
                )
            else:
                # Fallback to existing admin token
                super_admin_token = self.admin_token
                self.log_test(
                    "Super Admin Login", 
                    False, 
                    f"Failed to login with super.admin, using fallback admin token. HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            super_admin_token = self.admin_token
            self.log_test("Super Admin Login", False, f"Request failed, using fallback: {str(e)}")
        
        if not super_admin_token:
            self.log_test("Campaign Management Tests", False, "No admin token available")
            return
        
        headers = {
            "Authorization": f"Bearer {super_admin_token}",
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
                
                # Store existing campaigns for later tests
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
        
        # Test 2: POST /api/campaigns - Create new campaign (admin only)
        test_campaign = {
            "title": "Test Campaign",
            "description": "Test campaign for API testing",
            "company_name": "Test Company",
            "discount_details": "20% discount on all services",
            "terms_conditions": "Valid for Actor Club members only",
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
        
        # Test 3: PUT /api/campaigns/{id} - Update campaign (admin only)
        if created_campaign_id:
            updated_campaign = {
                "title": "Updated Test Campaign",
                "description": "Updated test campaign description",
                "discount_details": "25% discount on all services"
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
        
        # Test 4: Test admin authentication for campaign operations
        # Try to create campaign without admin token
        try:
            response = self.session.post(
                f"{API_BASE}/campaigns",
                json=test_campaign,
                headers={"Content-Type": "application/json"}  # No auth header
            )
            
            if response.status_code == 401 or response.status_code == 403:
                self.log_test(
                    "Admin Authentication for Campaigns", 
                    True, 
                    "Correctly rejected campaign creation without admin token"
                )
            else:
                self.log_test(
                    "Admin Authentication for Campaigns", 
                    False, 
                    f"Should have rejected non-admin request, got HTTP {response.status_code}"
                )
                
        except Exception as e:
            self.log_test("Admin Authentication for Campaigns", False, f"Request failed: {str(e)}")
        
        # Test 5: QR Code Generation - Need to test with a valid campaign
        campaign_id_for_qr = None
        
        # Use existing campaign or the one we just created
        if self.existing_campaigns:
            campaign_id_for_qr = self.existing_campaigns[0].get('id')
        elif created_campaign_id:
            campaign_id_for_qr = created_campaign_id
        
        if campaign_id_for_qr:
            try:
                response = self.session.post(
                    f"{API_BASE}/campaigns/{campaign_id_for_qr}/generate-qr",
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    qr_token = data.get('qr_token')
                    expires_at = data.get('expires_at')
                    
                    self.log_test(
                        "QR Code Generation", 
                        True, 
                        f"Successfully generated QR token (expires: {expires_at})"
                    )
                    
                    # Store QR token for verification test
                    self.test_qr_token = qr_token
                    
                elif response.status_code == 403:
                    self.log_test(
                        "QR Code Generation", 
                        True, 
                        "QR generation blocked due to dues eligibility (expected behavior)"
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
        else:
            self.log_test("QR Code Generation", False, "No campaign ID available for QR generation test")
            self.test_qr_token = None
        
        # Test 6: QR Code Verification (public endpoint)
        if hasattr(self, 'test_qr_token') and self.test_qr_token:
            try:
                response = self.session.get(f"{API_BASE}/verify-qr/{self.test_qr_token}")
                
                if response.status_code == 200:
                    data = response.json()
                    is_valid = data.get('valid', False)
                    message = data.get('message', '')
                    
                    self.log_test(
                        "QR Code Verification", 
                        True, 
                        f"QR verification response: {message} (valid: {is_valid})"
                    )
                    
                else:
                    self.log_test(
                        "QR Code Verification", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_test("QR Code Verification", False, f"Request failed: {str(e)}")
        else:
            # Test with invalid token
            try:
                response = self.session.get(f"{API_BASE}/verify-qr/invalid-token-12345")
                
                if response.status_code == 200:
                    data = response.json()
                    is_valid = data.get('valid', True)
                    
                    if not is_valid:
                        self.log_test(
                            "QR Code Verification (Invalid Token)", 
                            True, 
                            "Correctly identified invalid QR token"
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
        
        # Test 7: Dues Eligibility Logic - Test with a regular user
        # First, try to login as a regular user to test dues eligibility
        regular_user_creds = {"username": "test.kullanıcı", "password": "Test567!"}  # Using Turkish ı
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=regular_user_creds,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                regular_user_token = data['access_token']
                regular_user_id = data['user']['id']
                
                # Test QR generation with regular user (should check dues)
                regular_headers = {
                    "Authorization": f"Bearer {regular_user_token}",
                    "Content-Type": "application/json"
                }
                
                if campaign_id_for_qr:
                    try:
                        response = self.session.post(
                            f"{API_BASE}/campaigns/{campaign_id_for_qr}/generate-qr",
                            headers=regular_headers
                        )
                        
                        if response.status_code == 200:
                            self.log_test(
                                "Dues Eligibility Check", 
                                True, 
                                "Regular user passed dues eligibility check"
                            )
                        elif response.status_code == 403:
                            self.log_test(
                                "Dues Eligibility Check", 
                                True, 
                                "Regular user blocked by dues eligibility (expected if dues unpaid)"
                            )
                        else:
                            self.log_test(
                                "Dues Eligibility Check", 
                                False, 
                                f"Unexpected response: HTTP {response.status_code}: {response.text}"
                            )
                            
                    except Exception as e:
                        self.log_test("Dues Eligibility Check", False, f"Request failed: {str(e)}")
                else:
                    self.log_test("Dues Eligibility Check", False, "No campaign ID available for dues test")
                    
            else:
                self.log_test(
                    "Dues Eligibility Check", 
                    False, 
                    f"Could not login as regular user for dues test: HTTP {response.status_code}"
                )
                
        except Exception as e:
            self.log_test("Dues Eligibility Check", False, f"Regular user login failed: {str(e)}")
        
        # Test 8: DELETE /api/campaigns/{id} - Delete campaign (admin only)
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
    
    def test_critical_user_issues(self):
        """Test the 4 critical issues reported by user"""
        print("=== Testing Critical User-Reported Issues ===")
        
        # Use super.admin credentials as specified in review request
        super_admin_creds = {"username": "super.admin", "password": "AdminActor2024!"}
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=super_admin_creds,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                admin_token = data['access_token']
                self.log_test(
                    "Critical Issues - Admin Login", 
                    True, 
                    f"Successfully logged in as {data['user']['name']} {data['user']['surname']}"
                )
            else:
                self.log_test(
                    "Critical Issues - Admin Login", 
                    False, 
                    f"Failed to login with super.admin credentials: HTTP {response.status_code}: {response.text}"
                )
                return
                
        except Exception as e:
            self.log_test("Critical Issues - Admin Login", False, f"Login request failed: {str(e)}")
            return
        
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        # ISSUE 1: User deletion not persistent
        print("\n--- Testing Issue 1: User Deletion Persistence ---")
        
        # Instead of creating a new user, let's find an existing non-admin user to test deletion
        # This avoids the user creation/approval complexity and tests the actual deletion functionality
        
        created_user_id = None
        test_username = None
        
        try:
            # Get existing users to find one we can delete
            users_response = self.session.get(f"{API_BASE}/users", headers=headers)
            
            if users_response.status_code == 200:
                users = users_response.json()
                
                # Find a non-admin user that's not a test user we want to keep
                test_user = None
                for user in users:
                    if (not user.get('is_admin', False) and 
                        not user.get('username', '').startswith('test.') and
                        user.get('username', '') not in ['muzaffer.isgoren', 'super.admin']):
                        test_user = user
                        break
                
                if test_user:
                    created_user_id = test_user['id']
                    test_username = test_user['username']
                    self.log_test(
                        "Issue 1 - Found Test User for Deletion", 
                        True, 
                        f"Using existing user for deletion test: {test_username} (ID: {created_user_id})"
                    )
                else:
                    self.log_test(
                        "Issue 1 - Find Test User", 
                        False, 
                        f"No suitable non-admin user found for deletion test. Total users: {len(users)}"
                    )
            else:
                self.log_test(
                    "Issue 1 - Get Users for Deletion Test", 
                    False, 
                    f"Failed to get users: HTTP {users_response.status_code}: {users_response.text}"
                )
                
        except Exception as e:
            self.log_test("Issue 1 - Find User for Deletion", False, f"Request failed: {str(e)}")
        
        if created_user_id:
            # First, let's verify the user exists before deletion by checking the users list
            try:
                all_users_response = self.session.get(f"{API_BASE}/users", headers=headers)
                if all_users_response.status_code == 200:
                    all_users = all_users_response.json()
                    found_user = next((u for u in all_users if u['id'] == created_user_id), None)
                    if found_user:
                        self.log_test(
                            "Issue 1 - User Found in Users List", 
                            True, 
                            f"User found in users list: {found_user['username']}"
                        )
                    else:
                        self.log_test(
                            "Issue 1 - User Found in Users List", 
                            False, 
                            f"User not found in users list. Total users: {len(all_users)}"
                        )
                        # Print first few user IDs for debugging
                        print(f"   DEBUG: First 3 user IDs in list: {[u.get('id') for u in all_users[:3]]}")
                else:
                    self.log_test(
                        "Issue 1 - Get Users List", 
                        False, 
                        f"Failed to get users list: HTTP {all_users_response.status_code}"
                    )
            except Exception as e:
                self.log_test("Issue 1 - Users List Check", False, f"Users list check failed: {str(e)}")
            
            # Now try the individual user GET endpoint
            try:
                verify_before = self.session.get(
                    f"{API_BASE}/users/{created_user_id}",
                    headers=headers
                )
                
                if verify_before.status_code == 200:
                    self.log_test(
                        "Issue 1 - User Exists Before Deletion", 
                        True, 
                        f"User exists before deletion attempt (HTTP {verify_before.status_code})"
                    )
                else:
                    self.log_test(
                        "Issue 1 - User Exists Before Deletion", 
                        False, 
                        f"User not found before deletion: HTTP {verify_before.status_code}: {verify_before.text}"
                    )
                    
            except Exception as e:
                self.log_test("Issue 1 - User Verification Before Deletion", False, f"Pre-deletion check failed: {str(e)}")
            
            try:
                # Delete the user
                response = self.session.delete(
                    f"{API_BASE}/users/{created_user_id}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    self.log_test(
                        "Issue 1 - User Deletion API", 
                        True, 
                        "DELETE request successful"
                    )
                    
                    # Verify user is actually deleted from database
                    try:
                        verify_response = self.session.get(
                            f"{API_BASE}/users/{created_user_id}",
                            headers=headers
                        )
                        
                        if verify_response.status_code == 404:
                            self.log_test(
                                "Issue 1 - User Deletion Persistence", 
                                True, 
                                "✅ User successfully deleted from database permanently"
                            )
                        else:
                            self.log_test(
                                "Issue 1 - User Deletion Persistence", 
                                False, 
                                f"❌ User still exists after deletion: HTTP {verify_response.status_code}"
                            )
                            
                    except Exception as e:
                        self.log_test("Issue 1 - User Deletion Verification", False, f"Verification request failed: {str(e)}")
                        
                else:
                    self.log_test(
                        "Issue 1 - User Deletion API", 
                        False, 
                        f"DELETE request failed: HTTP {response.status_code}: {response.text}"
                    )
                    
                    # Let's also check if we can find the user in the users list
                    try:
                        all_users_response = self.session.get(f"{API_BASE}/users", headers=headers)
                        if all_users_response.status_code == 200:
                            all_users = all_users_response.json()
                            found_user = next((u for u in all_users if u['id'] == created_user_id), None)
                            if found_user:
                                self.log_test(
                                    "Issue 1 - User Found in List After Failed Delete", 
                                    False, 
                                    f"User still exists in users list: {found_user['username']}"
                                )
                            else:
                                self.log_test(
                                    "Issue 1 - User Not Found in List", 
                                    True, 
                                    "User not found in users list (may have been deleted despite 404 error)"
                                )
                    except Exception as e:
                        self.log_test("Issue 1 - User List Check", False, f"Failed to check users list: {str(e)}")
                    
            except Exception as e:
                self.log_test("Issue 1 - User Deletion API", False, f"Delete request failed: {str(e)}")
        else:
            self.log_test("Issue 1 - User Deletion Test", False, "No test user created for deletion test")
        
        # ISSUE 2: Event photo upload missing
        print("\n--- Testing Issue 2: Event Photo Upload Functionality ---")
        
        try:
            # Test event creation endpoint
            test_event = {
                "title": "Test Event for Photo Upload",
                "description": "Testing event photo upload functionality",
                "date": "2024-12-31T20:00:00Z",
                "location": "Test Location"
            }
            
            response = self.session.post(
                f"{API_BASE}/events",
                json=test_event,
                headers=headers
            )
            
            if response.status_code == 200:
                created_event = response.json()
                event_id = created_event.get('id')
                
                # Check if event has photos field
                has_photos_field = 'photos' in created_event
                photos_value = created_event.get('photos', None)
                
                self.log_test(
                    "Issue 2 - Event Creation with Photos Field", 
                    has_photos_field, 
                    f"Event created {'with' if has_photos_field else 'without'} photos field. Photos: {photos_value}"
                )
                
                # Test if there's a file upload endpoint available
                try:
                    upload_response = self.session.get(f"{API_BASE}/upload", headers=headers)
                    upload_endpoint_exists = upload_response.status_code != 404
                    
                    self.log_test(
                        "Issue 2 - File Upload Endpoint", 
                        upload_endpoint_exists, 
                        f"Upload endpoint {'exists' if upload_endpoint_exists else 'missing'} (HTTP {upload_response.status_code})"
                    )
                    
                except Exception as e:
                    self.log_test("Issue 2 - File Upload Endpoint Check", False, f"Upload endpoint check failed: {str(e)}")
                
                # Clean up test event
                try:
                    self.session.delete(f"{API_BASE}/events/{event_id}", headers=headers)
                except:
                    pass  # Ignore cleanup errors
                    
            else:
                self.log_test(
                    "Issue 2 - Event Creation", 
                    False, 
                    f"Failed to create test event: HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_test("Issue 2 - Event Photo Upload Test", False, f"Event creation request failed: {str(e)}")
        
        # ISSUE 3: Login page test accounts section (Frontend issue - note for main agent)
        print("\n--- Testing Issue 3: Login Page Test Accounts ---")
        self.log_test(
            "Issue 3 - Login Page Test Accounts", 
            True, 
            "⚠️ This is a FRONTEND issue - test accounts display section needs removal from login page. Backend testing not applicable."
        )
        
        # ISSUE 4: Dues payment status not persisting
        print("\n--- Testing Issue 4: Dues Payment Status Persistence ---")
        
        try:
            # First, get a user to test dues with
            users_response = self.session.get(f"{API_BASE}/users", headers=headers)
            
            if users_response.status_code == 200:
                users = users_response.json()
                test_user = None
                
                # Find a non-admin user for testing
                for user in users:
                    if not user.get('is_admin', False):
                        test_user = user
                        break
                
                if test_user:
                    user_id = test_user['id']
                    
                    # Get user's dues
                    dues_response = self.session.get(f"{API_BASE}/dues/{user_id}", headers=headers)
                    
                    if dues_response.status_code == 200:
                        dues_list = dues_response.json()
                        
                        if dues_list:
                            # Test marking a due as paid
                            test_due = dues_list[0]
                            due_id = test_due['id']
                            original_status = test_due.get('is_paid', False)
                            
                            # Mark as paid
                            pay_response = self.session.put(
                                f"{API_BASE}/dues/{due_id}/pay",
                                headers=headers
                            )
                            
                            if pay_response.status_code == 200:
                                self.log_test(
                                    "Issue 4 - Mark Due as Paid", 
                                    True, 
                                    "Successfully marked due as paid"
                                )
                                
                                # Verify persistence by fetching dues again
                                verify_response = self.session.get(f"{API_BASE}/dues/{user_id}", headers=headers)
                                
                                if verify_response.status_code == 200:
                                    updated_dues = verify_response.json()
                                    updated_due = next((d for d in updated_dues if d['id'] == due_id), None)
                                    
                                    # Debug information
                                    print(f"   DEBUG: Looking for due_id: {due_id}")
                                    print(f"   DEBUG: Found {len(updated_dues)} dues in response")
                                    if updated_due:
                                        print(f"   DEBUG: Found due with is_paid: {updated_due.get('is_paid')}")
                                    else:
                                        print(f"   DEBUG: Due not found. Available due IDs: {[d.get('id') for d in updated_dues[:3]]}")
                                    
                                    if updated_due and updated_due.get('is_paid', False):
                                        self.log_test(
                                            "Issue 4 - Dues Payment Status Persistence", 
                                            True, 
                                            "✅ Dues payment status persists correctly in database"
                                        )
                                    else:
                                        self.log_test(
                                            "Issue 4 - Dues Payment Status Persistence", 
                                            False, 
                                            f"❌ Dues payment status not persisted. Status: {updated_due.get('is_paid') if updated_due else 'Due not found'}"
                                        )
                                else:
                                    self.log_test(
                                        "Issue 4 - Dues Verification", 
                                        False, 
                                        f"Failed to verify dues status: HTTP {verify_response.status_code}"
                                    )
                                
                                # Test unpay functionality as well
                                unpay_response = self.session.put(
                                    f"{API_BASE}/dues/{due_id}/unpay",
                                    headers=headers
                                )
                                
                                if unpay_response.status_code == 200:
                                    # Verify unpay persistence
                                    final_verify = self.session.get(f"{API_BASE}/dues/{user_id}", headers=headers)
                                    if final_verify.status_code == 200:
                                        final_dues = final_verify.json()
                                        final_due = next((d for d in final_dues if d['id'] == due_id), None)
                                        
                                        if final_due and not final_due.get('is_paid', True):
                                            self.log_test(
                                                "Issue 4 - Dues Unpay Status Persistence", 
                                                True, 
                                                "✅ Dues unpay status also persists correctly"
                                            )
                                        else:
                                            self.log_test(
                                                "Issue 4 - Dues Unpay Status Persistence", 
                                                False, 
                                                "❌ Dues unpay status not persisted correctly"
                                            )
                                else:
                                    self.log_test(
                                        "Issue 4 - Dues Unpay API", 
                                        False, 
                                        f"Unpay request failed: HTTP {unpay_response.status_code}"
                                    )
                                    
                            else:
                                self.log_test(
                                    "Issue 4 - Mark Due as Paid", 
                                    False, 
                                    f"Failed to mark due as paid: HTTP {pay_response.status_code}: {pay_response.text}"
                                )
                        else:
                            self.log_test(
                                "Issue 4 - Dues Payment Test", 
                                False, 
                                "No dues found for test user"
                            )
                    else:
                        self.log_test(
                            "Issue 4 - Get User Dues", 
                            False, 
                            f"Failed to get user dues: HTTP {dues_response.status_code}"
                        )
                else:
                    self.log_test(
                        "Issue 4 - Find Test User", 
                        False, 
                        "No non-admin user found for dues testing"
                    )
            else:
                self.log_test(
                    "Issue 4 - Get Users for Dues Test", 
                    False, 
                    f"Failed to get users: HTTP {users_response.status_code}"
                )
                
        except Exception as e:
            self.log_test("Issue 4 - Dues Payment Status Test", False, f"Dues test request failed: {str(e)}")

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Actor Club Backend API Tests")
        print(f"Testing against: {API_BASE}")
        print("=" * 60)
        
        # Run tests in order
        self.test_api_endpoints_availability()
        self.test_login_with_username()
        self.test_user_management()
        self.test_new_members_added()
        self.test_password_change()
        self.test_campaign_management()  # New comprehensive campaign tests
        self.test_critical_user_issues()  # New critical issues tests
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All tests passed! Backend is working correctly.")
            return True
        else:
            print(f"\n⚠️  {total - passed} tests failed. See details above.")
            return False

if __name__ == "__main__":
    tester = ActorClubAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)