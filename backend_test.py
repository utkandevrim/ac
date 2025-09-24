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
            {"username": "test.kullanici", "password": "Test567!"}
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
        import time
        timestamp = int(time.time())
        valid_user = {
            "username": f"test.yeniuye{timestamp}",
            "email": f"test.yeniuye{timestamp}@actorclub.com",
            "password": "ValidPass123!",
            "name": "Test",
            "surname": "Yeni Üye"
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